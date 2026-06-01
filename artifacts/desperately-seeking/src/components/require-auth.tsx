import { ReactNode } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { LogIn, UserPlus, Lock, ArrowLeft } from "lucide-react";

function AuthWall() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center px-4 py-16 md:py-24 bg-[#FDF5E6]">
        <div className="w-full max-w-md rounded-3xl border border-[#D4AF37]/20 bg-[#fffaf2] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B3954]">
            <Lock className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0B3954]">
            Sign in to continue
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#5b4a35]/80">
            Create a free account or sign in to browse listings, message
            sellers, post requests, and start selling. It only takes a minute.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/login?mode=register">
              <Button className="w-full h-11 rounded-xl bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-2">
                <UserPlus className="h-4 w-4" />
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl border-[#0B3954]/20 text-[#0B3954] font-semibold hover:bg-[#0B3954]/5 gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>
          <Link href="/">
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs text-[#5b4a35]/60 hover:text-[#5b4a35] cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center py-32">
          <Spinner className="h-8 w-8 text-[#0B3954]" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <AuthWall />;
  }

  return <>{children}</>;
}
