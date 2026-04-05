import Link from "next/link";
import SigninForm from "./SigninForm";

export default function SigninPage() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden lg:flex-row bg-[#f8f6f6] text-slate-900">
      <section className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden p-16">
        <div className="absolute inset-0 z-0 bg-[#ec5b13]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,transparent_1px)] [background-size:24px_24px]" />
          <img
            alt="Medical professional"
            className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAurf5dVhxEEnudgwg1syzf4Dqr-MXI3hJK7TCOi0GGfkqJnrvsrbe86hCc10kAeq4xblP2jVFtV8dAdHGUdXIMqAOulA4nMHdDeB7bJOo1pdqRtekH-76bXRfF9jxjGHnStEbAN6LhU1hPggZUV_S1Z5cHjslQiQmIivpXO0M4YBFiY9EqT7g7tTgGzGX0s86S4KZFYt7h0J8kE5TdwTGXyAqspSJHkEZn0YG0rdudX3jK_W6ySAjrf38KtdOopojbOJj00anD2LA"
          />
        </div>

        <div className="relative z-10 max-w-xl text-white">
          <div className="mb-12 flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Serona</h2>
          </div>
          <h1 className="mb-6 text-5xl font-black leading-tight">
            Breaking Silos, Connecting Doctors.
          </h1>
          <p className="text-xl font-medium leading-relaxed text-white/80">
            Access a global network of specialized insights, real-time
            collaboration tools, and evidence-based medical data.
          </p>

          <div className="mt-12 flex gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold">50k+</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Active Professionals
              </span>
            </div>
            <div className="flex flex-col gap-1 border-l border-white/20 pl-8">
              <span className="text-3xl font-bold">120+</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Medical Specialties
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col bg-white lg:w-1/2">
        <header className="z-20 flex items-center justify-end px-6 py-6 lg:px-10">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">New here?</span>
            <Link
              href="/signup"
              className="text-sm font-bold text-[#ec5b13] hover:underline"
            >
              Create an account
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="mb-2 text-3xl font-black text-slate-900">
                Welcome Back
              </h2>
              <p className="text-slate-500">
                Secure access for medical professionals
              </p>
            </div>
            <SigninForm />
          </div>
        </div>

        <footer className="border-t border-slate-100 p-8 text-center text-xs text-slate-500 lg:text-left">
          <div className="mx-auto flex max-w-md flex-col gap-4 lg:mx-0 lg:flex-row lg:justify-between">
            <p>© 2026 Serona.</p>
            <div className="space-x-4">
              <a className="transition-colors hover:text-[#ec5b13]" href="#">
                Privacy Policy
              </a>
              <a className="transition-colors hover:text-[#ec5b13]" href="#">
                Terms of Service
              </a>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
