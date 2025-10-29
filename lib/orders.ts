import { prisma } from "./db";

/**
 * Generate a unique human-readable order number
 * Format: LUM-YYYYMMDD-NNN
 * Example: LUM-20241028-001
 */
export async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const datePrefix = `${year}${month}${day}`;

  // Find the highest order number for today
  const latestOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `LUM-${datePrefix}`,
      },
    },
    orderBy: {
      orderNumber: "desc",
    },
  });

  let sequence = 1;
  if (latestOrder) {
    // Extract sequence number from the last order (e.g., "LUM-20241028-005" -> 5)
    const lastSequence = parseInt(latestOrder.orderNumber.split("-")[2], 10);
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(3, "0");
  return `LUM-${datePrefix}-${sequenceStr}`;
}
