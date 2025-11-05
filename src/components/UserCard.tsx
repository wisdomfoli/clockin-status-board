import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserCardProps {
  id: string;
  firstName: string;
  lastName: string;
  isClockedIn: boolean;
  onToggleClock: (id: string) => void;
}

const UserCard = ({ id, firstName, lastName, isClockedIn, onToggleClock }: UserCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  return (
    <div
      className={cn(
        "relative bg-card border-2 rounded-lg p-4 transition-all duration-300",
        isClockedIn ? "border-accent shadow-md" : "border-border",
        isHovered && "shadow-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className={cn(
            "text-lg font-semibold",
            isClockedIn ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-medium text-card-foreground">
            {lastName}, {firstName}
          </h3>
          <p className={cn(
            "text-sm font-medium",
            isClockedIn ? "text-success" : "text-muted-foreground"
          )}>
            {isClockedIn ? "Clocked In" : "Clocked Out"}
          </p>
        </div>

        {isHovered && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
            <Button
              size="icon"
              variant={isClockedIn ? "destructive" : "default"}
              onClick={() => onToggleClock(id)}
              className="h-9 w-9"
            >
              {isClockedIn ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit User</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
