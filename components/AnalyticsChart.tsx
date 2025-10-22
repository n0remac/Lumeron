"use client";

import { useEffect, useState } from "react";

type AnalyticsData = {
  totalRevenue: number;
  channelRevenue: Array<{ channel: string; totalCents: number; count: number }>;
  topProducts: Array<{
    productId: string;
    title: string;
    totalCents: number;
    unitsSold: number;
  }>;
};

export default function AnalyticsChart() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load analytics");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!data) {
    return <div className="alert alert-info">No data available</div>;
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">{formatCurrency(data.totalRevenue)}</div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Revenue by Channel</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.channelRevenue.map((channel) => (
                  <tr key={channel.channel}>
                    <td className="capitalize">{channel.channel}</td>
                    <td>{channel.count}</td>
                    <td>{formatCurrency(channel.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Top Products</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.title}</td>
                    <td>{product.unitsSold}</td>
                    <td>{formatCurrency(product.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
