import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ServersModule } from './servers/servers.module';
import { ServerFieldsModule } from './server-fields/server-fields.module';
import { MetricsModule } from './metrics/metrics.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ServersModule,
    ServerFieldsModule,
    MetricsModule,
    AuditModule,
  ],
})
export class AppModule {}
