"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flame } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import Burger3D from "@/components/Burger3D";
import Hero from "@/components/Hero";
import SignatureBurgers from "@/components/SignatureBurgers";
import LimitedDeals from "@/components/LimitedDeals";
import Customizer from "@/components/Customizer";
import MobileApp from "@/components/MobileApp";
import Locations from "@/components/Locations";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("stax_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse saved cart", e);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("stax_cart", JSON.stringify(cart));
  }, [cart]);

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const addToCart = (item, event) => {
    const isCustom = item.id.toString().startsWith("custom-");
    const cartItemId = isCustom ? item.id : `preset-${item.id}`;

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === cartItemId);
      if (existing) {
        return prevCart.map((i) =>
          i.id === cartItemId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prevCart,
        {
          id: cartItemId,
          name: item.name,
          price: item.price,
          image: item.image,
          qty: 1,
        },
      ];
    });

    addToast(`Added to Cart: ${item.name}`);

    if (event) {
      triggerFlyAnimation(item.image, event);
    }
  };

  const triggerFlyAnimation = (imageUrl, clickEvent) => {
    if (!clickEvent) return;
    const flyEl = document.createElement("div");
    flyEl.style.position = "fixed";
    flyEl.style.left = `${clickEvent.clientX - 40}px`;
    flyEl.style.top = `${clickEvent.clientY - 40}px`;
    flyEl.style.width = "80px";
    flyEl.style.height = "80px";
    flyEl.style.backgroundImage = `url(${imageUrl})`;
    flyEl.style.backgroundSize = "contain";
    flyEl.style.backgroundRepeat = "no-repeat";
    flyEl.style.backgroundPosition = "center";
    flyEl.style.zIndex = "99999";
    flyEl.style.pointerEvents = "none";
    flyEl.style.transformOrigin = "center";
    document.body.appendChild(flyEl);

    const desktopCart = document.getElementById("cart-icon-nav");
    const floatingCart = document.getElementById("floating-cart-btn");
    
    let target = desktopCart;
    if (!desktopCart || window.getComputedStyle(desktopCart).display === "none") {
      target = floatingCart;
    }

    if (target) {
      const rect = target.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2 - 40;
      const targetY = rect.top + rect.height / 2 - 40;

      gsap.to(flyEl, {
        left: targetX,
        top: targetY,
        scale: 0.1,
        rotation: 360,
        opacity: 0.3,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          if (flyEl.parentNode) {
            flyEl.parentNode.removeChild(flyEl);
          }
          gsap.fromTo(target, 
            { scale: 1 },
            { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1, ease: "back.out(1.7)" }
          );
        }
      });
    } else {
      gsap.to(flyEl, {
        opacity: 0,
        scale: 0,
        duration: 0.5,
        onComplete: () => {
          if (flyEl.parentNode) {
            flyEl.parentNode.removeChild(flyEl);
          }
        }
      });
    }
  };

  const updateCartQty = (itemId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.qty + delta;
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const [activeCustomizer, setActiveCustomizer] = useState(null);
  const [activeBurgerName, setActiveBurgerName] = useState("Custom Stack");
  const [activeShowcase, setActiveShowcase] = useState(false);
  const [activeIngredients, setActiveIngredients] = useState("all");
  const [hoveredIngredient, setHoveredIngredient] = useState(null);

  const containerRef = useRef(null);
  const storylineRef = useRef(null);

  // 3D Model state properties animated at 60fps by GSAP ScrollTrigger
  const burgerStateRef = useRef({
    x: 0,
    y: 0,
    z: 0,
    scale: 1.2, // enlarged scale for premium desktop presentation
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    explodeFactor: 1.0, // starts fully scattered in 3D
    opacity: 0.0,       // starts faded out
    camX: 0,
    camY: 0.5,
    camZ: 8.5,
    camLookAtY: 0.1,
    showLabels: 0.0,
    embersIntensity: 0.25,
    smokeIntensity: 0.35,
  });

  useEffect(() => {
    // 1. Cinematic load entrance: flying in from all directions
    gsap.fromTo(burgerStateRef.current,
      { opacity: 0.0, explodeFactor: 1.5, scale: 0.8 },
      { opacity: 1.0, explodeFactor: 1.0, scale: 1.2, duration: 2.2, ease: "power2.out" }
    );

    // 2. Master timeline linked to scrolling container
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: storylineRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.0,
      }
    });

    // --- PHASE 1 & 2: STAGGERED ASSEMBLY & IMPACT BOUNCE ---
    // 0.0 -> 0.85: Assembly of staggered layers
    tl.to(burgerStateRef.current, {
      explodeFactor: 0.0,
      opacity: 1.0,
      rotateY: Math.PI * 0.7,
      scale: 1.15,
      duration: 0.85,
      ease: "power2.out"
    }, 0.0);

    // 0.85 -> 0.90: Impact bounce compression
    tl.to(burgerStateRef.current, {
      scale: 1.10,
      rotateY: Math.PI * 0.75,
      duration: 0.05,
      ease: "power1.in"
    }, 0.85);

    // 0.90 -> 1.0: Elastic bounce back and camera zoom-in (camZ: 7.8)
    tl.to(burgerStateRef.current, {
      scale: 1.20,
      rotateY: Math.PI * 0.8,
      camZ: 7.8, // 5% zoom-in
      duration: 0.1,
      ease: "back.out(2.5)"
    }, 0.9);

    // --- PHASE 3 & 4: HERO REVEAL & STAX SHOWCASE (FLAME GRILLED) ---
    // 1.0 -> 2.0: Volumetric smoke, embers, typography fade-in, spot zoom
    tl.to(burgerStateRef.current, {
      camZ: 5.6,
      camLookAtY: 0.15,
      embersIntensity: 1.0,
      smokeIntensity: 1.0,
      rotateY: Math.PI * 1.6,
      duration: 1.0,
      ease: "power1.inOut"
    }, 1.0);
    
    // STAX typography fade in to 5% opacity and larger scale
    tl.to("#bg-typography", {
      opacity: 0.05,
      scale: 1.2,
      duration: 1.0,
      ease: "power1.inOut"
    }, 1.0);

    // --- PHASE 6: THE INGREDIENTS HUD CONNECTOR CALLOUTS ---
    // 2.0 -> 3.0: Display labels, zoom out camera slightly
    tl.to(burgerStateRef.current, {
      showLabels: 1.0,
      camZ: 6.8, // zoom out slightly
      rotateY: Math.PI * 2.4,
      duration: 1.0,
      ease: "power1.inOut"
    }, 2.0);

    // --- PHASE 5: INTERACTIVE DISSECT ---
    // 3.0 -> 4.0: Hide labels, active hover explode triggers enabled
    tl.to(burgerStateRef.current, {
      showLabels: 0.0,
      rotateY: Math.PI * 3.2,
      duration: 1.0,
      ease: "power1.inOut"
    }, 3.0);

    // --- SECTION TRANSITION: SEAMLESS VISUAL FLOW ---
    // 4.0 -> 4.5: Slide down and fade out as menu rolls up (prevents overlap)
    tl.to(burgerStateRef.current, {
      y: -3.5,
      scale: 0.55,
      opacity: 0.0,
      duration: 0.5,
      ease: "power2.inOut"
    }, 4.0);

    // --- TEXT SCROLL-STORY TRANISTIONS ---
    // Section 1 Text fades out
    gsap.to("#story-text-1", {
      opacity: 0,
      y: -80,
      scrollTrigger: {
        trigger: "#section-1-hero",
        start: "center center",
        end: "bottom top",
        scrub: true,
      }
    });

    // Section 2 Text fades in and out
    gsap.fromTo("#story-text-2",
      { opacity: 0, y: 100, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        scrollTrigger: {
          trigger: "#section-2-assemble",
          start: "top bottom",
          end: "center center",
          scrub: true,
        }
      }
    );
    gsap.to("#story-text-2", {
      opacity: 0,
      y: -100,
      scrollTrigger: {
        trigger: "#section-2-assemble",
        start: "center center",
        end: "bottom top",
        scrub: true,
      }
    });

    // Section 3 Text fades in and out
    gsap.fromTo("#story-text-3",
      { opacity: 0, x: -100 },
      {
        opacity: 1,
        x: 0,
        scrollTrigger: {
          trigger: "#section-3-zoom",
          start: "top bottom",
          end: "center center",
          scrub: true,
        }
      }
    );
    gsap.to("#story-text-3", {
      opacity: 0,
      x: -100,
      scrollTrigger: {
        trigger: "#section-3-zoom",
        start: "center center",
        end: "bottom top",
        scrub: true,
      }
    });

    // Section 4 Text fades in and out
    gsap.fromTo("#story-text-4",
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: "#section-6-labels",
          start: "top bottom",
          end: "center center",
          scrub: true,
        }
      }
    );
    gsap.to("#story-text-4", {
      opacity: 0,
      y: -100,
      scrollTrigger: {
        trigger: "#section-6-labels",
        start: "center center",
        end: "bottom top",
        scrub: true,
      }
    });

    // Section 5 Text fades in
    gsap.fromTo("#story-text-5",
      { opacity: 0, y: 100, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        scrollTrigger: {
          trigger: "#section-9-float",
          start: "top bottom",
          end: "center center",
          scrub: true,
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main ref={containerRef} className="w-full relative min-h-screen bg-black overflow-x-hidden select-none">
      
      {/* Custom luxury trailing cursor follower with magnetic features */}
      <CustomCursor />
      
      {/* Fixed Background 3D STAX Canvas */}
      <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none">
        <Burger3D
          burgerStateRef={burgerStateRef}
          activeCustomizer={activeCustomizer}
          activeShowcase={activeShowcase}
          activeIngredients={activeIngredients}
          hoveredIngredient={hoveredIngredient}
        />
      </div>

      {/* Fixed Background Typography "STAX" */}
      <div 
        id="bg-typography" 
        className="fixed inset-0 w-screen h-screen z-0 flex items-center justify-center pointer-events-none opacity-0 select-none"
        style={{ transform: "scale(0.85)", transition: "opacity 0.2s ease" }}
      >
        <span className="font-heading font-black text-[22vw] text-white/50 tracking-tighter uppercase leading-none">
          STAX
        </span>
      </div>

      {/* Global Minimal Navigation Header */}
      <Hero
        cartCount={cart.reduce((acc, curr) => acc + curr.qty, 0)}
        onCartOpen={() => setIsCartOpen(true)}
      />

      {/* Narrative Flow Overlays (Hero + 4 Main Sections) */}
      <div className="relative z-10 w-full bg-transparent">
        
        {/* Cinematic storyline scroll container for ScrollTrigger syncing */}
        <div id="cinematic-storyline-container" ref={storylineRef} className="w-full bg-transparent">
          
          {/* Section 1: Hero */}
        <section
          id="section-1-hero"
          className="w-full h-screen flex flex-col items-center justify-between py-16 px-6 relative text-center"
        >
          <div />
          <div className="max-w-4xl flex flex-col items-center gap-4 z-10" id="story-text-1">
            <span className="text-[#FF7A00] font-heading font-extrabold text-xs uppercase tracking-widest animate-pulse">
              STAX Showcase
            </span>
            <h1 className="font-heading font-black text-6xl md:text-[6vw] lg:text-[6.5vw] text-white uppercase tracking-tighter leading-none m-0">
              FLAME CRAFTED<br />
              <span className="text-[#FF7A00] hover:drop-shadow-[0_0_30px_rgba(255,122,0,0.35)] transition-all duration-300">TO PERFECTION</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl m-0 font-medium">
              Experience handcrafted burgers layered with premium ingredients and finished over an open flame.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 animate-fade-in z-10">
            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
              Scroll to taste
            </span>
            <div className="w-[1.5px] h-14 bg-white/10 relative overflow-hidden rounded-full">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-[#FF7A00] animate-scroll-line" />
            </div>
          </div>
        </section>

        {/* Section 2: Assemble */}
        <section
          id="section-2-assemble"
          className="w-full h-screen flex items-center justify-center py-16 px-6 text-center"
        >
          <div className="max-w-2xl flex flex-col items-center gap-4 z-10" id="story-text-2">
            <span className="text-[#FFB347] font-heading font-extrabold text-xs uppercase tracking-widest">
              01 / THE CRAFT
            </span>
            <h2 className="font-heading font-black text-5xl md:text-[5vw] text-white uppercase tracking-tighter leading-none m-0">
              THE ART OF THE STACK
            </h2>
            <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl m-0 font-medium">
              Every STAX burger is carefully layered with premium ingredients and flame-crafted for maximum flavor.
            </p>
          </div>
        </section>

        {/* Section 3: Flame Grilled */}
        <section
          id="section-3-zoom"
          className="w-full h-screen flex items-center justify-start py-16 px-6 md:px-24"
        >
          <div className="max-w-xl flex flex-col items-start gap-4 z-10 text-left" id="story-text-3">
            <span className="text-[#FF7A00] font-heading font-extrabold text-xs uppercase tracking-widest">
              02 / THE FLAME
            </span>
            <h2 className="font-heading font-black text-5xl md:text-[5vw] text-white uppercase tracking-tighter leading-none m-0">
              SIZZLED OVER FIRE
            </h2>
            <p className="text-white/50 text-base md:text-lg leading-relaxed m-0 font-medium">
              We grill our custom patties over open flames, locking in signature smoke and deep caramelization.
            </p>
          </div>
        </section>

        {/* Section 4: The Ingredients */}
        <section
          id="section-6-labels"
          className="w-full h-screen flex items-center justify-center py-16 px-6 text-center"
        >
          <div className="max-w-2xl flex flex-col items-center gap-4 z-10" id="story-text-4">
            <span className="text-[#FFB347] font-heading font-extrabold text-xs uppercase tracking-widest">
              03 / THE PROMISE
            </span>
            <h2 className="font-heading font-black text-5xl md:text-[5vw] text-white uppercase tracking-tighter leading-none m-0">
              PURE CRAFTSMANSHIP
            </h2>
            <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl m-0 font-medium">
              We source locally and stack mindfully: no shortcuts, no artificial additions. Just pure fire-kissed flavor.
            </p>
          </div>
        </section>

        {/* Section 5: Interactive Dissect */}
        <section
          id="section-9-float"
          className="w-full h-screen flex flex-col items-center justify-between py-16 px-6 text-center relative"
        >
          <div />
          <div className="max-w-2xl flex flex-col items-center gap-6 z-10" id="story-text-5">
            <span className="text-[#FF7A00] font-heading font-extrabold text-xs uppercase tracking-widest">
              04 / INTERACTIVE ANATOMY
            </span>
            <h2 className="font-heading font-black text-5xl md:text-[5vw] text-white uppercase tracking-tighter leading-none m-0">
              EXPLORE THE ANATOMY
            </h2>
            <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl m-0 font-medium">
              Hover to dissect the layers of our craft. Move your cursor away to lock the stack back together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <a
                href="#signature-section"
                className="bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-105 text-white font-heading font-black text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-[0_4px_20px_rgba(255,122,0,0.25)] transition-all duration-300 no-underline"
              >
                Explore Menu
              </a>
              <a
                href="#signature-section"
                className="border border-white/20 hover:border-white/55 hover:bg-white/5 text-white font-heading font-black text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 no-underline"
              >
                View Signature Stacks
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/30 text-[9px] uppercase tracking-widest">Scroll to explore details</span>
            <Flame className="w-5 h-5 text-[#FF7A00] animate-bounce" />
          </div>
        </section>

        </div> {/* End of #cinematic-storyline-container */}

        {/* Subcomponents for full campaign site, styled in premium black/orange */}
        
        {/* Signature Burgers Menu Grid */}
        <div id="signature-section" className="bg-[#050505] text-white relative z-20">
          <SignatureBurgers 
            onCustomize={(name, config) => {
              setActiveBurgerName(name);
              setActiveCustomizer(config);
              document.getElementById("customizer-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            onAddToCart={addToCart}
          />
        </div>

        {/* Limited Deals Coupons */}
        <div id="deals-section" className="bg-[#0c0c0c] text-white relative z-20">
          <LimitedDeals />
        </div>

        {/* Customizer Workshop */}
        <div id="customizer-section" className="bg-transparent text-white relative z-20">
          <Customizer
            activeCustomizer={activeCustomizer}
            setActiveCustomizer={setActiveCustomizer}
            activeBurgerName={activeBurgerName}
            setActiveBurgerName={setActiveBurgerName}
            setHoveredIngredient={setHoveredIngredient}
            onAddToCart={addToCart}
          />
        </div>

        {/* Mobile App Promo */}
        <div id="app-section" className="bg-[#0c0c0c] text-white relative z-20">
          <MobileApp />
        </div>

        {/* Locations map Panel */}
        <div id="locations-section" className="bg-[#050505] text-white relative z-20">
          <Locations />
        </div>

        {/* Footer CTA & Links */}
        <section
          id="footer-cta"
          className="w-full min-h-screen bg-black flex flex-col justify-between pt-24 relative z-20 overflow-hidden"
        >
          <div />

          <div className="max-w-4xl mx-auto text-center px-6 z-10 flex flex-col items-center gap-6">
            <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">
              THE LAST BITE
            </span>
            <h2 className="font-heading font-black text-6xl md:text-[7vw] text-white uppercase tracking-tighter leading-none m-0">
              CRAFTED FOR THE<br />
              <span className="text-[#FF7A00]">BOLD & CRAVING.</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <a
                href="#customizer-section"
                className="bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-105 text-white font-heading font-black text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-[0_4px_25px_rgba(255,122,0,0.35)] transition-all duration-300 no-underline"
              >
                ORDER YOUR STAX
              </a>
              <a
                href="#signature-section"
                className="border border-white/20 hover:border-white/55 hover:bg-white/5 text-white font-heading font-black text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 no-underline"
              >
                VIEW FULL MENU
              </a>
            </div>
          </div>

          {/* Standard Footer Links and Copyright */}
          <Footer />
        </section>

      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-24 left-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-black/80 backdrop-blur-md border border-[#FF7A00]/30 shadow-[0_4px_20px_rgba(255,122,0,0.15)] rounded-2xl px-5 py-3.5 flex items-center gap-3 text-white pointer-events-auto"
            >
              <div className="w-5 h-5 rounded-full bg-[#FF7A00] flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-black fill-current" />
              </div>
              <span className="font-heading font-black text-xs uppercase tracking-wider">
                {toast.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cart Drawer Panel */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        onClearCart={clearCart}
      />
    </main>
  );
}
