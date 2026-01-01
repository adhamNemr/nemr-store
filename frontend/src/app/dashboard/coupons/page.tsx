"use client";

import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import api from '@/lib/api';
import { useState, useCallback, useEffect } from 'react';

// Components
import DashboardPageContainer from '@/components/dashboard/DashboardPageContainer';

// Types
interface Coupon {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  expirationDate: string | null;
  usageLimit: number | null; // null means unlimited
  usedCount: number;
  isActive: boolean;
  minOrderValue?: number;
  onePerUser?: boolean;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function CouponsPage() {
  const { token, user } = useAuth();
  
  // UI States
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', subMessage: '', variant: 'success' });
  
  // Scroll Lock Effect
  useEffect(() => {
    if (showModal || deleteId !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, deleteId]);

  // Data Fetching
  const { data: serverCoupons, error, mutate, isLoading } = useSWR(token ? '/dashboard/coupons' : null, fetcher);

  // Dummy Data for Preview
  const dummyCoupons: Coupon[] = [
    { id: 101, code: 'WELCOME24', discountType: 'percentage', value: 15, expirationDate: '2025-12-31', usageLimit: 500, usedCount: 120, isActive: true, minOrderValue: 200, onePerUser: true },
    { id: 102, code: 'FLASH50', discountType: 'fixed', value: 50, expirationDate: '2024-06-30', usageLimit: 50, usedCount: 50, isActive: false, minOrderValue: 0 },
    { id: 103, code: 'SUMMER_VIBES', discountType: 'percentage', value: 10, expirationDate: null, usageLimit: null, usedCount: 45, isActive: true, minOrderValue: 500 },
    { id: 104, code: 'VIP_ONLY', discountType: 'percentage', value: 25, expirationDate: '2025-01-01', usageLimit: 10, usedCount: 2, isActive: true, onePerUser: false },
  ];

  // Logic: Show server data ONLY if it exists and has items. Otherwise, show dummy data for preview.
  const coupons = (serverCoupons && serverCoupons.length > 0) ? serverCoupons : dummyCoupons;

  // Filters & Stats Logic
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = {
      total: coupons ? coupons.length : 0,
      active: coupons ? coupons.filter((c: Coupon) => c.isActive).length : 0,
      totalRedeemed: coupons ? coupons.reduce((acc: number, c: Coupon) => acc + c.usedCount, 0) : 0
  };

  const filteredCoupons = coupons?.filter((c: Coupon) => {
      const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' 
          ? true 
          : statusFilter === 'active' ? c.isActive 
          : !c.isActive;
      return matchesSearch && matchesStatus;
  }) || [];

  // Form State
  const [formData, setFormData] = useState({
      code: '',
      discountType: 'percentage',
      value: '',
      expirationDate: '',
      usageLimit: '',
      isUnlimited: false,
      minOrderValue: '',
      onePerUser: false
  });
  const [submitting, setSubmitting] = useState(false);

  // Helpers
  const toEnglishDigits = (str: string) => {
    return str.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
  };

  const showToast = useCallback((message: string, subMessage: string = '', variant: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, subMessage, variant });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("Copied to clipboard", `Code ${code} is ready to share.`);
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    // Optimistic Update
    const updatedCoupons = coupons.map((c: Coupon) => c.id === id ? { ...c, isActive: !currentStatus } : c);
    
    // For dummy data (IDs > 100), we just update locally without API call
    if (id > 100) {
        mutate(updatedCoupons, false);
        showToast(
          !currentStatus ? "Coupon Activated" : "Coupon Deactivated",
          "Test mode: Status updated locally."
        );
        return;
    }

    // For real data:
    mutate(updatedCoupons, false);
    try {
      await api.put(`/dashboard/coupons/${id}`, { isActive: !currentStatus }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      showToast(
          !currentStatus ? "Coupon Activated" : "Coupon Deactivated",
          !currentStatus ? "Customers can now use this code." : "This code has been paused."
      );
      mutate();
    } catch (err: any) {
      mutate(); // Revert
      showToast("Update Failed", "Could not change status.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      
      const payload = {
          ...formData,
          value: parseFloat(formData.value),
          usageLimit: formData.isUnlimited ? null : parseInt(formData.usageLimit) || 0,
          minOrderValue: (parseInt(formData.minOrderValue) || 0) > 0 ? parseInt(formData.minOrderValue) : null
      };

      try {
          // Handle Dummy Data Edit (ID > 100)
          if (editingId && editingId > 100) {
              mutate(coupons.map((c: Coupon) => c.id === editingId ? { ...c, ...payload, value: Number(payload.value) } : c), false);
              setShowModal(false);
              setEditingId(null);
              setFormData({ 
                  code: '', discountType: 'percentage', value: '', expirationDate: '', 
                  usageLimit: '', isUnlimited: false, minOrderValue: '', onePerUser: false 
              });
              showToast("Coupon Updated", "Test mode: Changes saved locally.");
              return;
          }

          if (editingId) {
             // Update existing
             await api.put(`/dashboard/coupons/${editingId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
             });
             showToast("Coupon Updated", "Changes saved successfully.");
          } else {
             // Create new
             await api.post('/dashboard/coupons', payload, {
                headers: { Authorization: `Bearer ${token}` }
             });
          }
          mutate();
          setShowModal(false);
          setFormData({ 
              code: '', discountType: 'percentage', value: '', expirationDate: '', 
              usageLimit: '', isUnlimited: false, minOrderValue: '', onePerUser: false 
          });
          setEditingId(null);
          showToast("Coupon Created", "Your new discount code is live!");
      } catch (err: any) {
          showToast("Creation Error", err.response?.data?.error || err.message, "error");
      } finally {
          setSubmitting(false);
      }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ 
        code: '', discountType: 'percentage', value: '', expirationDate: '', 
        usageLimit: '', isUnlimited: false, minOrderValue: '', onePerUser: false 
    });
    setShowModal(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value.toString(),
        expirationDate: coupon.expirationDate ? coupon.expirationDate.split('T')[0] : '',
        usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
        isUnlimited: coupon.usageLimit === null,
        minOrderValue: coupon.minOrderValue ? coupon.minOrderValue.toString() : '',
        onePerUser: coupon.onePerUser || false
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    const id = deleteId;
    // Optimistic delete
    mutate(coupons.filter((c: Coupon) => c.id !== id), false);
    setDeleteId(null); // Close modal immediately

    try {
        await api.delete(`/dashboard/coupons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        showToast("Coupon Deleted", "The discount code has been removed.");
    } catch (err) {
        mutate(); // Revert
        showToast("Delete Failed", "Could not remove coupon.", "error");
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  // --- Render Functions (to keep return clean) ---
  
  const renderModals = () => (
    <>
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

        {/* Create / Edit Modal */}
        {showModal && (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}></div>
            <div className="modal d-block fade show animate__animated animate__fadeInUp" style={{ zIndex: 10001, paddingLeft: '260px' }} onClick={() => setShowModal(false)}>
                <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="modal-header border-0 pb-0 bg-white">
                            <h5 className="modal-title fw-bold">{editingId ? 'Edit Offer' : 'Create New Offer'}</h5>
                            <button className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body p-4 bg-white">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-uppercase text-muted">Coupon Code</label>
                                    <div className="position-relative">
                                        <i className="bi bi-tag-fill position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ zIndex: 5 }}></i>
                                        <input type="text" className="form-control text-uppercase font-monospace bg-light fw-bold ps-5" required 
                                            value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                            placeholder="SUMMER2025"
                                        />
                                    </div>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Type</label>
                                        <select className="form-select bg-light border-0 fw-bold" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (EGP)</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Value</label>
                                        <input type="text" inputMode="decimal" className="form-control bg-light border-0 fw-bold" required 
                                            value={formData.value} onChange={e => {
                                                let converted = toEnglishDigits(e.target.value).replace(/[^0-9.]/g, '');
                                                // Prevent multiple decimals
                                                if ((converted.match(/\./g) || []).length > 1) return;
                                                
                                                // Cap percentage at 100
                                                if (formData.discountType === 'percentage' && parseFloat(converted) > 100) {
                                                    converted = '100';
                                                }

                                                setFormData({...formData, value: converted});
                                            }}
                                            placeholder={formData.discountType === 'percentage' ? "10" : "50"}
                                        />
                                        {formData.discountType === 'percentage' && parseFloat(formData.value) > 50 && (
                                            <div className="form-text text-warning d-flex align-items-center gap-1 mt-1 animate__animated animate__fadeIn">
                                                <i className="bi bi-exclamation-triangle-fill"></i>
                                                <span className="small fw-bold">Careful! That's a high discount.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Usage Limits</label>
                                        <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" id="unlimitedCheck" 
                                            checked={formData.isUnlimited}
                                            onChange={e => setFormData({...formData, isUnlimited: e.target.checked})}
                                        />
                                        <label className="form-check-label small" htmlFor="unlimitedCheck">Unlimited total uses</label>
                                        </div>
                                        {formData.isUnlimited ? (
                                             <input type="text" className="form-control bg-light border-0 fw-bold mb-2 text-muted fst-italic" disabled value="∞ Unlimited Usage" readOnly />
                                        ) : (
                                            <input type="text" inputMode="numeric" className="form-control bg-light border-0 fw-bold mb-2" 
                                                value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: toEnglishDigits(e.target.value).replace(/\D/g, '')})}
                                                placeholder="Max number of uses (e.g., 100)"
                                            />
                                        )}
                                </div>

                                <div className="mb-3">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Requirements</label>
                                        <div className="row g-2">
                                            <div className="col-md-8">
                                            <div className="position-relative">
                                                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted small fw-bold" style={{ zIndex: 5 }}>Min Spend</span>
                                                <input type="text" inputMode="numeric" className="form-control bg-light fw-bold" 
                                                    style={{ paddingLeft: '90px', paddingRight: '50px' }}
                                                    value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: toEnglishDigits(e.target.value).replace(/\D/g, '')})}
                                                    placeholder="0"
                                                />
                                                <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted small fw-bold" style={{ zIndex: 5 }}>EGP</span>
                                            </div>
                                            </div>
                                            <div className="col-md-4 d-flex align-items-center">
                                                <div className="form-check ms-2">
                                                <input className="form-check-input" type="checkbox" id="onePerUser"
                                                    checked={formData.onePerUser}
                                                    onChange={e => setFormData({...formData, onePerUser: e.target.checked})}
                                                />
                                                <label className="form-check-label small" htmlFor="onePerUser">1/User</label>
                                                </div>
                                            </div>
                                        </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-uppercase text-muted">Expires On (Optional)</label>
                                    <input type="date" className="form-control bg-light border-0 fw-bold small" 
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                                    />
                                </div>

                                <button type="submit" className="btn btn-dark w-100 py-2 rounded-pill fw-bold shadow-lg" disabled={submitting}>
                                    {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-lg me-2"></i>}
                                    {editingId ? 'Save Changes' : 'Launch Offer'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}></div>
            <div className="modal d-block fade show animate__animated animate__zoomIn" style={{ zIndex: 10001 }} onClick={() => setDeleteId(null)}>
                <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e => e.stopPropagation()}>
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-center p-4">
                        <div className="mb-3 text-danger">
                            <i className="bi bi-trash3-fill" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <h5 className="fw-bold mb-2">Delete Coupon?</h5>
                        <p className="text-muted small mb-4">This action cannot be undone. Are you sure?</p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-danger rounded-pill px-4 fw-bold" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
        )}
    </>
  );

  return (
    <DashboardPageContainer
      isShrunk={showModal || deleteId !== null}
      title={user?.role === 'admin' ? 'Marketplace Incentives' : 'Store Promotions'}
      subtitle={user?.role === 'admin' 
        ? 'Managing platform-wide discount codes and promotional campaigns.' 
        : 'Create custom discounts to drive more sales to your store.'}
      actions={
        <button 
            className="btn btn-dark btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2 shadow-sm" 
            onClick={handleCreate}
        >
            <i className="bi bi-plus-lg"></i> 
            <span>Create Code</span>
        </button>
      }
      overlay={renderModals()}
    >
      {/* Stats Row */}
      <div className="row g-3 mb-4">
         <div className="col-md-4">
             <div className="dashboard-card border-0 shadow-sm p-3 d-flex align-items-center gap-3">
                 <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                     <i className="bi bi-ticket-perforated-fill" style={{ fontSize: '1.2rem' }}></i>
                 </div>
                 <div>
                     <h6 className="text-muted small mb-0 fw-bold text-uppercase">Total Offers</h6>
                     <div className="fw-bold fs-4 text-dark">{stats.total}</div>
                 </div>
             </div>
         </div>
         <div className="col-md-4">
             <div className="dashboard-card border-0 shadow-sm p-3 d-flex align-items-center gap-3">
                 <div className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                     <i className="bi bi-check-circle-fill" style={{ fontSize: '1.2rem' }}></i>
                 </div>
                 <div>
                     <h6 className="text-muted small mb-0 fw-bold text-uppercase">Active Now</h6>
                     <div className="fw-bold fs-4 text-dark">{stats.active}</div>
                 </div>
             </div>
         </div>
         <div className="col-md-4">
             <div className="dashboard-card border-0 shadow-sm p-3 d-flex align-items-center gap-3">
                 <div className="bg-warning-subtle text-warning-emphasis rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                     <i className="bi bi-fire" style={{ fontSize: '1.2rem' }}></i>
                 </div>
                 <div>
                     <h6 className="text-muted small mb-0 fw-bold text-uppercase">Total Redemptions</h6>
                     <div className="fw-bold fs-4 text-dark">{stats.totalRedeemed}</div>
                 </div>
             </div>
         </div>
      </div>

      {/* Main Content Card */}
      <div className="dashboard-card border-0 shadow-sm p-0 overflow-hidden">
         
         {/* Filter Toolbar */}
         <div className="p-3 border-bottom bg-white d-flex align-items-center gap-3">
             <div className="position-relative flex-grow-1">
                 <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                 <input 
                     type="text" 
                     className="form-control border-0 bg-light ps-5 rounded-pill" 
                     placeholder="Search by code..." 
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                 />
             </div>
             <select 
                 className="form-select border-0 bg-light rounded-pill w-auto fw-bold text-muted"
                 value={statusFilter}
                 onChange={e => setStatusFilter(e.target.value)}
             >
                 <option value="all">All Status</option>
                 <option value="active">Active Only</option>
                 <option value="inactive">Inactive</option>
             </select>
         </div>

         {isLoading ? (
             <div className="d-flex flex-column align-items-center justify-content-center py-5 h-100">
                <div className="spinner-border text-primary mb-3"></div>
                <p className="text-muted small">Loading offers...</p>
             </div>
         ) : filteredCoupons.length === 0 ? (
             <div className="text-center py-5">
                 <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: 64, height: 64 }}>
                    <i className="bi bi-ticket-perforated text-muted" style={{ fontSize: '24px' }}></i>
                 </div>
                 <h6 className="fw-bold text-dark">No Coupons Found</h6>
                 <p className="text-muted small">Try adjusting your search or filters.</p>
             </div>
         ) : (
            <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover">
                    <thead className="bg-light text-muted small text-uppercase">
                        <tr>
                            <th className="px-4 py-3 fw-bold" style={{ letterSpacing: '0.5px' }}>Code</th>
                            <th className="px-4 py-3 fw-bold" style={{ letterSpacing: '0.5px' }}>Discount</th>
                            <th className="px-4 py-3 fw-bold text-center" style={{ letterSpacing: '0.5px' }}>Restrictions</th>
                            <th className="px-4 py-3 fw-bold text-center" style={{ letterSpacing: '0.5px' }}>Usage</th>
                            <th className="px-4 py-3 fw-bold text-center" style={{ letterSpacing: '0.5px' }}>Status</th>
                            <th className="px-4 py-3 fw-bold text-end" style={{ letterSpacing: '0.5px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCoupons.map((c: Coupon) => (
                            <tr key={c.id}>
                                <td className="px-4 py-3">
                                    <div 
                                        className="d-inline-flex align-items-center gap-2 bg-light px-2 py-1 border rounded cursor-pointer hover-bg-gray-200 transition-all"
                                        onClick={() => handleCopyCode(c.code)}
                                        title="Click to copy"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className="font-monospace fw-bold text-dark small">{c.code}</span>
                                        <i className="bi bi-copy text-muted" style={{ fontSize: '10px' }}></i>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="fw-bold text-dark">
                                        {c.discountType === 'percentage' ? `${c.value}% OFF` : `${c.value} EGP OFF`}
                                    </div>
                                    <div className="text-muted extra-small">
                                        {c.expirationDate 
                                            ? `Ends ${new Date(c.expirationDate).toLocaleDateString()}` 
                                            : 'No expiration'}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="d-flex flex-column align-items-center gap-1">
                                        {c.minOrderValue ? (
                                            <span className="badge bg-light text-dark border">Min: {c.minOrderValue} EGP</span>
                                        ) : <span className="text-muted extra-small">-</span>}
                                        {c.onePerUser && (
                                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" title="One use per customer">Limit: 1 Person</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center" style={{ width: '20%' }}>
                                    {c.usageLimit === null ? (
                                        <div className="text-success fw-bold small"><i className="bi bi-infinity me-1"></i> Unlimited</div>
                                    ) : (
                                        <>
                                            <div className="d-flex justify-content-between text-muted extra-small mb-1">
                                                <span>Used</span>
                                                <span className="fw-bold">{c.usedCount} / {c.usageLimit}</span>
                                            </div>
                                            <div className="progress rounded-pill bg-light" style={{height: 4}}>
                                                <div 
                                                    className={`progress-bar rounded-pill ${c.usedCount >= c.usageLimit ? 'bg-danger' : 'bg-dark'}`} 
                                                    style={{width: `${Math.min((c.usedCount/c.usageLimit)*100, 100)}%`}}
                                                ></div>
                                            </div>
                                        </>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="form-check form-switch d-flex justify-content-center">
                                        <input 
                                            className="form-check-input cursor-pointer" 
                                            type="checkbox" 
                                            checked={c.isActive}
                                            onChange={() => handleToggleStatus(c.id, c.isActive)}
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-end">
                                    <button 
                                        onClick={() => handleEdit(c)} 
                                        className="btn btn-sm btn-light text-primary border-0 rounded-circle me-1"
                                        style={{ width: 32, height: 32 }}
                                        title="Edit Coupon"
                                    >
                                        <i className="bi bi-pencil-fill"></i>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(c.id)} 
                                        className="btn btn-sm btn-light text-danger border-0 rounded-circle"
                                        style={{ width: 32, height: 32 }}
                                        title="Delete Coupon"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         )}
      </div>
    </DashboardPageContainer>
  );
}
