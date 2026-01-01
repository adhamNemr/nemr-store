import React from 'react';
import Link from 'next/link';

interface BentoItemProps {
  title: string;
  link: string;
  image: string;
  className?: string;
}

const BentoItem = ({ title, link, image, className = "" }: BentoItemProps) => (
  <div className={`bento-item ${className}`} style={{ backgroundImage: `url('${image}')` }}>
    <div className="bento-content">
      <h4 dangerouslySetInnerHTML={{ __html: title }}></h4>
      <Link href={link}>Explore Collection</Link>
    </div>
  </div>
);

export default function BentoGrid() {
  const collections = [
    {
      title: "Gentleman's<br/>Corner",
      link: "/shop?cat=men",
      image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1974&auto=format&fit=crop",
      className: "tall"
    },
    {
      title: "Summer<br/>Essentials",
      link: "/shop?cat=summer",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
      className: "wide"
    },
    {
      title: "Luxury<br/>Footwear",
      link: "/shop?cat=shoes",
      image: "https://images.unsplash.com/photo-1576185055363-ebd29e3bd90a?q=80&w=1974&auto=format&fit=crop"
    },
    {
      title: "Artisan<br/>Accessories",
      link: "/shop?cat=accessories",
      image: "https://images.unsplash.com/photo-1618331835717-810e976710dd?q=80&w=1974&auto=format&fit=crop"
    }
  ];

  return (
    <section className="section-container">
      <div className="section-header">
        <h3>Curated Collections</h3>
      </div>
      <div className="bento-grid">
        {collections.map((item, idx) => (
          <BentoItem key={idx} {...item} />
        ))}
      </div>
    </section>
  );
}
