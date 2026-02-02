import { config } from '../config/env.config';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const env = config.nodeEnv;

    if (context && Object.keys(context).length > 0) {
      return `[${timestamp}] [${level.toUpperCase()}] [${env}] ${message} ${JSON.stringify(context)}`;
    }

    return `[${timestamp}] [${level.toUpperCase()}] [${env}] ${message}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | LogContext | unknown): void {
    if (error instanceof Error) {
      console.error(this.formatMessage('error', message, {
        message: error.message,
        stack: error.stack,
      }));
    } else if (error && typeof error === 'object') {
      console.error(this.formatMessage('error', message, error as LogContext));
    } else {
      console.error(this.formatMessage('error', message));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (config.nodeEnv === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();
