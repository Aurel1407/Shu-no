import React, { useState } from "react";
import ImageZoomModal from "@/components/ImageZoomModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { getCloudinaryCarouselImage } from "@/lib/cloudinary-utils";

interface PropertyImageCarouselProps {
  images: string[];
  propertyName: string;
  className?: string;
}

const PropertyImageCarousel: React.FC<PropertyImageCarouselProps> = ({
  images,
  propertyName,
  className = "",
}) => {
  const displayImages = images && images.length > 0 ? images : [];
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  return (
    <div className={`relative ${className}`}>
      <Carousel className="w-full" opts={{ loop: true, align: "start" }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {displayImages.length > 0 ? (
            displayImages.map((image, index) => (
              <CarouselItem key={`${image}-${index}`} className="pl-2 md:pl-4">
                <Card className="border shadow-md">
                  <div className="relative overflow-hidden rounded-lg flex justify-center items-center">
                    <img
                      src={getCloudinaryCarouselImage(image)}
                      alt={`${propertyName} — vue ${index + 1}`}
                      className="max-w-full max-h-[70vh] object-contain transition-transform duration-300 hover:scale-105 cursor-zoom-in"
                      style={{ height: 'auto', width: 'auto', display: 'block' }}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    <button
                      type="button"
                      className="absolute inset-0 w-full h-full bg-transparent cursor-zoom-in focus:outline-none"
                      aria-label={`Agrandir la photo ${index + 1}`}
                      onClick={() => setZoomedIndex(index)}
                    />
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {index + 1} / {displayImages.length}
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem key="no-image">
              <Card className="border shadow-md">
                <div className="relative aspect-[3/2] max-h-64 overflow-hidden rounded-lg flex items-center justify-center bg-muted/10">
                  <span className="text-muted-foreground">Aucune photo disponible</span>
                </div>
              </Card>
            </CarouselItem>
          )}
        </CarouselContent>
        {displayImages.length > 1 && (
          <>
            <CarouselPrevious
              className="left-2"
              aria-label="Image précédente"
            />
            <CarouselNext
              className="right-2"
              aria-label="Image suivante"
            />
          </>
        )}
      </Carousel>
      {displayImages.length > 1 && (
        <div className="flex justify-center mt-3 space-x-1.5">
          {displayImages.map((image, index) => (
            <button
              key={image}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 hover:bg-muted-foreground/70 transition-colors"
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}
      <ImageZoomModal
        images={displayImages}
        currentIndex={zoomedIndex ?? 0}
        alt={propertyName}
        open={zoomedIndex !== null}
        onClose={() => setZoomedIndex(null)}
        onPrev={() => setZoomedIndex(i => (i === null ? 0 : (i - 1 + displayImages.length) % displayImages.length))}
        onNext={() => setZoomedIndex(i => (i === null ? 0 : (i + 1) % displayImages.length))}
      />
    </div>
  );
};

export default PropertyImageCarousel;