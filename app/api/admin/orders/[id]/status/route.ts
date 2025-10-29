import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateOrderStatus } from "@/lib/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validated = UpdateOrderStatus.parse(body);

    const order = await prisma.order.update({
      where: { id },
      data: { status: validated.status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Update order status error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
