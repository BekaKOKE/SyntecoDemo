import {
  Controller, Post, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StorageService } from './storage.service';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';

// Raster image types only — SVG excluded on purpose (stored-XSS vector).
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

/**
 * Verify the real file type by its magic bytes, so a client cannot bypass the
 * mimetype filter (e.g. an .svg/.html renamed and sent with image/png header).
 * Returns the detected mime, or null if it matches none of the allowed types.
 */
function detectImageMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  // GIF: "GIF87a" / "GIF89a"
  if (buf.slice(0, 3).toString('ascii') === 'GIF') return 'image/gif';
  // WEBP: "RIFF"...."WEBP"
  if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin', 'super_admin')
export class UploadController {
  private readonly logger = new Logger('UploadController');
  constructor(private readonly storage: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const dir = join(process.cwd(), 'uploads');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        // Never trust the client-supplied extension. Derive a safe one
        // from the declared (raster) mimetype only.
        const ext = MIME_TO_EXT[file.mimetype] ?? '.bin';
        cb(null, `${uuid()}${ext}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      // SVG intentionally NOT allowed — it can carry <script>/onload and would
      // execute as stored XSS when served from our origin. Raster formats only.
      if (!ALLOWED_IMAGE_MIME.has(file.mimetype)) {
        cb(new BadRequestException('Только изображения: JPEG, PNG, GIF, WebP'), false);
      } else {
        cb(null, true);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не загружен');

    const fs = await import('fs/promises');
    const buffer = await fs.readFile(file.path);

    // Magic-bytes validation: the real content must match an allowed raster
    // image type. Blocks spoofed mimetypes and disguised SVG/HTML payloads.
    const realMime = detectImageMime(buffer);
    if (!realMime || !ALLOWED_IMAGE_MIME.has(realMime)) {
      await fs.unlink(file.path).catch(() => {});
      throw new BadRequestException('Файл не является корректным изображением (JPEG, PNG, GIF, WebP)');
    }

    // Try MinIO upload — returns presigned URL. Falls back to local.
    if (this.storage.isAvailable()) {
      try {
        const result = await this.storage.upload(
          buffer,
          file.originalname,
          file.mimetype,
          'products',
        );
        // Clean up temp file from multer disk storage
        await fs.unlink(file.path).catch(() => {});
        return {
          url: result.presignedUrl,
          key: result.key,
          originalName: file.originalname,
          size: result.size,
          mimetype: file.mimetype,
        };
      } catch (err: any) {
        this.logger.warn(`MinIO upload failed, falling back to local storage: ${err?.message || String(err)}`);
      }
    }

    // Local fallback
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
