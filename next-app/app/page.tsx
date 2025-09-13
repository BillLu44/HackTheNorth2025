// next-app/app/chat/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Carousel from "../components/carousel";
import ProductCard from "../components/product-card";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string };
type Conversation = {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  title?: string;
};

const LS_KEY = "wishlist.chat.conversations.v1";

const GREETING: Message = {
  id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random()),
  role: "assistant",
  content: "Hi! Ask me anything — this demo echoes your message.",
};

const makeNewConversation = (): Conversation => ({
  id: crypto.randomUUID(),
  messages: [{ ...GREETING, id: crypto.randomUUID() }],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window === "undefined") return [makeNewConversation()];
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [makeNewConversation()];
      const parsed = JSON.parse(raw) as Conversation[];
      return parsed.length ? parsed : [makeNewConversation()];
    } catch {
      return [makeNewConversation()];
    }
  });

  const active = conversations[0];
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length]);

  // Sidebar labels: index 0 = "New conversation", archives start at 1
  const sidebarItems = conversations.map((c, idx) => ({
    id: c.id,
    label: idx === 0 ? "New conversation" : `Conversation ${idx}`,
    idx,
  }));

  // --- Switching logic by id (robust) ---
  const switchToId = (id: string) => {
  setConversations((prev) => {
    const i = prev.findIndex((c) => c.id === id);
    if (i < 0) return prev;      // not found
    if (i == 0) return prev;    // already active → no reorder
    const clone = [...prev];
    const [picked] = clone.splice(i, 1);
    return [picked, ...clone];
  });
};


  const newChat = () => {
    setConversations((prev) => {
      const fresh = makeNewConversation();
      const archivedActive = { ...prev[0], updatedAt: Date.now() };
      return [fresh, archivedActive, ...prev.slice(1)];
    });
    setInput("");
  };

  // Slash command: /open N  (N = 1,2,3...)
  const tryOpenByIndexCommand = (text: string): boolean => {
    const m = text.match(/^\/open\s+(\d+)\s*$/i);
    if (!m) return false;
    const n = parseInt(m[1], 10);
    if (!Number.isFinite(n) || n < 0 || n >= conversations.length) return true; // handled (noop if OOB)
    // Bring that index to front so you can continue chatting in it
    const id = conversations[n].id;
    switchToId(id);
    setInput("");
    return true;
  };

  const send = () => {
    const text = input.trim();
    if (!text || sending) return;

    // handle /open N
    if (tryOpenByIndexCommand(text)) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };

    // append user
    setConversations((prev) => {
      const [head, ...rest] = prev;
      const updatedHead: Conversation = {
        ...head,
        messages: [...head.messages, userMsg],
        updatedAt: Date.now(),
      };
      return [updatedHead, ...rest];
    });

    setInput("");
    setSending(true);

    // fake assistant
    setTimeout(() => {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "You said: " +
          text +
          "\n\n(This is a front-end only mock. Hook up an API route to call a model.)",
      };
      setConversations((prev) => {
        const [head, ...rest] = prev;
        const updatedHead: Conversation = {
          ...head,
          messages: [...head.messages, assistantMsg],
          updatedAt: Date.now(),
        };
        return [updatedHead, ...rest];
      });
      setSending(false);
    }, 400);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Demo products for optional carousel
  const products = [
    {
      imageSrc: "https://images.unsplash.com/photo-1511920170033-f8396924c348?",
      title: "Ninja Hot & Iced XL Coffee Maker with Rapid Cold Brew",
      price: "$179.99",
      rating: 4.7,
      reviews: "8K",
    },
    {
      imageSrc: "https://images.unsplash.com/photo-1498804103079-a6351b050096?",
      title: "Ninja Hot & Iced XL Coffee Maker with Rapid Cold Brew",
      price: "$179.99",
      rating: 4.7,
      reviews: "8K",
    },
    {
      imageSrc: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?",
      title: "Ninja Hot & Iced XL Coffee Maker with Rapid Cold Brew",
      price: "$179.99",
      rating: 4.7,
      reviews: "8K",
    },
  ];


  return (
    <div className="chat-shell">
      {/* Sidebar (scrolls) */}
      <aside className="chat-sidebar">
        <h2>Conversations</h2>

        <button className="btn chat-new" onClick={newChat}>
          + New chat
        </button>

        <div className="chat-list" role="tree">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className="chat-item"
              role="treeitem"
              aria-selected={item.idx === 0}
              onClick={() => switchToId(item.id)}
              title={item.label}
              style={item.idx === 0 ? { fontWeight: 600 } : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main (own scroll, pinned input) */}
      <section className="chat-main">
        <header className="chat-topbar">
          <div>Wishlist™</div>
          <div className="badge">Local demo</div>
        </header>

        <div className="chat-messages">
          {active.messages.map((m, idx) => (
            <div key={m.id}>
              <div className={`msg ${m.role}`}>
                <div className="bubble">
                  {m.content.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              {/* OPTIONAL: Carousel after the very first assistant greeting */}
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
          <div style={{ height: 96 }} />
        </div>

        {/* Composer pinned at bottom */}
        <div className="chat-input-wrap">
          <div className="chat-input">
            <textarea
              placeholder='Type a message… (tip: try "/open 2")'
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
