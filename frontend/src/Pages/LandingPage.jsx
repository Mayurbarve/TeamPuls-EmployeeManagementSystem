import React, { useEffect, useState } from "react";
import "./LandingPage.css";

const DownloadIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M4 14.5v2h12v-2" /></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;

function DashboardPreview() {
  return (
    <div className="live-preview" aria-label="TeamPulse live dashboard preview">
      <span className="preview-live-dot" />
      <div className="live-preview-header"><span><i /> LIVE DASHBOARD</span><span>Real-time</span></div>
      <div className="live-preview-grid">
        <article className="live-tile activity-tile"><div className="activity-pill"><span>● &nbsp;Live activity</span><b>+12% ↑</b></div><strong>18</strong><span className="tile-subtitle">employees active</span><div className="activity-meter-label"><span>Activity level</span><span>75%</span></div><div className="activity-meter"><i /></div></article>
        <article className="live-tile idle-tile"><strong>32</strong><b>Idle alerts</b><span className="idle-gauge" /></article>
        <article className="summary-tile"><label>TODAY'S SUMMARY</label><div><strong>Team productivity overview</strong><span>Mon Tue Wed Thu Fri Sat</span></div><p>Active · Idle · Suspicious minutes</p></article>
        <article className="live-tile average-tile"><b>Avg. idle time</b><span className="average-gauge"><strong>42</strong></span><span>minutes</span></article>
        <article className="live-tile suspicious-tile"><label>SUSPICIOUS ACTIVITY</label><strong>3 sessions flagged</strong><p>Macro-like patterns &amp; fake key spam detected.</p><div><span className="flag-dots">! ! !</span><b>Review needed</b></div></article>
      </div>
    </div>
  );
}

export default function LandingPage({ onAdminLogin, onDocs }) {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);

  const subscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setNotice("Newsletter signup is not connected yet.");
  };

  return (
    <main className="public-site" id="home">
      <header className="public-nav">
        <a className="public-brand" href="#home" aria-label="TeamPulse home">T</a>
        <nav aria-label="Main navigation"><a href="#home">Home</a><a href="#features">Features</a><a href="#download">Agent</a><a href="/docs" onClick={(event) => { event.preventDefault(); onDocs?.(); }}>Docs</a></nav>
        <button className="public-admin-login" onClick={onAdminLogin}>Admin Login</button>
      </header>

      <section className="public-hero">
        <div className="public-hero-copy">
          <h1>Activity Monitoring<br />You Can Rely On</h1>
          <p>TeamPulse tracks real keyboard, mouse and app activity, so you see actual work instead of fake screen time. Perfect for remote and hybrid teams.</p>
          <div className="public-hero-actions"><a className="public-primary-button" href="#download">Download Agent</a><a className="public-learn-link" href="#features">Learn how it works</a></div>
          <div className="public-trust-note"><span><CheckIcon /></span><p>Runs quietly in the background, flags idle &amp; suspicious patterns without interrupting employees.</p></div>
        </div>
        <DashboardPreview />
      </section>

      <section className="public-features" id="features">
        <h2>How TeamPulse Works</h2>
        <p className="features-intro">Advanced activity monitoring that distinguishes real work from fake presence</p>
        <div className="public-feature-grid">
          <article><span className="feature-symbol"><CheckIcon /></span><h3>Real activity only</h3><p>Tracks actual keyboard, mouse and active windows instead of just login time, so fake “online” doesn’t work.</p></article>
          <article><span className="feature-symbol">ϟ</span><h3>Smart idle logic</h3><p>Ignores app loading or long processing so employees aren’t marked idle while work is running.</p></article>
          <article><span className="feature-symbol"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9h4v10H4Zm6 0V5h4v14h-4Zm6 0v-7h4v7h-4Z" /></svg></span><h3>Clean dashboard</h3><p>Daily active, idle and suspicious minutes per employee in a simple, manager-friendly view.</p></article>
        </div>
      </section>

      <section className="public-download" id="download">
        <h2>Download TeamPulse Agent</h2>
        <p>Install the agent on each employee machine. It streams activity events to your TeamPulse backend and can start automatically when the employee signs in.</p>
        <div className="download-actions"><a className="public-primary-button download-agent" href="/downloads/teampulse-python-agent.zip" download="teampulse-python-agent.zip"><DownloadIcon /> Download Python Agent (.zip)</a><a className="public-secondary-button" href="/downloads/agent-setup.txt" download>Installation guide</a></div>
        <p className="download-fineprint">Requires Python 3.10+ · Lightweight agent · Typed text is not recorded</p>
        <details className="agent-setup" id="agent-setup"><summary>Before you start</summary><p>Install the packages from <code>requirements.txt</code>, then run <code>python agent.py</code>. Enter your backend URL, employee ID, and the API key provided by your TeamPulse administrator.</p></details>
      </section>

      <footer className="public-footer">
        <div className="footer-main">
          <section className="footer-brand-col"><a className="footer-brand" href="#home"><span>T</span> TeamPulse</a><p>Smart activity intelligence for modern remote teams. Built for accuracy, privacy, and performance.</p><a className="footer-github" href="https://github.com/Mayurbarve" target="_blank" rel="noreferrer">GitHub ↗</a></section>
          <section><h3>PRODUCT</h3><a href="#features">Features</a><a href="#download">Download</a><a href="#download">Agent setup</a></section>
          <section><h3>RESOURCES</h3><a href="#download">Documentation</a><a href="#download">Help center</a><a href="#home">Status</a></section>
          <section className="footer-contact"><h3>CONTACT</h3><p>TeamPulse activity monitoring</p><a href="https://github.com/Mayurbarve" target="_blank" rel="noreferrer">GitHub project ↗</a><h3 className="stay-updated">STAY UPDATED</h3><form onSubmit={subscribe}><label className="sr-only" htmlFor="newsletter-email">Your email</label><input id="newsletter-email" type="email" placeholder="Your email" value={email} onChange={(event) => { setEmail(event.target.value); setNotice(""); }} required/><button type="submit">Subscribe</button></form>{notice && <p className="newsletter-notice" role="status">{notice}</p>}</section>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} TeamPulse. All rights reserved.</span><div><a href="#home">Privacy policy</a><a href="#home">Terms of service</a><a href="#home">Cookie policy</a></div></div>
        <div className="footer-assurances"><span>✓ &nbsp;Privacy-focused monitoring</span><span>⌁ &nbsp;End-to-end encrypted</span><span>▤ &nbsp;Compliance friendly</span></div>
      </footer>
    </main>
  );
}
