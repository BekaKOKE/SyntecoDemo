import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypesenseService } from './typesense.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, TypesenseService],
  exports: [SearchService, TypesenseService],
})
export class SearchModule {}
