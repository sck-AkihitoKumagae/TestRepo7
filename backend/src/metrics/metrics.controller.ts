import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get('servers/:id/metrics/latest')
  async getLatestMetrics(@Param('id') id: string) {
    return this.metricsService.getLatestMetrics(id);
  }

  @Get('servers/:id/metrics/:metric')
  async getMetricHistory(
    @Param('id') id: string,
    @Param('metric') metric: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.metricsService.getMetricHistory(
      id,
      metric,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Post('metrics/ingest')
  async ingestMetrics(@Body() body: { items: any[] }) {
    return this.metricsService.ingestMetrics(body.items);
  }
}
