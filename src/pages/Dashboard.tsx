import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserCard, { TimeEntry } from "@/components/UserCard";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import logo from "/images/clinique_logo.png";
import { getUsersTodayClocks, isAuthenticated, logout, clockIn, clockOut } from "@/helpers/axios_helpers";
interface User {
  id: string;
  firstName: string;
  lastName: string;
  isClockedIn: boolean;
  timeEntries: TimeEntry[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);

  // Fonction helper pour mapper les données des utilisateurs
  const mapUsersFromResponse = (results: any[]): User[] => {
    const userIdToEntries: Record<string, { user: any; entries: TimeEntry[] }> = {};
    for (const item of results) {
      const u = item.user;
      if (!u) continue;
      const uid = String(u.id);
      if (!userIdToEntries[uid]) {
        userIdToEntries[uid] = { user: u, entries: [] };
      }
      // Populate from clock_records array
      const records = Array.isArray(item.clock_records) ? item.clock_records : [];
      for (const rec of records) {
        if (rec?.clock_in_time) {
          userIdToEntries[uid].entries.push({
            clockIn: new Date(rec.clock_in_time),
            clockOut: rec.clock_out_time ? new Date(rec.clock_out_time) : undefined,
          });
        }
      }
    }

    return Object.values(userIdToEntries).map(({ user: u, entries }) => {
      // Keep only valid dates and sort by clock-in time
      const sortedEntries = entries
        .filter(e => e.clockIn instanceof Date && !isNaN(e.clockIn.getTime()))
        .sort((a, b) => a.clockIn.getTime() - b.clockIn.getTime());

      const lastEntry = sortedEntries[sortedEntries.length - 1];
      const isClockedIn = !!(lastEntry && !lastEntry.clockOut);

      return {
        id: String(u.id),
        firstName: (u.first_name ?? "").trim() || (u.username ?? ""),
        lastName: (u.last_name ?? "").trim(),
        isClockedIn,
        timeEntries: sortedEntries,
      };
    });
  };

  useEffect(() => {
    // Vérifier l'authentification via le token dans les cookies
    if (!isAuthenticated()) {
      navigate("/");
      return;
    }
    
    const userId = localStorage.getItem("userId");
    if (userId) {
      setCurrentUserId(userId);
    }
  }, [navigate]);

  useEffect(() => {
    const loadTodayClocks = async () => {
      const response = await getUsersTodayClocks();
      if (!response.success) {
        console.log(response);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de récupérer les pointages du jour.",
          variant: "destructive",
        });
        return;
      }

      const results = response.data?.results ?? [];
      const mappedUsers = mapUsersFromResponse(results);
      setUsers(mappedUsers);
    };
    loadTodayClocks();
  }, [toast]);

  const handleToggleClock = async (userId: string) => {
    // Only allow users to clock themselves in/out
    if (userId !== currentUserId) {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez pointer que pour vous-même.",
        variant: "destructive",
      });
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      let response;
      if (user.isClockedIn) {
        // Clocking out
        response = await clockOut();
        if (response.success) {
          const now = new Date();
          setUsers(users.map(u => {
            if (u.id === userId) {
              const updatedEntries = [...u.timeEntries];
              const lastEntry = updatedEntries[updatedEntries.length - 1];
              if (lastEntry && !lastEntry.clockOut) {
                lastEntry.clockOut = now;
              }
              return { 
                ...u, 
                isClockedIn: false,
                timeEntries: updatedEntries
              };
            }
            return u;
          }));
          toast({
            title: "Pointage de sortie réussi",
            description: `Vous avez pointé votre sortie à ${format(now, 'HH:mm')}`,
          });
          // Recharger les données pour obtenir les données à jour du serveur
          const refreshResponse = await getUsersTodayClocks();
          if (refreshResponse.success) {
            const results = refreshResponse.data?.results ?? [];
            const mappedUsers = mapUsersFromResponse(results);
            setUsers(mappedUsers);
          }
        } else {
          toast({
            title: "Erreur de pointage",
            description: response.error?.message || "Impossible de pointer la sortie.",
            variant: "destructive",
          });
        }
      } else {
        // Clocking in
        response = await clockIn();
        if (response.success) {
          const clockInTime = response.data?.clock_in_time 
            ? new Date(response.data.clock_in_time) 
            : new Date();
          
          toast({
            title: "Pointage d'entrée réussi",
            description: `Vous avez pointé votre entrée à ${format(clockInTime, 'HH:mm')}`,
          });
          // Recharger les données pour obtenir les données à jour du serveur
          const refreshResponse = await getUsersTodayClocks();
          if (refreshResponse.success) {
            const results = refreshResponse.data?.results ?? [];
            const mappedUsers = mapUsersFromResponse(results);
            setUsers(mappedUsers);
          }
        } else {
          // Gérer le cas où un pointage est déjà en cours
          const errorData = response.error || response.data;
          const message = errorData?.message || "Impossible de pointer l'entrée.";
          const existingClockInTime = errorData?.clock_in_time;
          
          if (existingClockInTime) {
            const clockInDate = new Date(existingClockInTime);
            toast({
              title: "Pointage déjà en cours",
              description: `Un pointage est déjà en cours depuis ${format(clockInDate, 'HH:mm')}. ${message}`,
              variant: "default",
            });
            // Recharger les données pour synchroniser l'état
            const refreshResponse = await getUsersTodayClocks();
            if (refreshResponse.success) {
              const results = refreshResponse.data?.results ?? [];
              const mappedUsers = mapUsersFromResponse(results);
              setUsers(mappedUsers);
            }
          } else {
            toast({
              title: "Erreur de pointage",
              description: message,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du pointage.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    });
    navigate("/");
  };

  const clockedInCount = users.filter(u => u.isClockedIn).length;
  const totalUsers = users.length;
  const currentUser = users.find(u => u.id === currentUserId);

  // Trier les utilisateurs pour mettre l'utilisateur connecté en premier
  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white text-black shadow-md py-4 px-6 flex items-center justify-between">
        {/* <h1 className="text-2xl font-bold">Clinique Valeo</h1> */}
        <img src={logo} alt="Clinique Valeo" className="w-36" />
        <div className="flex items-center gap-4">
          {currentUser && (
            <span className="text-sm">
              {currentUser.firstName} {currentUser.lastName}
            </span>
          )}
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-white button_logo_color"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Banner */}
      {/* <div className="bg-[#52b033] text-banner-foreground py-6 text-center">
        <h2 className="text-3xl font-semibold">Clinique Valeo</h2>
      </div> */}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Informations generales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">Status:</p>
                  <p className="text-base font-medium">
                    {clockedInCount} de {totalUsers} utilisateurs connectés
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Users */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedUsers.map((user) => (
                <UserCard
                  key={user.id}
                  id={user.id}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  isClockedIn={user.isClockedIn}
                  timeEntries={user.timeEntries}
                  isCurrentUser={user.id === currentUserId}
                  onToggleClock={handleToggleClock}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
