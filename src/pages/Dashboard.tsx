import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserCard from "@/components/UserCard";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  isClockedIn: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([
    { id: "1", firstName: "Warren", lastName: "Buffet", isClockedIn: false },
    { id: "2", firstName: "Bill", lastName: "Gates", isClockedIn: false },
    { id: "3", firstName: "Jason", lastName: "Ho", isClockedIn: false },
    { id: "4", firstName: "Steve", lastName: "Jobs", isClockedIn: true },
    { id: "5", firstName: "Donald", lastName: "Trump", isClockedIn: false },
    { id: "6", firstName: "Phone", lastName: "User", isClockedIn: false },
  ]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const handleToggleClock = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isClockedIn: !user.isClockedIn }
        : user
    ));

    const user = users.find(u => u.id === userId);
    if (user) {
      toast({
        title: user.isClockedIn ? "Clocked Out" : "Clocked In",
        description: `${user.firstName} ${user.lastName} has ${user.isClockedIn ? 'clocked out' : 'clocked in'}.`,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const clockedInCount = users.filter(u => u.isClockedIn).length;
  const totalUsers = users.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-header text-header-foreground py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">clockspot</h1>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="text-header-foreground hover:bg-header/80"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
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
