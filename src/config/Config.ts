import Joi from 'joi';
import dotenv from 'dotenv';
import { singleton } from 'tsyringe';

dotenv.config();

export interface BotConfig {
  token: string;
  clientId: string;
  clientSecret: string;
  ownerId?: string;
  nodeEnv: string;
  logLevel: string;
  databaseUrl?: string;
  redisUrl?: string;
  shards: number;
  port: number;
}

const configSchema = Joi.object<BotConfig>({
  token: Joi.string().required().description('Discord bot token'),
  clientId: Joi.string().required().description('Discord application client ID'),
  clientSecret: Joi.string().required().description('Discord application client secret'),
  ownerId: Joi.string().optional().description('Discord bot owner ID'),
  nodeEnv: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Node environment'),
  logLevel: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'debug')
    .default('info')
    .description('Logging level'),
  databaseUrl: Joi.string().uri().optional().description('Database connection URL'),
  redisUrl: Joi.string().uri().optional().description('Redis connection URL'),
  shards: Joi.number().integer().min(1).max(10).default(1).description('Number of shards'),
  port: Joi.number().integer().min(1000).max(65535).default(3000).description('HTTP server port'),
});

@singleton()
export class Config {
  private config: BotConfig;

  constructor() {
    this.config = this.validateConfig();
  }

  private validateConfig(): BotConfig {
    const rawConfig = {
      token: process.env.BOT_TOKEN,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      ownerId: process.env.OWNER_ID,
      nodeEnv: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
      databaseUrl: process.env.DATABASE_URL,
      redisUrl: process.env.REDIS_URL,
      shards: parseInt(process.env.SHARDS || '1', 10),
      port: parseInt(process.env.PORT || '3000', 10),
    };

    const { error, value } = configSchema.validate(rawConfig, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message).join(', ');
      throw new Error(`Configuration validation error: ${errors}`);
    }

    return value;
  }

  public get<K extends keyof BotConfig>(key: K): BotConfig[K] {
    return this.config[key];
  }

  public getAll(): Readonly<BotConfig> {
    return Object.freeze({ ...this.config });
  }

  public isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  public isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  public isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }
}