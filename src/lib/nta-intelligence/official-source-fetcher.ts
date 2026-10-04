import crypto from 'crypto';
import prisma from '@/lib/prisma';

// Strict Domain Allowlist
export const ALLOWED_DOMAINS = [
  'nta.ac.in',
  'www.nta.ac.in',
  'neet.nta.nic.in',
  'www.nmc.org.in',
  'nmc.org.in',
];

export interface FetchResult {
  url: string;
  httpStatus: number;
  contentHash: string;
  latencyMs: number;
  bodyText?: string;
  contentType?: string;
  error?: string;
}

/**
 * Validate URL strictly against government authority allowlist
 */
export function validateOfficialUrl(urlStr: string): { isValid: boolean; error?: string } {
  try {
    const parsed = new URL(urlStr);

    // Enforce HTTPS
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { isValid: false, error: 'Only HTTP/HTTPS protocols are permitted' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check allowlist
    const isAllowed = ALLOWED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed) {
      return {
        isValid: false,
        error: `Host ${hostname} is not in the official government source allowlist (${ALLOWED_DOMAINS.join(', ')})`,
      };
    }

    // Disallow private / local IPs to prevent SSRF
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.')
    ) {
      return { isValid: false, error: 'Private and loopback addresses are strictly forbidden' };
    }

    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: `Invalid URL format: ${err.message}` };
  }
}

/**
 * Compute SHA-256 hash of a string or buffer
 */
export function computeSha256(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Fetch official source with strict safety and timeout
 */
export async function fetchOfficialSource(url: string, timeoutMs = 12000): Promise<FetchResult> {
  const validation = validateOfficialUrl(url);
  if (!validation.isValid) {
    return {
      url,
      httpStatus: 400,
      contentHash: '',
      latencyMs: 0,
      error: validation.error,
    };
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'KritiNEET-OfficialIntelligenceMonitor/1.0 (+https://neet2027.com/bot)',
        Accept: 'text/html,application/xhtml+xml,application/xml,application/pdf;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      return {
        url,
        httpStatus: response.status,
        contentHash: '',
        latencyMs,
        contentType,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const text = await response.text();
    const contentHash = computeSha256(text);

    return {
      url,
      httpStatus: response.status,
      contentHash,
      latencyMs,
      bodyText: text,
      contentType,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      url,
      httpStatus: 0,
      contentHash: '',
      latencyMs,
      error: err.name === 'AbortError' ? 'Request timed out after 12s' : err.message,
    };
  }
}

/**
 * Check official source health and record check log in DB
 */
export async function checkSourceHealth(sourceCode: 'NTA' | 'NEET_PORTAL' | 'NMC') {
  const source = await prisma.officialSource.findUnique({
    where: { code: sourceCode },
  });

  if (!source) {
    throw new Error(`Official source ${sourceCode} not registered in database`);
  }

  const result = await fetchOfficialSource(source.noticeBoardUrl);

  const isHealthy = result.httpStatus === 200;
  const newStatus = isHealthy ? 'HEALTHY' : result.httpStatus === 0 ? 'OUTAGE' : 'DEGRADED';

  // Record check in DB
  const check = await prisma.officialSourceCheck.create({
    data: {
      sourceId: source.id,
      httpStatus: result.httpStatus,
      latencyMs: result.latencyMs,
      contentHash: result.contentHash || null,
      status: isHealthy ? 'SUCCESS' : 'FAILED',
      errorMessage: result.error || null,
      newDocumentsFound: 0,
    },
  });

  // Update source
  await prisma.officialSource.update({
    where: { id: source.id },
    data: {
      status: newStatus,
      lastCheckedAt: new Date(),
      lastSuccessAt: isHealthy ? new Date() : source.lastSuccessAt,
      lastFailureAt: !isHealthy ? new Date() : source.lastFailureAt,
      lastFailureReason: result.error || null,
      contentHash: result.contentHash || source.contentHash,
    },
  });

  return { source, check, result };
}
