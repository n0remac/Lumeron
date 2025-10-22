import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import AdminTabs from "@/components/AdminTabs";
import UploadForm from "@/components/UploadForm";
import GenerateForm from "@/components/GenerateForm";
import AnalyticsChart from "@/components/AnalyticsChart";

async function ListingsContent() {
  const products = await prisma.product.findMany({
    include: {
      listings: true,
      design: {
        include: {
          assets: {
            where: { kind: "mockup" },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Listings</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="flex items-center gap-3">
                  {product.design.assets[0] && (
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img src={product.design.assets[0].url} alt={product.title} />
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="font-bold">{product.title}</div>
                  </div>
                </div>
              </td>
              <td>{product.slug}</td>
              <td>
                <span className="badge badge-sm capitalize">
                  {product.design.status}
                </span>
              </td>
              <td>
                <div className="flex gap-1">
                  {product.listings.map((listing) => (
                    <span key={listing.id} className="badge badge-sm capitalize">
                      {listing.channel}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <div className="flex gap-2">
                  <button className="btn btn-xs btn-primary">
                    Publish to Etsy
                  </button>
                  <button className="btn btn-xs btn-secondary">
                    Publish to Amazon
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products yet. Upload or generate your first design!
        </div>
      )}
    </div>
  );
}

export default async function AdminPage() {
  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <AdminTabs
          uploadContent={<UploadForm />}
          generateContent={<GenerateForm />}
          listingsContent={<ListingsContent />}
          analyticsContent={<AnalyticsChart />}
        />
      </div>
    </main>
  );
}
