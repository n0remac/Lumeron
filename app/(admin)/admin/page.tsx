import { prisma } from "@/lib/db";
import AdminTabs from "@/components/AdminTabs";
import UploadForm from "@/components/UploadForm";
import GenerateForm from "@/components/GenerateForm";
import AnalyticsChart from "@/components/AnalyticsChart";
import AdminOrdersTab from "@/components/AdminOrdersTab";

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
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const siteListing = product.listings.find((l) => l.channel === "site");
            return (
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
                  <span className={`badge badge-sm ${siteListing?.status === "active" ? "badge-success" : "badge-warning"}`}>
                    {siteListing?.status || "unavailable"}
                  </span>
                </td>
                <td>
                  {siteListing ? (
                    <span className="font-bold">
                      ${(siteListing.priceCents / 100).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
              </tr>
            );
          })}
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <AdminTabs
          uploadContent={<UploadForm />}
          generateContent={<GenerateForm />}
          listingsContent={<ListingsContent />}
          ordersContent={<AdminOrdersTab />}
          analyticsContent={<AnalyticsChart />}
        />
      </div>
    </main>
  );
}
