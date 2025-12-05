import { Module } from '@nestjs/common';
import { ServerFieldsController } from './server-fields.controller';
import { ServerFieldsService } from './server-fields.service';

@Module({
  controllers: [ServerFieldsController],
  providers: [ServerFieldsService],
  exports: [ServerFieldsService],
})
export class ServerFieldsModule {}
