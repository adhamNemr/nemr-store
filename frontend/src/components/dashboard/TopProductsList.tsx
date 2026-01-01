import React from 'react';

interface TopProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  sold: number;
}

interface TopProductsListProps {
  title: string;
  products: TopProduct[];
}

export default function TopProductsList({ title, products }: TopProductsListProps) {
  return (
    <div className="dashboard-card border-0 shadow-sm p-4 h-100">
      <h5 className="fw-bold mb-4">{title}</h5>
      <div className="d-flex flex-column gap-3">
        {products.slice(0, 5).map((p) => (
          <div key={p.id} className="d-flex align-items-center gap-3 border-bottom border-light pb-2">
            <img 
              src={p.image || 'https://placehold.co/100'} 
              alt={p.name} 
              className="rounded shadow-sm" 
              style={{ width: '48px', height: '48px', objectFit: 'cover' }} 
            />
            <div className="flex-grow-1 overflow-hidden">
              <h6 className="mb-0 fw-bold small text-truncate">{p.name}</h6>
              <small className="text-muted">{p.price.toLocaleString()} EGP</small>
            </div>
            <span className="badge bg-light text-dark fw-bold">{p.sold} Sold</span>
          </div>
        ))}
      </div>
    </div>
  );
}
