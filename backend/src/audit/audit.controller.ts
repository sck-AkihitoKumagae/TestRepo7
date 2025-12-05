import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('serverId') serverId?: string,
    @Query('actor') actor?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const perPageNum = parseInt(perPage) || 30;
    const skip = (pageNum - 1) * perPageNum;

    const result = await this.auditService.findAll({
      skip,
      take: perPageNum,
      serverId,
      actor,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });

    return {
      ...result,
      page: pageNum,
      perPage: perPageNum,
      totalPages: Math.ceil(result.total / perPageNum),
    };
  }
}
