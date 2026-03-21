import Link from "next/link";
import SignupForm from "./SignupForm";

const SignupPage = () => {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f8f6f6]">
      <div className="flex h-screen w-full flex-col lg:flex-row">
        <section className="relative hidden w-full overflow-hidden bg-slate-900 p-12 text-white lg:flex lg:w-5/12 xl:w-1/2 lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#ec5b13]/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-3">
              <h2 className="text-2xl font-bold leading-tight tracking-tight">
                MedIn
              </h2>
            </div>

            <div className="max-w-lg space-y-8">
              <h1 className="text-4xl font-black leading-tight xl:text-5xl">
                Empowering the future of medical collaboration.
              </h1>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="mt-1 text-[#ec5b13]">●</span>
                  <div>
                    <h4 className="text-lg font-bold">Verified Peer Network</h4>
                    <p className="text-sm text-slate-400">
                      Connect with over 50,000+ verified medical specialists
                      globally.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-1 text-[#ec5b13]">●</span>
                  <div>
                    <h4 className="text-lg font-bold">
                      Real-time Case Discussion
                    </h4>
                    <p className="text-sm text-slate-400">
                      Securely share insights and seek second opinions in
                      minutes.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative z-10 mt-12 max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="mb-4 font-light italic leading-relaxed text-slate-300">
              &quot;MedNet has completely changed how I consult on complex
              neurology cases. The ability to reach verified peers instantly is
              invaluable for patient care.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">
                DR
              </div>
              <div>
                <p className="text-sm font-bold">Dr. Sarah Richardson</p>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Chief of Neurology, Metro Health
                </p>
              </div>
            </div>
          </div>
        </section>

        <main className="flex h-full flex-1 flex-col items-center justify-center overflow-y-auto bg-white p-6 lg:p-12 xl:p-20">
          <div className="mb-10 self-start lg:hidden">
            <h2 className="text-xl font-bold text-slate-900">MedIn</h2>
          </div>

          <div className="w-full max-w-lg">
            <div className="mb-10">
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900">
                Join the Network
              </h1>
              <p className="mt-2 text-slate-500">
                Secure professional networking for verified medical
                practitioners.
              </p>
            </div>

            <SignupForm />

            <div className="mt-8 border-t border-slate-100 pt-8 text-center">
              <p className="text-sm text-slate-600">
                Already part of our network?{" "}
                <Link
                  href="/signin"
                  className="font-bold text-[#ec5b13] hover:underline"
                >
                  Log in here
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#ec5b13]/20 via-[#ec5b13] to-[#ec5b13]/20 lg:hidden" />
    </div>
  );
};

export default SignupPage;
