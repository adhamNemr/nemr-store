"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Seller {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  productCount?: number;
}

export default function ManageSellersPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all users
        const usersRes = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allUsers = usersRes.data || [];
        
        // Filter only sellers
        const sellersOnly = allUsers.filter((u: any) => u.role === 'seller');

        // Fetch all products to count per seller
        const productsRes = await api.get('/products');
        const allProducts = productsRes.data || [];
        setProducts(allProducts);

        // Add product count to each seller
        const sellersWithCounts = sellersOnly.map((seller: any) => ({
          ...seller,
          productCount: allProducts.filter((p: any) => p.userId === seller.id).length
        }));

        setSellers(sellersWithCounts);
      } catch (err) {
        console.error('Error fetching sellers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === 'admin') fetchData();
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
        <h2 className="fw-bold mb-1">Manage Sellers</h2>
        <p className="text-muted">Monitor and manage vendors on your marketplace.</p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="dashboard-card stat-card">
            <div className="d-flex justify-content-between">
              <span className="label">Total Sellers</span>
              <i className="bi bi-people text-primary fs-5"></i>
            </div>
            <div className="value">{sellers.length}</div>
            <div className="small text-muted">
              Active vendors
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="dashboard-card stat-card">
            <div className="d-flex justify-content-between">
              <span className="label">Total Products</span>
              <i className="bi bi-box-seam text-success fs-5"></i>
            </div>
            <div className="value">{products.length}</div>
            <div className="small text-muted">
              Listed by all sellers
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="dashboard-card stat-card">
            <div className="d-flex justify-content-between">
              <span className="label">Avg Products/Seller</span>
              <i className="bi bi-graph-up text-warning fs-5"></i>
            </div>
            <div className="value">
              {sellers.length > 0 ? Math.round(products.length / sellers.length) : 0}
            </div>
            <div className="small text-muted">
              Inventory distribution
            </div>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="dashboard-card p-0 overflow-hidden">
        {sellers.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-shop display-4 text-muted mb-3 d-block"></i>
            <p className="text-muted">No sellers yet. Waiting for vendors to join!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-premium mb-0">
              <thead>
                <tr>
                  <th>Seller ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th>Joined</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller.id}>
                    <td>
                      <span className="badge bg-dark">#{seller.id}</span>
                    </td>
                    <td>
                      <span className="fw-bold">{seller.username}</span>
                    </td>
                    <td>
                      <span className="small text-muted">{seller.email}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {seller.productCount || 0} items
                      </span>
                    </td>
                    <td>
                      <span className="small text-muted">
                        {new Date(seller.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="text-end">
                      <button 
                        className="btn btn-sm btn-outline-dark rounded-0 me-2"
                        onClick={() => {
                          // Filter products to show only this seller's
                          router.push(`/dashboard/products?seller=${seller.id}`);
                        }}
                      >
                        <i className="bi bi-box me-1"></i> View Products
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="alert alert-info border-info mt-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Note:</strong> This page shows all sellers who have listed products on the marketplace. 
        You can view their products and monitor their activity.
      </div>
    </div>
  );
}
