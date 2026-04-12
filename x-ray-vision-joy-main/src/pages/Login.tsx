import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-[#ffe6f3]/80 blur-3xl" />
      <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-[#dff4ff]/70 blur-3xl" />
      <div className="absolute -bottom-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#e4f8ef]/75 blur-3xl" />

      <Card className="w-full max-w-md border-border/70 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.55)] bg-white/92 backdrop-blur-md relative z-10">
        <CardHeader className="space-y-5 pb-3">
          <div className="mx-auto h-36 w-36 rounded-[2rem] bg-gradient-to-br from-[#fff4fb] to-[#eaf6ff] border border-border/70 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.55)] flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Viewr logo" className="h-28 w-28 object-contain" />
          </div>
          <div className="text-center space-y-1">
            <span className="ribbon-chip">
              <Sparkles className="h-3.5 w-3.5" />
              Dental AI Platform
            </span>
            <CardTitle className="font-display text-[2rem] text-foreground mt-3">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground max-w-xs mx-auto">
              Sign in to access your schedule, patient files, and AI reports in one place.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input id="email" type="email" placeholder="doctor@viewr.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
