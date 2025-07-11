
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type Counter } from '../schema';

export const getCounter = async (): Promise<Counter> => {
  try {
    // Try to get the first counter from the database
    const results = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    // If no counter exists, create one with default value 0
    if (results.length === 0) {
      const newCounter = await db.insert(countersTable)
        .values({
          value: 0
        })
        .returning()
        .execute();

      return newCounter[0];
    }

    // Return the existing counter
    return results[0];
  } catch (error) {
    console.error('Get counter failed:', error);
    throw error;
  }
};
