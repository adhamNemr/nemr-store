"use client";

import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function SellersPage() {
  const { token, user } = useAuth();
  
  const { data: sellers, error, isLoading, mutate } = useSWR(token && user?.role === 'admin' ? '/dashboard/sellers' : null, fetcher);

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    if (!confirm(`Are you sure you want to ${newStatus} this seller?`)) return;

    try {
      await api.patch(`/users/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      mutate();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (user?.role !== 'admin') {
      return <div className="p-5 text-center text-danger">Access Denied</div>;
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-dark" role="status"></div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-5">
            <p className="text-danger">Failed to load sellers.</p>
        </div>
    );
  }

  return (
    <div className="animate-fade-in pb-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1">Manage Sellers</h2>
          <p className="text-muted">Monitor vendor performance and status.</p>
        </div>
        <button className="btn btn-dark btn-sm rounded-pill px-3">
            <i className="bi bi-person-plus-fill me-2"></i> Invite Seller
        </button>
      </div>

      <div className="dashboard-card border-0 shadow-sm p-0 overflow-hidden">
        {sellers.length === 0 ? (
             <div className="text-center py-5">
                <i className="bi bi-shop display-4 text-muted mb-3 d-block"></i>
                <p className="text-muted">No sellers found.</p>
             </div>
        ) : (
            <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover">
                    <thead className="bg-light text-muted small text-uppercase">
                        <tr>
                            <th className="px-4 py-3 fw-bold">Seller Name</th>
                            <th className="px-4 py-3 fw-bold">Performance</th>
                            <th className="px-4 py-3 fw-bold text-center">Products</th>
                            <th className="px-4 py-3 fw-bold">Joined</th>
                            <th className="px-4 py-3 fw-bold">Status</th>
                            <th className="px-4 py-3 fw-bold text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sellers.map((s: any) => (
                            <tr key={s.id}>
                                <td className="px-4 py-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-primary border border-primary-subtle" style={{width: 40, height: 40}}>
                                            {s.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark">{s.name}</div>
                                            <div className="text-muted small">{s.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="fw-bold text-dark">{s.totalRevenue ? s.totalRevenue.toLocaleString() : 0} EGP</div>
                                    <div className="text-muted small">{s.totalOrders || 0} Orders</div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="badge bg-light text-dark border">{s.productsCount}</span>
                                </td>
                                <td className="px-4 py-3 text-muted small">
                                    {new Date(s.joinedAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`badge border ${s.status === 'banned' ? 'bg-danger-subtle text-danger border-danger-subtle' : 'bg-success-subtle text-success border-success-subtle'}`}>
                                        {s.status?.toUpperCase() || 'ACTIVE'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-end">
                                    <button className="btn btn-sm btn-light border rounded px-3 me-2">
                                        View
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(s.id, s.status || 'active')}
                                        className={`btn btn-sm ${s.status === 'banned' ? 'btn-success text-white' : 'btn-outline-danger'} rounded px-2`}
                                        title={s.status === 'banned' ? 'Unban Seller' : 'Ban Seller'}
                                    >
                                        <i className={`bi ${s.status === 'banned' ? 'bi-check-circle' : 'bi-ban'}`}></i>
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
  );
}
