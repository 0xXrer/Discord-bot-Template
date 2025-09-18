export class Config {
  public readonly botToken: string;
  public readonly clientId: string;
  public readonly clientSecret: string;
  public readonly ownerId: string;
  public readonly environment: string;
  public readonly logLevel: string;
  public readonly databaseUrl?: string;

  constructor() {
      this.botToken = process.env.BOT_TOKEN!;
      this.clientId = process.env.CLIENT_ID!;
      this.clientSecret = process.env.CLIENT_SECRET!;
      this.ownerId = process.env.OWNER_ID || '';
      this.environment = process.env.NODE_ENV || 'development';
      this.logLevel = process.env.LOG_LEVEL || 'info';
      this.databaseUrl = process.env.DATABASE_URL;

      this.validate();
  }

  private validate(): void {
      if (!this.botToken) {
          throw new Error('BOT_TOKEN is required');
      }

      if (!this.clientId) {
          throw new Error('CLIENT_ID is required');
      }

      if (!this.clientSecret) {
          throw new Error('CLIENT_SECRET is required');
      }
  }

  public isDevelopment(): boolean {
      return this.environment === 'development';
  }

  public isProduction(): boolean {
      return this.environment === 'production';
  }
}