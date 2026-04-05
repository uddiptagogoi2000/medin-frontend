"use client";

import { useSignUp, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { apiUrl } from "@/utils/api";

export default function SignupForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    doctorId: "",
    city: "",
    state: "",
    experience: "",
    specialization: "",
    hospital: "",
  });

  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // STEP 1 — Create signup + send OTP
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setPasswordError(null);
    setGeneralError(null);

    try {
      const [firstName, ...rest] = form.fullName.trim().split(" ");
      const lastName = rest.join(" ");

      await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err: any) {
      console.error("Signup error:", err);

      if (err.errors?.length > 0) {
        const error = err.errors[0];

        if (error.code?.includes("password")) {
          setPasswordError(error.message);
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — Verify OTP + onboard backend
  const handleVerify = async () => {
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setGeneralError(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log("Verification result:", completeSignUp);

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });

        const token = await getToken();

        if (!token) {
          throw new Error("Failed to retrieve token.");
        }

        console.log("TOKEN:", token);

        const response = await fetch(apiUrl("/users/onboard"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctor_id: form.doctorId,
            city: form.city,
            state: form.state,
            experience: Number(form.experience),
            specialization: form.specialization,
            hospital: form.hospital,
          }),
        });

        if (!response.ok) {
          throw new Error("Backend onboarding failed.");
        }

        alert("Signup successful 🚀");
      }
    } catch (err: any) {
      console.error("Verification error:", err);

      if (err.errors?.length > 0) {
        setGeneralError(err.errors[0].message);
      } else {
        setGeneralError("Invalid verification code.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!verifying ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
                placeholder="Dr. Julian Reed"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Professional Email
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
                placeholder="j.reed@hospital.org"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-sm font-bold text-slate-900">
                Professional Details
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Medical License Number / NPI
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 font-mono text-sm text-slate-900 outline-none focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
                  placeholder="Enter license code"
                  value={form.doctorId}
                  onChange={(e) =>
                    setForm({ ...form, doctorId: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Experience (Years)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
                  type="number"
                  min={0}
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Medical Specialty
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
                  placeholder="Cardiology"
                  value={form.specialization}
                  onChange={(e) =>
                    setForm({ ...form, specialization: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Hospital
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
                  placeholder="Metro Health"
                  value={form.hospital}
                  onChange={(e) =>
                    setForm({ ...form, hospital: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  City
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  State
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <p className="mt-4 text-[11px] italic text-slate-500">
              We verify licenses against national databases to ensure
              professional integrity.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setPasswordError(null);
              }}
              required
            />
            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          <div className="flex items-start gap-3 py-2">
            <input
              className="mt-1 rounded border-slate-300 text-[#ec5b13]"
              type="checkbox"
            />
            <p className="text-xs text-slate-500">
              I agree to the MedNet{" "}
              <a
                className="font-medium text-[#ec5b13] hover:underline"
                href="#"
              >
                Terms of Service
              </a>{" "}
              and confirm my status as a licensed professional.
            </p>
          </div>

          {generalError && (
            <p className="text-sm text-red-500">{generalError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ec5b13] py-4 font-bold text-white shadow-lg shadow-[#ec5b13]/20 transition-all hover:bg-[#d95310] disabled:opacity-60"
          >
            <span>
              {loading ? "Creating..." : "Create Professional Account"}
            </span>
            <span>→</span>
          </button>
        </form>
      ) : (
        <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-bold text-slate-900">
            Verify your email
          </h3>
          <p className="text-sm text-slate-500">
            Enter the verification code sent to your email.
          </p>

          <input
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          {generalError && (
            <p className="text-sm text-red-500">{generalError}</p>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="w-full rounded-xl bg-[#ec5b13] py-3 font-bold text-white transition-all hover:bg-[#d95310] disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </div>
      )}
    </div>
  );
}
