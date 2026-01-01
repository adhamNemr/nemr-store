"use client";

import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import api from '@/lib/api';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Components
import DashboardPageContainer from '@/components/dashboard/DashboardPageContainer';

// Types
interface ProductVariant {
    id?: number;
    color: string;
    size: string;
    stock: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  condition: 'new' | 'used';
  status: 'active' | 'inactive' | 'suspended';
  allowDiscounts: boolean;
  views: number;
  description: string;
  variants?: ProductVariant[];
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function ProductsPage() {
  const { token } = useAuth();
  const router = useRouter();
  
  // UI States
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', subMessage: '', variant: 'success' });

  // Data Fetching
  const { data: responseData, mutate, isLoading } = useSWR(token ? '/products?dashboard=true&limit=100' : null, fetcher);
  
  const products: Product[] = responseData?.products || [];

  // Stats Logic
  const stats = useMemo(() => {
      if (!products) return { total: 0, lowStock: 0, totalValue: 0 };
      return {
          total: products.length,
          lowStock: products.filter(p => p.stock < 5).length,
          totalValue: products.reduce((acc, p) => acc + (p.price * p.stock), 0)
      };
  }, [products]);

  // Filtering Logic
  const filteredProducts = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && p.stock > 0) || 
                           (statusFilter === 'out_of_stock' && p.stock === 0) ||
                           (statusFilter === 'discountable' && p.allowDiscounts);

      return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handlers
  const handleDelete = (id: number) => setDeleteId(id);

  const confirmDelete = async () => {
      if (!deleteId) return;
      try {
          await api.delete(`/products/${deleteId}`, { headers: { Authorization: `Bearer ${token}` } });
          setToast({ show: true, message: "Product Deleted", subMessage: "Item removed from catalog.", variant: 'success' });
          setDeleteId(null);
          mutate();
          setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      } catch (err) {
          setToast({ show: true, message: "Delete Failed", subMessage: "Could not remove product.", variant: 'error' });
          setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      }
  };

  return (
    <DashboardPageContainer
      isShrunk={false}
      title="Product Management"
      subtitle="Control your inventory, prices, and catalog visibility."
      actions={
        <Link href="/dashboard/products/new" className="btn btn-dark btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2 shadow-sm">
            <i className="bi bi-plus-lg"></i> 
            <span>Add Product</span>
        </Link>
      }
    >
        {/* Toast */}
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
      <div className="row g-3 mb-4">
         <div className="col-md-4">
             <div className="dashboard-card border-0 shadow-sm p-3 d-flex align-items-center gap-3">
                 <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                     <i className="bi bi-box-seam-fill" style={{ fontSize: '1.2rem' }}></i>
                 </div>
                 <div>
                     <h6 className="text-muted small mb-0 fw-bold text-uppercase">Total Items</h6>
                     <div className="fw-bold fs-4 text-dark">{stats.total}</div>
                 </div>
             </div>
         </div>
         <div className="col-md-4">
             <div className="dashboard-card border-0 shadow-sm p-3 d-flex align-items-center gap-3">
                 <div className="bg-warning-subtle text-warning-emphasis rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                     <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.2rem' }}></i>
                 </div>
                 <div>
                     <h6 className="text-muted small mb-0 fw-bold text-uppercase">Low Stock</h6>
                     <div className="fw-bold fs-4 text-dark">{stats.lowStock}</div>
                 </div>
             </div>
         </div>
         <div className="col-md-4">
             <div className="dashboard-card border-0 shadow-sm p-3 d-flex align-items-center gap-3">
                 <div className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                     <i className="bi bi-cash-stack" style={{ fontSize: '1.2rem' }}></i>
                 </div>
                 <div>
                     <h6 className="text-muted small mb-0 fw-bold text-uppercase">Inventory Value</h6>
                     <div className="fw-bold fs-4 text-dark">{stats.totalValue.toLocaleString()} EGP</div>
                 </div>
             </div>
         </div>
      </div>

      {/* Main Table Card */}
      <div className="dashboard-card border-0 shadow-sm p-0 overflow-hidden">
         {/* Toolbar */}
         <div className="p-3 border-bottom bg-white d-flex align-items-center gap-3 flex-wrap">
             <div className="position-relative flex-grow-1" style={{ minWidth: '200px' }}>
                 <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                 <input 
                     type="text" 
                     className="form-control border-0 bg-light ps-5 rounded-pill" 
                     placeholder="Search inventory..." 
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                 />
             </div>
             <select className="form-select border-0 bg-light rounded-pill w-auto fw-bold text-muted"
                 value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
             >
                 <option value="all">Categories</option>
                 <option value="Electronics">Electronics</option>
                 <option value="Fashion">Fashion</option>
                 <option value="Home">Home</option>
                 <option value="Beauty">Beauty</option>
                 <option value="General">General</option>
                 <option value="shoes">Shoes</option>
                 <option value="accessories">Accessories</option>
             </select>
             <select className="form-select border-0 bg-light rounded-pill w-auto fw-bold text-muted"
                 value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
             >
                 <option value="all">Status</option>
                 <option value="active">Active (In Stock)</option>
                 <option value="out_of_stock">Out of Stock</option>
                 <option value="discountable">Coupons Allowed</option>
             </select>
         </div>

         {isLoading ? (
             <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <div className="spinner-border text-primary mb-3"></div>
                <p className="text-muted small">Loading catalog...</p>
             </div>
         ) : filteredProducts.length === 0 ? (
             <div className="text-center py-5">
                 <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: 64, height: 64 }}>
                    <i className="bi bi-box2 text-muted" style={{ fontSize: '24px' }}></i>
                 </div>
                 <h6 className="fw-bold text-dark">No Products Found</h6>
                 <p className="text-muted small">Try adjusting filters or add a new product.</p>
             </div>
         ) : (
            <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover">
                    <thead className="bg-light text-muted small text-uppercase">
                        <tr>
                            <th className="px-4 py-3 fw-bold">Product</th>
                            <th className="px-4 py-3 fw-bold">Category</th>
                            <th className="px-4 py-3 fw-bold">Price</th>
                            <th className="px-4 py-3 fw-bold text-center">Stock</th>
                            <th className="px-4 py-3 fw-bold text-center">Settings</th>
                            <th className="px-4 py-3 fw-bold text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((p) => (
                            <tr key={p.id}>
                                <td className="px-4 py-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light rounded-3 d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0 border" style={{ width: 48, height: 48 }}>
                                            {p.image ? (
                                                <img src={p.image} alt={p.name} className="w-100 h-100 object-fit-cover" />
                                            ) : (
                                                <i className="bi bi-image text-muted opacity-50"></i>
                                            )}
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }}>{p.name}</div>
                                            <div className="text-muted extra-small">{p.condition}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="badge bg-light text-dark border fw-normal">{p.category || 'General'}</span>
                                </td>
                                <td className="px-4 py-3 fw-bold text-dark">
                                    {p.price.toLocaleString()} <span className="text-muted extra-small fw-normal">EGP</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {p.stock === 0 ? (
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Out of Stock</span>
                                    ) : p.stock < 5 ? (
                                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">{p.stock} Left</span>
                                    ) : (
                                        <span className="badge bg-success-subtle text-success border border-success-subtle">{p.stock} In Stock</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {p.allowDiscounts ? (
                                         <i className="bi bi-check-circle-fill text-success" title="Coupons Allowed"></i>
                                    ) : (
                                         <i className="bi bi-slash-circle-fill text-muted opacity-50" title="No Coupons"></i>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-end">
                                    <Link 
                                        href={`/dashboard/products/edit/${p.id}`}
                                        className="btn btn-sm btn-light text-primary border-0 rounded-circle me-1"
                                        style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="Edit Product"
                                    >
                                        <i className="bi bi-pencil-fill"></i>
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(p.id)} 
                                        className="btn btn-sm btn-light text-danger border-0 rounded-circle"
                                        style={{ width: 32, height: 32 }}
                                        title="Delete Product"
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

       {/* Delete Modal (Kept simple) */}
       {deleteId && (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}></div>
            <div className="modal d-block fade show animate__animated animate__zoomIn" style={{ zIndex: 10001 }} onClick={() => setDeleteId(null)}>
                <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e => e.stopPropagation()}>
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-center p-4">
                        <div className="mb-3 text-danger">
                            <i className="bi bi-trash3-fill" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <h5 className="fw-bold mb-2">Delete Product?</h5>
                        <p className="text-muted small mb-4">This action cannot be undone.</p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-danger rounded-pill px-4 fw-bold" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
        )}
    </DashboardPageContainer>
  );
}
