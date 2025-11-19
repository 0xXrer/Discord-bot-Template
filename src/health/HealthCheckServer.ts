import express, { Express, Request, Response } from 'express';
import { Server } from 'http';
import { singleton } from 'tsyringe';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { Logger } from '@common/logger';
import { Config } from '@config/Config';
import { ExtendedClient } from '@core/client';

@singleton()
export class HealthCheckServer {
  private app: Express;
  private server?: Server;
  private commandCounter: Counter;
  private commandDuration: Histogram;

  constructor(
    private logger: Logger,
    private config: Config,
    private client: ExtendedClient
  ) {
    this.app = express();

    collectDefaultMetrics({ register });

    this.commandCounter = new Counter({
      name: 'bot_commands_total',
      help: 'Total number of commands executed',
      labelNames: ['command', 'status'],
    });

    this.commandDuration = new Histogram({
      name: 'bot_command_duration_seconds',
      help: 'Duration of command execution in seconds',
      labelNames: ['command'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.get('/health', (_req: Request, res: Response) => {
      const isHealthy = this.client.ready && this.client.shards.size > 0;

      if (isHealthy) {
        res.status(200).json({
          status: 'healthy',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          status: 'unhealthy',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.app.get('/ready', (_req: Request, res: Response) => {
      const isReady = this.client.ready;

      if (isReady) {
        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          status: 'not ready',
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.app.get('/metrics', async (_req: Request, res: Response) => {
      try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
      } catch (error) {
        res.status(500).end(error);
      }
    });

    this.app.get('/stats', (_req: Request, res: Response) => {
      const memoryUsage = process.memoryUsage();

      res.status(200).json({
        bot: {
          guilds: this.client.guilds.size,
          users: this.client.users.size,
          commands: this.client.commands.size,
          shards: this.client.shards.size,
        },
        process: {
          uptime: process.uptime(),
          memory: {
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
          },
          nodeVersion: process.version,
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  public start(): void {
    const port = this.config.get('port');

    this.server = this.app.listen(port, () => {
      this.logger.info(`Health check server listening on port ${port}`);
      this.logger.info(`Health: http://localhost:${port}/health`);
      this.logger.info(`Ready: http://localhost:${port}/ready`);
      this.logger.info(`Metrics: http://localhost:${port}/metrics`);
      this.logger.info(`Stats: http://localhost:${port}/stats`);
    });
  }

  public stop(): void {
    if (this.server) {
      this.server.close(() => {
        this.logger.info('Health check server stopped');
      });
    }
  }

  public incrementCommandCounter(command: string, status: 'success' | 'error'): void {
    this.commandCounter.inc({ command, status });
  }

  public observeCommandDuration(command: string, duration: number): void {
    this.commandDuration.observe({ command }, duration);
  }
}
