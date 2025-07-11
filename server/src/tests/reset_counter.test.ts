
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type ResetCounterInput } from '../schema';
import { resetCounter } from '../handlers/reset_counter';
import { eq } from 'drizzle-orm';

// Test input with explicit value
const testInput: ResetCounterInput = {
  value: 42
};

// Test input using default value
const defaultInput: ResetCounterInput = {
  value: 0
};

describe('resetCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new counter when none exists', async () => {
    const result = await resetCounter(testInput);

    // Basic field validation
    expect(result.id).toBeDefined();
    expect(result.value).toEqual(42);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save counter to database when creating new', async () => {
    const result = await resetCounter(testInput);

    // Query database to verify creation
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(42);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update existing counter when one exists', async () => {
    // Create initial counter
    const initialResult = await db.insert(countersTable)
      .values({ value: 100 })
      .returning()
      .execute();

    const initialCounter = initialResult[0];

    // Reset counter to new value
    const result = await resetCounter(testInput);

    // Should have same ID but updated value
    expect(result.id).toEqual(initialCounter.id);
    expect(result.value).toEqual(42);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(initialCounter.updated_at.getTime());
  });

  it('should handle default value correctly', async () => {
    const result = await resetCounter(defaultInput);

    expect(result.value).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should verify only one counter exists after reset', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({ value: 50 })
      .execute();

    // Reset counter
    await resetCounter(testInput);

    // Verify only one counter exists
    const allCounters = await db.select()
      .from(countersTable)
      .execute();

    expect(allCounters).toHaveLength(1);
    expect(allCounters[0].value).toEqual(42);
  });

  it('should handle negative reset values', async () => {
    const negativeInput: ResetCounterInput = {
      value: -10
    };

    const result = await resetCounter(negativeInput);

    expect(result.value).toEqual(-10);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});
