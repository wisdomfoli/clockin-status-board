import { Clock } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface TimeSessionProps {
  clockIn: Date;
  clockOut?: Date;
}

const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const TimeSession = ({ clockIn, clockOut }: TimeSessionProps) => {
  const [currentDuration, setCurrentDuration] = useState<string>("");

  useEffect(() => {
    if (!clockOut) {
      // Si la session est en cours, mettre à jour la durée toutes les secondes
      const updateDuration = () => {
        const now = new Date();
        const duration = now.getTime() - clockIn.getTime();
        setCurrentDuration(formatDuration(duration));
      };

      updateDuration();
      const interval = setInterval(updateDuration, 1000);

      return () => clearInterval(interval);
    } else {
      // Si la session est terminée, calculer la durée une seule fois
      const duration = clockOut.getTime() - clockIn.getTime();
      setCurrentDuration(formatDuration(duration));
    }
  }, [clockIn, clockOut]);

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
      <span className="text-muted-foreground ml-1">
        ({currentDuration})
      </span>
    </div>
  );
};

export default TimeSession;
