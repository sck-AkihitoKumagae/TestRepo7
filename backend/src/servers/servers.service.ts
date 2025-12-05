import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ServerWhereInput;
    orderBy?: Prisma.ServerOrderByWithRelationInput;
    search?: string;
    env?: string;
    tags?: string[];
  }) {
    const { skip, take, where = {}, orderBy, search, env, tags } = params;

    // Build dynamic where clause
    const whereClause: Prisma.ServerWhereInput = { ...where };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { os: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (env) {
      whereClause.environment = env;
    }

    if (tags && tags.length > 0) {
      whereClause.tags = {
        some: {
          tag: { in: tags },
        },
      };
    }

    const [servers, total] = await Promise.all([
      this.prisma.server.findMany({
        skip,
        take,
        where: whereClause,
        orderBy,
        include: {
          tags: true,
        },
      }),
      this.prisma.server.count({ where: whereClause }),
    ]);

    return { servers, total };
  }

  async findOne(id: string) {
    return this.prisma.server.findUnique({
      where: { id },
      include: {
        tags: true,
        metrics: {
          orderBy: { ts: 'desc' },
          take: 100,
        },
      },
    });
  }

  async create(data: Prisma.ServerCreateInput & { tags?: string[] }) {
    const { tags, ...serverData } = data;
    
    return this.prisma.server.create({
      data: {
        ...serverData,
        tags: tags
          ? {
              create: tags.map((tag) => ({ tag })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });
  }

  async update(id: string, data: Prisma.ServerUpdateInput & { tags?: string[] }) {
    const { tags, ...serverData } = data;

    // If tags are provided, delete existing and create new ones
    if (tags) {
      await this.prisma.serverTag.deleteMany({
        where: { serverId: id },
      });
    }

    return this.prisma.server.update({
      where: { id },
      data: {
        ...serverData,
        tags: tags
          ? {
              create: tags.map((tag) => ({ tag })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.server.delete({
      where: { id },
    });
  }
}
