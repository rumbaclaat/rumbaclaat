"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

/**
 * Renders a brand logo from /public, falling back to `fallback` (e.g. the text
 * wordmark) if the file isn't present yet. Drop the real file at `src` and it
 * appears automatically — no code change needed.
 */
export default function BrandImage({
  src,
  alt,
  className,
  width,
  height,
  fallback = null,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
