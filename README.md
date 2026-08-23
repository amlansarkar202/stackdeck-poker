# 🎲 PokerChip - Digital Poker Chips for Home Games

A complete, free, real-time poker chip management web application modeled after **[pokerchip.app](https://pokerchip.app)**.

Designed for live, in-person poker games where players use a physical deck of cards, but track all chips, bets, blinds, turns, side pots, and payouts digitally on their smartphones.

---

## ✨ Features

- **📱 Phone-Based Play**: Every player joins and acts from their own phone browser with zero downloads required.
- **⚡ Instant Real-Time Sync**: Powered by WebSockets (Socket.io) for instantaneous updates across all connected devices.
- **🎯 Full Texas Hold'em Engine**:
  - Automatic Dealer Button rotation (`D`), Small Blind (`SB`), and Big Blind (`BB`) postings.
  - Full betting streets: **Pre-flop ➡️ Flop ➡️ Turn ➡️ River ➡️ Showdown**.
  - Actions: **Fold**, **Check**, **Call**, **Raise** (with presets: `Min`, `2.5x`, `3x`, `Pot`, `All-in`), and **All-In**.
  - **Dynamic Multi-Level Side Pots**: Automatically calculates main and side pots for uneven all-in stack amounts.
- **🏆 Showdown & Pot Distribution**:
  - Select single or multiple winners per pot with automatic split pot calculation and odd chip allocation.
  - Confetti celebration!
- **🔊 Built-In Sound Synthesizer**: Realistic ceramic poker chip clinks, turn alerts, check knocks, fold swooshes, and victory chimes via the Web Audio API.
- **↩️ Activity Log & Undo**: Full chronological hand history with a one-click **Undo Last Action** button.
- **⚙️ Host Controls**:
  - Rebuy / Add chips
  - Edit stack balances
  - Configurable blind timers with audio alert on blind level-ups
  - Kick disconnected / idle players
- **📲 QR Code & Local Wi-Fi Sharing**: Host screen displays a scannable QR code and link for friends on the same Wi-Fi.
- **💰 Cash Game Settlement Calculator (`/settlement`)**:
  - Standalone or post-game ledger calculator.
  - Calculates the minimum number of direct transfers to settle all player buy-ins and cash-outs.
  - One-click copy for WhatsApp/group chat.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (or yarn/pnpm)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development Mode
To start both the backend server (port 3001) and Vite frontend (port 5173):
```bash
npm start
```

- **Host on Computer**: Open `http://localhost:5173`
- **Join from Phones on Wi-Fi**: Open `http://<your-local-ip>:5173` or scan the QR Code on the host's screen!

---

## 🧪 Testing the Poker Engine

To run the automated unit test suite (verifying blinds, side pots, all-ins, split pots, and undo):
```bash
npm test
```

---

## 📦 Production Deployment

Build the optimized production assets:
```bash
npm run build
```

Run the unified production server (serves both API and frontend on port 3001 or `$PORT`):
```bash
npm run serve
```
