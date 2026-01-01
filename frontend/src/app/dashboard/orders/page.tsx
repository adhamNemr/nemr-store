
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

// Components
import DashboardPageContainer from '@/components/dashboard/DashboardPageContainer';
import StatCard from '@/components/dashboard/StatCard';
import OrdersTable from '@/components/dashboard/orders/OrdersTable';
import OrderDetailsSlideOver from '@/components/dashboard/orders/OrderDetailsSlideOver';

// Types
interface Order {
  id: number;
  createdAt: string;
  userId?: number;
  total: number;
  status: string;
  customer?: string;
  User?: { username: string };
  items?: any[];
  itemCount?: number;
}

interface DashboardStats {
  totalRevenue: number;
  pendingCount: number;
  completedCount: number;
}

export default function OrdersPage() {
  const { user, token } = useAuth();
  
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, pendingCount: 0, completedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [offset, setOffset] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', subMessage: '', variant: 'success' });

  const limit = 10;

  // Helpers
  const showToast = useCallback((message: string, subMessage: string = '', variant: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, subMessage, variant });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const [ordersRes, statsRes] = await Promise.all([
        api.get(`/orders/my-orders?limit=${limit}&offset=${offset}${statusParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/orders/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const data = ordersRes.data.orders || ordersRes.data;
      const total = ordersRes.data.total || (Array.isArray(data) ? data.length : 0);
      
      setOrders(Array.isArray(data) ? data : []);
      setTotalOrders(total);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      showToast("Failed to load orders", "Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, offset, statusFilter, showToast, limit]);

  useEffect(() => {
    if (token) fetchData();
  }, [fetchData, token]);

  const handleFilterChange = useCallback((newStatus: string) => {
    setStatusFilter(newStatus);
    setOffset(0);
  }, []);

  // Unified Status Update Handler
  const handleStatusUpdate = useCallback(async (orderId: number, newStatus: string) => {
    // 1. Optimistic Update
    const previousOrders = [...orders];
    setOrders(current => current.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    // Update local selected order if open
    if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      // 2. API Call
      await api.put(`/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Success Feedback
      const msg = newStatus === 'processing' ? 'Order Accepted' : 
                  newStatus === 'shipped' ? 'Order Shipped' :
                  newStatus === 'delivered' ? 'Order Delivered' :
                  'Status Updated';
      
      const subMsg = newStatus === 'processing' ? 'You can now prepare the items.' : 
                     newStatus === 'shipped' ? 'Customer has been notified.' :
                     `Order #${orderId} is now ${newStatus}.`;

      showToast(msg, subMsg, 'success');

      // 4. Refresh Stats (can be background)
      const statsRes = await api.get(`/orders/stats`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(statsRes.data);

    } catch (err: any) {
      // Revert optimization
      setOrders(previousOrders);
      if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(previousOrders.find(o => o.id === orderId) || null);
      }
      console.error("Update failed:", err);
      showToast("Failed to update status", err.response?.data?.message || "Please try again.", "error");
    }
  }, [orders, selectedOrder, token, showToast]);

  const handleShowOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  }, []);

  const handleExport = useCallback(async () => {
    if (orders.length === 0) return;
    setExporting(true);
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const response = await api.get(`/orders/my-orders?limit=1000&offset=0${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const exportData = response.data.orders || response.data;

      const headers = ["Order ID", "Date", "Customer", "Status", "Items", "Total (EGP)"];
      const rows = exportData.map((o: any) => [
        `#${o.id}`,
        new Date(o.createdAt).toLocaleDateString(),
        o.customer || o.User?.username || 'Guest',
        o.status.toUpperCase(),
        o.itemCount || o.items?.length,
        o.total
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      showToast("Export Complete", "Your CSV file has been downloaded.", "success");
    } catch (err) {
      showToast("Export Failed", "Could not generate the report.", "error");
    } finally {
      setExporting(false);
    }
  }, [orders.length, statusFilter, token, showToast]);

  const { pendingCount, completedCount, totalRevenue } = stats;

  return (
    <DashboardPageContainer
      isShrunk={showModal}
      title={user?.role === 'admin' ? "Global Marketplace Orders" : "Order Fulfillment"}
      subtitle="Track transactions, manage status, and export shipment manifest."
      actions={
        <button 
          className="btn btn-dark btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2"
          onClick={handleExport}
          disabled={exporting || orders.length === 0}
        >
          {exporting ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-download"></i>}
          EXPORT MANIFEST
        </button>
      }
      overlay={
        <OrderDetailsSlideOver 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          order={selectedOrder} 
          onUpdateStatus={(status) => {
              if (selectedOrder) handleStatusUpdate(selectedOrder.id, status);
          }}
        />
      }
    >
      {/* Toast Notification */}
      {toast.show && (
         <div className="position-fixed top-0 start-50 translate-middle-x mt-4 p-3" style={{ zIndex: 1100 }}>
            <div className="bg-dark text-white rounded-pill shadow-lg px-4 py-3 d-flex align-items-center gap-3 animate__animated animate__fadeInDown">
               <div className={`bg-${toast.variant === 'success' ? 'success' : 'danger'} rounded-circle d-flex align-items-center justify-content-center`} style={{ width: 24, height: 24 }}>
                 <i className={`bi ${toast.variant === 'success' ? 'bi-check-lg' : 'bi-exclamation-lg'}`} style={{ fontSize: '14px' }}></i>
               </div>
               <div>
                 <h6 className="fw-bold mb-0 text-white small">{toast.message}</h6>
                 <div className="text-white-50 extra-small">{toast.subMessage}</div>
               </div>
            </div>
         </div>
      )}

      {/* Stats Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <StatCard 
            label="Pending Fulfillment"
            value={pendingCount}
            icon="bi-clock-history"
          />
        </div>
        <div className="col-md-4">
          <StatCard 
            label="Successful Deliveries"
            value={completedCount}
            icon="bi-check-circle"
          />
        </div>
        <div className="col-md-4">
          <StatCard 
            label="Gross Sales"
            value={totalRevenue}
            unit="EGP"
            icon="bi-cash-stack"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-card border-0 shadow-sm p-3 mb-4 d-flex flex-wrap gap-2">
        {['all', 'pending', 'processing', 'completed', 'cancelled'].map(status => (
          <button 
            key={status}
            className={`btn btn-sm rounded-pill px-4 fw-bold text-uppercase transition-all ${
                statusFilter === status 
                ? 'btn-dark shadow' 
                : 'btn-light text-muted border-0 hover-bg-gray-200'
            }`}
            onClick={() => handleFilterChange(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="dashboard-card border-0 shadow-sm p-0 overflow-hidden" style={{ minHeight: '300px' }}>
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 h-100">
             <div className="spinner-border text-primary mb-3"></div>
             <p className="text-muted small animate__animated animate__pulse animate__infinite">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: 64, height: 64 }}>
                <i className="bi bi-inbox text-muted" style={{ fontSize: '24px' }}></i>
            </div>
            <h6 className="fw-bold text-dark">No orders found</h6>
            <p className="text-muted small">
                {statusFilter === 'all' 
                    ? "You haven't received any orders yet." 
                    : `No orders matching "${statusFilter}" status.`}
            </p>
          </div>
        ) : (
          <OrdersTable 
            orders={orders} 
            isAdmin={user?.role === 'admin'} 
            onStatusUpdate={handleStatusUpdate}
            onViewDetails={handleShowOrder}
            updatingId={null} 
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && totalOrders > limit && (
        <div className="d-flex justify-content-between align-items-center mt-4 px-2">
          <div className="text-muted small fw-medium">
             Showing <span className="text-dark">{offset + 1}</span> to <span className="text-dark">{Math.min(offset + limit, totalOrders)}</span> of {totalOrders} orders
          </div>
          <div className="d-flex gap-2">
            <button 
                className="btn btn-white border shadow-sm btn-sm rounded-pill px-4" 
                disabled={offset === 0} 
                onClick={() => setOffset(Math.max(0, offset - limit))}
            >
                <i className="bi bi-chevron-left me-1"></i> Prev
            </button>
            <button 
                className="btn btn-white border shadow-sm btn-sm rounded-pill px-4" 
                disabled={offset + limit >= totalOrders} 
                onClick={() => setOffset(offset + limit)}
            >
                Next <i className="bi bi-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      )}
    </DashboardPageContainer>
  );
}

