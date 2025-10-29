"use client";

import { useState } from "react";

type Tab = "upload" | "generate" | "listings" | "analytics" | "orders";

type AdminTabsProps = {
  uploadContent: React.ReactNode;
  generateContent: React.ReactNode;
  listingsContent: React.ReactNode;
  analyticsContent: React.ReactNode;
  ordersContent: React.ReactNode;
};

export default function AdminTabs({
  uploadContent,
  generateContent,
  listingsContent,
  analyticsContent,
  ordersContent,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("upload");

  return (
    <div>
      <div className="tabs tabs-boxed mb-6">
        <a
          className={`tab ${activeTab === "upload" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          Upload
        </a>
        <a
          className={`tab ${activeTab === "generate" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("generate")}
        >
          Generate
        </a>
        <a
          className={`tab ${activeTab === "listings" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("listings")}
        >
          Listings
        </a>
        <a
          className={`tab ${activeTab === "orders" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </a>
        <a
          className={`tab ${activeTab === "analytics" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </a>
      </div>

      <div className="mt-4">
        {activeTab === "upload" && uploadContent}
        {activeTab === "generate" && generateContent}
        {activeTab === "listings" && listingsContent}
        {activeTab === "orders" && ordersContent}
        {activeTab === "analytics" && analyticsContent}
      </div>
    </div>
  );
}
