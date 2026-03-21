"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function SigninForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Wait until Clerk is ready
  if (!isLoaded) {
    return null; // or loading spinner
  }

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        // Get backend JWT (for FastAPI)
        const token = await getToken({ template: "backend" });
        console.log("Backend JWT:", token);

        // Redirect to /feed after successful signin
        router.push("/feed");
      } else {
        console.log("Additional sign-in steps required:", result);
      }
    } catch (err: any) {
      console.error("Signin error:", err);

      if (err.errors?.length > 0) {
        setGeneralError(err.errors[0].message);
      } else {
        setGeneralError("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignin} className="space-y-5">
      <div className="space-y-2">
        <label className="ml-1 text-sm font-semibold text-slate-700">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none transition-all focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
            placeholder="dr.smith@hospital.org"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="ml-1 flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">Password</label>
          <a className="text-xs font-medium text-[#ec5b13] hover:underline" href="#">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none transition-all focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      {generalError && <p className="text-sm text-red-500">{generalError}</p>}

      <button
        type="submit"
        disabled={loading}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#ec5b13] py-3.5 font-bold text-white shadow-lg shadow-[#ec5b13]/20 transition-all hover:bg-[#d95310] disabled:opacity-60"
      >
        {loading ? "Signing In..." : "Sign In"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
