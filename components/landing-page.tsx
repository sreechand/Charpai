"use client";

import Image from "next/image";
import { useState } from "react";

const steps = [{ id: "upload", label: "Recording" }, { id: "details", label: "Family details" }, { id: "spread", label: "First spread" }] as const;
const barHeights = [18,34,52,40,26,60,72,44,30,56,66,38,22,48,70,58,32,20,44,62,50,28,36,64,54,30,24,46,68,40,26,52,60,34,22,42,56,30,18,26];

export function LandingPage() {
  const [step, setStep] = useState<"upload" | "details" | "spread">("upload");
  const [menuOpen, setMenuOpen] = useState(false);
  return (
<main style={{"fontFamily": "Hind, sans-serif", "color": "#1F1A14", "background": "#F2EEE3", "fontSize": "18px", "lineHeight": "1.6"}} className="landing-page">

<header style={{"maxWidth": "1240px", "margin": "0 auto", "padding": "24px 32px", "display": "flex", "justifyContent": "space-between", "alignItems": "center", "gap": "24px", "flexWrap": "wrap"}} className="landing-header">
<a href="#top" aria-label="Charpai home" style={{"textDecoration": "none", "color": "#2A2724", "display": "flex", "alignItems": "center", "gap": "12px"}}>
<Image src="/landing/charpai-logo.png" alt="Charpai" width={1200} height={400} style={{"height": "52px", "width": "auto", "display": "block"}} />
</a>
<button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Close" : "Menu"}<span aria-hidden="true">{menuOpen ? " ×" : " ☰"}</span></button>
<nav id="landing-navigation" aria-label="Main" onClick={() => setMenuOpen(false)} onKeyDown={(event) => { if (event.key === "Escape") setMenuOpen(false); }} style={{"display": "flex", "gap": "24px", "alignItems": "center", "flexWrap": "wrap"}} className={`landing-nav${menuOpen ? " is-open" : ""}`}>
<a className="navlink" href="#how">How it works</a>
<a className="navlink" href="#questions-to-ask">What to ask</a>
<a className="navlink" href="#maker">The maker</a>
<a className="navlink" href="#faq">Questions</a>
<a className="navlink" href="/app">Log in</a>
<a className="btn btn-primary" href="/app">Start a storybook</a>
</nav>
</header>

<section id="top" style={{"maxWidth": "1240px", "margin": "0 auto", "padding": "48px 32px 96px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", "gap": "64px", "alignItems": "center"}}>
<div style={{"display": "flex", "flexDirection": "column", "gap": "28px"}}>
<p style={{"margin": "0", "fontSize": "15px", "letterSpacing": "0.14em", "textTransform": "uppercase", "color": "#6B4A2E"}}>Nostalgia trips → digital storybooks</p>
<h1 style={{"margin": "0", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "clamp(52px, 7vw, 96px)", "lineHeight": "1.02", "letterSpacing": "-0.025em"}}>Nani told it once. <em style={{"color": "#8E3A22"}}>Now it’s a book.</em></h1>
<p style={{"margin": "0", "maxWidth": "32em", "fontSize": "20px", "color": "#33302B"}}>Record a nostalgia trip with someone in your family. Charpai picks out the people, places and years, drafts the first storybook spread, and leaves every line for you to edit before it becomes a digital keepsake.</p>
<div style={{"display": "flex", "gap": "16px", "flexWrap": "wrap"}}>
<a className="btn btn-primary" href="/app">Start a storybook</a>
<a className="btn btn-ghost" href="#how">See how it works</a>
</div>
<p style={{"margin": "0", "fontSize": "15px", "color": "#6B4A2E"}}>₹500 per digital keepsake · Sign in with Google or email</p>
</div>

<div style={{"display": "flex", "flexDirection": "column", "gap": "20px"}}>
<div role="group" aria-label="Preview a step" style={{"display": "flex", "gap": "10px", "flexWrap": "wrap"}} className="preview-tabs">
{steps.map((s, index) => (<button key={s.id} type="button" className={`tab ${step === s.id ? "tab-on" : ""}`} aria-pressed={step === s.id} onClick={() => setStep(s.id)}>{index + 1} · {s.label}</button>))}
</div>

<div style={{"background": "#FBF7EF", "border": "1px solid rgba(51,48,43,.2)", "borderRadius": "10px", "padding": "28px", "minHeight": "380px", "boxShadow": "14px 18px 0 rgba(51,48,43,.12)", "display": "flex", "flexDirection": "column", "justifyContent": "center"}} className="preview-card">

{step === "upload" && (<> 
<div style={{"display": "flex", "flexDirection": "column", "gap": "22px"}}>
<p style={{"margin": "0", "fontSize": "14px", "letterSpacing": "0.12em", "textTransform": "uppercase", "color": "#6B4A2E"}}>Your recording</p>
<div style={{"display": "flex", "alignItems": "center", "gap": "16px", "padding": "18px", "border": "1.5px dashed #A9875A", "borderRadius": "8px"}}>
<div style={{"width": "48px", "height": "48px", "borderRadius": "50%", "background": "#8E3A22", "display": "flex", "alignItems": "center", "justifyContent": "center", "flexShrink": "0"}}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path></svg>
</div>
<div >
<div style={{"fontWeight": "600"}}>nani-nostalgia-trip.m4a</div>
<div style={{"fontSize": "15px", "color": "#6B4A2E"}}>Example recording · Voice memo</div>
</div>
</div>
<div aria-hidden="true" style={{"display": "flex", "alignItems": "center", "gap": "4px", "height": "72px"}}>
{barHeights.map((height, index) => (<div key={index} className="bar" style={{ height }} />))}
</div>
<p style={{"margin": "0", "fontSize": "16px", "color": "#33302B"}}>A phone voice memo works. So does a call you recorded across cities.</p>
</div>
 </>)}

{step === "details" && (<> 
<div style={{"display": "flex", "flexDirection": "column", "gap": "18px"}}>
<p style={{"margin": "0", "fontSize": "14px", "letterSpacing": "0.12em", "textTransform": "uppercase", "color": "#6B4A2E"}}>Family details Charpai found · example</p>
<div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(170px, 1fr))", "gap": "12px"}}>
<div style={{"padding": "14px 16px", "background": "#F2EEE3", "borderRadius": "6px"}}><div style={{"fontSize": "13px", "color": "#6B4A2E"}}>Storyteller</div><div style={{"fontFamily": "'Source Serif 4', serif", "fontSize": "24px", "lineHeight": "1.2"}}>Nani</div></div>
<div style={{"padding": "14px 16px", "background": "#F2EEE3", "borderRadius": "6px"}}><div style={{"fontSize": "13px", "color": "#6B4A2E"}}>Grew up in</div><div style={{"fontFamily": "'Source Serif 4', serif", "fontSize": "24px", "lineHeight": "1.2"}}>A house by the river</div></div>
<div style={{"padding": "14px 16px", "background": "#F2EEE3", "borderRadius": "6px"}}><div style={{"fontSize": "13px", "color": "#6B4A2E"}}>Siblings</div><div style={{"fontFamily": "'Source Serif 4', serif", "fontSize": "24px", "lineHeight": "1.2"}}>Four brothers</div></div>
<div style={{"padding": "14px 16px", "background": "#F2EEE3", "borderRadius": "6px"}}><div style={{"fontSize": "13px", "color": "#6B4A2E"}}>A year that mattered</div><div style={{"fontFamily": "'Source Serif 4', serif", "fontSize": "24px", "lineHeight": "1.2"}}>Her wedding</div></div>
</div>
<p style={{"margin": "0", "fontSize": "16px", "color": "#33302B"}}>Names, relationships, places and years are pulled from the conversation, so the story starts from who your family actually is.</p>
</div>
 </>)}

{step === "spread" && (<> 
<div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(180px, 1fr))", "gap": "0", "borderRadius": "4px", "overflow": "hidden", "boxShadow": "0 1px 0 rgba(51,48,43,.2)"}}>
<div className="weave-soft" role="img" aria-label="Example storybook illustration area" style={{"minHeight": "280px", "display": "flex", "alignItems": "end", "padding": "12px"}}><span style={{"background": "#FBF7EF", "fontSize": "13px", "padding": "4px 10px", "color": "#33302B"}}>Example illustration</span></div>
<div style={{"background": "#FFFDF8", "padding": "26px 24px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>
<div style={{"fontSize": "13px", "letterSpacing": "0.12em", "textTransform": "uppercase", "color": "#9A3B26"}}>Chapter one</div>
<div style={{"fontFamily": "'Source Serif 4', serif", "fontSize": "28px", "lineHeight": "1.1"}}>The house by the river</div>
<p style={{"margin": "0", "fontFamily": "'Source Serif 4', serif", "fontSize": "19px", "lineHeight": "1.45", "color": "#33302B"}}>Nani was the only girl among four brothers, and the first to wake each morning, because someone had to beat them to the river.<span className="caret"></span></p>
<div style={{"fontSize": "14px", "color": "#6B4A2E"}}>Click any line to change it.</div>
</div>
</div>
 </>)}

</div>
</div>
</section>

<section aria-label="Why it matters" style={{"background": "#33302B", "color": "#F2EEE3"}}>
<div style={{"maxWidth": "1040px", "margin": "0 auto", "padding": "112px 32px", "display": "flex", "flexDirection": "column", "gap": "28px"}}>
<p style={{"margin": "0", "fontFamily": "'Source Serif 4', serif", "fontSize": "clamp(34px, 4.4vw, 56px)", "lineHeight": "1.12"}}>Every family has someone who tells the stories. Most families have a recording of them somewhere on a phone, and nobody has played it since.</p>
<p style={{"margin": "0", "maxWidth": "36em", "fontSize": "20px", "color": "#CFE2EB"}}>Charpai turns that recording into something you can hold, read to the kids, and hand to the next generation, without spending weekends transcribing it.</p>
</div>
</section>

<section id="how" style={{"maxWidth": "1240px", "margin": "0 auto", "padding": "120px 32px"}}>
<p style={{"margin": "0 0 16px", "fontSize": "15px", "letterSpacing": "0.14em", "textTransform": "uppercase", "color": "#6B4A2E"}}>How it works</p>
<h2 style={{"margin": "0 0 64px", "maxWidth": "15em", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "clamp(40px, 4.5vw, 60px)", "lineHeight": "1.02"}}>You bring the conversation. Charpai does the first draft.</h2>
<ol style={{"listStyle": "none", "margin": "0", "padding": "0", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", "gap": "48px"}}>
<li style={{"borderTop": "2px solid #33302B", "paddingTop": "20px"}}>
<div style={{"fontFamily": "'Source Serif 4', serif", "fontSize": "22px", "color": "#9A3B26"}}>01</div>
<h3 style={{"margin": "4px 0 8px", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "30px"}}>Upload the nostalgia trip</h3>
<p style={{"margin": "0", "color": "#33302B"}}>Record it in Charpai, or upload one from your phone or computer. It works in eleven languages.</p>
</li>
<li style={{"borderTop": "2px solid #33302B", "paddingTop": "20px"}}>
<div style={{"fontFamily": "'Source Serif 4', serif", "fontSize": "22px", "color": "#9A3B26"}}>02</div>
<h3 style={{"margin": "4px 0 8px", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "30px"}}>Charpai finds the family</h3>
<p style={{"margin": "0", "color": "#33302B"}}>It listens for the details that make the story yours: who’s who, where they lived, and when things happened.</p>
</li>
<li style={{"borderTop": "2px solid #33302B", "paddingTop": "20px"}}>
<div style={{"fontFamily": "'Source Serif 4', serif", "fontSize": "22px", "color": "#9A3B26"}}>03</div>
<h3 style={{"margin": "4px 0 8px", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "30px"}}>Shape it into a keepsake</h3>
<p style={{"margin": "0", "color": "#33302B"}}>Read the first spread, drafted from what was actually said. Change a word, a line, or the whole thing. When it reads right to you, it becomes a digital keepsake to share on the family group.</p>
</li>
</ol>
</section>

<section aria-label="Your words, not ours" style={{"borderTop": "1px solid rgba(51,48,43,.25)", "borderBottom": "1px solid rgba(51,48,43,.25)"}}>
<div style={{"maxWidth": "1240px", "margin": "0 auto", "padding": "96px 32px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", "gap": "56px"}} className="words-grid">
<h2 style={{"margin": "0", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "clamp(40px, 4.5vw, 60px)", "lineHeight": "1.02"}}>It’s their story. You get the last word.</h2>
<div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", "gap": "40px 48px", "gridColumn": "span 2"}}>
<div >
<h3 style={{"margin": "0 0 8px", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "30px", "color": "#8E3A22"}}>Every line is editable.</h3>
<p style={{"margin": "0", "color": "#33302B"}}>Nothing goes into the storybook that you haven’t had the chance to read and change. The draft is a starting point, not a verdict.</p>
</div>
<div >
<h3 style={{"margin": "0 0 8px", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "30px", "color": "#8E3A22"}}>Built from the recording.</h3>
<p style={{"margin": "0", "color": "#33302B"}}>The draft starts from the names, places and moments in the conversation, so it sounds like your family, not a template with your surname dropped in.</p>
</div>
<div >
<h3 style={{"margin": "0 0 8px", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "30px", "color": "#8E3A22"}}>Made to be kept.</h3>
<p style={{"margin": "0", "color": "#33302B"}}>What you get is a digital storybook, illustrated and ready to read on any screen, pass around the family, and come back to for years.</p>
</div>
<div >
<h3 style={{"margin": "0 0 8px", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "30px", "color": "#8E3A22"}}>Your recordings stay yours.</h3>
<p style={{"margin": "0", "color": "#33302B"}}>Your recordings and the illustrated storybooks made from them live on Charpai, ready whenever you want to revisit them. All of it is completely owned by you.</p>
</div>
</div>
</div>
</section>

<section id="questions-to-ask" style={{"maxWidth": "1240px", "margin": "0 auto", "padding": "120px 32px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", "gap": "64px", "alignItems": "start"}}>
<div style={{"display": "flex", "flexDirection": "column", "gap": "20px"}}>
<p style={{"margin": "0", "fontSize": "15px", "letterSpacing": "0.14em", "textTransform": "uppercase", "color": "#6B4A2E"}}>Haven’t recorded yet?</p>
<h2 style={{"margin": "0", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "clamp(40px, 4.5vw, 60px)", "lineHeight": "1.02"}}>Charpai gets the conversation going.</h2>
<p style={{"margin": "0", "color": "#33302B"}}>Charpai suggests ways to start the conversation, then steers it toward stories your family member may not even know they have. The ones they’d never think were worth telling are often the best ones.</p>
<p style={{"margin": "0", "fontSize": "15px", "letterSpacing": "0.14em", "textTransform": "uppercase", "color": "#6B4A2E"}}>A few ways in</p>
</div>
<ol style={{"margin": "0", "padding": "0 0 0 1.4em", "display": "flex", "flexDirection": "column", "gap": "18px", "fontFamily": "'Source Serif 4', serif", "fontSize": "26px", "lineHeight": "1.25"}}>
<li >What did the house you grew up in look like?</li>
<li >Who in the family were you closest to as a child, and why?</li>
<li >What did your family eat on festival days?</li>
<li >How did you meet the person you married?</li>
<li >What was your first job, and what did it pay?</li>
<li >What do you wish your grandchildren knew about you?</li>
</ol>
</section>

<section aria-label="Why the name" className="weave-soft">
<div style={{"maxWidth": "1040px", "margin": "0 auto", "padding": "112px 32px"}}>
<div style={{"background": "#FBF7EF", "padding": "56px 48px", "borderRadius": "6px", "textAlign": "center", "display": "flex", "flexDirection": "column", "gap": "16px"}} className="name-card">
<p style={{"margin": "0", "fontSize": "15px", "letterSpacing": "0.14em", "textTransform": "uppercase", "color": "#6B4A2E"}}>Why “Charpai”</p>
<p style={{"margin": "0", "fontFamily": "'Source Serif 4', serif", "fontSize": "clamp(30px, 3.8vw, 48px)", "lineHeight": "1.15"}}>The rope cot in the courtyard, where the elders sat after dinner and the children were told who they came from.</p>
<p style={{"margin": "0", "fontFamily": "'Tiro Devanagari Hindi', serif", "fontSize": "24px", "color": "#9A3B26"}}>चारपाई पर सुनी कहानियाँ</p>
<p style={{"margin": "0", "fontSize": "15px", "color": "#33302B"}}>Stories heard on the charpai.</p>
</div>
</div>
</section>

<section id="maker" aria-label="A note from the maker" style={{"maxWidth": "1240px", "margin": "0 auto", "padding": "120px 32px 40px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", "gap": "40px 64px"}} className="maker-grid">
<div style={{"display": "flex", "flexDirection": "column", "gap": "20px"}}>
<p style={{"margin": "0", "fontSize": "15px", "letterSpacing": "0.18em", "textTransform": "uppercase", "color": "#6B4A2E"}}>A note from the maker</p>
<div style={{"width": "120px", "height": "1.5px", "background": "#9A3B26"}}></div>
</div>
<div style={{"gridColumn": "span 2", "display": "flex", "flexDirection": "column", "gap": "24px", "maxWidth": "46em"}}>
<h2 style={{"margin": "0", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "clamp(40px, 4.5vw, 60px)", "lineHeight": "1.08", "letterSpacing": "-0.015em"}}>I’m Sreechand — a tinkerer and a lover of stories.</h2>
<p style={{"margin": "0", "fontSize": "20px", "color": "#33302B"}}>I have always loved stories. They are what keep us going, and what our lives are built around. I’ve been a longtime listener of <em >The Moth</em> and <em >Story Collider</em>.</p>
<p style={{"margin": "0", "fontSize": "20px", "color": "#33302B"}}>Charpai began while I was talking to my mother about her first job. That conversation became the first story.</p>
<span style={{"alignSelf": "start", "display": "inline-flex", "alignItems": "center", "gap": "8px", "minHeight": "44px", "color": "#8E3A22", "fontWeight": "600"}}>Follow @storygult
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path></svg></span>
</div>
</section>

<section id="faq" style={{"maxWidth": "1000px", "margin": "0 auto", "padding": "120px 32px"}}>
<h2 style={{"margin": "0 0 40px", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "clamp(40px, 4.5vw, 60px)", "lineHeight": "1.02"}}>Questions people ask</h2>
<details >
<summary ><span >Does the AI write the story for me?</span><span aria-hidden="true">+</span></summary>
<p style={{"margin": "0 0 24px", "color": "#33302B"}}>It writes the first draft, not the final word. Charpai transcribes the recording and shapes it into a story that keeps your family member’s own voice: their words, their phrases, the way they tell it. Then you read it, change anything that isn’t right, and decide when it’s done.</p>
</details>
<details >
<summary ><span >What kind of recordings work?</span><span aria-hidden="true">+</span></summary>
<p style={{"margin": "0 0 24px", "color": "#33302B"}}>Whatever’s easiest. Record the conversation right inside Charpai, or upload one you’ve already made on a phone or a computer.</p>
</details>
<details >
<summary ><span >What if the conversation isn’t in English?</span><span aria-hidden="true">+</span></summary>
<div style={{"margin": "0 0 24px", "display": "flex", "flexDirection": "column", "gap": "14px"}}><p style={{"margin": "0", "color": "#33302B"}}>No problem. Talk in the language the stories were lived in. Charpai understands eleven:</p><ul aria-label="Supported languages" style={{"listStyle": "none", "margin": "0", "padding": "0", "display": "flex", "flexWrap": "wrap", "gap": "8px", "color": "#33302B"}}><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>English</li><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>Hindi</li><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>Telugu</li><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>Tamil</li><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>Kannada</li><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>Malayalam</li><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>Marathi</li><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>Bengali</li><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>Gujarati</li><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>Punjabi</li><li style={{"padding": "6px 14px", "border": "1px solid rgba(51,48,43,.3)", "borderRadius": "999px", "fontSize": "16px"}}>Urdu</li></ul></div>
</details>
<details >
<summary ><span >Can I print it?</span><span aria-hidden="true">+</span></summary>
<p style={{"margin": "0 0 24px", "color": "#33302B"}}>Not yet, but printable keepsakes are on the way.</p>
</details>
<details >
<summary ><span >What does it cost?</span><span aria-hidden="true">+</span></summary>
<p style={{"margin": "0 0 24px", "color": "#33302B"}}>₹500 for each digital keepsake. Make as many as you need, and keep them forever. No subscription.</p>
</details>
<div style={{"borderTop": "1px solid rgba(51,48,43,.25)"}}></div>
</section>

<section id="start" style={{"background": "#8E3A22", "color": "#FFFFFF"}}>
<div style={{"maxWidth": "1240px", "margin": "0 auto", "padding": "112px 32px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", "gap": "40px", "alignItems": "center"}}>
<h2 style={{"margin": "0", "fontFamily": "'Source Serif 4', serif", "fontWeight": "700", "fontSize": "clamp(44px, 5.5vw, 76px)", "lineHeight": "1"}}>Someone in your family has a story only they can tell.</h2>
<div style={{"display": "flex", "flexDirection": "column", "gap": "20px", "alignItems": "start"}}>
<p style={{"margin": "0", "fontSize": "20px", "color": "#F8EAE3"}}>Take the nostalgia trip this week. Turn it into a storybook tonight.</p>
<div style={{"display": "flex", "gap": "16px", "flexWrap": "wrap"}}>
<a className="btn" href="/app" style={{"background": "#F2EEE3", "color": "#1F1A14"}}>Start a storybook</a>
</div>
</div>
</div>
</section>

<footer style={{"maxWidth": "1240px", "margin": "0 auto", "padding": "40px 32px", "display": "flex", "justifyContent": "space-between", "gap": "16px", "flexWrap": "wrap", "fontSize": "15px", "color": "#6B4A2E"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "12px"}}><Image src="/landing/charpai-logo.png" alt="Charpai" width={1200} height={400} style={{"height": "36px", "width": "auto", "display": "block"}} /><span >Nostalgia trips, kept as storybooks</span></span>
<span >Made from conversations with loved ones.</span>
</footer>

</main>
  );
}
