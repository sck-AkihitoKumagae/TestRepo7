import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample server fields (metadata)
  const fields = [
    {
      key: 'owner_dept',
      label: '所有部署',
      type: 'string',
      group: '資産',
      orderIndex: 10,
      required: false,
    },
    {
      key: 'backup_policy',
      label: 'バックアップポリシー',
      type: 'enum',
      options: { values: ['Daily', 'Weekly', 'Monthly', 'None'] },
      group: '運用',
      orderIndex: 20,
      required: false,
    },
    {
      key: 'maintenance_expiry',
      label: '保守期限',
      type: 'date',
      group: '資産',
      orderIndex: 30,
      required: false,
    },
    {
      key: 'cpu_cores',
      label: 'CPUコア数',
      type: 'number',
      unit: 'cores',
      group: '構成',
      orderIndex: 40,
      required: false,
    },
    {
      key: 'memory_gb',
      label: 'メモリ容量',
      type: 'number',
      unit: 'GB',
      group: '構成',
      orderIndex: 50,
      required: false,
    },
  ];

  for (const field of fields) {
    await prisma.serverField.upsert({
      where: { key: field.key },
      update: field,
      create: field,
    });
  }

  console.log('Server fields created');

  // Create sample servers
  const server1 = await prisma.server.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'srv-app-001',
      ipAddress: '10.20.30.40',
      environment: 'prod',
      os: 'Windows Server 2022',
      role: 'Application',
      location: 'DC-1 Rack-12',
      attributes: {
        owner_dept: 'IT運用',
        backup_policy: 'Daily',
        maintenance_expiry: '2026-03-31',
        cpu_cores: 8,
        memory_gb: 32,
      },
      tags: {
        create: [{ tag: 'primera' }, { tag: 'etl' }],
      },
    },
  });

  const server2 = await prisma.server.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'srv-db-001',
      ipAddress: '10.20.30.41',
      environment: 'prod',
      os: 'Red Hat Enterprise Linux 9',
      role: 'Database',
      location: 'DC-1 Rack-13',
      attributes: {
        owner_dept: 'データベース',
        backup_policy: 'Daily',
        maintenance_expiry: '2027-12-31',
        cpu_cores: 16,
        memory_gb: 128,
      },
      tags: {
        create: [{ tag: 'postgresql' }, { tag: 'production' }],
      },
    },
  });

  console.log('Sample servers created');

  // Create sample metrics
  const now = new Date();
  const metrics = [
    {
      serverId: server1.id,
      metric: 'memory_used_percent',
      ts: now,
      value: 63.4,
    },
    {
      serverId: server1.id,
      metric: 'disk_free_tb',
      ts: now,
      value: 0.142,
    },
    {
      serverId: server2.id,
      metric: 'memory_used_percent',
      ts: now,
      value: 78.2,
    },
    {
      serverId: server2.id,
      metric: 'disk_free_tb',
      ts: now,
      value: 2.5,
    },
  ];

  for (const metric of metrics) {
    await prisma.metric.create({
      data: metric,
    });
  }

  console.log('Sample metrics created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
