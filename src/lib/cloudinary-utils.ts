/**
 * Utilities pour optimiser les images Cloudinary
 * 
 * Cloudinary permet de transformer les images à la volée via l'URL.
 * Ces fonctions ajoutent automatiquement les transformations pour :
 * - Réduire la taille des fichiers
 * - Générer des formats modernes (WebP)
 * - Adapter les dimensions à l'affichage
 */

interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  gravity?: 'auto' | 'face' | 'center';
}

/**
 * Transforme une URL Cloudinary pour optimiser l'image
 * 
 * @example
 * getCloudinaryUrl('https://res.cloudinary.com/.../image.jpg', { width: 800 })
 * // Returns: https://res.cloudinary.com/.../w_800,h_600,c_fill,q_auto,f_auto/image.jpg
 */
export const getCloudinaryUrl = (
  url: string,
  options: CloudinaryOptions = {}
): string => {
  // Si ce n'est pas une URL Cloudinary, retourner telle quelle
  if (!url?.includes('res.cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
  } = options;

  // Construire les transformations
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity && crop === 'fill') transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformString = transformations.join(',');

  // Insérer les transformations dans l'URL
  // Format: .../upload/transformations/image.jpg
  return url.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * Génère un srcSet responsive pour différentes tailles d'écran
 * 
 * @example
 * <img srcSet={getCloudinarySrcSet(url, [400, 800, 1200])} />
 */
export const getCloudinarySrcSet = (
  url: string,
  sizes: number[] = [400, 800, 1200, 1920]
): string => {
  if (!url?.includes('res.cloudinary.com')) {
    return url;
  }

  return sizes
    .map((size) => {
      const optimizedUrl = getCloudinaryUrl(url, {
        width: size,
        height: Math.round(size * 0.75), // Ratio 4:3
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
      });
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');
};

/**
 * Génère une URL pour une miniature (thumbnail)
 * Utilisé dans les listes de propriétés
 */
export const getCloudinaryThumbnail = (
  url: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): string => {
  const dimensions = {
    small: { width: 400, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 },
  };

  return getCloudinaryUrl(url, {
    ...dimensions[size],
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    gravity: 'auto',
  });
};

/**
 * Génère un placeholder flou pour le lazy loading
 * Image ultra-légère (~2KB) affichée pendant le chargement
 */
export const getCloudinaryBlurPlaceholder = (url: string): string => {
  if (!url?.includes('res.cloudinary.com')) {
    return url;
  }

  // Image très petite (50x50) avec effet de flou
  return url.replace(
    '/upload/',
    '/upload/w_50,h_50,e_blur:1000,q_auto,f_auto/'
  );
};

/**
 * Génère l'URL optimale pour une image de carousel
 */
export const getCloudinaryCarouselImage = (url: string): string => {
  return getCloudinaryUrl(url, {
    width: 1200,
    height: 800,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    gravity: 'auto',
  });
};

/**
 * Génère l'URL pour une image de carte de propriété (thumbnail liste)
 */
export const getCloudinaryCardImage = (url: string): string => {
  return getCloudinaryUrl(url, {
    width: 600,
    height: 400,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    gravity: 'auto',
  });
};

/**
 * Génère l'URL pour une image pleine résolution (modal zoom)
 */
export const getCloudinaryFullImage = (url: string): string => {
  return getCloudinaryUrl(url, {
    width: 1920,
    height: 1440,
    crop: 'limit', // Ne pas crop, juste limiter la taille max
    quality: 'auto',
    format: 'auto',
  });
};
