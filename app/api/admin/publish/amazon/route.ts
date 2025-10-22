import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PublishAmazon } from "@/lib/schema";
import * as amazon from "@/lib/amazon";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PublishAmazon.parse(body);

    // Get product with assets
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      include: {
        design: {
          include: {
            assets: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Generate SKU
    const sku = `LUMERON-${product.slug.toUpperCase()}`;

    // Get mockup URLs
    const mockups = product.design.assets
      .filter((a) => a.kind === "mockup")
      .map((a) => a.url);

    // Submit product feed to Amazon
    const amazonProduct = await amazon.submitProductFeed({
      sku,
      title: product.title,
      description: product.description,
      priceCents: validatedData.priceCents,
      imageUrls: mockups,
    });

    // Create listing record
    const listing = await prisma.listing.create({
      data: {
        productId: product.id,
        channel: "amazon",
        externalId: amazonProduct.feedId,
        status: "pending",
        priceCents: validatedData.priceCents,
        seoTitle: product.title,
        keywords: product.design.tags,
      },
    });

    return NextResponse.json({
      success: true,
      listing,
      sku,
      feedId: amazonProduct.feedId,
    });
  } catch (error) {
    console.error("Amazon publish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publish to Amazon failed" },
      { status: 500 }
    );
  }
}
