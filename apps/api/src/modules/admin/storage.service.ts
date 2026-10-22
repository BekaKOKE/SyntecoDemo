import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

/**
 * MinIO S3-compatible object storage service.
 *
 * Replaces local disk storage with S3 for:
 * - Product images (with auto-generated thumbnails)
 * - Document uploads (PDF, CAD, spec sheets)
 * - Any other binary assets
 *
 * All files are served via presigned URLs (7-day expiry by default).
 * Public-read bucket policy eliminates the need for proxying through the API.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger('StorageService');
  private client: Minio.Client | null = null;
  private available = false;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get('S3_BUCKET', 'synteco-media');
  }

  async onModuleInit() {
    try {
      const endpoint = this.config.get('S3_ENDPOINT', 'localhost');
      const port = parseInt(this.config.get('S3_PORT', '9000'), 10);
      const accessKey = this.config.get('S3_ACCESS_KEY', 'synteco_admin');
      const secretKey = this.config.get('S3_SECRET_KEY', 'synteco_dev');

      this.client = new Minio.Client({
        endPoint: endpoint,
        port,
        useSSL: false,
        accessKey,
        secretKey,
      });

      // Ensure bucket exists
      const bucketExists = await this.client.bucketExists(this.bucket);
      if (!bucketExists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`Created bucket: ${this.bucket}`);
      }

      this.available = true;
      this.logger.log(`MinIO storage ready — bucket: ${this.bucket}`);
    } catch (err: any) {
      this.logger.warn(`MinIO unavailable — uploads will use local fallback: ${err.message}`);
      this.available = false;
    }
  }

  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Upload a file buffer to MinIO.
   * Returns the object key (path) and a presigned URL.
   */
  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string = 'products',
  ): Promise<{
    key: string;
    url: string;
    presignedUrl: string;
    size: number;
  }> {
    if (!this.client || !this.available) {
      throw new Error('Storage service unavailable');
    }

    const ext = originalName.split('.').pop()?.toLowerCase() ?? 'bin';
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    await this.client.putObject(this.bucket, key, buffer, buffer.length, {
      'Content-Type': mimeType,
    });

    // Generate presigned URL (7-day expiry)
    const presignedUrl = await this.client.presignedGetObject(
      this.bucket,
      key,
      7 * 24 * 60 * 60, // 7 days
    );

    // Public URL (if bucket policy allows)
    const url = `http://${this.config.get('S3_ENDPOINT', 'localhost')}:${this.config.get('S3_PORT', '9000')}/${this.bucket}/${key}`;

    this.logger.log(`Uploaded: ${key} (${(buffer.length / 1024).toFixed(1)} KB)`);

    return {
      key,
      url,
      presignedUrl,
      size: buffer.length,
    };
  }

  /**
   * Delete an object from MinIO.
   */
  async delete(key: string): Promise<void> {
    if (!this.client || !this.available) return;
    try {
      await this.client.removeObject(this.bucket, key);
    } catch (err: any) {
      this.logger.warn(`Failed to delete ${key}: ${err.message}`);
    }
  }

  /**
   * Generate a presigned URL for an existing object.
   * Use this for serving private files without proxying through the API.
   */
  async getPresignedUrl(key: string, expirySeconds: number = 3600): Promise<string> {
    if (!this.client || !this.available) {
      throw new Error('Storage service unavailable');
    }
    return this.client.presignedGetObject(this.bucket, key, expirySeconds);
  }
}
