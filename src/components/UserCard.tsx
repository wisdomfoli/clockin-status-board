import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlarmClockCheck, AlarmClockOff, Clock, LogIn, LogOut, PauseCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TimeSession from "./TimeSession";

export interface TimeEntry {
  clockIn: Date;
  clockOut?: Date;
}

interface UserCardProps {
  id: string;
  firstName: string;
  lastName: string;
  isClockedIn: boolean;
  timeEntries: TimeEntry[];
  isCurrentUser: boolean;
  onToggleClock: (id: string, action: "in" | "out") => void;
}

const UserCard = ({
  id,
  firstName,
  lastName,
  isClockedIn,
  timeEntries,
  isCurrentUser,
  onToggleClock,
}: UserCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  return (
    <div
      className={cn(
        "relative bg-card border-2 rounded-lg p-4 transition-all duration-300 flex flex-col",
        isClockedIn ? "border-success" : "border-border",
        isHovered && isCurrentUser && "shadow-md",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback
            className={cn(
              "text-lg font-semibold",
              isClockedIn
                ? "bg-success text-success-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {initials} 
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="font-medium text-card-foreground">
            {firstName} {lastName}
            {isCurrentUser && (
              <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">
                Vous
              </span>
            )}
          </h3>
          <p
            className={cn(
              "text-sm font-medium",
              isClockedIn ? "text-success" : "text-muted-foreground"
            )}
          >
            {isClockedIn ? "En service" : "Hors service"}
          </p>
        </div>
      </div>

      {/* Sessions du jour */}
      {timeEntries.length > 0 && (
        <div className={cn(
          "pl-2 space-y-1",
          isCurrentUser && "flex-1"
        )}>
          <p className="text-xs text-muted-foreground my-2">
            Sessions du jour :
          </p>
          {timeEntries.map((entry, index) => (
            <TimeSession
              key={index}
              clockIn={entry.clockIn}
              clockOut={entry.clockOut}
            />
          ))}
        </div>
      )}

      {/* Boutons Clock In/Out */}
      {isCurrentUser && (
        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border">
          <Button
            size="icon"
            variant="ghost"
            disabled={isClockedIn}
            onClick={() => onToggleClock(id, "in")}
            className={cn(
              "h-9 w-9 rounded-full transition-all",
              !isClockedIn
                ? "hover:bg-green-100 hover:text-green-600"
                : "opacity-40 cursor-not-allowed"
            )}
            title="Clock In"
          >
            <AlarmClockCheck className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            disabled={!isClockedIn}
            onClick={() => onToggleClock(id, "out")}
            className={cn(
              "h-9 w-9 rounded-full transition-all",
              isClockedIn
                ? "hover:bg-red-100 hover:text-red-600"
                : "opacity-40 cursor-not-allowed"
            )}
            title="Clock Out"
          >
            <AlarmClockOff className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserCard;
