"use client";
import { useState, KeyboardEvent, PointerEvent } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";

export type ProductCardProps = {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  price: string;
  rating: number;
  reviews: string;
  summary: string;
  details?: string;
  url?: string;
};

export default function ProductCard({
  imageSrc,
  imageAlt = "",
  title,
  price,
  rating,
  reviews,
  summary,
  details,
  url,
}: ProductCardProps) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped(v => !v);

  const markdown = `[Open link](${url})`;

  // Stop carousel drag from starting when interacting with the card
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Flip on left mouse or tap
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") {
      const btn = (e as any).button ?? 0;
      if (btn !== 0) return; // only left click
    }
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
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* FRONT */}
      <div className="pcard-face pcard-front">
        <div className="pcard-imgwrap">
          <img className="pcard-img" src={imageSrc} alt={imageAlt} draggable={false} />
        </div>
        <h3 className="pcard-title">{title}</h3>
        <div className="pcard-meta">
          <span className="pcard-price">{price}</span>
          <span className="pcard-dot">•</span>
          <span className="pcard-rating">★ {rating.toFixed(1)}</span>
          <span className="pcard-dot">•</span>
          <span className="pcard-reviews">({reviews})</span>
        </div>
      </div>

      {/* BACK */}
      <div className="pcard-face pcard-back">
        <h4 className="pcard-back-title">{summary}</h4>
        <p className="pcard-back-text">{details}</p>
        <p className="pcard-back-link"><ReactMarkdown>{markdown}</ReactMarkdown></p>
        <p className="pcard-back-hint">Click again or press Enter/Space to flip back.</p>
      </div>
    </div>
  );
}
