# Nova — Digital Studio

**A single-page marketing/portfolio site template for a design & development studio.**

![Nova hero preview](screenshots/01-hero.png)

Hero, about, services, work/portfolio, and contact — all on one scrolling page with smooth anchor navigation, backed by a real Node/Express server and PostgreSQL database for the contact form.

---

## Overview

Nova is a single-page site built for studios and freelancers who want a polished, animated online presence. The front end is framework-free HTML/CSS/JS; the contact form posts to a small Express API that validates, rate-limits, and stores each submission in PostgreSQL.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Design](#design)
  - [Motion & Interactivity](#motion--interactivity)
  - [Contact Form](#contact-form)
- [Getting Started](#getting-started)
- [Reading Submissions](#reading-submissions)
- [Deployment](#deployment)

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Structure | **HTML5** | Semantic single-page structure |
| Styling | **CSS3** | Custom properties (design tokens), Grid/Flexbox, keyframe animations — no framework |
| Front-end behavior | **Vanilla JavaScript** | No bundler — served as-is by the Express app |
| Server | **Node.js + Express** | Serves the static site and exposes the `/api/contact` endpoint |
| Database | **PostgreSQL** (via `pg`) | Stores every contact-form submission |
| Rate limiting | **express-rate-limit** | Server-side cooldown (1 submission per IP per minute) |
| Typography | **Google Fonts** | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (headings) + [Inter](https://fonts.google.com/specimen/Inter) (body) |

## Features

### Design

- Dark theme with purple/teal/coral gradient accents
- Glassmorphism cards, glowing animated background blobs, subtle grid overlay
- Mouse-follow cursor glow effect (desktop only)
- Fully responsive, with a mobile hamburger menu

### Motion & Interactivity

- Scroll-reveal animations on every section (`IntersectionObserver`-based)
- Animated stat counters that count up when scrolled into view
- Rotating headline text in the hero
- Scroll-aware navbar (adds blur/background on scroll)
- Smooth-scroll anchor navigation

### Contact Form

- Real-time inline validation with floating labels and error messages (client-side, then re-validated server-side)
- Submissions are stored in PostgreSQL via `POST /api/contact`
- Loading spinner + success/error states
- Spam protection: hidden honeypot field (server checks it, silently accepts and discards bot submissions) + a real server-enforced rate limit of one submission per IP per minute

## Getting Started

1. **Clone this repository** and install dependencies:
   ```bash
   npm install
   ```
2. **Set up PostgreSQL** — any Postgres 13+ instance works (local install, Docker, or a hosted service like Supabase/Neon/RDS). Create a database for this project.
3. **Configure environment variables** — copy `.env.example` to `.env` and fill in:
   ```
   DATABASE_URL=postgres://user:password@localhost:5432/modern_website
   PORT=3000
   ADMIN_TOKEN=some-long-random-string
   ```
4. **Run the migration** to create the `contact_submissions` table:
   ```bash
   npm run migrate
   ```
5. **Start the server:**
   ```bash
   npm start
   ```
   (or `npm run dev` to auto-restart on file changes)
6. Open `http://localhost:3000` — the server serves the static site and the API from the same origin, so the contact form works immediately.

## Reading Submissions

`GET /api/contact` returns the 200 most recent submissions as JSON, protected by the `ADMIN_TOKEN` from your `.env`:

```bash
curl -H "Authorization: Bearer your-admin-token" http://localhost:3000/api/contact
```

## Deployment

This is now a real Node app, not static-only — deploy it anywhere that runs Node and can reach a Postgres database: Render, Railway, Fly.io, a VPS, etc. Set `DATABASE_URL`, `PORT`, and `ADMIN_TOKEN` as environment variables on the host, run `npm run migrate` once against the production database, then `npm start`.

---

<p align="center">Built with HTML, CSS, and vanilla JavaScript on the front end — Node, Express, and PostgreSQL on the back end.</p>
