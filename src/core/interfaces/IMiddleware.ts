import { CommandInteraction } from 'oceanic.js';

export type NextFunction = () => Promise<void>;

export interface MiddlewareContext {
  interaction: CommandInteraction;
  [key: string]: any;
}

export interface IMiddleware {
  use(context: MiddlewareContext, next: NextFunction): Promise<void>;
}
