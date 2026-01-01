"use client";

import React from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  condition: string;
  image: string;
  stock: number;
}

interface ProductRowProps {
  product: Product;
  onDelete: (id: number) => void;
}

export default function ProductRow({ product, onDelete }: ProductRowProps) {
  return (
    <tr className="border-bottom-light">
      <td className="px-4 py-3">
        <div className="d-flex align-items-center gap-3">
          <img 
            src={product.image || 'https://placehold.co/100'} 
            alt={product.name} 
            className="rounded shadow-sm" 
            style={{ width: '40px', height: '50px', objectFit: 'cover' }} 
          />
          <div>
            <div className="fw-bold text-dark small text-truncate" style={{maxWidth: '200px'}}>{product.name}</div>
            <div className="x-small text-muted">{product.category}</div>
          </div>
        </div>
      </td>
      <td className="py-3">
        <span className={`badge ${product.condition === 'new' ? 'bg-success' : 'bg-secondary'} rounded-pill px-3 text-uppercase`} style={{ fontSize: '10px' }}>
          {product.condition}
        </span>
      </td>
      <td className="py-3">
        {product.discountPrice ? (
          <div className="d-flex flex-column">
            <span className="fw-black text-danger">{product.discountPrice.toLocaleString()} EGP</span>
            <span className="text-muted text-decoration-line-through x-small">{product.price.toLocaleString()} EGP</span>
          </div>
        ) : (
          <span className="fw-bold text-dark">{product.price?.toLocaleString()} EGP</span>
        )}
      </td>
      <td className="py-3">
        <span className={`fw-bold ${product.stock < 5 ? 'text-danger' : 'text-dark'}`}>
          {product.stock} <small className="text-muted fw-normal">units</small>
        </span>
      </td>
      <td className="px-4 py-3 text-end">
        <div className="d-flex justify-content-end gap-2">
          <Link href={`/dashboard/products/edit/${product.id}`} className="btn-action btn-edit">
            <i className="bi bi-pencil-square"></i>
          </Link>
          <button onClick={() => onDelete(product.id)} className="btn-action btn-delete">
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}
