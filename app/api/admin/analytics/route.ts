import { NextRequest, NextResponse } from "next/server";
import {
  getRevenueByChannel,
  getTopProducts,
  getTotalRevenue,
} from "@/lib/analytics";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const [totalRevenue, channelRevenue, topProducts] = await Promise.all([
      getTotalRevenue(startDate, endDate),
      getRevenueByChannel(startDate, endDate),
      getTopProducts(10, startDate, endDate),
    ]);

    return NextResponse.json({
      totalRevenue,
      channelRevenue,
      topProducts,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
