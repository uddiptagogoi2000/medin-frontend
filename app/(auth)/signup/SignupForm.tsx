"use client";

import { useSignUp, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { apiUrl } from "@/utils/api";
import { useRouter } from "next/navigation";

const SIGNUP_INVITE_TOKEN_KEY = "serona_signup_invite_token";
const INVALID_INVITE_ERROR =
  "This invite link is invalid, expired, or has already been used. Please contact us for a new invite.";
const BACKEND_INVALID_INVITE_MESSAGE =
  "This invite link is invalid, expired, or has already been used.";
const INVITE_VALIDATION_FAILURE_MESSAGE =
  "We could not validate this invite link right now. Please refresh and try again.";

export default function SignupForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const router = useRouter();

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
  const [inviteCheckLoading, setInviteCheckLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [lastInviteCheckedEmail, setLastInviteCheckedEmail] = useState("");
  const [lastInviteAllowed, setLastInviteAllowed] = useState<boolean | null>(
    null,
  );
  const [lastInviteMessage, setLastInviteMessage] = useState<string | null>(
    null,
  );
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteValidationLoading, setInviteValidationLoading] = useState(false);
  const [inviteValidationError, setInviteValidationError] = useState<
    string | null
  >(null);
  const [inviteBlocked, setInviteBlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isActive = true;

    const validateInvite = async (rawToken: string) => {
      setInviteValidationLoading(true);
      setInviteValidationError(null);
      setInviteBlocked(false);

      try {
        const response = await fetch(apiUrl("/users/invites/validate"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invite_token: rawToken,
          }),
        });

        if (!response.ok) {
          throw new Error("Invite validation failed.");
        }

        const data = await response.json();
        const isValid = Boolean(data?.valid);

        if (!isActive) return;

        if (isValid) {
          sessionStorage.setItem(SIGNUP_INVITE_TOKEN_KEY, rawToken);
          setInviteToken(rawToken);
          setInviteBlocked(false);
          return;
        }

        sessionStorage.removeItem(SIGNUP_INVITE_TOKEN_KEY);
        setInviteToken(null);
        setInviteBlocked(true);
        setInviteValidationError(
          data?.message
            ? `${data.message} Please contact us for a new invite.`
            : INVALID_INVITE_ERROR,
        );
      } catch (error) {
        console.error("Invite validation error:", error);

        if (!isActive) return;

        sessionStorage.removeItem(SIGNUP_INVITE_TOKEN_KEY);
        setInviteToken(null);
        setInviteBlocked(true);
        setInviteValidationError(INVITE_VALIDATION_FAILURE_MESSAGE);
      } finally {
        if (isActive) {
          setInviteValidationLoading(false);
        }
      }
    };

    const params = new URLSearchParams(window.location.search);
    const inviteFromUrl = params.get("invite")?.trim() || "";
    const storedInvite = sessionStorage
      .getItem(SIGNUP_INVITE_TOKEN_KEY)
      ?.trim();
    const inviteToValidate = inviteFromUrl || storedInvite || "";

    if (!inviteToValidate) {
      sessionStorage.removeItem(SIGNUP_INVITE_TOKEN_KEY);
      setInviteToken(null);
      setInviteValidationLoading(false);
      setInviteValidationError(null);
      setInviteBlocked(false);
      return () => {
        isActive = false;
      };
    }

    void validateInvite(inviteToValidate);

    return () => {
      isActive = false;
    };
  }, []);

  // STEP 1 — Create signup + send OTP
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (inviteBlocked || inviteValidationLoading) {
      return;
    }

    setLoading(true);
    setPasswordError(null);
    setGeneralError(null);

    try {
      const trimmedEmail = form.email.trim();
      const normalizedEmail = trimmedEmail.toLowerCase();

      if (!trimmedEmail) {
        setGeneralError("Email is required.");
        return;
      }

      // Invite-only email allowlist check is only needed when no invite link token exists.
      if (!inviteToken) {
        if (lastInviteCheckedEmail !== normalizedEmail) {
          setInviteCheckLoading(true);

          try {
            const inviteResponse = await fetch(apiUrl("/users/invite-check"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: trimmedEmail,
              }),
            });

            if (!inviteResponse.ok) {
              throw new Error("Invite check failed.");
            }

            const inviteData = await inviteResponse.json();
            const isAllowed = Boolean(inviteData?.allowed);
            const inviteMessage =
              inviteData?.message ||
              "This platform is invite-only. This email is not on the approved invite list.";

            setLastInviteCheckedEmail(normalizedEmail);
            setLastInviteAllowed(isAllowed);
            setLastInviteMessage(isAllowed ? null : inviteMessage);

            if (!isAllowed) {
              setGeneralError(inviteMessage);
              return;
            }
          } catch (error) {
            console.error("Invite check error:", error);
            setGeneralError(
              "We could not verify invite access right now. Please try again.",
            );
            return;
          } finally {
            setInviteCheckLoading(false);
          }
        } else if (lastInviteAllowed === false) {
          setGeneralError(
            lastInviteMessage ||
              "This platform is invite-only. This email is not on the approved invite list.",
          );
          return;
        }
      }

      const [firstName, ...rest] = form.fullName.trim().split(" ");
      const lastName = rest.join(" ");

      await signUp.create({
        emailAddress: trimmedEmail,
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

        const token = await getToken({ template: "backend" });

        if (!token) {
          throw new Error("Failed to retrieve token.");
        }

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
            ...(inviteToken ? { invite_token: inviteToken } : {}),
          }),
        });

        if (!response.ok) {
          let message = "Backend onboarding failed.";
          try {
            const data = await response.json();
            message = data?.detail || data?.message || message;
          } catch {
            // ignore JSON parse failure
          }

          if (
            response.status === 403 &&
            message === BACKEND_INVALID_INVITE_MESSAGE
          ) {
            sessionStorage.removeItem(SIGNUP_INVITE_TOKEN_KEY);
            setInviteToken(null);
            setInviteBlocked(true);
            setInviteValidationError(INVALID_INVITE_ERROR);
            setVerifying(false);
            throw new Error(INVALID_INVITE_ERROR);
          }

          throw new Error(message);
        }

        sessionStorage.removeItem(SIGNUP_INVITE_TOKEN_KEY);
        setInviteToken(null);
        setVerifying(false);
        router.push("/feed");
      } else {
        setGeneralError("Verification not complete. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);

      if (err.errors?.length > 0) {
        setGeneralError(err.errors[0].message);
      } else if (err?.message) {
        setGeneralError(err.message);
      } else {
        setGeneralError("Could not complete signup. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // if (inviteValidationLoading) {
  //   return (
  //     <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-6">
  //       <div className="space-y-2">
  //         <h3 className="text-lg font-bold text-slate-900">
  //           Validating invite
  //         </h3>
  //         <p className="text-sm text-slate-500">
  //           We&apos;re checking your invite link before continuing with signup.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  if (inviteBlocked) {
    return (
      <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-red-700">Invite unavailable</h3>
          <p className="text-sm text-red-600">
            {inviteValidationError || INVALID_INVITE_ERROR}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!verifying ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {generalError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {generalError}
            </div>
          )}

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
                onChange={(e) => {
                  const nextEmail = e.target.value;
                  setForm({ ...form, email: nextEmail });

                  const normalized = nextEmail.trim().toLowerCase();
                  if (normalized !== lastInviteCheckedEmail) {
                    setLastInviteAllowed(null);
                    setLastInviteMessage(null);
                  }
                }}
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

          <div className="flex items-center gap-3 py-2">
            <input
              className="h-4 w-4 rounded border-slate-300 text-[#ec5b13]"
              type="checkbox"
            />
            <p className="leading-relaxed text-xs text-slate-500">
              I agree to Serona{" "}
              <a
                className="font-medium text-[#ec5b13] hover:underline"
                href="#"
              >
                Terms of Service
              </a>{" "}
              and confirm my status as a licensed professional.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || inviteCheckLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ec5b13] py-4 font-bold text-white shadow-lg shadow-[#ec5b13]/20 transition-all hover:bg-[#d95310] disabled:opacity-60"
          >
            <span>
              {inviteCheckLoading
                ? "Checking invite..."
                : loading
                  ? "Creating..."
                  : "Create Professional Account"}
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
