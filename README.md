# NEMR | Premium Fashion Marketplace

![Marketplace Concept](https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop)

## 📌 Project Overview
**NEMR** is a high-end, premium fashion marketplace designed for the modern editorial aesthetic. Moving away from traditional "cluttered" e-commerce, NEMR focuses on **visual storytelling**, **minimalism**, and a **high-performance user experience**.

This project serves as a bridge between high-quality fashion brands and sophisticated consumers who value design and exclusivity.

---

## 🎨 Design Philosophy (The "Nemr" Aesthetic)
The project identifies with a **Premium Brutalist** design language:
- **Monochrome Palette:** Dominantly Black, White, and Grays to allow product photography to shine.
- **Typography:** Bold, modern sans-serif (**Outfit**) with high weight Contrast.
- **Split-Screen Layouts:** Using an immersive hero section to divide Men’s and Women’s editorial paths.
- **Marketplace Grid:** Strict 3:4 aspect ratios for product imagery, ensuring a clean and consistent storefront regardless of vendor input.
- **Zero Distractions:** Removal of unnecessary borders and commercial "clutter" in favor of whitespace and clean lines.

---

## 🛠 Tech Stack & Architecture
The project has been migrated from a legacy static structure to a modern **Enterprise-Grade** stack:

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) for type safety and robust development.
- **Styling:** Custom Vanilla CSS (for maximum flexibility) + [Bootstrap](https://getbootstrap.com/) for base utility icons.
- **Architecture:** **Modular Component-Based Architecture**
  - `src/components/layout`: Global persistent elements (Fixed Navbar, Modern Footer).
  - `src/components/ui`: Highly reusable atomic components (Product Cards, Buttons).
  - `src/components/home`: Page-specific sections (Immersive Hero, Ticker Tape, Bento Grids).

---

## 🚀 Current Implementation Status
- [x] **Next.js Core Migration:** Successfully moved from standard HTML/CSS to React-based architecture.
- [x] **Global Layout System:** Implemented DRY (Don't Repeat Yourself) architecture with `RootLayout`.
- [x] **Responsive Hero:** 50/50 Split-pane immersive hero section for category entry.
- [x] **Product Grid System:** Automated 3:4 aspect ratio enforcement and hover micro-animations.
- [x] **Global Styling:** Design tokens defined in `globals.css` (Colors, Spacing, Typography).

---

## 🚧 Upcoming Milestones
1. **Dynamic Catalog (Shop Page):** Implementing real-time filtering (Category, Price, Size) and a "Marketplace" feel where users can explore multiple vendors.
2. **Auth Flow (The Modern Way):** Building the split-screen login/signup experience (already conceptualized in standard migration).
3. **Cart Drawer:** A slide-out "Off-canvas" shopping cart to maintain user flow without page redirects.
4. **Backend Integration:** Connecting the Next.js frontend to the existing Node.js/Express backend API.

---

## 👨‍💻 Note for Collaborators
When working on NEMR, prioritize **Aesthetics** and **Flow**. If you are an AI agent helping another user:
- **Never compromise on the Grid:** Always ensure images fit the 3:4 portrait standard.
- **Keep it Minimal:** If a feature adds clutter, rethink the UI.
- **Modular First:** Never hardcode layout sections in pages; extract them as components in `src/components/`.

---

## 📦 Getting Started

### 1. Backend Setup
The backend is a Node.js/Express server using Sequelize (SQLite for local development).
```bash
# In the root directory
npm install
node seed.js    # Only first time: Seeds the DB with initial products
node server.js  # Starts API on Port 5002
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Starts Next.js on Port 3000
```

### 3. Port Configuration
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5002
*(Note: Port 5002 is used to avoid conflicts with macOS AirPlay on port 5000/5001)*
