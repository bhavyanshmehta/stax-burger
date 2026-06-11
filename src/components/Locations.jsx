"use client";

import React, { useState } from "react";
import { MapPin, Clock, Phone, Compass, Flame } from "lucide-react";

const storeLocations = [
  {
    id: 0,
    name: "STAX — GT Central Jaipur",
    address: "GT Central Mall, Malviya Nagar, Jaipur, Rajasthan 302017",
    hours: "10:00 AM — 11:00 PM Daily",
    phone: "+91 141 555 0101",
    coords: "26.8524° N • 75.8062° E",
    mapGlow: "shadow-[0_0_30px_rgba(255,122,0,0.25)]",
  },
  {
    id: 1,
    name: "STAX — Sardarpura Jodhpur",
    address: "Plot No 664, Sardarpura, Jodhpur, Rajasthan 342003",
    hours: "10:00 AM — 11:00 PM Daily",
    phone: "+91 291 555 0121",
    coords: "26.2731° N • 73.0189° E",
    mapGlow: "shadow-[0_0_30px_rgba(255,179,71,0.25)]",
  },
  {
    id: 2,
    name: "STAX — Mittal Mall Ajmer",
    address: "Mittal Mall, Kutchery Road, Ajmer, Rajasthan 305001",
    hours: "10:00 AM — 11:00 PM Daily",
    phone: "+91 145 555 0141",
    coords: "26.4674° N • 74.6393° E",
    mapGlow: "shadow-[0_0_30px_rgba(255,255,255,0.08)]",
  },
  {
    id: 3,
    name: "STAX — Celebration Mall Udaipur",
    address: "Celebration Mall, Bhuwana, Udaipur, Rajasthan 313001",
    hours: "10:00 AM — 11:00 PM Daily",
    phone: "+91 294 555 0161",
    coords: "24.6192° N • 73.7093° E",
    mapGlow: "shadow-[0_0_30px_rgba(255,122,0,0.25)]",
  },
  {
    id: 4,
    name: "STAX — Connaught Place Delhi",
    address: "Block E, Connaught Place, New Delhi, 110001",
    hours: "Open 24/7 (Drive-thru Active)",
    phone: "+91 11 5550 1954",
    coords: "28.6304° N • 77.2177° E",
    mapGlow: "shadow-[0_0_30px_rgba(255,179,71,0.25)]",
  },
  {
    id: 5,
    name: "STAX — Bandra Mumbai",
    address: "12 Grill Road, Bandra West, Mumbai, 400050",
    hours: "10:00 AM — 03:00 AM Daily",
    phone: "+91 22 5550 1980",
    coords: "19.0596° N • 72.8295° E",
    mapGlow: "shadow-[0_0_30px_rgba(255,255,255,0.08)]",
  },
  {
    id: 6,
    name: "STAX — Indiranagar Bangalore",
    address: "88 Brioche Boulevard, Indiranagar, Bengaluru, 560038",
    hours: "09:00 AM — 01:00 AM Daily",
    phone: "+91 80 5550 2002",
    coords: "12.9716° N • 77.5946° E",
    mapGlow: "shadow-[0_0_30px_rgba(255,122,0,0.25)]",
  },
];

export default function Locations() {
  const [selectedStore, setSelectedStore] = useState(storeLocations[0]);

  return (
    <section id="locations" className="py-24 md:py-32 px-6 md:px-12 bg-transparent relative border-b border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-16 text-center md:text-left">
          <span className="flex items-center justify-center md:justify-start gap-2 text-[#FF7A00] font-heading font-extrabold text-xs uppercase tracking-widest animate-pulse">
            <MapPin className="w-4 h-4" />
            Kitchen Finder
          </span>
          <h2 className="font-heading font-black text-4xl md:text-6xl text-white uppercase tracking-tighter leading-none m-0">
            LOCATE THE GRILL
          </h2>
          <p className="text-white/50 max-w-xl text-sm md:text-base leading-relaxed m-0 font-medium">
            Find active open-fire kitchens, thermal delivery radius codes, and operational hours near you.
          </p>
        </div>

        {/* Grid Map panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left panel: List list */}
          <div className="flex flex-col gap-4 md:col-span-1">
            {storeLocations.map((store) => (
              <button
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`w-full text-left glass-card border rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
                  selectedStore.id === store.id
                    ? "border-[#FF7A00]/50 bg-white/[0.04] translate-x-2 shadow-md"
                    : "border-white/5 bg-transparent hover:border-white/10"
                }`}
              >
                <h4 className="text-white font-heading font-bold text-lg uppercase tracking-tight mb-2 flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${selectedStore.id === store.id ? "text-[#FF7A00]" : "text-white/20"}`} />
                  {store.name}
                </h4>
                <p className="text-white/40 text-xs leading-relaxed font-medium m-0">
                  {store.address.substring(0, 32)}...
                </p>
              </button>
            ))}
          </div>

          {/* Right panel: Map placeholder */}
          <div className={`md:col-span-2 glass-panel border border-white/5 rounded-3xl p-8 min-h-[350px] flex flex-col justify-between transition-all duration-500 shadow-md ${selectedStore.mapGlow}`}>
            
            {/* Map metadata header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#FF7A00]" />
                <span className="font-heading font-extrabold text-xl text-white uppercase tracking-tight">
                  {selectedStore.name}
                </span>
              </div>
              <span className="text-[10px] text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Kitchen Online
              </span>
            </div>

            {/* Grid specifications */}
            <div className="flex flex-col gap-4 my-8">
              <div className="flex items-start gap-4">
                <MapPin className="w-4 h-4 text-white/40 mt-1 shrink-0" />
                <div className="text-left">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-0.5">Address</span>
                  <p className="text-white/80 text-sm leading-relaxed m-0 font-medium">{selectedStore.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-4 h-4 text-white/40 mt-1 shrink-0" />
                <div className="text-left">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-0.5">Operating Hours</span>
                  <p className="text-white/80 text-sm leading-relaxed m-0 font-medium">{selectedStore.hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-4 h-4 text-white/40 mt-1 shrink-0" />
                <div className="text-left">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-0.5">Phone Line</span>
                  <p className="text-white/80 text-sm leading-relaxed m-0 font-medium">{selectedStore.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Compass className="w-4 h-4 text-white/40 mt-1 shrink-0" />
                <div className="text-left">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-0.5">Coordinates</span>
                  <p className="text-white/80 text-sm leading-relaxed m-0 font-mono">{selectedStore.coords}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <button
                onClick={() => alert(`Directions loaded for: ${selectedStore.name}`)}
                className="bg-[#1A1A1A] hover:bg-white/10 text-white border border-white/10 font-heading font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all duration-300 cursor-pointer"
              >
                Get Directions
              </button>
              <button
                onClick={() => alert(`Connecting call to: ${selectedStore.phone}`)}
                className="bg-[#FF7A00] hover:bg-[#FFB347] text-black font-heading font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-[0_0_15px_rgba(255,122,0,0.2)] transition-all duration-300 cursor-pointer border-none"
              >
                Call Kitchen
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
