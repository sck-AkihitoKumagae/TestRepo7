import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getLatestMetrics(serverId: string) {
    // Get the latest value for each metric for a server
    const metrics = await this.prisma.$queryRaw<Array<{
      metric: string;
      ts: Date;
      value: number;
    }>>`
      SELECT DISTINCT ON (metric) metric, ts, value
      FROM metrics
      WHERE server_id = ${serverId}::uuid
      ORDER BY metric, ts DESC
    `;

    return metrics;
  }

  async getMetricHistory(
    serverId: string,
    metric: string,
    from?: Date,
    to?: Date,
  ) {
    return this.prisma.metric.findMany({
      where: {
        serverId,
        metric,
        ts: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { ts: 'asc' },
    });
  }

  async ingestMetrics(items: Array<{
    server_name?: string;
    server_id?: string;
    metric: string;
    ts: string | Date;
    value: number;
  }>) {
    const results = [];

    for (const item of items) {
      let serverId = item.server_id;

      // If server_name is provided, look up the server
      if (item.server_name && !serverId) {
        const server = await this.prisma.server.findFirst({
          where: { name: item.server_name },
        });
        serverId = server?.id;
      }

      if (!serverId) {
        results.push({
          success: false,
          error: 'Server not found',
          item,
        });
        continue;
      }

      try {
        await this.prisma.metric.create({
          data: {
            serverId,
            metric: item.metric,
            ts: new Date(item.ts),
            value: item.value,
          },
        });
        results.push({ success: true });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          item,
        });
      }
    }

    return results;
  }
}
