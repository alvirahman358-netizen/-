import { useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  title: string;
  className?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  title,
  className = '',
  priority = false,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[var(--brand-surface)] text-stone-600 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Package
          className="w-8 h-8 mb-2 text-[var(--brand-accent)]/70"
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-stone-700 line-clamp-2">
          {title}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
