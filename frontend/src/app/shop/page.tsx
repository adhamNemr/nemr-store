"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import api from '@/lib/api';

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('cat') || 'All';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query string based on category
        const query = category !== 'All' ? `?cat=${category.toLowerCase()}` : '';
        const response = await api.get(`/products${query}`);
        const data = response.data.products || response.data;
        
        // Map backend fields to frontend ProductCard props
        const mappedProducts = data.map((p: any) => ({
          id: p.id,
          title: p.name,
          price: p.price,
          image: p.image,
          isNew: p.condition === 'new',
          description: p.description,
          category: p.category // Ensure category is preserved for UI if needed
        }));
        
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]); // Re-fetch when category param changes

  if (loading) {
    return (
      <div className="section-container text-center" style={{ paddingTop: '200px' }}>
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h2 className="letter-spacing-2 fw-bold">{category.toUpperCase()}</h2>
        <p className="text-muted text-uppercase small">Showing {products.length} results</p>
      </div>

      <div className="filter-bar border-top border-bottom py-3">
        <div className="container d-flex justify-content-between">
          <div className="filter-group">
            <span className="small fw-bold text-uppercase letter-spacing-1 me-3">Filters</span>
            <select className="form-select-minimal">
              <option>Default</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
          <div className="filter-group">
            <span className="small text-muted">{products.length} Products</span>
          </div>
        </div>
      </div>

      <section className="section-container mt-5">
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-5">
            <h3 className="fw-light">NO PRODUCTS FOUND</h3>
            <p className="text-muted">Try exploring our other curated collections.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container py-5 mt-5 text-center">Loading Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
