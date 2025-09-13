"use client";

import { useEffect, useRef, useState } from "react";

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

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    // Fake assistant response (echo with a tiny delay)
    setTimeout(() => {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "You said: " + text +
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

  return (
    <div className="chat-shell">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <h2>Conversations</h2>
        <button
          className="btn chat-new"
          onClick={() =>
            setMessages([
              { id: crypto.randomUUID(), role: "assistant", content: "New chat started. How can I help?" },
            ])
          }
        >
          + New chat
        </button>
        <div className="chat-list">
          <div className="chat-item" title="Current conversation">Current conversation</div>
        </div>
      </aside>

      {/* Main */}
      <section className="chat-main">
        <header className="chat-topbar">
          <div>Wishlist™</div>
          <div className="badge">Local demo</div>
        </header>

        <div className="chat-messages">
          {messages.map((m) => (
            <div className={`msg ${m.role}`} key={m.id}>
              <div className="avatar">{m.role === "user" ? "U" : "A"}</div>
              <div className="bubble">
                {m.content.split("\n").map((line, i) => (
                  <p key={i} style={{ marginBottom: line ? 8 : 0 }}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="chat-input-wrap">
          <div className="chat-input">
            <textarea
              placeholder="Send a message…"
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
