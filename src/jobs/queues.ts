export const QUEUES = {
  embeddings: 'embeddings',
  summaries: 'summaries',
  sentiment: 'sentiment',
  personalization: 'personalization',
} as const;

export const QUEUE_NAMES = {
  WEEKLY_SUMMARY: QUEUES.summaries,
  PERSONALIZATION: QUEUES.personalization,
  SENTIMENT: QUEUES.sentiment,
  EMBEDDINGS: QUEUES.embeddings,
} as const;

export const JOB_NAMES = {
  WEEKLY_SUMMARY: 'weekly-summary',
  PERSONALIZATION_UPDATE: 'personalization-update',
  SENTIMENT_SINGLE: 'sentiment-single',
  EMBED_USER_DATA: 'embed-user-data',
} as const;

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: 100,
  removeOnFail: 50,
};

export interface WeeklySummaryPayload {
  userId: string;
  weekStart: string;
  weekEnd: string;
  triggerType?: 'cron' | 'manual';
}

export interface PersonalizationUpdatePayload {
  userId: string;
  triggeredBy: 'cron' | 'manual';
}

export interface SentimentPayload {
  userId: string;
  reflectionId: string;
}

export interface EmbedPayload {
  userId: string;
  source: string;
  sourceId: string;
}
