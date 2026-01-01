"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State for selections
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [displayImage, setDisplayImage] = useState('');
  const [activeGallery, setActiveGallery] = useState<string[]>([]);
  
  // Derived data
  const [variants, setVariants] = useState<any[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const p = response.data;
        
        // Parse variant images safely
        const parsedVariants = (p.variants || []).map((v: any) => ({
             ...v,
             images: typeof v.images === 'string' ? JSON.parse(v.images) : (Array.isArray(v.images) ? v.images : [])
        }));

        setProduct(p);
        setVariants(parsedVariants);

        // Extract Options
        const colors = Array.from(new Set(parsedVariants.map((v: any) => v.color).filter(Boolean))) as string[];
        const sizes = Array.from(new Set(parsedVariants.map((v: any) => v.size).filter(Boolean))) as string[];

        setAvailableColors(colors);
        setAvailableSizes(sizes);

        // Default Selections
        if (colors.length > 0) {
            const initialColor = colors[0];
            setSelectedColor(initialColor);
            
            // Set initial image from first color variant
            const firstColorVar = parsedVariants.find((v: any) => v.color === initialColor);
            const initialImages = firstColorVar?.images?.length > 0 ? firstColorVar.images : [p.image].filter(Boolean);
            
            setActiveGallery(initialImages);
            setDisplayImage(initialImages[0]);
        } else {
            // No color options, just main image
            setActiveGallery([p.image].filter(Boolean));
            setDisplayImage(p.image);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Handle Color Click -> Updates Gallery & Selection
  const handleColorSelect = (color: string) => {
      setSelectedColor(color);
      setSelectedSize(''); // Reset size when color changes
      
      // Update Image Gallery to this color's images
      const variant = variants.find(v => v.color === color);
      const newImages = variant?.images?.length > 0 ? variant.images : [product.image].filter(Boolean);
      
      setActiveGallery(newImages);
      setDisplayImage(newImages[0]);
  };

  const handleAddToBag = () => {
    if (availableColors.length > 0 && !selectedColor) {
        alert('Please select a color.');
        return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      alert('Please select a size.');
      return;
    }

    // Find specific variant ID if applicable
    let selectedVariant = null;
    if (variants.length > 0) {
        selectedVariant = variants.find(v => 
            (!selectedColor || v.color === selectedColor) && 
            (!selectedSize || v.size === selectedSize)
        );
        
        if (!selectedVariant) {
             alert('This combination is currently unavailable.');
             return;
        }
    }

    // Pass the currently displayed image (variant image) to the cart
    const productToAdd = { ...product, image: displayImage || product.image };
    addToCart(productToAdd, selectedSize, selectedColor, selectedVariant ? selectedVariant.id : null);
  };

  if (loading) return (
    <div className="section-container text-center" style={{ paddingTop: '200px' }}>
      <div className="spinner-border" role="status"></div>
    </div>
  );

  if (!product) return (
    <div className="section-container text-center" style={{ paddingTop: '200px' }}>
      <h2>Product not found</h2>
      <button onClick={() => router.back()} className="btn btn-dark mt-3">Go Back</button>
    </div>
  );

  return (
    <div className="section-container" style={{ paddingTop: '120px' }}>
      <div className="row g-5">
        {/* Product Images Gallery */}
        <div className="col-lg-7">
          <div className="d-flex gap-3 flex-column-reverse flex-md-row">
             {/* Vertical Thumbnails (Desktop) or Horizontal (Mobile) */}
             {activeGallery.length > 1 && (
                 <div className="d-flex flex-md-column gap-2 overflow-auto hide-scrollbar" style={{ maxHeight: '600px', maxWidth: '100vw' }}>
                    {activeGallery.map((img: string, idx: number) => (
                        <div 
                           key={idx} 
                           className={`cursor-pointer border rounded-2 overflow-hidden flex-shrink-0 ${displayImage === img ? 'border-dark border-2' : ''}`}
                           style={{ width: 80, height: 100 }}
                           onClick={() => setDisplayImage(img)}
                        >
                            <img src={img} className="w-100 h-100 object-fit-cover" />
                        </div>
                    ))}
                 </div>
             )}
             
             {/* Main Image */}
             <div className="product-main-image flex-grow-1">
                <div className="rounded-3 shadow-sm overflow-hidden" style={{ aspectRatio: '3/4', position: 'relative' }}>
                    <img 
                      src={displayImage || product.image} 
                      alt={product.name} 
                      className="w-100 h-100 object-fit-cover animate-fade-in"
                    />
                </div>
             </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="col-lg-5">
          <div className="sticky-top" style={{ top: '120px' }}>
            <p className="text-muted text-uppercase letter-spacing-2 mb-2">{product.category || "Editor's Pick"}</p>
            <h1 className="display-5 fw-bold mb-2">{product.name}</h1>
            <div className="d-flex align-items-center gap-3 mb-4">
                 <p className="fs-3 fw-bold mb-0">{product.price} EGP</p>
                 {parseInt(product.stock) > 0 ? <span className="badge bg-success-subtle text-success rounded-pill px-3">In Stock</span> : <span className="badge bg-danger">Out of Stock</span>}
            </div>
            
            <hr className="my-4 opacity-25" />
            
            <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>{product.description || 'A masterpiece of modern design having premium quality and comfort.'}</p>
            
            {/* Color Selection (Apple Style) */}
            {availableColors.length > 0 && (
                <div className="mb-4">
                    <p className="fw-bold small text-muted mb-2">COLOR: <span className="text-dark fw-bolder">{selectedColor}</span></p>
                    <div className="d-flex flex-wrap gap-3">
                        {availableColors.map(color => (
                            <button
                                key={color}
                                onClick={() => handleColorSelect(color)}
                                className={`rounded-circle position-relative p-0 transition-transform hover-scale`}
                                style={{ 
                                    width: 36, 
                                    height: 36, 
                                    border: 'none',
                                    outline: 'none',
                                    // Apple style selection ring
                                    boxShadow: selectedColor === color 
                                        ? '0 0 0 2px white, 0 0 0 4px black' 
                                        : '0 0 0 1px rgba(0,0,0,0.1)'
                                }}
                                title={color}
                            >
                                <span 
                                    className="d-block w-100 h-100 rounded-circle" 
                                    style={{ background: color.toLowerCase() }}
                                ></span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-2">
                  <p className="fw-bold small text-muted mb-0">SIZE</p>
                  <button className="btn btn-link p-0 text-muted small text-decoration-none">Size Guide</button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {availableSizes.sort().map((size) => {
                    // Check availability for this size + selected color
                    const isAvailable = variants.some(v => 
                        (v.size === size) && 
                        (!selectedColor || v.color === selectedColor) && 
                        parseInt(v.stock) > 0
                    );
                    
                    return (
                      <button 
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`btn btn-outline-dark rounded-2 d-flex align-items-center justify-content-center fw-bold text-uppercase transition-all ${selectedSize === size ? 'bg-dark text-white' : ''} ${!isAvailable ? 'opacity-25 text-decoration-line-through border-0 bg-light' : ''}`}
                        style={{ width: '48px', height: '48px' }}
                      >
                        {size}
                      </button>
                    )
                })}
              </div>
            </div>
            )}

            {/* Actions */}
            <div className="d-grid gap-2">
              <button 
                className="btn btn-dark py-3 fw-bold letter-spacing-1 rounded-0"
                onClick={handleAddToBag}
                disabled={parseInt(product.stock) === 0}
              >
                {parseInt(product.stock) === 0 ? 'SOLD OUT' : 'ADD TO BAG'}
              </button>
              <button className="btn btn-outline-dark py-3 fw-bold letter-spacing-1 rounded-0">
                <i className="bi bi-heart me-2"></i> ADD TO WISHLIST
              </button>
            </div>

            {/* Details Accordion */}
            <div className="mt-5">
              <div className="accordion-item py-3 border-top border-bottom">
                <p className="fw-bold mb-1" style={{fontSize: '13px'}}>DESIGNER NOTES</p>
                <p className="text-muted small mb-0">Constructed from premium materials for durability and comfort. Designed for the modern individual.</p>
              </div>
              <div className="accordion-item py-3 border-bottom">
                <p className="fw-bold mb-1" style={{fontSize: '13px'}}>SHIPPING & RETURNS</p>
                <p className="text-muted small mb-0">Free express shipping. Returns accepted within 14 days of delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
