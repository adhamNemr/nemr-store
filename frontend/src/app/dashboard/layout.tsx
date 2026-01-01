"use client";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import "@/styles/dashboard.css";
import "@/styles/product-admin.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-wrapper">
      <DashboardSidebar />
      <main className="dashboard-main w-100">
        <div className="container-fluid p-0">
            {children}
        </div>
      </main>
    </div>
  );
}
