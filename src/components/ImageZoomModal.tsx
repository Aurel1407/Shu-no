import React, { useEffect } from "react";

interface ImageZoomModalProps {
  images: string[];
  currentIndex: number;
  alt: string;
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ images, currentIndex, alt, open, onClose, onPrev, onNext }) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full flex justify-center items-center"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={alt}
          className="max-h-[90vh] max-w-full rounded-lg shadow-lg object-contain"
          style={{ background: "#222" }}
          loading="lazy"
        />
        <button
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-black rounded-full px-3 py-1 text-lg shadow"
          onClick={onClose}
          aria-label="Fermer la vue zoom"
        >
          ×
        </button>
        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full px-3 py-1 text-lg shadow"
              onClick={e => { e.stopPropagation(); onPrev(); }}
              aria-label="Photo précédente"
            >
              ‹
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full px-3 py-1 text-lg shadow"
              onClick={e => { e.stopPropagation(); onNext(); }}
              aria-label="Photo suivante"
            >
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageZoomModal;
