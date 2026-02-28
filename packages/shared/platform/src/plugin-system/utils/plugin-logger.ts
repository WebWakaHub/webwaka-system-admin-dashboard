/**
 * Plugin System Logger
 * Provides structured logging for plugin operations
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: Record<string, unknown>;
  tenantId?: string;
  pluginId?: string;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

/**
 * Plugin System Logger
 */
export class PluginLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000;

  /**
   * Log a message
   */
  log(
    level: LogLevel,
    component: string,
    message: string,
    options?: {
      data?: Record<string, unknown>;
      tenantId?: string;
      pluginId?: string;
      error?: Error;
    }
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data: options?.data,
      tenantId: options?.tenantId,
      pluginId: options?.pluginId,
    };

    if (options?.error) {
      entry.error = {
        code: options.error.name,
        message: options.error.message,
        stack: options.error.stack,
      };
    }

    this.logs.push(entry);

    // Keep logs size bounded
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    this.consoleLog(entry);
  }

  /**
   * Log debug message
   */
  debug(
    component: string,
    message: string,
    options?: {
      data?: Record<string, unknown>;
      tenantId?: string;
      pluginId?: string;
    }
  ): void {
    this.log(LogLevel.DEBUG, component, message, options);
  }

  /**
   * Log info message
   */
  info(
    component: string,
    message: string,
    options?: {
      data?: Record<string, unknown>;
      tenantId?: string;
      pluginId?: string;
    }
  ): void {
    this.log(LogLevel.INFO, component, message, options);
  }

  /**
   * Log warning message
   */
  warn(
    component: string,
    message: string,
    options?: {
      data?: Record<string, unknown>;
      tenantId?: string;
      pluginId?: string;
      error?: Error;
    }
  ): void {
    this.log(LogLevel.WARN, component, message, options);
  }

  /**
   * Log error message
   */
  error(
    component: string,
    message: string,
    options?: {
      data?: Record<string, unknown>;
      tenantId?: string;
      pluginId?: string;
      error?: Error;
    }
  ): void {
    this.log(LogLevel.ERROR, component, message, options);
  }

  /**
   * Get all logs
   */
  getLogs(filter?: { level?: LogLevel; component?: string; tenantId?: string }): LogEntry[] {
    let filtered = this.logs;

    if (filter?.level) {
      filtered = filtered.filter((log) => log.level === filter.level);
    }

    if (filter?.component) {
      filtered = filtered.filter((log) => log.component === filter.component);
    }

    if (filter?.tenantId) {
      filtered = filtered.filter((log) => log.tenantId === filter.tenantId);
    }

    return filtered;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get log statistics
   */
  getStatistics(): {
    total: number;
    byLevel: Record<LogLevel, number>;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
      },
    };

    for (const log of this.logs) {
      stats.byLevel[log.level]++;
    }

    return stats;
  }

  /**
   * Console output for development
   */
  private consoleLog(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.component}]`;

    if (entry.tenantId) {
      console.log(`${prefix} [${entry.tenantId}]`, entry.message, entry.data || '');
    } else {
      console.log(prefix, entry.message, entry.data || '');
    }

    if (entry.error) {
      console.error(`Error: ${entry.error.code} - ${entry.error.message}`);
    }
  }
}

/**
 * Global logger instance
 */
export const pluginLogger = new PluginLogger();
