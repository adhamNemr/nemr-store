"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

// Components
import Hero from '@/components/home/Hero';
import Ticker from '@/components/home/Ticker';
import BentoGrid from '@/components/home/BentoGrid';
import ProductCard from '@/components/ui/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await api.get('/products');
        const data = response.data.products || response.data;
        const mapped = data.slice(0, 4).map((p: any) => ({
          id: p.id,
          title: p.name,
          price: p.price,
          image: p.image,
          isNew: p.condition === 'new'
        }));
        setProducts(mapped);
      } catch (err) {
        console.error("Home Products Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  return (
    <>
      <Hero />
      <Ticker />

      {/* ======= LATEST ARRIVALS ======= */}
      <section className="section-container">
        <div className="section-header">
          <h3 className="fw-black" style={{ letterSpacing: '-1px' }}>JUST DROPPED</h3>
          <Link href="/shop" className="view-all text-dark fw-bold">View All <i className="bi bi-arrow-right"></i></Link>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-dark"></div></div>
        ) : (
          <div className="product-grid">
            {products.map((product: any) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </section>

      <BentoGrid />

      {/* ======= LUXURY PROMO ======= */}
      <section className="promo-banner mt-5">
        <div className="promo-content">
          <h2 className="display-4 fw-black" style={{ letterSpacing: '-2px' }}>JOIN THE INNER CIRCLE</h2>
          <p className="lead mb-4">Exclusive access to limited drops and 15% off your first order.</p>
          <div className="promo-form">
            <input type="email" placeholder="Enter your email" aria-label="email" />
            <button type="button">JOIN NOW</button>
          </div>
        </div>
      </section>
    </>
  );
}
