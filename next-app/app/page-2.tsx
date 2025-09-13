import Link from "next/link";

export default function Home() {
  return (
    <main className="hero">
      <section className="hero-card">
        <header className="hero-head">
          {/* If you add /public/logo.svg it will show; otherwise remove the img */}
          <img src="/logo.svg" alt="" />
          <span className="badge">Demo</span>
        </header>

        <div className="hero-body">
          <h1 className="hero-title">Chat, but make it simple.</h1>
          <p className="hero-sub">
            A minimal ChatGPT-style interface built with Next.js App Router.
            No backend required for this demo—messages are stored in memory and echoed.
          </p>

          <div className="hero-actions">
            <Link href="/chat" className="btn">Start chatting</Link>
            <a className="btn" href="https://nextjs.org/docs" target="_blank" rel="noreferrer">Next.js Docs</a>
          </div>
        </div>
      </section>
    </main>
  );
}
