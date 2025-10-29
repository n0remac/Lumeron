import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Image from "next/image";
import AddToCartForm from "@/components/AddToCartForm";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      design: {
        include: {
          assets: true,
        },
      },
      listings: {
        where: {
          status: "active",
          channel: "site",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const assets = product.design.assets ?? [];
  const mockups = assets.filter((a) => a.kind === "mockup");
  const galleryAssets = mockups.length > 0 ? mockups : assets;
  const primaryAsset = galleryAssets[0];
  const imageUrl = primaryAsset?.url || "/placeholder.png";

  // Parse variants JSON
  let variantsData: { variants?: Array<{ size: string; finish: string; priceCents: number }> };
  try {
    variantsData = JSON.parse(product.variantsJson);
  } catch {
    variantsData = {};
  }

  const variants = variantsData.variants || [];

  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {primaryAsset && (
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={primaryAsset.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            {galleryAssets.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {galleryAssets.slice(1, 4).map((asset) => (
                  <div
                    key={asset.id}
                    className="relative h-24 rounded overflow-hidden"
                  >
                    <Image
                      src={asset.url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
            </div>

            <div className="prose">
              <p>{product.description}</p>
            </div>

            {variants.length > 0 ? (
              <AddToCartForm
                productId={product.id}
                slug={product.slug}
                title={product.title}
                imageUrl={imageUrl}
                variants={variants}
              />
            ) : (
              <div className="alert alert-warning">
                <span>This product is not yet available for purchase.</span>
              </div>
            )}

            {product.printifyId && (
              <p className="text-sm text-gray-500 text-center">
                Fulfilled by Printify
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
  });

  return products.map((product) => ({
    slug: product.slug,
  }));
}
