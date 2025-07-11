
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type IncrementCounterInput, type Counter } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const incrementCounter = async (input: IncrementCounterInput): Promise<Counter> => {
  try {
    // Check if counter exists
    const existingCounters = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    if (existingCounters.length === 0) {
      // Create new counter with initial value
      const result = await db.insert(countersTable)
        .values({
          value: input.increment
        })
        .returning()
        .execute();

      return result[0];
    }

    // Update existing counter by incrementing its value
    const result = await db.update(countersTable)
      .set({
        value: sql`${countersTable.value} + ${input.increment}`,
        updated_at: new Date()
      })
      .where(eq(countersTable.id, existingCounters[0].id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Counter increment failed:', error);
    throw error;
  }
};
