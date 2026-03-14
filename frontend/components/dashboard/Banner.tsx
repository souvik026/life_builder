import Image from "next/image";

/**
 * Collage-style hero banner with 6 images.
 *
 * To swap images: replace the SVG/PNG files in /public/banners/ keeping the
 * same filenames (banner-1 through banner-6). Recommended size: 400x300px.
 * Supported formats: SVG, PNG, JPG, WebP.
 */

const BANNER_IMAGES = [
  { src: "/banners/banner-1.svg", alt: "Leaf pattern" },
  { src: "/banners/banner-2.svg", alt: "Mountain silhouette" },
  { src: "/banners/banner-3.svg", alt: "Botanical circles" },
  { src: "/banners/banner-4.svg", alt: "Geometric grid" },
  { src: "/banners/banner-5.svg", alt: "Sunrise horizon" },
  { src: "/banners/banner-6.svg", alt: "Growth sprout" },
];

export function Banner() {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl animate-fade-in">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        {BANNER_IMAGES.map((img, i) => (
          <div
            key={img.src}
            className="relative aspect-[4/3] overflow-hidden rounded-lg"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              priority={i < 3}
            />
          </div>
        ))}
      </div>
      {/* Bottom fade overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-cream to-transparent" />
    </div>
  );
}
