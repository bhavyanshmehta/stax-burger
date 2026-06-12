"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldAlert, ArrowLeft } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      setLoading(false);
      return;
    }

    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (signInError) throw signInError;

        if (data.user) {
          // Fetch profile to verify role
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

          if (profileError) throw profileError;

          // Double check email fallback as well
          const userEmail = data.user.email || "";
          const isEmailAdmin = userEmail.includes("admin") || userEmail.endsWith("@stax.com");

          if (profile?.role === "admin" || isEmailAdmin) {
            if (isEmailAdmin && profile?.role !== "admin") {
              // Automatically upgrade role to admin in DB
              await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
            }
            router.push("/admin/dashboard");
          } else {
            // Sign them out immediately if they are not an admin
            await supabase.auth.signOut();
            setError("Access denied. You do not have permissions to access STAX HQ.");
          }
        }
      } catch (err) {
        console.error("Admin signin error:", err);
        setError(err.message || "Authentication failed.");
      } finally {
        setLoading(false);
      }
    } else {
      // Simulation Sandbox Mode
      setTimeout(() => {
        const emailLower = email.trim().toLowerCase();
        const isSimAdmin = emailLower.includes("admin") || emailLower.endsWith("@stax.com");

        if (isSimAdmin) {
          const mockUser = {
            id: "usr_mock_admin",
            email: email.trim(),
            role: "admin",
            user_metadata: {
              name: "Admin Staff",
              phone: "9876543210",
            },
          };
          localStorage.setItem("stax_simulated_user", JSON.stringify(mockUser));
          router.push("/admin/dashboard");
        } else {
          setError("Access denied. Authorized @stax.com admin email required in sandbox mode.");
        }
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FF7A00]/5 rounded-full filter blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF7A00]/5 rounded-full filter blur-[60px] pointer-events-none" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[#FF7A00] mx-auto mb-6 shadow-[0_0_20px_rgba(255,122,0,0.15)]">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="font-heading font-black text-2xl uppercase tracking-wider text-white mb-2">
            STAX HQ Operations
          </h3>
          <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto mb-8 font-medium">
            Authorized administrative staff portal. Please authenticate below.
          </p>

          {!isSupabaseConfigured() && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3.5 mb-6 text-yellow-500 text-[10px] leading-relaxed font-semibold text-left">
              <span>
                <strong>Sandbox Active:</strong> Enter any email with <strong>admin</strong> or ending in <strong>@stax.com</strong> to simulate admin credentials.
              </span>
            </div>
          )}

          {error && (
            <div className="text-red-400 font-bold text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-center gap-2 justify-center">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                <Mail className="w-3.5 h-3.5 text-[#FF7A00]" /> Admin Email
              </label>
              <input
                type="email"
                placeholder="anshu@stax.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3.5 text-white text-xs outline-none transition-all duration-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                <Lock className="w-3.5 h-3.5 text-[#FF7A00]" /> Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3.5 text-white text-xs outline-none transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_25px_rgba(255,122,0,0.35)] transition-all duration-300 border-none cursor-pointer mt-4 flex items-center justify-center gap-2"
            >
              {loading ? "Authenticating..." : "Enter Operations HQ"}
            </button>
          </form>

          <a
            href="/"
            className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest font-black flex items-center justify-center gap-1.5 mt-8 no-underline transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Home
          </a>
        </div>
      </motion.div>
    </div>
  );
}
