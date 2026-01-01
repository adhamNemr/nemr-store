"use client";

interface ProductCardProps {
  id: string | number;
  brand?: string;
  title: string;
  price: string | number;
  oldPrice?: string | number;
  image: string;
  isNew?: boolean;
  discount?: string;
}

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductCard(props: any) {
  // Gracefully handle both {product} and flat props
  const p = props.product || props;
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(p);
  };

  return (
    <div className="product-card">
      <Link href={`/product/${p.id}`} className="card-link-wrapper">
        <div className="card-image">
          {p.isNew && <span className="badge-new">NEW</span>}
          {p.discount && <span className="badge-sale">{p.discount}</span>}
          <img src={p.image} alt={p.title || p.name} />
          
          <button className="btn-quick-add" onClick={handleQuickAdd}>
            + Quick Add
          </button>
        </div>
      </Link>
      
      <div className="card-info">
        <Link href={`/product/${p.id}`}>
          <p className="brand">{p.brand || 'NEMR'}</p>
          <h4 className="title">{p.title || p.name}</h4>
        </Link>
        <span className="price">
          {p.oldPrice && <span className="old">{p.oldPrice}</span>}
          {p.price} EGP
        </span>
      </div>
    </div>
  );
}
