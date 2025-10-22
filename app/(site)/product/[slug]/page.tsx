import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Image from "next/image";

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
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const mockups = product.design.assets.filter((a) => a.kind === "mockup");
  const primaryMockup = mockups[0] || product.design.assets[0];
  const listing = product.listings[0];
  const price = listing ? (listing.priceCents / 100).toFixed(2) : "0.00";

  // Parse options JSON
  let options;
  try {
    options = JSON.parse(product.optionsJson);
  } catch {
    options = {};
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {primaryMockup && (
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={primaryMockup.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            {mockups.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {mockups.slice(1, 4).map((mockup) => (
                  <div
                    key={mockup.id}
                    className="relative h-24 rounded overflow-hidden"
                  >
                    <Image
                      src={mockup.url}
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
              <p className="text-3xl font-bold text-primary">${price}</p>
            </div>

            <div className="prose">
              <p>{product.description}</p>
            </div>

            {options.sizes && (
              <div>
                <h3 className="font-semibold mb-2">Available Sizes</h3>
                <div className="flex gap-2">
                  {options.sizes.map((size: string) => (
                    <span key={size} className="badge badge-lg">
                      {size}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {options.finishes && (
              <div>
                <h3 className="font-semibold mb-2">Finishes</h3>
                <div className="flex gap-2">
                  {options.finishes.map((finish: string) => (
                    <span key={finish} className="badge badge-lg capitalize">
                      {finish}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {listing?.channel === "etsy" && listing.externalId && (
                <a
                  href={`https://www.etsy.com/listing/${listing.externalId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-block"
                >
                  Buy on Etsy
                </a>
              )}

              {listing?.channel === "amazon" && listing.externalId && (
                <a
                  href={`https://www.amazon.com/dp/${listing.externalId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-block"
                >
                  Buy on Amazon
                </a>
              )}

              {product.printifyId && (
                <p className="text-sm text-gray-500 text-center">
                  Fulfilled by Printify
                </p>
              )}
            </div>
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
