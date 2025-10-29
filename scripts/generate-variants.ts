import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default pricing for variants (in cents)
const DEFAULT_PRICING = {
  "2": { glossy: 500, matte: 500 },   // 2" stickers: $5.00
  "3": { glossy: 700, matte: 700 },   // 3" stickers: $7.00
  "4": { glossy: 900, matte: 900 },   // 4" stickers: $9.00
};

async function generateVariants() {
  console.log("Generating variants for all products...");

  const products = await prisma.product.findMany();

  for (const product of products) {
    // Parse optionsJson to get available sizes and finishes
    let options: { sizes?: string[]; finishes?: string[] };
    try {
      options = JSON.parse(product.optionsJson);
    } catch {
      console.log(`Skipping ${product.slug}: invalid optionsJson`);
      continue;
    }

    const sizes = options.sizes || ["2", "3", "4"];
    const finishes = options.finishes || ["glossy", "matte"];

    // Generate all combinations
    const variants = [];
    for (const size of sizes) {
      for (const finish of finishes) {
        const priceCents = DEFAULT_PRICING[size as keyof typeof DEFAULT_PRICING]?.[finish as "glossy" | "matte"] || 500;
        variants.push({
          size,
          finish,
          priceCents,
        });
      }
    }

    // Update product with variants
    await prisma.product.update({
      where: { id: product.id },
      data: {
        variantsJson: JSON.stringify({ variants }),
      },
    });

    // Create or update "site" listing
    let listing = await prisma.listing.findFirst({
      where: {
        productId: product.id,
        channel: "site",
      },
    });

    const basePrice = variants[0]?.priceCents || 500;

    if (!listing) {
      await prisma.listing.create({
        data: {
          productId: product.id,
          channel: "site",
          status: "active",
          priceCents: basePrice,
          seoTitle: product.title,
          keywords: "",
        },
      });
      console.log(`✓ Created variants and site listing for: ${product.slug}`);
    } else {
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          status: "active",
          priceCents: basePrice,
        },
      });
      console.log(`✓ Updated variants and site listing for: ${product.slug}`);
    }
  }

  console.log("\nDone! All products now have variants and are available for purchase.");
}

generateVariants()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
