import { useState, type JSX, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail, Activity, ShieldCheck, AlertCircle } from "lucide-react";
import authService, { type LoginCredentials } from "@/api/auth";

// ── Shadcn / custom UI components ──────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LoginFormState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extracts a human-readable message from an Axios error or a generic Error. */
function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const axiosErr = err as {
      response?: { data?: { detail?: string | { msg: string }[] } };
      message?: string;
    };

    const detail = axiosErr.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg).join(". ");
    }
    if (axiosErr.message) return axiosErr.message;
  }
  return "An unexpected error occurred. Please try again.";
}

// ─── Branding Panel (left side) ───────────────────────────────────────────────

function BrandingPanel(): JSX.Element {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-12 py-10 text-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-3xl" />

      {/* Logo / brand mark */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-white/10 backdrop-blur-sm">
          <Activity className="h-5 w-5 text-blue-300" />
        </div>
        <span className="text-lg font-bold tracking-tight">Pulse Dashboard</span>
      </div>

      {/* Hero text */}
      <div className="relative z-10 space-y-6">
        <div className="space-y-3">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Track team progress,<br />
            <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              one pulse at a time.
            </span>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-slate-300/80">
            A centralised hub for managers and team members to submit weekly
            reports, monitor project health, and surface insights — all in one
            place.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: ShieldCheck, label: "Role-based access" },
            { icon: Activity, label: "Real-time metrics" },
            { icon: Lock, label: "JWT secured" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs font-medium ring-1 ring-white/10 backdrop-blur-sm"
            >
              <Icon className="h-3.5 w-3.5 text-blue-300" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 text-xs text-slate-500">
        © {new Date().getFullYear()} Pulse Team Dashboard. All rights reserved.
      </p>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm(): JSX.Element {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    loading: false,
    error: null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev: LoginFormState) => ({ ...prev, [name]: value, error: null }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // ── Basic client-side validation ─────────────────────────────────────
    if (!form.email.trim()) {
      setForm((prev: LoginFormState) => ({ ...prev, error: "Email / username is required." }));
      return;
    }
    if (!form.password) {
      setForm((prev: LoginFormState) => ({ ...prev, error: "Password is required." }));
      return;
    }

    setForm((prev: LoginFormState) => ({ ...prev, loading: true, error: null }));

    try {
      const credentials: LoginCredentials = {
        username: form.email.trim(),
        password: form.password,
      };

      await authService.login(credentials);

      // Redirect to the dashboard after a successful login
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      setForm((prev: LoginFormState) => ({
        ...prev,
        loading: false,
        error: extractErrorMessage(err),
      }));
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-xl border border-border/60">
      <CardHeader className="space-y-1 pb-2">
        {/* Mobile-only logo mark */}
        <div className="mb-3 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Pulse Dashboard
          </span>
        </div>

        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
          {/* Error banner */}
          {form.error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{form.error}</AlertDescription>
            </Alert>
          )}

          {/* Email / username */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={form.loading}
                aria-required
                className="pl-8"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                disabled={form.loading}
                aria-required
                className="pl-8"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={form.loading}
            className="mt-2 w-full bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/40"
            size="lg"
          >
            {form.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * LoginPage
 *
 * Two-column layout:
 *  Left  → dark gradient branding panel (hidden on mobile)
 *  Right → centered login card
 *
 * Fully responsive: on small screens only the card is shown with an
 * inline logo mark at the top of the card.
 */
export default function LoginPage(): JSX.Element {
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-2">
      {/* ── Left: branding ──────────────────────────────────────────────── */}
      <BrandingPanel />

      {/* ── Right: login form ────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center p-6 md:p-12">
        <LoginForm />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Having trouble signing in?{" "}
          <a
            href="mailto:support@pulse.dev"
            className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
          >
            Contact support
          </a>
        </p>
      </div>
    </main>
  );
}
