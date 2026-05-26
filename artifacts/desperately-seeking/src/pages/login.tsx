import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getApiUrl } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles, Mail, Lock, User } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === "register" ? "auth/register" : "auth/login";
      const body =
        mode === "register"
          ? { email, password, name }
          : { email, password };

      const res = await fetch(getApiUrl(endpoint), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      await qc.invalidateQueries();
      toast.success(
        mode === "register"
          ? `Welcome to Desperately Seeking™, ${data.name}!`
          : `Welcome back, ${data.name}!`,
      );
      setLocation("/");
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B3954] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/">
        <div className="mb-8 text-center cursor-pointer">
          <h1 className="font-serif text-3xl font-bold text-white">
            <span className="italic text-[#D4AF37]">Desperately</span> Seeking
          </h1>
          <p className="text-white/50 text-sm mt-1">Post what you need. Help comes to you.</p>
        </div>
      </Link>

      <Card className="w-full max-w-md rounded-3xl border-0 shadow-2xl bg-white">
        <CardHeader className="pb-2 pt-8 px-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/15">
              <Sparkles className="h-4.5 w-4.5 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#0B3954]">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to manage your listings and requests."
              : "Join to start buying or selling in your area."}
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8 pt-4">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-muted/60 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-white shadow text-[#0B3954]"
                  : "text-muted-foreground hover:text-[#0B3954]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-white shadow text-[#0B3954]"
                  : "text-muted-foreground hover:text-[#0B3954]"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[#0B3954] text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="pl-9 rounded-xl border-[#0B3954]/15 focus:border-[#0B3954]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#0B3954] text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-9 rounded-xl border-[#0B3954]/15 focus:border-[#0B3954]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#0B3954] text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  className="pl-9 pr-10 rounded-xl border-[#0B3954]/15 focus:border-[#0B3954]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-[#0B3954]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#D4AF37] text-[#0B3954] font-bold text-base hover:bg-[#c9a430] border-0 mt-2 transition-transform hover:-translate-y-0.5"
            >
              {loading
                ? mode === "login"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link href="/pricing#terms">
              <span className="underline underline-offset-2 cursor-pointer hover:text-[#0B3954]">
                Terms of Use
              </span>
            </Link>{" "}
            and{" "}
            <Link href="/pricing#privacy">
              <span className="underline underline-offset-2 cursor-pointer hover:text-[#0B3954]">
                Privacy Policy
              </span>
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-white/40 text-xs text-center">
        © {new Date().getFullYear()} Desperately Seeking™. All rights reserved.
      </p>
    </div>
  );
}
