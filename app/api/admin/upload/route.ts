import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/storage";
import { UploadSticker } from "@/lib/schema";

async function generateUniqueSlugFromTitle(title: string) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "design";

  let candidate = baseSlug;
  let suffix = 2;

  // Ensure we don't collide with an existing product slug
  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tagsString = formData.get("tags") as string;
    const sizeInches = formData.get("sizeInches") as string;
    const finish = formData.get("finish") as string;
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const tags = tagsString
      ? tagsString.split(",").map((t) => t.trim())
      : [];

    // Validate input
    const validatedData = UploadSticker.parse({
      title,
      description,
      tags,
      fileName: file.name,
      sizeInches,
      finish,
    });

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const url = await saveFile(buffer, filename, "designs");

    // Create design, asset, and product
    const slug = await generateUniqueSlugFromTitle(validatedData.title);

    // Default pricing for variants (in cents)
    const DEFAULT_PRICING: Record<string, Record<string, number>> = {
      "2": { glossy: 500, matte: 500 },   // 2" stickers: $5.00
      "3": { glossy: 700, matte: 700 },   // 3" stickers: $7.00
      "4": { glossy: 900, matte: 900 },   // 4" stickers: $9.00
    };

    // Generate variants for the product
    const sizes = [validatedData.sizeInches];
    const finishes = [validatedData.finish];
    const variants = [];
    for (const size of sizes) {
      for (const finish of finishes) {
        const priceCents = DEFAULT_PRICING[size]?.[finish] || 500;
        variants.push({ size, finish, priceCents });
      }
    }

    const design = await prisma.design.create({
      data: {
        prompt: validatedData.description,
        tags: validatedData.tags.join(","),
        status: "uploaded",
        assets: {
          create: {
            kind: "source",
            url,
            width: 1000, // TODO: Get actual dimensions
            height: 1000,
            dpi: 300,
          },
        },
        products: {
          create: {
            slug,
            title: validatedData.title,
            description: validatedData.description,
            optionsJson: JSON.stringify({
              sizes,
              finishes,
            }),
            variantsJson: JSON.stringify({ variants }),
            listings: {
              create: {
                channel: "site",
                status: "active",
                priceCents: variants[0].priceCents,
                seoTitle: validatedData.title,
                keywords: validatedData.tags.join(", "),
              },
            },
          },
        },
      },
      include: {
        assets: true,
        products: {
          include: {
            listings: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      design,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
