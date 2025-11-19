import { singleton } from 'tsyringe';
import { IMiddleware, MiddlewareContext, NextFunction } from '@core/interfaces/IMiddleware';
import { Middleware } from '@core/decorators';

interface RateLimitData {
  count: number;
  resetAt: number;
}

@Middleware()
@singleton()
export class RateLimitMiddleware implements IMiddleware {
  private limits: Map<string, RateLimitData> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor() {
    this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '5', 10);
    this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  }

  public async use(context: MiddlewareContext, next: NextFunction): Promise<void> {
    const userId = context.interaction.user.id;
    const now = Date.now();

    let limitData = this.limits.get(userId);

    if (!limitData || now > limitData.resetAt) {
      limitData = {
        count: 0,
        resetAt: now + this.windowMs,
      };
      this.limits.set(userId, limitData);
    }

    if (limitData.count >= this.maxRequests) {
      const resetIn = Math.ceil((limitData.resetAt - now) / 1000);
      await context.interaction.createMessage({
        content: `⏱️ You're being rate limited. Please try again in ${resetIn} seconds.`,
        flags: 64,
      });
      return;
    }

    limitData.count++;
    await next();
  }

  public reset(userId: string): void {
    this.limits.delete(userId);
  }

  public resetAll(): void {
    this.limits.clear();
  }
}
