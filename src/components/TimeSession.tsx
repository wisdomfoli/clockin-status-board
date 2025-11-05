import { Clock } from "lucide-react";
import { format } from "date-fns";

interface TimeSessionProps {
  clockIn: Date;
  clockOut?: Date;
}

const TimeSession = ({ clockIn, clockOut }: TimeSessionProps) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="h-3 w-3 text-muted-foreground" />
      <span className="font-medium text-foreground">
        {format(clockIn, "HH:mm")}
      </span>
      <span className="text-muted-foreground">→</span>
      <span className="font-medium text-foreground">
        {clockOut ? format(clockOut, "HH:mm") : "..."}
      </span>
    </div>
  );
};

export default TimeSession;
