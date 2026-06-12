"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we arrived here from an auth recovery flow
    // Supabase automatically parses recovery tokens from URL fragment and establishes a session.
    // If not, we might be in simulation sandbox mode.
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) throw updateError;
        setSuccess(true);
      } catch (err) {
        console.error("Update password error:", err);
        setError(err.message || "Failed to update password.");
      } finally {
        setLoading(false);
      }
    } else {
      // Simulation sandbox mode
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1000);
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

        {success ? (
          <div className="relative z-10 py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto mb-6 shadow-[0_0_20px_rgba(74,222,128,0.15)]">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="font-heading font-black text-2xl uppercase tracking-wider text-white mb-2">
              Password Restored
            </h3>
            <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto mb-8 font-medium">
              Your security credentials have been updated successfully. You can now sign in using your new password.
            </p>

            <button
              onClick={() => router.push("/")}
              className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_25px_rgba(255,122,0,0.35)] transition-all duration-300 border-none cursor-pointer"
            >
              Go to Home Page
            </button>
          </div>
        ) : (
          <div className="relative z-10">
            <h3 className="font-heading font-black text-2xl uppercase tracking-wider text-white mb-2">
              Set New Password
            </h3>
            <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto mb-8 font-medium">
              Provide a secure, new password below for your STAX account credentials.
            </p>

            {error && (
              <div className="text-red-400 font-bold text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                  <Lock className="w-3.5 h-3.5 text-[#FF7A00]" /> New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3.5 text-white text-xs outline-none transition-all duration-300"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                  <Lock className="w-3.5 h-3.5 text-[#FF7A00]" /> Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3.5 text-white text-xs outline-none transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_25px_rgba(255,122,0,0.35)] transition-all duration-300 border-none cursor-pointer mt-4 flex items-center justify-center gap-2"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>

            <a
              href="/"
              className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest font-black flex items-center justify-center gap-1.5 mt-8 no-underline transition-colors duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Home
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}
