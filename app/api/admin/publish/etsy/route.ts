import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PublishEtsy } from "@/lib/schema";
import * as etsy from "@/lib/etsy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PublishEtsy.parse(body);

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

    // Parse tags from design
    const tags = product.design.tags
      ? product.design.tags.split(",").map((t) => t.trim())
      : [];

    // Create Etsy listing
    const etsyListing = await etsy.createListing({
      title: product.title,
      description: product.description,
      priceCents: validatedData.priceCents,
      quantity: 999, // Set high inventory for print-on-demand
      tags,
    });

    // Upload mockup images
    const mockups = product.design.assets.filter((a) => a.kind === "mockup");
    for (const mockup of mockups) {
      await etsy.uploadImage(etsyListing.listing_id, mockup.url);
    }

    // Create listing record
    const listing = await prisma.listing.create({
      data: {
        productId: product.id,
        channel: "etsy",
        externalId: etsyListing.listing_id.toString(),
        status: "active",
        priceCents: validatedData.priceCents,
        seoTitle: product.title,
        keywords: tags.join(","),
      },
    });

    return NextResponse.json({
      success: true,
      listing,
      etsyListingId: etsyListing.listing_id,
    });
  } catch (error) {
    console.error("Etsy publish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publish to Etsy failed" },
      { status: 500 }
    );
  }
}
