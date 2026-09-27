import { HindsightClient } from '@vectorize-io/hindsight-client';
import { HealthStatus, HistoricalMemory } from '../types';
import { ALL_HISTORICAL_MEMORIES, ENTERPRISE_MEMORY_CHAINS } from '../lib/demo-data';

export class HindsightService {
  private client: HindsightClient | null = null;
  private baseUrl: string;
  private apiKey: string | null = null;
  private bankId: string;
  private inMemoryStore: HistoricalMemory[] = [...ALL_HISTORICAL_MEMORIES];

  constructor() {
    this.baseUrl = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';
    this.apiKey = process.env.HINDSIGHT_API_KEY || null;
    this.bankId = process.env.HINDSIGHT_BANK_ID || 'echoless-org-memory';

    if (this.apiKey) {
      try {
        this.client = new HindsightClient({
          baseUrl: this.baseUrl,
          apiKey: this.apiKey,
        });
      } catch (err) {
        console.error('[ECHOLESS/Hindsight] Failed to initialize HindsightClient:', err);
        this.client = null;
      }
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.client && this.apiKey);
  }

  public getBankId(): string {
    return this.bankId;
  }

  public async getHealth(): Promise<HealthStatus> {
    const memoryCount = this.inMemoryStore.length;

    if (!this.client || !this.apiKey) {
      return {
        status: 'unavailable',
        configured: false,
        baseUrl: this.baseUrl,
        bankId: this.bankId,
        message: 'HINDSIGHT_API_KEY is not configured on the server. Running in localized organizational memory mode.',
        memoryCount,
      };
    }

    try {
      const version = await this.client.getVersion();
      return {
        status: 'connected',
        configured: true,
        baseUrl: this.baseUrl,
        bankId: this.bankId,
        message: 'Connected to Hindsight Cloud memory cluster.',
        memoryCount,
        version: version?.api_version || '0.10.x',
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn('[ECHOLESS/Hindsight] Health check ping failed:', errorMessage);
      return {
        status: 'unavailable',
        configured: true,
        baseUrl: this.baseUrl,
        bankId: this.bankId,
        message: 'Hindsight memory is currently unavailable. Check the server configuration and try again.',
        memoryCount,
      };
    }
  }

  public async retain(
    content: string,
    options?: {
      context?: string;
      tags?: string[];
      metadata?: Record<string, string>;
      timestamp?: Date | string;
    }
  ) {
    let hindsightResult = null;

    if (this.client) {
      try {
        hindsightResult = await this.client.retain(this.bankId, content, {
          context: options?.context,
          tags: options?.tags,
          metadata: options?.metadata,
          timestamp: options?.timestamp,
        });
      } catch (err: unknown) {
        console.error('[ECHOLESS/Hindsight] retain() call failed:', err);
      }
    }

    return {
      success: true,
      hindsightRetained: Boolean(hindsightResult),
      result: hindsightResult,
    };
  }

  public async recall(
    query: string,
    options?: {
      maxTokens?: number;
      budget?: 'low' | 'mid' | 'high';
      tags?: string[];
    }
  ) {
    if (this.client) {
      try {
        const response = await this.client.recall(this.bankId, query, {
          maxTokens: options?.maxTokens || 2048,
          budget: options?.budget || 'mid',
          tags: options?.tags,
          signal: AbortSignal.timeout(1500),
        });
        return {
          source: 'hindsight' as const,
          response,
        };
      } catch (err: unknown) {
        console.warn('[ECHOLESS/Hindsight] recall() call failed, falling back to local memory engine:', err);
      }
    }

    return {
      source: 'local' as const,
      response: null,
    };
  }

  public async reflect(
    query: string,
    options?: {
      context?: string;
      budget?: 'low' | 'mid' | 'high';
    }
  ) {
    if (this.client) {
      try {
        const response = await this.client.reflect(this.bankId, query, {
          context: options?.context,
          budget: options?.budget || 'mid',
          includeFacts: true,
          signal: AbortSignal.timeout(1500),
        });
        return {
          source: 'hindsight' as const,
          response,
        };
      } catch (err: unknown) {
        console.warn('[ECHOLESS/Hindsight] reflect() call failed, using synthesized organizational reflection:', err);
      }
    }

    return {
      source: 'local' as const,
      response: null,
    };
  }

  public async listMemories(): Promise<HistoricalMemory[]> {
    return this.inMemoryStore;
  }

  public addMemory(memory: HistoricalMemory): void {
    this.inMemoryStore.unshift(memory);
  }

  public async seedBank(): Promise<{ seededCount: number; remoteSuccess: boolean; error?: string }> {
    let remoteSuccess = false;
    let error: string | undefined;

    if (this.client) {
      try {
        for (const chain of ENTERPRISE_MEMORY_CHAINS) {
          const documentContent = `
Project: ${chain.project} (${chain.year})
WARNING: ${chain.warning.text} [Raised by: ${chain.warning.raisedBy || 'Staff'}]
DECISION: ${chain.decision.text} [Rationale: ${chain.decision.rationale || 'None'}]
ACTION: ${chain.action.text}
OUTCOME: ${chain.outcome.text} [Severity: ${chain.outcome.severity}]
LESSON: ${chain.lesson.text}
FUTURE RISK: ${chain.futureRisk.text}
RECOMMENDATION: ${chain.futureRisk.recommendation}
          `.trim();

          await this.client.retain(this.bankId, documentContent, {
            context: `Organizational historical postmortem: ${chain.project}`,
            tags: [chain.project.toLowerCase().replace(/\s+/g, '-'), 'postmortem', 'near-miss', chain.outcome.severity],
            metadata: {
              project: chain.project,
              year: String(chain.year),
              severity: chain.outcome.severity,
            },
          });
        }
        remoteSuccess = true;
      } catch (err: unknown) {
        error = err instanceof Error ? err.message : String(err);
        console.warn('[ECHOLESS/Hindsight] Remote seeding had issues:', error);
      }
    }

    return {
      seededCount: ENTERPRISE_MEMORY_CHAINS.length,
      remoteSuccess,
      error,
    };
  }
}

export const hindsightService = new HindsightService();
