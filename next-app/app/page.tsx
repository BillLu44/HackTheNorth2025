"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";
import Carousel from "../components/carousel";
import ProductCard from "../components/product-card";

type Role = "user" | "assistant";
type Message = { 
  id: string; 
  role: Role; 
  content: string;
  products?: any[];
};
type Conversation = {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  title?: string;
};

let idCounter = 0;
const generateId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = ++idCounter;
  return `${timestamp}_${counter}_${random}`;
};

const GREETING: Message = {
  id: generateId(),
  role: "assistant",
  content: "Hi! I'm your shopping assistant. Ask me what you want to buy!",
};

const makeNewConversation = (): Conversation => ({
  id: generateId(),
  messages: [{ ...GREETING, id: generateId() }],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Simple in-memory storage for Claude.ai compatibility
const storage = {
  conversations: [] as Conversation[],
  get: (key: string) => {
    if (key === LS_KEY) {
      return JSON.stringify(storage.conversations);
    }
    return null;
  },
  set: (key: string, value: string) => {
    if (key === LS_KEY) {
      try {
        storage.conversations = JSON.parse(value);
      } catch {
        storage.conversations = [];
      }
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

const LoadingSpinner = () => (
  <div className="modern-spinner">
    <div className="spinner-dots">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
    <style jsx>{`
      .modern-spinner {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
      }
      
      .spinner-dots {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      
      .dot {
        width: 6px;
        height: 6px;
        background: var(--c-accent);
        border-radius: 50%;
        animation: pulse-dot 1.4s ease-in-out infinite both;
      }
      
      .dot:nth-child(1) { animation-delay: -0.32s; }
      .dot:nth-child(2) { animation-delay: -0.16s; }
      .dot:nth-child(3) { animation-delay: 0s; }
      
      @keyframes pulse-dot {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1.2);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

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

  // Save conversations to in-memory storage
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

    // Add to conversations list (prevent duplicates)
    setConversations((prev) => {
      const exists = prev.some(c => c.id === savedConvo.id);
      return exists ? prev : [savedConvo, ...prev];
    });
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

    try {
      // Call the search endpoint with user's query
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();
      
      // Debug: Log the products to see what we're getting
      console.log('Frontend - Products received:', products);
      console.log('Frontend - Products type:', typeof products);
      console.log('Frontend - Is array:', Array.isArray(products));
      console.log('Frontend - Products length:', products?.length);
      
      // If products is not an array, try to extract the array from the response
      let productArray = products;
      if (!Array.isArray(products)) {
        console.log('Frontend - Products is not an array, checking for nested array...');
        // Check if products has a property that contains the array
        if (products && typeof products === 'object') {
          const keys = Object.keys(products);
          console.log('Frontend - Available keys:', keys);
          // Look for common array property names
          for (const key of ['products', 'items', 'results', 'data']) {
            if (products[key] && Array.isArray(products[key])) {
              console.log(`Frontend - Found array at key: ${key}`);
              productArray = products[key];
              break;
            }
          }
        }
      }

      // Create response based on the products received
      let assistantContent = "I found some great products for you! Here are the options:";
      
      if (productArray && productArray.length > 0) {
        assistantContent = `I found ${productArray.length} products that might interest you. Take a look at these options!`;
      } else {
        assistantContent = "I searched our database but couldn't find any products matching your request at the moment. Please try a different search term.";
      }

      console.log('Frontend - Final productArray:', productArray);
      console.log('Frontend - Final productArray length:', productArray?.length);

      // Generate AI descriptions for products
      const productsWithDescriptions = await Promise.all(
        (productArray || []).map(async (product: any) => {
          try {
            const descResponse = await fetch('/api/cohere', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: product.product_name,
                product: product,
                type: 'description'
              }),
            });
            
            if (descResponse.ok) {
              const { description } = await descResponse.json();
              return { ...product, cohereDescription: description };
            }
          } catch (error) {
            console.error('Error generating description for product:', error);
          }
          return product;
        })
      );

      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: assistantContent,
        products: productsWithDescriptions || [], // Store products with AI descriptions
      };

      const finalConvo = {
        ...updatedConvo,
        messages: [...updatedConvo.messages, assistantMsg],
        updatedAt: Date.now(),
      };

      updateConversation(finalConvo);
      setSending(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Fallback response if API call fails
      const errorMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "I'm having trouble searching for products right now. Please try again in a moment.",
        products: [], // Empty products array for failed requests
      };

      const finalConvo = {
        ...updatedConvo,
        messages: [...updatedConvo.messages, errorMsg],
        updatedAt: Date.now(),
      };

      updateConversation(finalConvo);
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

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
                key={`${convo.id}-${idx}`}
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

              {/* Show products for assistant messages that have products */}
              {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
                <div style={{ 
                  margin: "20px 0", 
                  display: "flex", 
                  justifyContent: "center", 
                  gap: "20px", 
                  flexWrap: "wrap",
                  maxWidth: "1000px",
                  marginLeft: "auto",
                  marginRight: "auto"
                }}>
                  {msg.products.slice(0, 3).map((product, i) => (
                    <ProductCard
                      key={i}
                      imageSrc={product.image_url}
                      title={product.product_name}
                      price={product.price_str}
                      priceRange={product.price_range}
                      category={product.category}
                      siteName={product.site_name}
                      rating={product.rating}
                      reviews={product.review_count}
                      summary={product.description}
                      url={product.product_url}
                      cohereDescription={product.cohereDescription}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="msg assistant">
              <div className="bubble">
                <LoadingSpinner />
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
              placeholder="Eg. I need the best tent for the rugged outdoors, under $200."
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
              {sending ? <LoadingSpinner /> : "Send"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}