
import { z } from 'zod';

// Counter schema
export const counterSchema = z.object({
  id: z.number(),
  value: z.number().int(),
  updated_at: z.coerce.date()
});

export type Counter = z.infer<typeof counterSchema>;

// Input schema for incrementing counter
export const incrementCounterInputSchema = z.object({
  increment: z.number().int().positive().default(1)
});

export type IncrementCounterInput = z.infer<typeof incrementCounterInputSchema>;

// Input schema for resetting counter
export const resetCounterInputSchema = z.object({
  value: z.number().int().default(0)
});

export type ResetCounterInput = z.infer<typeof resetCounterInputSchema>;
