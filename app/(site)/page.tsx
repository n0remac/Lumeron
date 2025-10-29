import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  // Fetch products with active site listings only
  const products = await prisma.product.findMany({
    where: {
      listings: {
        some: {
          channel: "site",
          status: "active",
        },
      },
    },
    include: {
      listings: {
        where: {
          channel: "site",
          status: "active",
        },
        take: 1,
      },
      design: {
        include: {
          assets: {
            orderBy: [
              { kind: "asc" },
              { createdAt: "asc" },
            ],
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Rave Sticker Collection
        </h1>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              No products available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const assets = product.design.assets ?? [];
              const mockupAsset = assets.find((asset) => asset.kind === "mockup");
              const fallbackAsset = assets[0];
              const imageUrl =
                mockupAsset?.url || fallbackAsset?.url || "/placeholder.png";
              const priceCents = product.listings[0]?.priceCents || 0;

              return (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  title={product.title}
                  imageUrl={imageUrl}
                  priceCents={priceCents}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
