# ♠️ StackDeck — Real-Time Digital Poker Engine & Chip Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-61DAFB.svg)](https://reactjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-black.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED.svg)](https://www.docker.com/)

A modern, high-performance, real-time poker chip management platform and authoritative Texas Hold'em game engine. Built for live, in-person home games where players use a physical deck of cards and track all chip stacks, betting streets, blinds, side pots, loans, and settlements digitally on their smartphones with zero downloads required.

---

## 🌟 Key Architecture & Features

### ⚡ 1. Real-Time Distributed Synchronization
- **Duplex Event Architecture**: Powered by **Socket.io (WebSockets)** for sub-millisecond table updates across all connected mobile and desktop devices.
- **Fault-Tolerant Session Reconnection**: Decoupled player identities from transient socket handshakes. Automatically preserves seat assignments, chip balances, and turn actions across browser refreshes or network drops.
- **Room Isolation**: Isolated game room namespaces (`socket.join`) supporting concurrent games with live player count inspection.

### 🎰 2. Authoritative Texas Hold'em Game Engine
- **Deterministic State Machine**: Strictly enforces street progression (**Pre-Flop ➡️ Flop ➡️ Turn ➡️ River ➡️ Showdown ➡️ Hand Complete**).
- **Algorithmic Multi-Tier Side Pots**: Automatically calculates and separates complex main and side pots for multiple simultaneous all-in players with uneven chip stacks.
- **Action Validation**: Authoritative server validation for **Fold**, **Check**, **Call**, **Raise**, and **All-In** with dynamic min-raise arithmetic.
- **Loan & Sit-Out Engine**: Supports player loans with automated 1-hand sit-out penalties and double-repayment debt triggers.
- **Historical Snapshotting & Undo**: Allows table hosts to roll back actions or misclicks seamlessly without corrupting pot mathematics.

### 📱 3. Responsive UI / UX
- **Mobile-First Elliptical Felt**: Trigonometrically positioned player seats with dynamic anti-overlap geometry for both portrait smartphones and widescreen displays.
- **2x2 Action Layout**: Ergonomic button layout designed for one-handed mobile play.
- **Web Audio Sound Synthesizer**: Realistic ceramic poker chip clinks, turn alerts, check knocks, fold swooshes, and victory chimes.
- **Custom Insignia Avatars**: 10 distinct vector player crests with real-time taken-avatar exclusivity.

### 💰 4. Cash Game Debt Settlement Calculator (`/settlement`)
- Standalone transaction minimization ledger calculating the optimal minimum number of direct transfers to settle all player buy-ins and cash-outs.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, Web Audio API
- **Backend**: Node.js, Express, Socket.io
- **DevOps & Cloud**: Docker (Node 20 Alpine), Railway Cloud CI/CD
- **Testing**: Node.js Automated Test Suite (`server/testFullSuite.js`)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (or yarn / pnpm)

### 2. Installation
```bash
git clone https://github.com/amlansarkar202/stackdeck-poker.git
cd stackdeck-poker
npm install
```

### 3. Run in Development Mode
Starts both the Express WebSocket server (`localhost:3001`) and Vite frontend (`localhost:5173`):
```bash
npm start
```
- Open `http://localhost:5173` in your browser.
- Share your local network IP (`http://<your-ip>:5173`) with other devices on your Wi-Fi to test multiplayer.

---

## 🧪 Automated Testing

To run the comprehensive 6-suite integration test verifying 5-street progression, all-in side pots, walkovers, loan sit-outs, and disconnect recovery:

```bash
npm test
```

---

## 🐳 Docker & Production Deployment

### Build and Run with Docker
```bash
# Build Docker image
docker build -t stackdeck-poker .

# Run container
docker run -p 3001:3001 stackdeck-poker
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by **Amlan Sarkar**.
