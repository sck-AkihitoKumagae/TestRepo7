import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServerFieldsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.serverField.findMany({
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.serverField.findUnique({
      where: { id: BigInt(id) },
    });
  }

  async create(data: Prisma.ServerFieldCreateInput) {
    return this.prisma.serverField.create({
      data,
    });
  }

  async update(id: number, data: Prisma.ServerFieldUpdateInput) {
    return this.prisma.serverField.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.serverField.delete({
      where: { id: BigInt(id) },
    });
  }
}
