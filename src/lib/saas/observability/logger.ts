/**
 * Phase 8: Structured JSON Logging & Data Sanitizer
 * Produces structured machine-readable logs with request tracing and
 * strictly redacts sensitive secrets (passwords, tokens, payment secrets).
 */

export interface StructuredLogPayload {
  level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  action: string;
  requestId?: string;
  userId?: string;
  tenantId?: string;
  status?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
  error?: string;
}

export class StructuredLogger {
  private static SENSITIVE_KEYS = new Set([
    'password',
    'secret',
    'token',
    'authorization',
    'apikey',
    'creditcard',
    'cvv',
    'cardnumber',
    'webhooksecret',
    'signature',
  ]);

  /**
   * Sanitizes object by recursively stripping or masking sensitive keys
   */
  public static sanitize(data: any): any {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lower = key.toLowerCase();
      if (this.SENSITIVE_KEYS.has(lower) || lower.includes('secret') || lower.includes('token') || lower.includes('password')) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  public static log(payload: StructuredLogPayload) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: payload.level || 'INFO',
      action: payload.action,
      requestId: payload.requestId || `req_${Math.random().toString(36).substring(2, 10)}`,
      userId: payload.userId || undefined,
      tenantId: payload.tenantId || undefined,
      status: payload.status || 'OK',
      durationMs: payload.durationMs,
      metadata: payload.metadata ? this.sanitize(payload.metadata) : undefined,
      error: payload.error,
    };

    const serialized = JSON.stringify(entry);
    if (payload.level === 'ERROR') {
      console.error(serialized);
    } else if (payload.level === 'WARN') {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }

    return entry;
  }

  public static info(action: string, payload?: Partial<StructuredLogPayload>) {
    return this.log({ level: 'INFO', action, ...payload });
  }

  public static warn(action: string, payload?: Partial<StructuredLogPayload>) {
    return this.log({ level: 'WARN', action, ...payload });
  }

  public static error(action: string, error: string, payload?: Partial<StructuredLogPayload>) {
    return this.log({ level: 'ERROR', action, error, ...payload });
  }
}
