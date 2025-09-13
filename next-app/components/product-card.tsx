"use client";

export type ProductCardProps = {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  price: string;          // e.g., "$179.99"
  rating: number;         // e.g., 4.7
  reviews: string;        // e.g., "8k"
};

export default function ProductCard({
  imageSrc,
  imageAlt = "",
  title,
  price,
  rating,
  reviews,
}: ProductCardProps) {
  return (
    <article className="pcard">
      <div className="pcard-imgwrap">
        {/* Use <Image> if you prefer; <img> keeps it generic */}
        <img className="pcard-img" src={imageSrc} alt={imageAlt} />
      </div>

      <h3 className="pcard-title">{title}</h3>

      <div className="pcard-meta">
        <span className="pcard-price">{price}</span>
        <span className="pcard-dot">•</span>
        <span className="pcard-rating">
            <span className="pcard-star">★</span> {rating.toFixed(1)}
        </span>
        <span className="pcard-dot">•</span>
        <span className="pcard-reviews">({reviews})</span>
      </div>
    </article>
  );
}
