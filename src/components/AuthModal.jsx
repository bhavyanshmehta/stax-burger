"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Phone, Sparkles } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    if (isSignUp && (!name.trim() || !phone.trim())) {
      setError("Name and phone number are required for signup.");
      setLoading(false);
      return;
    }

    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      try {
        if (isSignUp) {
          // Supabase Sign Up
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
                phone: phone,
              },
            },
          });

          if (signUpError) throw signUpError;
          
          if (data.user) {
            onAuthSuccess(data.user);
            onClose();
          }
        } else {
          // Supabase Sign In
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) throw signInError;

          if (data.user) {
            onAuthSuccess(data.user);
            onClose();
          }
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError(err.message || "An error occurred during authentication.");
      } finally {
        setLoading(false);
      }
    } else {
      // Simulation fallback mode (for zero-config testing)
      setTimeout(() => {
        const mockUser = {
          id: "usr_mock_" + Math.random().toString(36).substring(2, 11),
          email: email.trim(),
          user_metadata: {
            name: isSignUp ? name.trim() : "Anshu Sharma",
            phone: isSignUp ? phone.trim() : "9876543210",
          },
        };
        
        // Save simulated user details to local storage so it persists on refresh in mock mode
        localStorage.setItem("stax_simulated_user", JSON.stringify(mockUser));
        onAuthSuccess(mockUser);
        setLoading(false);
        onClose();
      }, 800);
    }
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const modalVariants = {
    closed: { scale: 0.9, opacity: 0, y: 20 },
    open: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-[12px]"
          />

          {/* Modal Card */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={modalVariants}
            className="relative w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white p-8"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF7A00]/5 rounded-full filter blur-[60px] pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="font-heading font-black text-xl uppercase tracking-wider text-white m-0">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h3>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="flex flex-col gap-4 text-left relative z-10">
              
              {!isSupabaseConfigured() && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3 flex items-start gap-2.5 text-yellow-500 text-[10px] leading-relaxed font-semibold">
                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Supabase is not configured. Running in <strong>Simulation Sandbox</strong>. Enter any email & password to test the account panels.
                  </span>
                </div>
              )}

              {error && (
                <div className="text-red-400 font-bold text-xs text-center bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  {error}
                </div>
              )}

              {isSignUp && (
                <>
                  {/* Name field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                      <User className="w-3 h-3 text-[#FF7A00]" /> Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Anshu Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none transition-all duration-300"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                      <Phone className="w-3 h-3 text-[#FF7A00]" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none transition-all duration-300"
                    />
                  </div>
                </>
              )}

              {/* Email field */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                  <Mail className="w-3 h-3 text-[#FF7A00]" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="anshu@stax.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none transition-all duration-300"
                />
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                  <Lock className="w-3 h-3 text-[#FF7A00]" /> Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_4px_20px_rgba(255,122,0,0.3)] transition-all duration-300 border-none cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? "Authenticating..." : isSignUp ? "Create Account" : "Sign In"}
              </button>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="bg-transparent border-none text-white/45 hover:text-white font-medium text-[11px] uppercase tracking-wider cursor-pointer text-center mt-3 transition-colors duration-200"
              >
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
