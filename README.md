# STAX — Flame Crafted Burgers

STAX is a next-generation, interactive 3D digital showcase for an original premium burger brand focused on craftsmanship, flame grilling, and bold flavors. Built with a Next.js framework, React Three Fiber (R3F) for hardware-accelerated 3D viewport rendering, and GSAP for cinematic scroll-storytelling transitions, the application offers real-time custom ingredient assembly and interactive anatomy inspections.

---

## 🌟 Key Features

* **Cinematic 3D Burger Viewport**: High-resolution, hardware-accelerated 3D burger model rendering featuring realistic physical materials, custom sesame seeds, floating heat embers, and real-time cursor parallax.
* **Scroll-Storytelling Camera Paths**: Seamless camera zoom-in/out, focus shifts, and rotation transitions synced to your scrolling speed using GSAP ScrollTrigger.
* **STAX Lab Workshop**: Interactive customizer panel allowing users to stack extra patties, add melting cheddar, double the veggies, or scale quantities (0x - 3x) in real time with instant 3D visual updates and live price calculations.
* **Interactive Exploded Anatomy**: Hover elements that scatter individual burger layers in 3D space with animated SVG connecting HUD lines and description overlays.
* **AERO-Style Luxury Theme**: Sleek dark luxury visual identity using HSL tailored color palettes (`#FF7A00` Orange, `#FFB347` Golden Amber, `#111111` Charcoal), premium typography, and custom orange-accented scrollbars.
* **Locations & Promo Integrations**: Dynamic kitchen maps listing store hours, phone numbers, and coordinates alongside promo coupon code boards (e.g. `STAX50`, `STAXFEAST`, `CRAFT3D`).

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16+ (React)
* **3D Rendering**: React Three Fiber, React Three Drei, Three.js (WebGL)
* **Animations**: GSAP (GreenSock), ScrollTrigger, Framer Motion
* **Styling**: Tailwind CSS (v4 Theme inline configurations)
* **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** 18.0 or higher installed on your system.
* **npm** or **yarn** package manager.

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bhavyanshmehta/stax-burger.git
   cd stax-burger
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```

4. **Verify Live View**:
   Open your web browser and navigate to:
   👉 **`http://localhost:3000`**

---

## 📂 Project Directory Structure

```
stax-burger/
├── src/
│   ├── app/
│   │   ├── layout.js          # Main layout, fonts, and metadata configurations
│   │   ├── globals.css        # Custom Tailwind v4 theme configurations & scrollbars
│   │   └── page.js            # Cinematic GSAP ScrollTrigger storytelling flow
│   └── components/
│       ├── Burger3D.jsx       # 3D canvas, spotlights, volumetric smoke, and R3F meshes
│       ├── Hero.jsx           # Sticky glassmorphism header & mega dropdown menus
│       ├── SignatureBurgers.jsx# Product card catalog, tilt triggers, and search database
│       ├── Customizer.jsx     # Workshop controls & real-time quantity modifiers
│       ├── LimitedDeals.jsx   # Promo code boards & clipboards copy handlers
│       ├── MobileApp.jsx      # Mobile app advertisement mockup with screen simulation
│       ├── Locations.jsx      # Kitchen search locator & coordinates catalog
│       ├── Footer.jsx         # Copyright blocks, social hooks, and newsletter inputs
│       └── CustomCursor.jsx   # Magnetic trailing cursor follower with glow ring
├── public/                    # Static vector graphics & asset builds
├── package.json               # Package manifests & compiler scripts
└── next.config.mjs            # Next.js compiler properties
```

---

## 📄 License
This project is open-source and distributed under the MIT License.
