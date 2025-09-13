// next-app/app/chat/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Carousel from "./components/carousel";
import ProductCard from "./components/product-card";

type Message = { id: string; role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hi! Ask me anything — this demo echoes your message.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    setTimeout(() => {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "You said: " +
          text +
          "\n\n(This is a front-end only mock. Hook up an API route to call a model.)",
      };
      setMessages((m) => [...m, assistantMsg]);
      setSending(false);
    }, 400);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) send();
    }
  };

  // Demo products (replace imageSrc with your own or external URLs)
  const products = [
    {
      imageSrc: "https://images.unsplash.com/photo-1511920170033-f8396924c348?",
      title: "Ninja Hot & Iced XL Coffee Maker with Rapid Cold Brew",
      price: "$179.99",
      rating: 4.7,
      reviews: "8k",
    },
    {
      imageSrc: "https://images.unsplash.com/photo-1498804103079-a6351b050096?",
      title: "Ninja Hot & Iced XL Coffee Maker with Rapid Cold Brew",
      price: "$179.99",
      rating: 4.7,
      reviews: "8k",
    },
    {
      imageSrc: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?",
      title: "Ninja Hot & Iced XL Coffee Maker with Rapid Cold Brew",
      price: "$179.99",
      rating: 4.7,
      reviews: "8k",
    },
  ];

  return (
    <div className="chat-shell">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <h2>Conversations</h2>
        <button
          className="btn chat-new"
          onClick={() =>
            setMessages([
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "New chat started. How can I help?",
              },
            ])
          }
        >
          + New chat
        </button>
        <div className="chat-list">
          <div className="chat-item" title="Current conversation">
            Current conversation
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="chat-main">
        <header className="chat-topbar">
          <div>Wishlist™</div>
          <div className="badge">Local demo</div>
        </header>

        <div className="chat-messages">
          {messages.map((m, idx) => (
            <div key={m.id}>
              <div className={`msg ${m.role}`}>
                {/* avatar hidden per your current style */}
                <div className="bubble">
                  {m.content.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              {/* Inject carousel after the FIRST assistant message only */}
              {m.role === "assistant" && idx === 0 && (
                <div style={{ margin: "20px 0" }}>
                  <Carousel ariaLabel="Suggested products" gap={20} padX={8}>
                    {products.map((p, i) => (
                      <ProductCard
                        key={i}
                        imageSrc={p.imageSrc}
                        title={p.title}
                        price={p.price}
                        rating={p.rating}
                        reviews={p.reviews}
                      />
                    ))}
                  </Carousel>
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="chat-input-wrap">
          <div className="chat-input">
            <textarea
              placeholder="Start writing your wishlist..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="send-btn" onClick={send} disabled={sending || !input.trim()}>
              {sending ? "…" : "Send"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
