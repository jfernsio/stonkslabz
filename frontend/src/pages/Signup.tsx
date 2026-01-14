import { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-sm bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-semibold text-foreground text-glow-cyan">StonksLab</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start your trading journey with $100,000 paper money</p>
        </div>

        {/* Form */}
        <div className="terminal-card p-6">
          <form className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="trader123"
                  className="pl-9 bg-muted border-border font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="trader@stonkslab.com"
                  className="pl-9 bg-muted border-border font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-10 bg-muted border-border font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="rounded border-border bg-muted mt-0.5" />
              <span className="text-xs text-muted-foreground">
                I agree to the{" "}
                <a href="#" className="text-primary hover:text-primary/80">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:text-primary/80">Privacy Policy</a>
              </span>
            </div>

            <Button className="w-full bg-primary text-primary-foreground">
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "$100K", desc: "Paper Money" },
            { label: "Real-time", desc: "Market Data" },
            { label: "AI", desc: "Insights" },
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-mono font-semibold text-primary">{feature.label}</div>
              <div className="text-xs text-muted-foreground">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
