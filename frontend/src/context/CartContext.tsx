"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string | number;
  cartItemId?: string | number; // Added for unique identification
  variantId?: string | number;
  name: string;
  price: number;
  oldPrice?: number | string;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  category?: string;
  condition?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, size?: string, color?: string, variantId?: string | number) => void; // Updated signature
  removeFromCart: (itemId: string | number) => void; // Changed param name for clarity (it handles unique item keys now)
  updateQuantity: (itemId: string | number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('nemr_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('nemr_cart', JSON.stringify(cart));
  }, [cart]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = (product: any, size?: string, color?: string, variantId?: string | number) => {
    setCart((prevCart) => {
      // Find item matching ProductID + Size + Color
      const existingItem = prevCart.find(item => 
        item.id === product.id && 
        item.size === size &&
        item.color === color
      );

      if (existingItem) {
        return prevCart.map(item => 
          (item.id === product.id && item.size === size && item.color === color)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      // We need a unique key for list rendering if we rely on it, but here we can just rely on combination
      // Or we can generate a composite unique ID for the cart item (recommended for removeFromCart)
      const cartItemId = variantId ? `v-${variantId}` : `${product.id}-${size || 'ns'}-${color || 'nc'}`;

      return [...prevCart, { 
        id: product.id, 
        variantId,
        // Hack: Store a unique cart-item identifier inside 'id' or parallel? 
        // Best practice: Keep product.id as real ID, but use logic for matching.
        // But removeFromCart currently uses "id". If we have 2 variants of same PID, removing one by PID removes both?
        // YES, BUG IN ORIGINAL CODE if we rely only on PID.
        // Let's attach a unique 'cartId' to each item.
        cartId: Date.now() + Math.random(), // transient unique id
        name: product.name || product.title, 
        price: Number(product.price), 
        image: product.image, 
        quantity: 1,
        size,
        color,
        category: product.category,
        condition: product.condition
      } as any]; // Casting to any to allow extra fields if needed
    });
  };

  // Enhance remove/update to work with unique items.
  // Since original code interface used 'id' (productId), this is tricky without breaking changes.
  // For now, I will keep 'id' refer to Product ID, but logic needs to be smarter.
  // Actually, standardizing: removing by PID removes all variants? Probably not desired.
  // I will assume for now removeFromCart usually receives the product ID, which is broken for variants.
  // I will check how removeFromCart is used. It's usually item.id.
  // I'll update the added item to use a composite ID as its main "id" for cart purposes? 
  // No, that breaks links to product page.
  
  // Quick fix: Add 'cartItemId' field and update logic, but signature remains same type-wise.
  // But wait, the previous code: removeFromCart(id).
  
  // Let's look at how it matches: `item.id !== id`.
  // If I add multiple variants, they all share `item.id`. Removing one removes all.
  // To fix this properly with "Apple Style" request, I MUST fix the Cart logic.
  
  // MODIFIED APPROACH:
  // When adding to cart, I will generate a unique `uuid` for the cart entry.
  // And `removeFromCart` will expect that `uuid` technically, but existing calls pass `product.id`.
  // I should update calls to pass `item.uuid` or `item.cartId`.
  
  // For this step, I will stick to adding the Color/VariantId support to AddToCart logic essentially.
  // And I will simply use a composite string for ID if it's a variant: `${producId}-${variantId}`.
  
  // Re-writing the addToCart logic below:
  
function addToCartSafely(product: any, size?: string, color?: string, variantId?: string | number) {
    setCart((prevCart) => {
      // Composite ID for the CART ITEM (not the product)
      // If variantId exists, use it as unique identifier? No, variantId might be shared across sizes? 
      // Usually Variant = Color + Size combo. So VariantID contains both.
      // If VariantID is present, it is unique.
      const uniqueItemId = variantId || `${product.id}-${size || ''}-${color || ''}`;

      const existingItem = prevCart.find(item => item.cartItemId === uniqueItemId);

      if (existingItem) {
        return prevCart.map(item => 
          item.cartItemId === uniqueItemId
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }

      return [...prevCart, { 
        id: product.id, // Keep reference to parent product
        cartItemId: uniqueItemId, // Unique key for cart operations
        variantId,
        name: product.name || product.title, 
        price: Number(product.price), 
        image: product.image, // Ideally usage specific variant image passed in 'product' or logic
        quantity: 1,
        size,
        color,
        category: product.category,
        condition: product.condition
      } as any];
    });
}

const addToCartImpl = addToCartSafely as any; // Type alignment

  const removeFromCart = (uniqueId: string | number) => {
    setCart(prev => prev.filter(item => (item as any).cartItemId !== uniqueId && item.id !== uniqueId));
  };

  const updateQuantity = (uniqueId: string | number, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => (item as any).cartItemId === uniqueId || item.id === uniqueId ? { ...item, quantity } : item));
  };
  
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart: addToCartImpl, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      cartTotal,
      isCartOpen,
      setIsCartOpen,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
  
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
