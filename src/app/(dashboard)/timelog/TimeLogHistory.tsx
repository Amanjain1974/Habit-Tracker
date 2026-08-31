"use client";

import { TimeLog } from "@prisma/client";
import { format } from "date-fns";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTimeLog } from "@/actions/timelog.actions";

export default function TimeLogHistory({ logs }: { logs: TimeLog[] }) {
  
  const handleDelete = async (id: string) => {
    if(confirm("Delete this log?")) {
      await deleteTimeLog(id);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" /> Recent Sessions
      </h2>
      
      <div className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No time logged yet.</p>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg bg-background group">
              <div>
                <p className="font-medium text-sm">{log.activity}</p>
                <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                  <span className="bg-muted px-1.5 py-0.5 rounded">{log.category || "Uncategorized"}</span>
                  <span>{log.duration} mins</span>
                  <span>{format(new Date(log.startTime), "MMM d, h:mm a")}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(log.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
