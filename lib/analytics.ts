// lib/analytics.ts
import { prisma } from "./db";

export type ChannelRevenue = {
  channel: string;
  totalCents: number;
  count: number;
};

export type TopProduct = {
  productId: string;
  title: string;
  totalCents: number;
  unitsSold: number;
};

export type UtmSource = {
  source: string;
  count: number;
  totalCents: number;
};

export async function getRevenueByChannel(
  startDate?: Date,
  endDate?: Date
): Promise<ChannelRevenue[]> {
  const where = startDate && endDate
    ? {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    : {};

  const sales = await prisma.sale.groupBy({
    by: ["channel"],
    where,
    _sum: {
      totalCents: true,
    },
    _count: {
      id: true,
    },
  });

  return sales.map((s) => ({
    channel: s.channel,
    totalCents: s._sum.totalCents || 0,
    count: s._count.id,
  }));
}

export async function getTopProducts(
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
): Promise<TopProduct[]> {
  const where = startDate && endDate
    ? {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    : {};

  const sales = await prisma.sale.findMany({
    where,
    include: {
      listing: {
        include: {
          product: true,
        },
      },
    },
  });

  // Group by product
  const productMap = new Map<string, { title: string; totalCents: number; qty: number }>();

  sales.forEach((sale) => {
    const productId = sale.listing.product.id;
    const existing = productMap.get(productId);

    if (existing) {
      existing.totalCents += sale.totalCents;
      existing.qty += sale.qty;
    } else {
      productMap.set(productId, {
        title: sale.listing.product.title,
        totalCents: sale.totalCents,
        qty: sale.qty,
      });
    }
  });

  return Array.from(productMap.entries())
    .map(([productId, data]) => ({
      productId,
      title: data.title,
      totalCents: data.totalCents,
      unitsSold: data.qty,
    }))
    .sort((a, b) => b.totalCents - a.totalCents)
    .slice(0, limit);
}

export async function getUtmSourceBreakdown(
  startDate?: Date,
  endDate?: Date
): Promise<UtmSource[]> {
  const where = startDate && endDate
    ? {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        utmSource: {
          not: null,
        },
      }
    : {
        utmSource: {
          not: null,
        },
      };

  const sales = await prisma.sale.groupBy({
    by: ["utmSource"],
    where,
    _sum: {
      totalCents: true,
    },
    _count: {
      id: true,
    },
  });

  return sales.map((s) => ({
    source: s.utmSource || "unknown",
    count: s._count.id,
    totalCents: s._sum.totalCents || 0,
  }));
}

export async function getTotalRevenue(
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const where = startDate && endDate
    ? {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    : {};

  const result = await prisma.sale.aggregate({
    where,
    _sum: {
      totalCents: true,
    },
  });

  return result._sum.totalCents || 0;
}
