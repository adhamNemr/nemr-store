"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function MarketplaceStatsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalSellers: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch all products
        const productsRes = await api.get('/products');
        const products = productsRes.data || [];

        // Fetch all orders
        const ordersRes = await api.get('/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orders = ordersRes.data || [];

        // Calculate stats
        const totalRevenue = orders
          .filter((o: any) => o.status === 'completed')
          .reduce((sum: number, o: any) => sum + o.total, 0);

        const uniqueSellers = new Set(products.map((p: any) => p.userId));

        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalSellers: uniqueSellers.size,
          pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
          completedOrders: orders.filter((o: any) => o.status === 'completed').length
        });
      } catch (err) {
        console.error('Error fetching marketplace stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === 'admin') fetchStats();
  }, [token, user, router]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-dark" role="status"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h2 className="fw-bold mb-1">Marketplace Statistics</h2>
        <p className="text-muted">Overview of the entire NEMR Marketplace platform.</p>
      </div>

      {/* Revenue & Orders */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="dashboard-card stat-card">
            <div className="d-flex justify-content-between">
              <span className="label">Total Revenue</span>
              <i className="bi bi-currency-dollar text-success fs-5"></i>
            </div>
            <div className="value small">{stats.totalRevenue.toLocaleString()}</div>
            <div className="small text-muted">
              Platform earnings (EGP)
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card stat-card">
            <div className="d-flex justify-content-between">
              <span className="label">Total Orders</span>
              <i className="bi bi-receipt text-primary fs-5"></i>
            </div>
            <div className="value">{stats.totalOrders}</div>
            <div className="small text-muted">
              {stats.pendingOrders} pending • {stats.completedOrders} completed
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card stat-card">
            <div className="d-flex justify-content-between">
              <span className="label">Active Sellers</span>
              <i className="bi bi-shop text-warning fs-5"></i>
            </div>
            <div className="value">{stats.totalSellers}</div>
            <div className="small text-muted">
              Vendors on platform
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card stat-card">
            <div className="d-flex justify-content-between">
              <span className="label">Total Products</span>
              <i className="bi bi-box-seam text-info fs-5"></i>
            </div>
            <div className="value">{stats.totalProducts}</div>
            <div className="small text-muted">
              Listed items
            </div>
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="dashboard-card">
            <h5 className="fw-bold mb-4">Platform Health</h5>
            <div className="list-group list-group-flush">
              <div className="list-group-item px-0 d-flex justify-content-between align-items-center border-0">
                <div>
                  <h6 className="mb-1 fw-bold">Order Fulfillment Rate</h6>
                  <p className="small text-muted mb-0">Completed vs Total Orders</p>
                </div>
                <span className="badge bg-success rounded-pill">
                  {stats.totalOrders > 0 
                    ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="list-group-item px-0 d-flex justify-content-between align-items-center border-0">
                <div>
                  <h6 className="mb-1 fw-bold">Average Products per Seller</h6>
                  <p className="small text-muted mb-0">Inventory distribution</p>
                </div>
                <span className="badge bg-primary rounded-pill">
                  {stats.totalSellers > 0 
                    ? Math.round(stats.totalProducts / stats.totalSellers) 
                    : 0}
                </span>
              </div>
              <div className="list-group-item px-0 d-flex justify-content-between align-items-center border-0">
                <div>
                  <h6 className="mb-1 fw-bold">Average Order Value</h6>
                  <p className="small text-muted mb-0">Revenue per order</p>
                </div>
                <span className="badge bg-warning rounded-pill">
                  {stats.totalOrders > 0 
                    ? Math.round(stats.totalRevenue / stats.totalOrders) 
                    : 0} EGP
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="dashboard-card bg-dark text-white">
            <h5 className="fw-bold mb-3">Quick Actions</h5>
            <p className="small mb-4 opacity-75">Manage your marketplace efficiently</p>
            <div className="d-grid gap-2">
              <button 
                className="btn btn-light rounded-0 fw-bold text-start"
                onClick={() => router.push('/dashboard/admin/sellers')}
              >
                <i className="bi bi-people me-2"></i> Manage Sellers
              </button>
              <button 
                className="btn btn-outline-light rounded-0 fw-bold text-start"
                onClick={() => router.push('/dashboard/orders')}
              >
                <i className="bi bi-list-check me-2"></i> View All Orders
              </button>
              <button 
                className="btn btn-outline-light rounded-0 fw-bold text-start"
                onClick={() => router.push('/dashboard/products')}
              >
                <i className="bi bi-box me-2"></i> Browse All Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
