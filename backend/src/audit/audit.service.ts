import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    actor: string;
    action: string;
    serverId?: string;
    payload: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actor: data.actor,
        action: data.action,
        serverId: data.serverId,
        payload: data.payload,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    serverId?: string;
    actor?: string;
    from?: Date;
    to?: Date;
  }) {
    const { skip, take, serverId, actor, from, to } = params;

    const where: Prisma.AuditLogWhereInput = {};

    if (serverId) {
      where.serverId = serverId;
    }

    if (actor) {
      where.actor = { contains: actor, mode: 'insensitive' };
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          server: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}
