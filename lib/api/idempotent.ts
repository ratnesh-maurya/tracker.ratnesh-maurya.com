import type { Document, Model } from 'mongoose';
import { z } from 'zod';

// Optional on create bodies. Generated on the device so a save that is retried
// (offline queue, flaky network) never creates a second entry.
export const clientIdSchema = z.string().uuid().optional();

const isDuplicateKey = (error: unknown) => (error as { code?: number })?.code === 11000;

// Saves `doc` unless this user already has an entry with the same clientId.
// `created` is false when the earlier copy is returned instead.
export async function saveOnce<T extends Document>(
  model: Model<T>,
  doc: T,
  userId: string,
  clientId: string | undefined
): Promise<{ doc: T; created: boolean }> {
  if (!clientId) {
    await doc.save();
    return { doc, created: true };
  }

  const existing = await model.findOne({ userId, clientId });
  if (existing) return { doc: existing, created: false };

  try {
    await doc.save();
    return { doc, created: true };
  } catch (error) {
    // Two copies of the same request raced past the findOne above.
    if (!isDuplicateKey(error)) throw error;
    const winner = await model.findOne({ userId, clientId });
    if (!winner) throw error;
    return { doc: winner, created: false };
  }
}
