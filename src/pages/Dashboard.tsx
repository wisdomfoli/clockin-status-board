import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserCard, { TimeEntry } from "@/components/UserCard";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  
  // Initialize users with some demo data showing Steve Jobs already has sessions
  const [users, setUsers] = useState<User[]>([
    { 
      id: "1", 
      firstName: "Warren", 
      lastName: "Buffet", 
      isClockedIn: false,
      timeEntries: []
    },
    { 
      id: "2", 
      firstName: "Bill", 
      lastName: "Gates", 
      isClockedIn: false,
      timeEntries: []
    },
    { 
      id: "3", 
      firstName: "Jason", 
      lastName: "Ho", 
      isClockedIn: false,
      timeEntries: []
    },
    { 
      id: "4", 
      firstName: "Steve", 
      lastName: "Jobs", 
      isClockedIn: true,
      timeEntries: [
        {
          clockIn: new Date(new Date().setHours(8, 0, 0, 0)),
          clockOut: new Date(new Date().setHours(14, 0, 0, 0))
        },
        {
          clockIn: new Date(new Date().setHours(15, 0, 0, 0)),
          clockOut: undefined
        }
      ]
    },
    { 
      id: "5", 
      firstName: "Donald", 
      lastName: "Trump", 
      isClockedIn: false,
      timeEntries: []
    },
    { 
      id: "6", 
      firstName: "Phone", 
      lastName: "User", 
      isClockedIn: false,
      timeEntries: []
    },
  ]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userId = localStorage.getItem("userId");
    
    if (!isAuthenticated || !userId) {
      navigate("/");
    } else {
      setCurrentUserId(userId);
    }
  }, [navigate]);

  const handleToggleClock = (userId: string) => {
    // Only allow users to clock themselves in/out
    if (userId !== currentUserId) {
      toast({
        title: "Action not allowed",
        description: "You can only clock in/out for yourself.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    
    setUsers(users.map(user => {
      if (user.id === userId) {
        if (user.isClockedIn) {
          // Clocking out - update the last entry with clock out time
          const updatedEntries = [...user.timeEntries];
          const lastEntry = updatedEntries[updatedEntries.length - 1];
          if (lastEntry && !lastEntry.clockOut) {
            lastEntry.clockOut = now;
          }
          return { 
            ...user, 
            isClockedIn: false,
            timeEntries: updatedEntries
          };
        } else {
          // Clocking in - add a new entry
          return { 
            ...user, 
            isClockedIn: true,
            timeEntries: [...user.timeEntries, { clockIn: now }]
          };
        }
      }
      return user;
    }));

    const user = users.find(u => u.id === userId);
    if (user) {
      toast({
        title: user.isClockedIn ? "Clocked Out" : "Clocked In",
        description: `Successfully ${user.isClockedIn ? 'clocked out' : 'clocked in'} at ${format(now, 'HH:mm')}`,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const clockedInCount = users.filter(u => u.isClockedIn).length;
  const totalUsers = users.length;
  const currentUser = users.find(u => u.id === currentUserId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-header text-header-foreground py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">clockspot</h1>
        <div className="flex items-center gap-4">
          {currentUser && (
            <span className="text-sm">
              {currentUser.firstName} {currentUser.lastName}
            </span>
          )}
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-header-foreground hover:bg-header/80"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-banner text-banner-foreground py-6 text-center">
        <h2 className="text-3xl font-semibold">Clockspot Demo.123</h2>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Info */}
          <div className="lg:col-span-1">
            <Card className="bg-info-panel border-info-panel">
              <CardHeader>
                <CardTitle className="text-lg">System Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">All passwords:</p>
                  <p className="text-xl font-bold">12345</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admin account:</p>
                  <p className="text-lg font-semibold">Jason</p>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">Status:</p>
                  <p className="text-base font-medium">
                    {clockedInCount} of {totalUsers} clocked in
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Users */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user) => (
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
