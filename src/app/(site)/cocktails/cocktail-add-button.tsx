"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

export default function CocktailAddButton({
  productId,
  name,
  price,
}: {
  productId: string;
  name: string;
  price: number;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function onClick() {
    add({ productId, name, price }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      className="btn btn-outline-gold btn-sm"
      onClick={onClick}
      aria-label={`Add ${name} to cart`}
    >
      {added ? "✓" : "＋"}
    </button>
  );
}
