"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";

type CarouselProps = PropsWithChildren<{
  ariaLabel?: string;
  gap?: number;       // px gap between cards (default 16)
  padX?: number;      // horizontal padding (default 16)
  showDots?: boolean; // not used here, kept for future
}>;

export default function Carousel({
  children,
  ariaLabel = "carousel",
  gap = 16,
  padX = 16,
  showDots = false,
}: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEnds = () => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setAtStart(scrollLeft <= 2);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    updateEnds();
    el.addEventListener("scroll", updateEnds, { passive: true });
    const ro = new ResizeObserver(updateEnds);
    ro.observe(el);

    // Pointer drag
    let isDown = false;
    let startX = 0;
    let startLeft = 0;

    const onDown = (e: PointerEvent) => {
      // 🚫 Don’t start dragging if the pointer target is an interactive child
      if (e.target instanceof Element && e.target.closest('[data-interactive="true"]')) return;
      // Only left mouse (or touch/pen)
      if (e.pointerType === "mouse" && e.button !== 0) return;

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
      if (!isDown) return;
      isDown = false;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      el.classList.remove("carousel-dragging");
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    return () => {
      el.removeEventListener("scroll", updateEnds);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const scrollByAmount = (dir: "prev" | "next") => {
    const el = viewportRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

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
        style={{ paddingLeft: padX, paddingRight: padX, scrollSnapType: "x mandatory" }}
      >
        <div className="carousel-track">
          {Array.isArray(children)
            ? children.map((child, i) => (
                <div className="carousel-item" key={i}>
                  {child}
                </div>
              ))
            : <div className="carousel-item">{children}</div>}
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

      {showDots && <div className="carousel-dots" aria-hidden />}
    </div>
  );
}
