import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import { AppConfigService } from '../../config/config.service';

export interface SentimentResult {
  label: 'positive' | 'neutral' | 'negative';
  score: number;
  confidence: number;
}

export interface EmbedResult {
  ok: boolean;
  vectorId?: string;
}

export interface ChatRequest {
  userId: string;
  message: string;
  history?: { role: 'user' | 'assistant'; text: string }[];
}

export interface ChatResponse {
  reply: string;
  citations?: { source: string; sourceId: string; snippet: string }[];
}

export interface WeeklySummaryResult {
  userId: string;
  weekStart: string;
  weekEnd: string;
  summary: string;
  highlights: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly cfg: AppConfigService) {}

  analyzeSentiment(text: string): Promise<SentimentResult> {
    return this.post<SentimentResult>('/sentiment', { text });
  }

  embed(payload: { userId: string; source: string; sourceId: string; text: string }): Promise<EmbedResult> {
    return this.post<EmbedResult>('/embed', payload);
  }

  chat(payload: ChatRequest): Promise<ChatResponse> {
    return this.post<ChatResponse>('/chat', payload);
  }

  weeklySummary(payload: { userId: string; weekStart: string; weekEnd: string; reflections: string[] }): Promise<WeeklySummaryResult> {
    return this.post<WeeklySummaryResult>('/weekly-summary', payload);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.cfg.aiServiceUrl}${path}`;
    const bodyStr = JSON.stringify(body);
    const timestamp = Date.now().toString();
    const signature = createHmac('sha256', this.cfg.aiServiceHmacSecret)
      .update(`${timestamp}.${bodyStr}`)
      .digest('hex');

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OptiTime-Timestamp': timestamp,
          'X-OptiTime-Signature': signature,
        },
        body: bodyStr,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`AI ${path} ${res.status}: ${text || res.statusText}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      this.logger.error(`AI call failed: ${path}`, err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException('AI service unavailable');
    }
  }
}
