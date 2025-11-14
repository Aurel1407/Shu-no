/**
 * Composant d'image optimisé avec support Cloudinary
 * 
 * Utilise automatiquement srcSet pour des images responsive
 * et applique les transformations Cloudinary pour optimiser le chargement
 */

import React from 'react';
import { getCloudinaryUrl, getCloudinarySrcSet } from '@/lib/cloudinary-utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

/**
 * Image optimisée avec transformations Cloudinary automatiques
 * 
 * @example
 * <OptimizedImage 
 *   src={property.image}
 *   alt="Gîte"
 *   width={800}
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width = 800,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
  loading = 'lazy',
  onLoad,
  onError,
  style,
}) => {
  // Si l'URL est Cloudinary, générer srcSet responsive
  const isCloudinary = src?.includes('res.cloudinary.com');

  if (isCloudinary) {
    // Générer plusieurs tailles pour srcSet
    const srcSet = getCloudinarySrcSet(src, [400, 800, 1200, 1920]);
    
    // URL par défaut (fallback)
    const defaultSrc = getCloudinaryUrl(src, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });

    return (
      <img
        src={defaultSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={onLoad}
        onError={onError}
        style={style}
      />
    );
  }

  // Pour les images non-Cloudinary, affichage standard
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onLoad={onLoad}
      onError={onError}
      style={style}
    />
  );
};

export default OptimizedImage;
