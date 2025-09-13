// next-app/app/demo/page.tsx
import ProductCard from "../components/product-card";
import Carousel from "../components/carousel";

export default function DemoPage() {
  // Demo data (use your own URLs or local /public files)
  const items = [
    {
      img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1200&auto=format&fit=crop",
      title: "Ninja Hot & Iced XL Coffee Maker with Rapid Cold Brew",
      price: "$179.99",
      rating: 4.7,
      reviews: "8k",
    },
    {
      img: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200&auto=format&fit=crop",
      title: "Ninja Hot & Iced XL Coffee Maker with Rapid Cold Brew",
      price: "$179.99",
      rating: 4.7,
      reviews: "8k",
    },
    {
      img: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=1200&auto=format&fit=crop",
      title: "Ninja Hot & Iced XL Coffee Maker with Rapid Cold Brew",
      price: "$179.99",
      rating: 4.7,
      reviews: "8k",
    },
  ];

  return (
    <main style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: 16 }}>Products</h1>
      <Carousel ariaLabel="Coffee makers" gap={20} padX={8}>
        {items.map((p, idx) => (
          <ProductCard
            key={idx}
            imageSrc={p.img}
            title={p.title}
            price={p.price}
            rating={p.rating}
            reviews={p.reviews}
          />
        ))}
      </Carousel>
    </main>
  );
}
