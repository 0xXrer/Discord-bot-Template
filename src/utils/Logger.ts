export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private name: string;
  private level: LogLevel;

  constructor(name: string, level: LogLevel = LogLevel.INFO) {
      this.name = name;
      this.level = level;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
      const timestamp = new Date().toISOString();
      const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ') : '';
      
      return `[${timestamp}] [${level}] [${this.name}] ${message}${formattedArgs}`;
  }

  public debug(message: string, ...args: any[]): void {
      if (this.level <= LogLevel.DEBUG) {
          console.log(this.formatMessage('DEBUG', message, ...args));
      }
  }

  public info(message: string, ...args: any[]): void {
      if (this.level <= LogLevel.INFO) {
          console.log(this.formatMessage('INFO', message, ...args));
      }
  }

  public warn(message: string, ...args: any[]): void {
      if (this.level <= LogLevel.WARN) {
          console.warn(this.formatMessage('WARN', message, ...args));
      }
  }

  public error(message: string, ...args: any[]): void {
      if (this.level <= LogLevel.ERROR) {
          console.error(this.formatMessage('ERROR', message, ...args));
      }
  }

  public setLevel(level: LogLevel): void {
      this.level = level;
  }

  public getLevel(): LogLevel {
      return this.level;
  }
}