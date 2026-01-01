"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';

// Hooks
import { useDebounce } from '@/hooks/useDebounce';

// Components
import DashboardPageContainer from '@/components/dashboard/DashboardPageContainer';
import StatCard from '@/components/dashboard/StatCard';
import CustomerDetailsSlideOver from '@/components/dashboard/customers/CustomerDetailsSlideOver';

// Types
interface Customer {
  id: number;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  joinedAt: string;
  phone?: string;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function CustomersPage() {
  const { token, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [offset, setOffset] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', subMessage: '', variant: 'success' });
  
  // Export State
  const [exporting, setExporting] = useState(false);

  const limit = 10;
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { data: response, error, isLoading } = useSWR(
    token ? `/dashboard/customers?limit=${limit}&offset=${offset}&q=${debouncedSearch}` : null, 
    fetcher
  );

  const customers: Customer[] = response?.customers || [];
  const totalCount = response?.total || 0;
  
  // Logic Hint: Ideally 'totalRevenue' should come from a stats endpoint for accurate Avg Value.
  // Fallback: We calculate from current view but warn it's estimated if needed, or rely on a stats endpoint if available.
  // For now, we will use a defensive display.

  // Helpers
  const showToast = useCallback((message: string, subMessage: string = '', variant: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, subMessage, variant });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  const handleShowCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  }, []);

  const handleExport = useCallback(async () => {
    if (totalCount === 0) return;
    setExporting(true);
    try {
      // Fetch ALL customers for export (up to 1000 for safety)
      const res = await api.get(`/dashboard/customers?limit=1000&offset=0&q=${debouncedSearch}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allCustomers = res.data.customers || [];
      
      const csvContent = [
        ["ID", "Name", "Email", "Phone", "Order Count", "Total Spent (EGP)", "Joined Date"],
        ...allCustomers.map((c: Customer) => [
          c.id,
          `"${c.name}"`, // Quote name to handle commas
          c.email,
          c.phone || "N/A",
          c.orderCount,
          c.totalSpent,
          new Date(c.joinedAt).toLocaleDateString()
        ])
      ].map(e => e.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      
      URL.revokeObjectURL(url);
      showToast("Export Complete", `${allCustomers.length} records downloaded.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Export Failed", "Could not generate the CSV file.", "error");
    } finally {
      setExporting(false);
    }
  }, [token, debouncedSearch, totalCount, showToast]);

  if (error) {
    return (
       <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '50vh' }}>
          <i className="bi bi-exclamation-triangle text-danger display-4 mb-3"></i>
          <h5 className="fw-bold text-dark">Something went wrong</h5>
          <p className="text-muted">Failed to load customer directory.</p>
       </div>
    );
  }

  // Stats Calculations (Based on visible data/recent activity)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  const newCustomersCount = customers.filter(c => new Date(c.joinedAt) > thirtyDaysAgo).length;
  const returningCustomersCount = customers.filter(c => c.orderCount > 1).length;

  return (
    <DashboardPageContainer
      isShrunk={showModal}
      title={user?.role === 'admin' ? "Global User Directory" : "My Customers"}
      subtitle="Management and insights for your platform's customer base."
      actions={
        <button 
          className="btn btn-dark btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2"
          onClick={handleExport}
          disabled={exporting || customers.length === 0}
        >
          {exporting ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-download"></i>}
          EXPORT CSV
        </button>
      }
      overlay={
        <CustomerDetailsSlideOver 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          customer={selectedCustomer} 
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
            label="Total Base"
            value={totalCount}
            icon="bi-people"
          />
        </div>
        <div className="col-md-4">
          <StatCard 
            label="New (30 Days)"
            value={newCustomersCount}
            icon="bi-person-plus"
            unit={customers.length > 0 ? "recent" : ""}
          />
        </div>
        <div className="col-md-4">
          <StatCard 
            label="Returning"
            value={returningCustomersCount}
            icon="bi-arrow-repeat"
            unit="loyal"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="dashboard-card border-0 shadow-sm p-4 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0 text-muted ps-3"><i className="bi bi-search"></i></span>
          <input 
            type="text" 
            className="form-control border-start-0 ps-2 py-2 shadow-none" 
            placeholder="Search by name, email or ID..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setOffset(0); }}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="dashboard-card border-0 shadow-sm p-0 overflow-hidden" style={{ minHeight: '300px' }}>
        {isLoading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 h-100">
             <div className="spinner-border text-primary mb-3"></div>
             <p className="text-muted small animate__animated animate__pulse animate__infinite">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-5">
             <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: 64, height: 64 }}>
                <i className="bi bi-person-x text-muted" style={{ fontSize: '24px' }}></i>
            </div>
            <h6 className="fw-bold text-dark">No customers found</h6>
            <p className="text-muted small">
                 {searchTerm ? `No matches for "${searchTerm}"` : "Your customer list is empty."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 fw-bold text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>ID</th>
                  <th className="py-3 fw-bold text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>Customer</th>
                  <th className="py-3 fw-bold text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>Performance</th>
                  <th className="py-3 fw-bold text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>Spent</th>
                  <th className="text-end px-4 py-3 fw-bold text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer: Customer) => (
                  <tr key={customer.id} style={{ cursor: 'pointer' }} onClick={() => handleShowCustomer(customer)}>
                    <td className="px-4 py-3 fw-bold text-dark text-muted">#{customer.id}</td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{width: 36, height: 36, fontSize: '14px'}}>
                          {customer.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="fw-bold text-dark small">{customer.name}</div>
                          <div className="text-muted extra-small">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="badge bg-light text-dark border px-3 py-1 rounded-pill">
                        {customer.orderCount} Orders
                      </span>
                    </td>
                    <td className="py-3 fw-bold text-dark">{customer.totalSpent?.toLocaleString()} EGP</td>
                    <td className="px-4 py-3 text-end">
                      <button className="btn btn-link text-dark p-0" onClick={(e) => { e.stopPropagation(); handleShowCustomer(customer); }}>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalCount > limit && (
        <div className="d-flex justify-content-between align-items-center mt-4 px-2">
          <div className="text-muted small fw-medium">
             Showing <span className="text-dark">{offset + 1}</span> to <span className="text-dark">{Math.min(offset + limit, totalCount)}</span> of {totalCount} customers
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
              disabled={offset + limit >= totalCount}
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
