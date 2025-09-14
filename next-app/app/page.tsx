"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";
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

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const GREETING: Message = {
  id: generateId(),
  role: "assistant",
  content: "Hi! I'm your shopping assistant. Options to get you started:",
};

const makeNewConversation = (): Conversation => ({
  id: generateId(),
  messages: [{ ...GREETING, id: generateId() }],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Simple localStorage wrapper with error handling
const storage = {
  get: (key: string) => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail if localStorage is unavailable
    }
  },
};

// Generate chat title using Cohere API
const generateChatTitle = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch("/api/cohere", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate title");
    }

    const { title } = await response.json();
    return title || `Shopping for ${userMessage.slice(0, 30)}...`;
  } catch (error) {
    console.error("Error generating title:", error);
    // Fallback to simple title generation
    const words = userMessage.trim().split(" ").slice(0, 4);
    return `Shopping for ${words.join(" ")}${
      words.length < userMessage.split(" ").length ? "..." : ""
    }`;
  }
};

const LS_KEY = "wishlist_conversations";

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvo, setCurrentConvo] = useState<Conversation | null>(null);
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [highlightInput, setHighlightInput] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Initialize conversations
  useEffect(() => {
    const stored = storage.get(LS_KEY);
    let loadedConvos: Conversation[] = [];

    if (stored) {
      try {
        loadedConvos = JSON.parse(stored);
        if (!Array.isArray(loadedConvos)) {
          loadedConvos = [];
        }
      } catch {
        loadedConvos = [];
      }
    }

    setConversations(loadedConvos);

    // If no conversations exist, start with a temporary one
    if (loadedConvos.length === 0) {
      setCurrentConvo(makeNewConversation());
      setIsTemporaryChat(true);
    } else {
      setCurrentConvo(loadedConvos[0]);
      setIsTemporaryChat(false);
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      storage.set(LS_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConvo]);

  const newChat = () => {
    const newConvo = makeNewConversation();
    setCurrentConvo(newConvo);
    setIsTemporaryChat(true);
    setInput("");

    // Trigger highlight animation
    setHighlightInput(true);
    setTimeout(() => setHighlightInput(false), 2000);
  };

  const switchConversation = (id: string) => {
    const convo = conversations.find((c) => c.id === id);
    if (convo) {
      setCurrentConvo(convo);
      setIsTemporaryChat(false);
    }
  };

  const saveTemporaryChat = async (
    convo: Conversation,
    firstUserMessage: string
  ) => {
    setGeneratingTitle(true);

    // Generate title based on first user message
    const title = await generateChatTitle(firstUserMessage);

    const savedConvo = {
      ...convo,
      title,
      updatedAt: Date.now(),
    };

    // Add to conversations list
    setConversations((prev) => [savedConvo, ...prev]);
    setCurrentConvo(savedConvo);
    setIsTemporaryChat(false);
    setGeneratingTitle(false);
  };

  const updateConversation = (updatedConvo: Conversation) => {
    if (isTemporaryChat) {
      setCurrentConvo(updatedConvo);
    } else {
      setConversations((prev) =>
        prev.map((c) => (c.id === updatedConvo.id ? updatedConvo : c))
      );
      setCurrentConvo(updatedConvo);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !currentConvo) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text,
    };

    const updatedConvo = {
      ...currentConvo,
      messages: [...currentConvo.messages, userMsg],
      updatedAt: Date.now(),
    };

    // If this is a temporary chat and it's the first user message, save it
    const isFirstUserMessage =
      isTemporaryChat && currentConvo.messages.length === 1;

    if (isFirstUserMessage) {
      await saveTemporaryChat(updatedConvo, text);
    } else {
      updateConversation(updatedConvo);
    }

    setInput("");
    setSending(true);

    // Simulate assistant response
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you find that! Let me search for some options...",
        "Great choice! Here are some similar products you might like:",
        "I found some excellent options for you. Would you like to see more details?",
        "That's a popular item! Here are some recommendations based on your request:",
        "I can help you with that. Let me show you what's available:",
      ];

      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      };

      const finalConvo = {
        ...updatedConvo,
        messages: [...updatedConvo.messages, assistantMsg],
        updatedAt: Date.now(),
      };

      updateConversation(finalConvo);
      setSending(false);
    }, 1000 + Math.random() * 1000);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Demo products
  const products = [
    {
      imageSrc:
        "https://sharkninja-sfcc-prod-res.cloudinary.com/image/upload/b_rgb:FFFFFF,c_pad,dpr_2.0,f_auto,g_north,h_800,q_auto,w_800/c_pad,h_800,w_800/v1/SharkNinja-NA/CM360C_01?pgw=1&_i=AG",
      title: "Ninja Hot & Iced XL Coffee Maker",
      price: "$179.99",
      rating: 4.7,
      reviews: "8K",
      summary:
        "Brews everything from a single-serve cup, to a travel mug—no pods required.",
      details:
        "50Oz Reservoir/10 cup carafe\n6 Sizes: Cup/XL cup/Travel/XL Travel/1/2 Carafe/Full Carafe\n4 Brew Styles: Classic/Rich/Over Ice/Cold Brew",
      url: "https://www.sharkninja.ca/ninja-hot-iced-coffee-maker-with-rapid-cold-brew/CM360C.html",
    },
    {
      imageSrc:
        "https://kickinghorsecoffee.ca/cdn/shop/files/Kicking_Horse_Coffee_Grizzly_Claw_Whole_Bean_454g_EN.webp?v=1749057974&width=1220",
      title: "Premium Organic Arabica Coffee Beans - Dark Roast",
      price: "$22.99",
      rating: 4.8,
      reviews: "2K",
      summary: "A full body bean hailing from Central & South America",
      details:
        "Condensed sugar cane and cocoa powder aromas.\nRich, dark chocolate, cacao nibs, brown sugar and roasted hazelnut.",
      url: "https://kickinghorsecoffee.ca/products/grizzly-claw-coffee?variant=41287019626652",
    },
    {
      imageSrc:
        "https://m.media-amazon.com/images/I/716wiYCPtqL._AC_SL1500_.jpg",
      title: "Ceramic Coffee Mug Set (4)",
      price: "$39.99",
      rating: 4.5,
      reviews: "289",
      summary: "A brief overview of the product",
      details:
        "Stylish 450ml ceramic mug, microwave/dishwasher safe, durable, comfy to hold, and beautifully packaged—perfect for gifting.",
      url: "https://www.amazon.ca/MIAMIO-Ceramic-Dishwasher-Microwave-Collection/dp/B0CSK1XKS8?",
    },
  ];

  return (
    <div className="chat-shell">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <h2>Your Wishlists</h2>

        <button className="btn chat-new" onClick={newChat}>
          + New chat
        </button>

        <div className="chat-list">
          {conversations.map((convo, idx) => {
            const isActive = currentConvo?.id === convo.id;
            const displayTitle =
              generatingTitle && isActive
                ? "Generating title..."
                : convo.title || `Chat ${conversations.length - idx}`;

            return (
              <button
                key={convo.id}
                className={`chat-item ${isActive ? "active" : ""}`}
                onClick={() => switchConversation(convo.id)}
                title={displayTitle}
                disabled={generatingTitle && isActive}
              >
                {displayTitle}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main chat area */}
      <section className="chat-main">
        <header className="chat-topbar">
          <picture>
            {theme == "light" ? (
              <>
                <source srcSet="/wishlist-light-32.png" />
                <Image
                  src="/wishlist-dark-32.png"
                  alt="Wishlist"
                  width={32}
                  height={32}
                />
              </>
            ) : (
              <>
                <source srcSet="/wishlist-dark-32.png" />
                <Image
                  src="/wishlist-light-32.png"
                  alt="Wishlist"
                  width={32}
                  height={32}
                />
              </>
            )}
          </picture>
          <div>Wishlist™</div>
          <div className="badge">Shopping Assistant</div>
        </header>

        <div className="chat-messages">
          {currentConvo?.messages.map((msg, idx) => (
            <div key={msg.id}>
              <div className={`msg ${msg.role}`}>
                <div className="bubble">
                  {msg.content.split("\n").map((line, i) => (
                    <p key={i}>{line || "\u00A0"}</p>
                  ))}
                </div>
              </div>

              {/* Show products after first assistant message */}
              {msg.role === "assistant" && idx === 0 && (
                <div style={{ margin: "20px 0" }}>
                  <Carousel ariaLabel="Featured products" gap={20} padX={8}>
                    {products.map((product, i) => (
                      <ProductCard
                        key={i}
                        imageSrc={product.imageSrc}
                        title={product.title}
                        price={product.price}
                        rating={product.rating}
                        reviews={product.reviews}
                        summary={product.summary}
                        details={product.details}
                        url={product.url}
                      />
                    ))}
                  </Carousel>
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="msg assistant">
              <div className="bubble typing">
                <span>●</span>
                <span>●</span>
                <span>●</span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-wrap">
          <div className="chat-input">
            <textarea
              className={highlightInput ? "highlight-border" : ""}
              placeholder="I need the best tent for the rugged outdoors, under $200."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={sending}
              rows={1}
            />
            <button
              className="send-btn"
              onClick={send}
              disabled={sending || !input.trim()}
            >
              {sending ? "●●●" : "Send"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
