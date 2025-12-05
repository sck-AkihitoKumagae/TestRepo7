import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServersService } from './servers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@Controller('api/servers')
@UseGuards(JwtAuthGuard)
export class ServersController {
  constructor(
    private serversService: ServersService,
    private auditService: AuditService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('search') search?: string,
    @Query('env') env?: string,
    @Query('tags') tags?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const perPageNum = parseInt(perPage) || 30;
    const skip = (pageNum - 1) * perPageNum;

    const tagArray = tags ? tags.split(',') : undefined;

    // Parse sort parameter (e.g., "name:asc" or "createdAt:desc")
    let orderBy = {};
    if (sort) {
      const [field, order] = sort.split(':');
      orderBy = { [field]: order || 'asc' };
    }

    const result = await this.serversService.findAll({
      skip,
      take: perPageNum,
      search,
      env,
      tags: tagArray,
      orderBy,
    });

    return {
      ...result,
      page: pageNum,
      perPage: perPageNum,
      totalPages: Math.ceil(result.total / perPageNum),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.serversService.findOne(id);
  }

  @Post()
  async create(@Body() createServerDto: any, @Request() req) {
    const server = await this.serversService.create(createServerDto);
    
    await this.auditService.log({
      actor: req.user.username,
      action: 'create',
      serverId: server.id,
      payload: { server: createServerDto },
    });

    return server;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServerDto: any,
    @Request() req,
  ) {
    const server = await this.serversService.update(id, updateServerDto);
    
    await this.auditService.log({
      actor: req.user.username,
      action: 'update',
      serverId: id,
      payload: { changes: updateServerDto },
    });

    return server;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.serversService.remove(id);
    
    await this.auditService.log({
      actor: req.user.username,
      action: 'delete',
      serverId: id,
      payload: {},
    });

    return result;
  }
}
