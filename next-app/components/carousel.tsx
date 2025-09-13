"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";

type CarouselProps = PropsWithChildren<{
  ariaLabel?: string;
  gap?: number;         // px gap between cards (default 16)
  padX?: number;        // horizontal padding inside viewport (default 16)
  showDots?: boolean;   // optional dots (default false)
}>;

export default function Carousel({
  children,
  ariaLabel = "product carousel",
  gap = 16,
  padX = 16,
  showDots = false,
}: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Update arrow disabled state
  const updateEnds = () => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setAtStart(scrollLeft <= 2);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
  };

  useEffect(() => {
    updateEnds();
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEnds, { passive: true });
    const ro = new ResizeObserver(updateEnds);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEnds);
      ro.disconnect();
    };
  }, []);

  const scrollByAmount = (dir: "prev" | "next") => {
    const el = viewportRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9); // almost a page
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  // Pointer drag (optional but nice)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let startLeft = 0;

    const onDown = (e: PointerEvent) => {
      isDown = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.classList.add("carousel-dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = (e: PointerEvent) => {
      isDown = false;
      el.releasePointerCapture(e.pointerId);
      el.classList.remove("carousel-dragging");
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className="carousel" aria-label={ariaLabel} style={{ ["--gap" as any]: `${gap}px` }}>
      <button
        className="carousel-arrow left"
        aria-label="Previous"
        onClick={() => scrollByAmount("prev")}
        disabled={atStart}
      >
        ‹
      </button>

      <div
        ref={viewportRef}
        className="carousel-viewport"
        style={{
          paddingLeft: padX,
          paddingRight: padX,
          scrollSnapType: "x mandatory",
        }}
      >
        <div className="carousel-track">
          {Array.isArray(children) ? children.map((child, i) => (
            <div className="carousel-item" key={i}>
              {child}
            </div>
          )) : <div className="carousel-item">{children}</div>}
        </div>
      </div>

      <button
        className="carousel-arrow right"
        aria-label="Next"
        onClick={() => scrollByAmount("next")}
        disabled={atEnd}
      >
        ›
      </button>

      {showDots && (
        <div className="carousel-dots" aria-hidden />
      )}
    </div>
  );
}
