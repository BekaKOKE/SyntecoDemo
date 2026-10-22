import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UploadController } from './upload.controller';
import { SettingsController } from './settings.controller';
import { StorageService } from './storage.service';
import { InquiriesModule } from './inquiries/inquiries.module';
import { CrmModule } from './crm/crm.module';

@Module({
  imports: [InquiriesModule, CrmModule],
  controllers: [AdminController, UploadController, SettingsController],
  providers: [AdminService, StorageService],
  exports: [StorageService],
})
export class AdminModule {}
