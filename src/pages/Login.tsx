import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { login, isAuthenticated } from "@/helpers/axios_helpers";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Rediriger vers le dashboard si l'utilisateur est déjà authentifié
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login({ username, password });
      if (response.success) {
        // Vérifier que le token a bien été stocké dans le cookie
        if (!isAuthenticated()) {
          toast({
            title: "Erreur de connexion",
            description: "Le token d'authentification n'a pas pu être créé.",
            variant: "destructive",
          });
          return;
        }
        
        const user = response.data?.user ?? response.data;
        localStorage.setItem("isAuthenticated", "true");
        if (user?.id) localStorage.setItem("userId", String(user.id));
        if (user?.username) localStorage.setItem("userEmail", user.username);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${user?.username ?? ""}`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Échec de la connexion",
          description: typeof response.error === "string" ? response.error : "Identifiants invalides.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-header text-header-foreground py-4 px-6">
        <h1 className="text-2xl font-bold">Clinique Valeo</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center ">Bienvenue</CardTitle>
            {/* <CardDescription className="text-center">
              Entrez vos identifiants pour accéder au tableau de bord
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="">
              <div className="mb-6">
                <label htmlFor="username" className="block mb-2">Nom d'utilisateur</label>
                <input
                  id="username"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-0 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="">
                <label htmlFor="password" className="block mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base md:text-sm focus:outline-none focus:ring-0 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-10 flex gap-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full button_logo_color text-white rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Se connecter
                </button>
              </div>
            </form>
            {/* <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Comptes de démonstration:</p>
              <p>jason@example.com, steve@example.com, bill@example.com</p>
              <p>warren@example.com, donald@example.com, phone@example.com</p>
              <p className="text-xs">(n'importe quel mot de passe fonctionne)</p>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
