import { Env } from '@/lib/config/env';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<string, string | undefined> {}
  }
}

export {};
