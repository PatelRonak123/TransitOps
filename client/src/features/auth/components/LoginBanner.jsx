import { Truck, CheckCircle2 } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const roles = [
  "Fleet Manager",
  "Dispatcher",
  "Safety Officer",
  "Financial Analyst",
];

export default function LoginBanner() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-50 via-white to-orange-50 p-12 border-r border-slate-200">

      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
          <Truck size={30} />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            TransitOps
          </h1>

          <p className="text-sm text-slate-500">
            Smart Transport Operations Platform
          </p>
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center">

        <div className="w-full max-w-md">
          <DotLottieReact
            src="https://lottie.host/e4efdd62-95fc-4d36-b0fc-dd637bad5a66/kZVXAsh69v.lottie"
            loop
            autoplay
          />
        </div>

        <div className="mt-6 text-center">

          <h2 className="text-3xl font-bold text-slate-900">
            <span className="text-orange-500"> Powering Intelligent Transport Operations</span>
          </h2>

          <p className="mt-3 max-w-md text-slate-600 leading-relaxed">
            Manage vehicles, drivers, trips, maintenance and analytics
            from one centralized platform.
          </p>

        </div>

        {/* Roles */}
        <div className="mt-10 grid grid-cols-2 gap-4">

          {roles.map((role) => (
            <div
              key={role}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm border border-slate-200"
            >
              <CheckCircle2
                size={18}
                className="text-orange-500"
              />

              <span className="text-sm font-medium text-slate-700">
                {role}
              </span>

            </div>
          ))}

        </div>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-400">

        <span>Version 1.0</span>

        <span>© 2026 TransitOps</span>

      </div>

    </div>
  );
}