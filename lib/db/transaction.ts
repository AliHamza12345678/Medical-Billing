import { prisma } from './index';

export type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function runInTransaction<T>(
  action: (tx: TransactionClient) => Promise<T>,
  options?: { maxWait?: number; timeout?: number }
): Promise<T> {
  return prisma.$transaction(async (tx: unknown) => {
    return await action(tx as TransactionClient);
  }, {
    maxWait: options?.maxWait ?? 5000,
    timeout: options?.timeout ?? 10000,
  });
}
