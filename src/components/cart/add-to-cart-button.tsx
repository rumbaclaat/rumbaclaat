"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

export default function AddToCartButton({
  productId,
  variantId,
  name,
  price,
  className = "btn btn-gold btn-lg",
  label = "Add to Cart",
  qty = 1,
}: {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  className?: string;
  label?: string;
  qty?: number;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function onClick() {
    add({ productId, variantId, name, price }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button type="button" className={className} onClick={onClick} aria-live="polite">
      {added ? "Added ✓" : label}
    </button>
  );
}
