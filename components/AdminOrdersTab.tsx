"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  title: string;
  size: string;
  finish: string;
  quantity: number;
  priceCents: number;
};

type Order = {
  id: string;
  orderNumber: string;
  email: string;
  name: string;
  shippingAddressJson: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, searchQuery]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh orders
        fetchOrders();
        // Update selected order if it's the one being updated
        if (selectedOrder?.id === orderId) {
          const data = await response.json();
          setSelectedOrder(data.order);
        }
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: "badge-warning",
      paid: "badge-success",
      fulfilled: "badge-info",
      cancelled: "badge-error",
    };
    return badges[status] || "badge-ghost";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex gap-4 flex-wrap">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select select-bordered"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-control flex-grow">
              <label className="label">
                <span className="label-text">Search</span>
              </label>
              <input
                type="text"
                placeholder="Order number, email, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Orders ({orders.length})</h2>

          {isLoading ? (
            <div className="text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-mono">{order.orderNumber}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div>{order.name}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </td>
                      <td className="font-bold">
                        ${(order.totalCents / 100).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="btn btn-sm btn-ghost"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              Order {selectedOrder.orderNumber}
            </h3>

            {/* Customer Info */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Customer</h4>
              <p>{selectedOrder.name}</p>
              <p className="text-sm text-gray-500">{selectedOrder.email}</p>
            </div>

            {/* Shipping Address */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Shipping Address</h4>
              {(() => {
                try {
                  const address = JSON.parse(selectedOrder.shippingAddressJson);
                  return (
                    <div className="text-sm">
                      <p>{address.street}</p>
                      <p>
                        {address.city}, {address.state} {address.zip}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  );
                } catch {
                  return <p className="text-sm text-gray-500">Invalid address data</p>;
                }
              })()}
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.title} ({item.size}", {item.finish}) x{item.quantity}
                    </span>
                    <span>${((item.priceCents * item.quantity) / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Subtotal</span>
                <span>${(selectedOrder.subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Shipping</span>
                <span>${(selectedOrder.shippingCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${(selectedOrder.totalCents / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Update Status</h4>
              <select
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="modal-action">
              <button onClick={() => setSelectedOrder(null)} className="btn">
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedOrder(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
