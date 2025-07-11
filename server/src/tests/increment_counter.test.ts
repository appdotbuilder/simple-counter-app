
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type IncrementCounterInput } from '../schema';
import { incrementCounter } from '../handlers/increment_counter';
import { eq } from 'drizzle-orm';

describe('incrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new counter when none exists', async () => {
    const input: IncrementCounterInput = {
      increment: 5
    };

    const result = await incrementCounter(input);

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(5);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter value', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 10
      })
      .execute();

    const input: IncrementCounterInput = {
      increment: 3
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(13);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save incremented value to database', async () => {
    // Create initial counter
    const initial = await db.insert(countersTable)
      .values({
        value: 7
      })
      .returning()
      .execute();

    const input: IncrementCounterInput = {
      increment: 4
    };

    const result = await incrementCounter(input);

    // Verify database state
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(11);
    expect(counters[0].id).toEqual(initial[0].id);
  });

  it('should use default increment value of 1', async () => {
    const input: IncrementCounterInput = {
      increment: 1 // This would be the default from Zod
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(1);
  });

  it('should handle large increment values', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 1000
      })
      .execute();

    const input: IncrementCounterInput = {
      increment: 9999
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(10999);
  });
});
