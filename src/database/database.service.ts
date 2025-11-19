import { PrismaClient } from '@prisma/client';
import { singleton } from 'tsyringe';
import { Logger } from '@common/logger';

@singleton()
export class DatabaseService {
  private prisma: PrismaClient;

  constructor(private logger: Logger) {
    this.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.logger.info('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.logger.info('Database disconnected successfully');
    } catch (error) {
      this.logger.error('Failed to disconnect from database', error);
      throw error;
    }
  }

  public get client(): PrismaClient {
    return this.prisma;
  }

  // Guild operations
  public async getGuild(id: string) {
    return this.prisma.guild.findUnique({ where: { id } });
  }

  public async createGuild(id: string, data?: { prefix?: string; settings?: any }) {
    return this.prisma.guild.create({
      data: {
        id,
        prefix: data?.prefix,
        settings: data?.settings,
      },
    });
  }

  public async updateGuild(id: string, data: { prefix?: string; settings?: any }) {
    return this.prisma.guild.update({
      where: { id },
      data,
    });
  }

  public async getOrCreateGuild(id: string) {
    let guild = await this.getGuild(id);
    if (!guild) {
      guild = await this.createGuild(id);
    }
    return guild;
  }

  // User operations
  public async getUser(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  public async createUser(id: string, data?: { permissions?: string[]; level?: number }) {
    return this.prisma.user.create({
      data: {
        id,
        permissions: data?.permissions,
        level: data?.level,
      },
    });
  }

  public async updateUser(
    id: string,
    data: { permissions?: string[]; level?: number; experience?: number }
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  public async getOrCreateUser(id: string) {
    let user = await this.getUser(id);
    if (!user) {
      user = await this.createUser(id);
    }
    return user;
  }

  // Warning operations
  public async createWarning(data: {
    userId: string;
    guildId: string;
    reason: string;
    moderator: string;
  }) {
    return this.prisma.warning.create({ data });
  }

  public async getWarnings(userId: string, guildId: string) {
    return this.prisma.warning.findMany({
      where: { userId, guildId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getWarningCount(userId: string, guildId: string): Promise<number> {
    return this.prisma.warning.count({
      where: { userId, guildId },
    });
  }

  public async deleteWarning(id: string) {
    return this.prisma.warning.delete({ where: { id } });
  }

  // Command usage tracking
  public async logCommandUsage(data: {
    commandName: string;
    userId: string;
    guildId?: string;
  }) {
    return this.prisma.commandUsage.create({ data });
  }

  public async getCommandUsageStats(commandName?: string) {
    return this.prisma.commandUsage.groupBy({
      by: ['commandName'],
      where: commandName ? { commandName } : undefined,
      _count: true,
    });
  }
}
