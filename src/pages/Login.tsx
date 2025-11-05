import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple mock authentication - map emails to user IDs
    const userMap: { [key: string]: string } = {
      "warren@example.com": "1",
      "bill@example.com": "2",
      "jason@example.com": "3",
      "steve@example.com": "4",
      "donald@example.com": "5",
      "phone@example.com": "6",
    };
    
    const userId = userMap[email.toLowerCase()];
    
    if (email && password && userId) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userId", userId);
      toast({
        title: "Login successful",
        description: "Welcome to Clockspot!",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: "Please use one of the demo emails (e.g., jason@example.com).",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-header text-header-foreground py-4 px-6">
        <h1 className="text-2xl font-bold">clockspot</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jason@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Demo accounts:</p>
              <p>jason@example.com, steve@example.com, bill@example.com</p>
              <p>warren@example.com, donald@example.com, phone@example.com</p>
              <p className="text-xs">(any password works)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
