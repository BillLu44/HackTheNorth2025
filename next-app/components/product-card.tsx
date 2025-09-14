"use client";
import { useState, KeyboardEvent, PointerEvent } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";

export type ProductCardProps = {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  price: string;
  priceRange: string;
  category: string;
  siteName: string;
  rating: number;
  reviews: string;
  summary: string;
  url?: string;
  cohereDescription?: string;
};

export default function ProductCard({
  imageSrc,
  imageAlt = "",
  title,
  price,
  priceRange,
  category,
  siteName,
  rating,
  reviews,
  summary,
  url,
  cohereDescription,
}: ProductCardProps) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((v) => !v);

  const markdown = `[Open link](${url})`;

  // Stop carousel drag from starting when interacting with the card
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Flip on click
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  // Keyboard accessibility
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      className={`pcard ${flipped ? "is-flipped" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={flipped ? "Show front" : "Show details"}
      data-interactive="true"
      onClick={onClick}
      onKeyDown={onKeyDown}
      style={{ cursor: 'pointer' }}
    >
      {/* FRONT */}
      <div className="pcard-face pcard-front">
        <div className="pcard-imgwrap">
          <img
            className="pcard-img"
            src={imageSrc}
            alt={imageAlt}
            draggable={false}
          />
        </div>
        <h3 className="pcard-title">{title}</h3>
        <div className="pcard-price-main">{price ? price.replace(/^\$?(\d+)\.?$/, '$$$1') : "N/A"}</div>
        <div className="pcard-meta">
          <span className="pcard-rating"><span className="text-yellow-300">★</span>{Number(rating).toFixed(1)}</span>
          <span className="pcard-dot">•</span>
          <span className="pcard-reviews">{reviews} reviews</span>
        </div>
      </div>

      {/* BACK */}
      <div className="pcard-face pcard-back">
        <div className="pcard-back-content">
          <h4 className="pcard-back-title">Summary</h4>
          <p className="pcard-back-description">
            {cohereDescription || "Generating AI summary..."}
          </p>
        </div>
        <p className="pcard-back-hint">
          Click to flip back
        </p>
      </div>
    </div>
  );
}
