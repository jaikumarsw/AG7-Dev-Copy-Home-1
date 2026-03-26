import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { CalendarEvent } from "@shared/schema";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = [
  { label: "8:00 am", hour: 8 }, { label: "10:00 am", hour: 10 },
  { label: "12:00 pm", hour: 12 }, { label: "2:00 pm", hour: 14 },
  { label: "4:00 pm", hour: 16 }, { label: "6:00 pm", hour: 18 },
  { label: "8:00 pm", hour: 20 },
];
const EVENT_COLORS = ["#ff7539", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#eab308"];

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDate(d: Date) { return d.toISOString().split("T")[0]; }
function makeISO(dateStr: string, hour: number) {
  return new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00Z`).toISOString();
}

function formatRelativeTime(iso: string): string {
  const m = new Date(iso);
  const h = m.getHours();
  const min = String(m.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${min} ${ampm}`;
}

export const CalendarPage = (): JSX.Element => {
  const { toast } = useToast();
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const weekDayStrs = weekDays.map(isoDate);

  const monthYear = weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const { data: allEvents = [] } = useQuery<CalendarEvent[]>({ queryKey: ["/api/calendar-events"] });
  const weekEvents = allEvents.filter(e => weekDayStrs.includes(e.startAt.split("T")[0]));

  const createMutation = useMutation({
    mutationFn: (data: Omit<CalendarEvent, "id">) => apiRequest("POST", "/api/calendar-events", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/calendar-events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] }),
  });

  const [dialog, setDialog] = useState<{ open: boolean; dateStr?: string; hour?: number; event?: CalendarEvent }>({ open: false });
  const [form, setForm] = useState({ title: "", description: "", color: "#ff7539" });

  const openCreate = (dateStr: string, hour: number) => {
    setForm({ title: "", description: "", color: "#ff7539" });
    setDialog({ open: true, dateStr, hour });
  };

  const save = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    if (dialog.dateStr && dialog.hour !== undefined) {
      await createMutation.mutateAsync({
        title: form.title, description: form.description, color: form.color,
        startAt: makeISO(dialog.dateStr, dialog.hour),
        endAt: makeISO(dialog.dateStr, dialog.hour + 1),
      });
    }
    setDialog({ open: false });
  };

  // Map events to grid [dayIdx][slotIdx]
  const grid: Record<number, Record<number, CalendarEvent[]>> = {};
  weekDays.forEach((_, di) => {
    grid[di] = {};
    TIME_SLOTS.forEach((_, si) => { grid[di][si] = []; });
  });
  weekEvents.forEach(ev => {
    const di = weekDayStrs.indexOf(ev.startAt.split("T")[0]);
    if (di < 0) return;
    const evHour = new Date(ev.startAt).getUTCHours();
    let si = 0;
    for (let s = 0; s < TIME_SLOTS.length; s++) { if (evHour >= TIME_SLOTS[s].hour) si = s; }
    grid[di][si].push(ev);
  });

  const today = isoDate(new Date());

  return (
    <div className="flex flex-col h-full px-6 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-2xl font-semibold [font-family:'Inter',Helvetica]">Calendar</h1>
          <span className="text-white/50 text-sm [font-family:'Inter',Helvetica]">{monthYear}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="calendar-prev-week"
            onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={16} color="white" />
          </button>
          <button
            data-testid="calendar-today"
            onClick={() => setWeekStart(getMondayOfWeek(new Date()))}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-sm [font-family:'Inter',Helvetica]"
          >
            Today
          </button>
          <button
            data-testid="calendar-next-week"
            onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={16} color="white" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="flex-1 rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}
      >
        {/* Day headers */}
        <div className="grid border-b border-white/10" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
          <div />
          {weekDays.map((d, i) => {
            const isToday = isoDate(d) === today;
            return (
              <div key={i} className="flex flex-col items-center py-3 gap-1">
                <span className="text-white/50 text-xs uppercase [font-family:'Inter',Helvetica]">{DAYS[i]}</span>
                <span
                  className={`text-base font-semibold [font-family:'Inter',Helvetica] flex items-center justify-center w-8 h-8 rounded-full ${
                    isToday ? "text-white" : "text-white/80"
                  }`}
                  style={isToday ? { background: "linear-gradient(180deg,#E97334,#CC4130)" } : {}}
                >
                  {d.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time rows */}
        <div className="flex-1 overflow-y-auto">
          {TIME_SLOTS.map((slot, si) => (
            <div
              key={si}
              className="grid border-b border-white/5"
              style={{ gridTemplateColumns: "80px repeat(7, 1fr)", minHeight: "80px" }}
            >
              <div className="flex items-start justify-end pr-3 pt-2">
                <span className="text-white/30 text-xs [font-family:'Inter',Helvetica]">{slot.label}</span>
              </div>
              {weekDays.map((d, di) => (
                <div
                  key={di}
                  data-testid={`calendar-cell-${isoDate(d)}-${slot.hour}`}
                  className="border-l border-white/5 p-1 cursor-pointer hover:bg-white/5 transition-colors relative"
                  onClick={() => openCreate(isoDate(d), slot.hour)}
                >
                  {grid[di][si].map(ev => (
                    <div
                      key={ev.id}
                      data-testid={`event-${ev.id}`}
                      onClick={e => { e.stopPropagation(); }}
                      className="rounded-lg px-2 py-1 mb-1 flex items-center justify-between group"
                      style={{ background: ev.color + "33", borderLeft: `3px solid ${ev.color}` }}
                    >
                      <div>
                        <div className="text-white text-xs font-medium [font-family:'Inter',Helvetica] truncate">{ev.title}</div>
                        <div className="text-white/50 text-xs [font-family:'Inter',Helvetica]">{formatRelativeTime(ev.startAt)}</div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteMutation.mutate(ev.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} color="white" />
                      </button>
                    </div>
                  ))}
                  <div className="absolute right-1 top-1 opacity-0 hover:opacity-100 transition-opacity">
                    <Plus size={12} color="rgba(255,255,255,0.4)" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white [font-family:'Inter',Helvetica]">New Event</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              data-testid="event-title-input"
              placeholder="Event title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
            <Input
              data-testid="event-desc-input"
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
            <div className="flex gap-2">
              {EVENT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-6 h-6 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: form.color === c ? "white" : "transparent" }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-white/60 hover:text-white" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button
              data-testid="event-save-btn"
              onClick={save}
              disabled={createMutation.isPending}
              style={{ background: "linear-gradient(180deg,#E97334,#CC4130)" }}
            >
              {createMutation.isPending ? "Saving..." : "Add Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
