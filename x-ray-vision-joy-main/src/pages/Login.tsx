import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-border/80 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="mx-auto h-36 w-36 rounded-3xl bg-white border border-border shadow-sm flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Viewr logo" className="h-32 w-32 object-contain" />
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="font-display text-2xl text-black">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to continue to Viewr.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black">Email</Label>
              <Input id="email" type="email" placeholder="doctor@viewr.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" required />
            </div>
            <Button type="submit" className="w-full bg-[#fde2f3] text-black hover:bg-[#f7d2eb]">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
