import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  // Fetch products with their first listing for pricing
  const products = await prisma.product.findMany({
    include: {
      listings: {
        take: 1,
        where: {
          status: "active",
        },
      },
      design: {
        include: {
          assets: {
            where: {
              kind: "mockup",
            },
            take: 1,
          },
        },
      },
    },
  });

  return (
    <main>
      <Navbar />
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
              const mockupUrl =
                product.design.assets[0]?.url || "/placeholder.png";
              const priceCents = product.listings[0]?.priceCents || 0;

              return (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  title={product.title}
                  imageUrl={mockupUrl}
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
