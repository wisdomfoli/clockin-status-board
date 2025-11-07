import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "/images/clinique_logo.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserList from "@/components/UserList";
import { getUsers, login, isAuthenticated, clockIn, getUsersTodayClocks } from "@/helpers/axios_helpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export default function UsersList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClockInLoading, setIsClockInLoading] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Vérifie si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated()) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        setCurrentUserId(userId);
      }
    }
  }, []);

  // Récupère tous les utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      const response = await getUsers();
      console.log(response);
      if (!response.success) {
        toast({
          title: "Erreur de chargement",
          description: "Impossible de récupérer la liste des utilisateurs.",
          variant: "destructive",
        });
        return;
      }

      setUsers(response.data || []);
    };

    loadUsers();
  }, [toast]);

  const handleLogin = async () => {
    if (username.trim() === "" || password.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

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
        setCurrentUserId(String(user?.id || ""));
        setIsLoginOpen(false);
        setUsername("");
        setPassword("");
        setSelectedUsername("");
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${user?.username ?? username}`,
        });
        
        // Rediriger vers le dashboard après connexion
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

  const handleClockIn = async () => {
    if (username.trim() === "" || password.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    setIsClockInLoading(true);
    try {
      // Étape 1: Se connecter
      const loginResponse = await login({ username, password });
      if (!loginResponse.success) {
        toast({
          title: "Échec de la connexion",
          description: typeof loginResponse.error === "string" ? loginResponse.error : "Identifiants invalides.",
          variant: "destructive",
        });
        return;
      }

      // Vérifier que le token a bien été stocké dans le cookie
      if (!isAuthenticated()) {
        toast({
          title: "Erreur de connexion",
          description: "Le token d'authentification n'a pas pu être créé.",
          variant: "destructive",
        });
        return;
      }
      
      const user = loginResponse.data?.user ?? loginResponse.data;
      localStorage.setItem("isAuthenticated", "true");
      if (user?.id) localStorage.setItem("userId", String(user.id));
      if (user?.username) localStorage.setItem("userEmail", user.username);
      setCurrentUserId(String(user?.id || ""));

      // Étape 2: Vérifier s'il y a un clock-in en cours
      const clocksResponse = await getUsersTodayClocks();
      let hasActiveClockIn = false;

      if (clocksResponse.success && clocksResponse.data?.results) {
        const userId = String(user?.id || "");
        for (const item of clocksResponse.data.results) {
          if (String(item.user?.id) === userId) {
            const records = Array.isArray(item.clock_records) ? item.clock_records : [];
            // Vérifier s'il y a un clock-in sans clock-out
            for (const rec of records) {
              if (rec?.clock_in_time && !rec?.clock_out_time) {
                hasActiveClockIn = true;
                break;
              }
            }
            break;
          }
        }
      }

      // Étape 3: Faire un clock-in si pas de clock-in en cours
      if (!hasActiveClockIn) {
        const clockInResponse = await clockIn();
        if (clockInResponse.success) {
          toast({
            title: "Connexion et Clock In réussis",
            description: `Bienvenue ${user?.username ?? username}, vous êtes connecté et avez pointé votre entrée.`,
          });
        } else {
          // Si le clock-in échoue mais que la connexion a réussi, on continue quand même
          const errorData = clockInResponse.error || clockInResponse.data;
          const message = errorData?.message || "Impossible de pointer l'entrée.";
          const existingClockInTime = errorData?.clock_in_time;
          
          if (existingClockInTime) {
            toast({
              title: "Connexion réussie",
              description: `Bienvenue ${user?.username ?? username}. Un pointage est déjà en cours.`,
            });
          } else {
            toast({
              title: "Connexion réussie",
              description: `Bienvenue ${user?.username ?? username}. ${message}`,
              variant: "default",
            });
          }
        }
      } else {
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${user?.username ?? username}, vous êtes connecté. Un pointage est déjà en cours.`,
        });
      }

      setIsLoginOpen(false);
      setUsername("");
      setPassword("");
      setSelectedUsername("");
      
      // Rediriger vers le dashboard après connexion
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsClockInLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    // setSelectedUsername(user.username);
    // setUsername(user.username);
    setIsLoginOpen(true);
  };

  const handleCloseModal = () => {
    setIsLoginOpen(false);
    setUsername("");
    setPassword("");
    setSelectedUsername("");
  };

  const totalUsers = users.length;
  
  // Trier les utilisateurs pour mettre l'utilisateur connecté en premier
  const sortedUsers = React.useMemo(() => {
    if (!currentUserId || users.length === 0) return users;
    
    const sorted = [...users];
    const currentUserIndex = sorted.findIndex((u) => String(u.id) === String(currentUserId));
    
    // Si l'utilisateur connecté est trouvé et n'est pas déjà en première position
    if (currentUserIndex > 0) {
      // Déplacer l'utilisateur connecté en première position
      const [currentUser] = sorted.splice(currentUserIndex, 1);
      sorted.unshift(currentUser);
    }
    
    return sorted;
  }, [users, currentUserId]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white text-black shadow-md py-4 px-6 flex items-center justify-between">
        <img src={logo} alt="Clinique Valeo" className="w-36" />
        {/* {currentUser && (
          <span className="text-sm font-medium">
            {currentUser.username} {currentUser.last_name}
          </span>
        )} */}
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">Nombre total :</p>
                  <p className="text-base font-medium">{totalUsers} utilisateurs</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Users */}
          <div className="lg:col-span-3">
            <div className="flex flex-col items-center w-full">
              {/* Liste des utilisateurs */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedUsers.map((user) => (
                  <div key={user.id} className="w-full max-w-sm">
                    <UserList
                      id={user.id}
                      firstName={user.first_name}
                      lastName={user.last_name}
                      username={user.username}
                      onClick={() => handleUserClick(user)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de connexion */}
      <Dialog open={isLoginOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseModal();
        } else {
          setIsLoginOpen(true);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
                Connexion
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="">
            <div className="mb-6">
              <label htmlFor="modal-username" className="block mb-2">
                Nom d'utilisateur
              </label>
              <input
                id="modal-username"
                type="text"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-0 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || isClockInLoading}
                autoFocus
                required
              />
            </div>
            <div className="">
              <label htmlFor="modal-password" className="block mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="modal-password"
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base md:text-sm focus:outline-none focus:ring-0 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isClockInLoading}
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
                type="button"
                onClick={handleClockIn}
                disabled={isClockInLoading || isLoading}
                className="flex-1 button_logo_color text-white rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isClockInLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Clock In
              </button>
              <button 
                type="submit"
                disabled={isLoading || isClockInLoading}
                className="flex-1 button_logo_color text-white rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Se connecter
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}