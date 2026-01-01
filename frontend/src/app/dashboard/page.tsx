"use client";

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import useSWR from 'swr';

// Components
import DashboardPageContainer from '@/components/dashboard/DashboardPageContainer';
import StatCard from '@/components/dashboard/StatCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import TopProductsList from '@/components/dashboard/TopProductsList';
import OrdersTable from '@/components/dashboard/orders/OrdersTable';
import OrderDetailsSlideOver from '@/components/dashboard/orders/OrderDetailsSlideOver';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [period, setPeriod] = useState(30);
  
  const { data: stats, error: e1, isValidating: statsSyncing } = useSWR(token ? `/dashboard/stats?days=${period}` : null, fetcher);
  const { data: salesData, error: e2, isValidating: salesSyncing } = useSWR(token ? `/dashboard/sales?days=${period}` : null, fetcher);
  const { data: topProducts, error: e3 } = useSWR(token ? `/dashboard/top-products?days=${period}` : null, fetcher);
  const { data: recentOrders, mutate: mutateOrders, error: e4 } = useSWR(token ? '/orders/my-orders' : null, fetcher);

  const [updating, setUpdating] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [toast, setToast] = useState({ show: false, message: '' });

  const anyError = e1 || e2 || e3 || e4;
  const loading = (!stats || !salesData || !topProducts || !recentOrders) && !anyError;
  const ordersList = recentOrders?.orders || recentOrders || [];

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      mutateOrders();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleShowOrder = (order: any) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  if (anyError) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        Failed to load dashboard data. Please check connection.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-dark" role="status"></div>
      </div>
    );
  }

  return (
    <DashboardPageContainer
      isShrunk={showModal}
      title={user?.role === 'admin' ? 'Marketplace Operator' : 'Store Manager'}
      subtitle={user?.role === 'admin' 
        ? 'Monitoring platform health and ecosystem performance.' 
        : `Welcome back, ${user?.username}! Let's check your store performance.`}
      actions={
        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill d-flex align-items-center gap-2">
          <i className="bi bi-calendar3"></i> 
          <span>Last {period} Days</span>
          {(statsSyncing || salesSyncing) && <div className="spinner-border spinner-border-sm ms-1" style={{ width: 10, height: 10 }}></div>}
        </span>
      }
      overlay={
        <OrderDetailsSlideOver 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          order={selectedOrder} 
          onUpdateStatus={async (newStatus: string) => {
            try {
              // Optimistically close modal
              setShowModal(false);

              // 1. Call API
              await api.put(`/orders/${selectedOrder.id}/status`, { status: newStatus }, {
                  headers: { Authorization: `Bearer ${token}` }
              });

              // 2. Instant Local Update
              mutateOrders((currentData: any) => {
                if (!currentData) return currentData;
                const orders = currentData.orders || [];
                return {
                  ...currentData,
                  orders: orders.map((o: any) => 
                    o.id === selectedOrder.id ? { ...o, status: newStatus } : o
                  )
                };
              }, false);

              // 3. Show Success Toast
              const msg = newStatus === 'processing' ? 'Order Accepted Successfully!' : 'Pickup Requested Successfully!';
              setToast({ show: true, message: msg });
              setTimeout(() => setToast({ ...toast, show: false }), 3000);
            } catch (err) {
              alert("Failed to update order status. Please try again.");
            }
          }}
        />
      }
    >
      {toast.show && (
         <div className="position-fixed top-0 start-50 translate-middle-x mt-4 p-3" style={{ zIndex: 1100 }}>
            <div className="bg-dark text-white rounded-pill shadow-lg px-4 py-3 d-flex align-items-center gap-3 animate__animated animate__fadeInDown">
              <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24 }}>
                <i className="bi bi-check-lg" style={{ fontSize: '14px' }}></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-white small">Pickup Requested</h6>
                <div className="text-white-50 extra-small">Courier has been notified.</div>
              </div>
            </div>
         </div>
      )}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <StatCard 
            label={user?.role === 'admin' ? 'Total GMV' : 'My Revenue'}
            value={stats.revenue}
            unit="EGP"
            icon="bi-currency-dollar"
          />
        </div>
        <div className="col-md-4">
          <StatCard 
            label={user?.role === 'admin' ? 'Global Orders' : 'Store Orders'}
            value={stats.orders}
            icon="bi-bag-check"
          />
        </div>
        <div className="col-md-4">
          <StatCard 
            label={user?.role === 'admin' ? 'Total Listings' : 'Active Products'}
            value={stats.products}
            icon="bi-box-seam"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="dashboard-card border-0 shadow-sm p-4 h-100 position-relative">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="text-uppercase extra-small fw-black text-muted mb-0 letter-spacing-2">Sales Analytics</h6>
                <select 
                  className="form-select form-select-sm w-auto border-0 bg-light fw-bold rounded-pill px-3"
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value))}
                  style={{ fontSize: '11px' }}
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
            </div>
            <div className={`transition-all ${salesSyncing ? 'opacity-50' : 'opacity-100'}`}>
              <PerformanceChart key={`overall-chart-${period}`} data={salesData} />
            </div>
            {salesSyncing && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <div className="spinner-border spinner-border-sm text-dark"></div>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <TopProductsList 
            title={user?.role === 'admin' ? 'Marketplace Leaders' : 'Best Sellers'}
            products={topProducts}
          />
        </div>
      </div>

      <div className="dashboard-card border-0 shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-0 text-primary">LIVE PERFORMANCE FEED</h5>
            <p className="text-muted small mb-0">Live feed of global platform activity.</p>
          </div>
          <Link href="/dashboard/orders" className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold small">Manage All Orders</Link>
        </div>
        
        <OrdersTable 
          orders={ordersList.slice(0, 10)} 
          isAdmin={user?.role === 'admin'} 
          onStatusUpdate={handleStatusUpdate}
          onViewDetails={handleShowOrder}
          updatingId={updating}
        />
      </div>
    </DashboardPageContainer>
  );
}
