import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ServerFieldsService } from './server-fields.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/server-fields')
@UseGuards(JwtAuthGuard)
export class ServerFieldsController {
  constructor(private serverFieldsService: ServerFieldsService) {}

  @Get()
  async findAll() {
    return this.serverFieldsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.serverFieldsService.findOne(parseInt(id));
  }

  @Post()
  async create(@Body() createFieldDto: any) {
    return this.serverFieldsService.create(createFieldDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFieldDto: any) {
    return this.serverFieldsService.update(parseInt(id), updateFieldDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.serverFieldsService.remove(parseInt(id));
  }
}
