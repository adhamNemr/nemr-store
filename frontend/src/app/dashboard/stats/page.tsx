"use client";

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const fetcher = (url: string) => api.get(url).then(res => res.data);
const COLORS = ['#000000', '#555555', '#999999', '#CCCCCC', '#E5E5E5'];

export default function AnalyticsPage() {
  const { token, user } = useAuth();
  
  const [period, setPeriod] = useState(30);
  
  /* Safe handled SWR fetch */
  const { data: salesData, error: salesError, isLoading: salesLoading, isValidating: salesValidating } = useSWR(token ? `/dashboard/sales?days=${period}` : null, fetcher);
  const { data: categoryData, error: catError, isLoading: catLoading } = useSWR(token ? '/dashboard/categories' : null, fetcher);
  const { data: stats, error: statsError, isLoading: statsLoading } = useSWR(token ? `/dashboard/stats?days=${period}` : null, fetcher);
  const { data: productPerf, error: prodError, isLoading: prodLoading } = useSWR(token ? `/dashboard/product-intelligence?days=${period}` : null, fetcher);
  
  // Determine loading and error states
  const isSyncing = salesLoading || catLoading || statsLoading || prodLoading || salesValidating;
  const error = salesError || catError || statsError || prodError;
  
  // Safe extraction of data with defaults
  const sales = salesData || [];
  const categories = categoryData || [];
  const performance = stats || { revenue: 0, orders: 0, products: 0, aov: 0 };
  const products = productPerf || [];

  if (salesLoading && !salesData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-dark" role="status"></div>
      </div>
    );
  }

  if (error && !salesData && !stats) {
    return (
      <div className="text-center py-5">
        <div className="text-danger mb-3"><i className="bi bi-exclamation-circle h1"></i></div>
        <h3>Failed to load analytics</h3>
        <p className="text-muted">Please check your connection and try again.</p>
        <button className="btn btn-dark rounded-pill mt-3" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-3">
            {user?.role === 'admin' ? 'Marketplace Intelligence' : 'Performance Insights'}
            {isSyncing && (
              <span className="badge bg-soft-dark text-dark border fw-normal small d-flex align-items-center gap-2" style={{ fontSize: '10px' }}>
                <span className="spinner-border spinner-border-sm" style={{width: '10px', height: '10px'}}></span>
                Syncing...
              </span>
            )}
          </h2>
          <p className="text-muted">
             {user?.role === 'admin' 
               ? 'Comprehensive monitoring of platform economics and merchant health.' 
               : 'Analyze your sales trends and product-level performance.'}
          </p>
        </div>
        <button className="btn btn-dark btn-sm rounded-pill px-3">
          <i className="bi bi-download me-2"></i> {user?.role === 'admin' ? 'Export Global Audit' : 'Export Sales Report'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
            <div className="dashboard-card border-0 shadow-sm p-4">
                <span className="text-muted fw-bold text-uppercase small" style={{letterSpacing: '1px'}}>
                   {user?.role === 'admin' ? 'Marketplace AOV' : 'Average Order Value'}
                </span>
                <h3 className="fw-bold mb-0 mt-2 text-dark">{performance.aov.toLocaleString()} <span className="fs-6 text-muted">EGP</span></h3>
                <small className="text-success fw-bold"><i className="bi bi-arrow-up-short"></i> +12% from last month</small>
            </div>
        </div>
        <div className="col-md-4">
            <div className="dashboard-card border-0 shadow-sm p-4">
                <span className="text-muted fw-bold text-uppercase small" style={{letterSpacing: '1px'}}>
                  {user?.role === 'admin' ? 'Total GMV' : 'My Total Revenue'}
                </span>
                <h3 className="fw-bold mb-0 mt-2 text-dark">{performance.revenue.toLocaleString()} <span className="fs-6 text-muted">EGP</span></h3>
                <small className="text-muted">{user?.role === 'admin' ? 'Total transaction volume' : 'Gross income before taxes'}</small>
            </div>
        </div>
        <div className="col-md-4">
            <div className="dashboard-card border-0 shadow-sm p-4">
                <span className="text-muted fw-bold text-uppercase small" style={{letterSpacing: '1px'}}>
                  {user?.role === 'admin' ? 'Platform Conversion' : 'Sales Velocity'}
                </span>
                <h3 className="fw-bold mb-0 mt-2 text-dark">3.2%</h3>
                <small className="text-muted">Visits to Orders ratio</small>
            </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Revenue Chart */}
        <div className="col-lg-8">
          <div className="dashboard-card border-0 shadow-sm p-4 h-100">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Revenue Trends</h5>
                <select 
                  className="form-select form-select-sm w-auto border-0 bg-light fw-bold rounded-pill px-3"
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value))}
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={14}>Last 14 Days</option>
                  <option value={30}>Last 30 Days</option>
                </select>
             </div>
             
             <div className={`mt-2 transition-all ${isSyncing ? 'opacity-50' : 'opacity-100'}`} style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart key={`sales-chart-${period}-${sales.length}`} data={sales}>
                  <defs>
                    <linearGradient id="colorSalesMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="name" 
                  tick={{fontSize: 10, fill: '#888'}} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(str: string) => {
                    try {
                      const d = new Date(str);
                      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                    } catch (e) {
                      return str;
                    }
                  }}
                />
                  <YAxis 
                    tick={{fontSize: 12, fill: '#666'}} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val: any) => `EGP ${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    labelFormatter={(val) => {
                      try {
                        return new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                      } catch {
                        return val;
                      }
                    }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorSalesMain)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="col-lg-4">
          <div className="dashboard-card border-0 shadow-sm p-4 h-100">
              <h5 className="fw-bold mb-4">Category Distribution</h5>
              <div style={{ width: '100%', height: 300 }}>
                 {categories.length === 0 ? (
                     <div className="h-100 d-flex align-items-center justify-content-center text-muted">No data available</div>
                 ) : (
                     <ResponsiveContainer>
                         <PieChart>
                             <Pie
                                 data={categories}
                                 cx="50%"
                                 cy="50%"
                                 innerRadius={60}
                                 outerRadius={80}
                                 fill="#8884d8"
                                 paddingAngle={5}
                                 dataKey="value"
                             >
                                 {categories.map((entry: any, index: number) => (
                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                             </Pie>
                             <Tooltip />
                             <Legend verticalAlign="bottom" height={36}/>
                         </PieChart>
                     </ResponsiveContainer>
                 )}
              </div>
             <div className="mt-3">
                <p className="text-muted small text-center">Breakdown of product inventory by category.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card border-0 shadow-sm p-4">
          <h5 className="fw-bold mb-4">Product Performance Intelligence</h5>
          <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover">
                  <thead className="bg-light text-uppercase small text-muted">
                      <tr>
                          <th className="py-3 px-3">Product</th>
                          <th className="py-3 px-3 text-center" title="Total cumulative views for this product">Views (All Time)</th>
                          <th className="py-3 px-3 text-center" title="Number of users who have this in their cart">In Carts</th>
                          <th className="py-3 px-3 text-center" title={`Units sold in the last ${period} days`}>Sold ({period}d)</th>
                          <th className="py-3 px-3 text-center" title="Conversion rate for the selected period">Conversion</th>
                          <th className="py-3 px-3 text-end">Revenue</th>
                      </tr>
                  </thead>
                   <tbody className={isSyncing ? 'opacity-50 transition-all' : 'transition-all'}>
                        {products.length > 0 ? products.slice(0, 10).map((p: any) => (
                            <tr key={p.id}>
                                <td className="py-3 px-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light rounded overflow-hidden" style={{width: 40, height: 40}}>
                                            <img src={p.image || 'https://placehold.co/100'} alt={p.name} className="w-100 h-100" style={{objectFit: 'cover'}}/>
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark small">{p.name}</div>
                                            <div className="text-muted d-block" style={{fontSize: '11px'}}>{p.price.toLocaleString()} EGP</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-3 text-center">
                                    <span className="badge bg-light text-dark border fw-normal"><i className="bi bi-eye me-1"></i> {p.views.toLocaleString()}</span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                    <span className="badge bg-light text-primary border border-primary-subtle fw-normal"><i className="bi bi-cart me-1"></i> {p.inCarts}</span>
                                </td>
                                <td className="py-3 px-3 text-center fw-bold text-dark">{p.sold}</td>
                                <td className="py-3 px-3 text-center">
                                    {p.conversionRate > 2 ? (
                                        <span className="text-success fw-bold small"><i className="bi bi-graph-up-arrow me-1"></i>{p.conversionRate}%</span>
                                    ) : p.conversionRate > 0 ? (
                                        <span className="text-warning fw-bold small">{p.conversionRate}%</span>
                                    ) : (
                                      <span className="text-muted small">0%</span>
                                    )}
                                </td>
                                <td className="py-3 px-3 text-end fw-black text-dark">{(p.revenue || 0).toLocaleString()} <span className="extra-small text-muted">EGP</span></td>
                            </tr>
                        )) : (
                           <tr>
                             <td colSpan={6} className="text-center py-5">
                               <div className="text-muted mb-2"><i className="bi bi-inbox h3"></i></div>
                               <div className="fw-bold text-dark">No performance data for this period</div>
                               <div className="small text-muted">Try selecting a longer timeframe.</div>
                             </td>
                           </tr>
                        )}
                   </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
