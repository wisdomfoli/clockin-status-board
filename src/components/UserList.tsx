import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserListProps {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  onClick?: () => void;
}

const UserList = ({ id, firstName, lastName, username, onClick}: UserListProps) => {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  return (
    <div
      className={cn(
        "relative bg-general-100 border-2 rounded-lg px-4 py-2 transition-all duration-300 cursor-pointer user_style",
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={cn(
              "text-lg font-semibold",
            )}>
              {initials.toLocaleUpperCase() ? initials : username.charAt(0).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-medium text-card-foreground">
              {firstName ? lastName + " " + firstName : username}
            </h3>
            {/* <p className={cn(
              "text-sm font-medium",
            )}>
              Connecté
            </p> */}
          </div>
        </div>

        {/* Time entries for today */}
        
      </div>
    </div>
  );
};

export default UserList;
