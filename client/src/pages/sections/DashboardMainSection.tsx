import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { CalendarEvent, Task, MainGoal, Note, LifeArea, Metrics } from "@shared/schema";

// Time slots shown in the calendar (hour values)
const TIME_SLOT_HOURS = [8, 12, 16, 20];
const TIME_SLOT_LABELS = ["8:00 am", "12:00 pm", "04:00 pm", "08:00 pm"];

const EVENT_COLORS = ["#ff7539", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#eab308"];

const STATUS_CYCLE: Record<string, string> = {
  "done": "in progress",
  "in progress": "closed",
  "closed": "done",
};
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "done": { bg: "bg-[#22c55e33]", color: "text-[#21c55e]" },
  "in progress": { bg: "bg-[#3b82f633]", color: "text-blue-500" },
  "closed": { bg: "bg-[#ee444433]", color: "text-[#ee4444]" },
};

// Get Monday of the week containing `date`
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Generate 7 days starting from `start`
function getWeekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatWeekHeader(start: Date): string {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return start.toLocaleDateString("en-US", { month: "long", day: "numeric" }) +
    " – " +
    end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function dayAbbr(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

// Build an ISO datetime string from a date and an hour (0–23)
function makeDateTime(dateStr: string, hour: number): string {
  return `${dateStr}T${String(hour).padStart(2, "0")}:00:00.000Z`;
}

export const DashboardMainSection = (): JSX.Element => {
  const { toast } = useToast();

  // ── Week navigation ──────────────────────────────────────────────────────────
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOfWeek(new Date()));
  const weekDays = getWeekDays(weekStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  // ── Calendar events ──────────────────────────────────────────────────────────
  const { data: allEvents = [] } = useQuery<CalendarEvent[]>({ queryKey: ["/api/calendar-events"] });

  const weekDayStrings = weekDays.map(isoDate);
  const weekEvents = allEvents.filter((e) => weekDayStrings.includes(e.startAt.split("T")[0]));

  const createEventMutation = useMutation({
    mutationFn: (data: Omit<CalendarEvent, "id">) => apiRequest("POST", "/api/calendar-events", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] }),
  });
  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<CalendarEvent> & { id: string }) =>
      apiRequest("PATCH", `/api/calendar-events/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] }),
  });
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/calendar-events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] }),
  });

  const [eventDialog, setEventDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    startAt?: string;
    endAt?: string;
    event?: CalendarEvent;
  }>({ open: false, mode: "create" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", color: "#ff7539" });

  const openCreateEvent = (dateStr: string, hour: number) => {
    const startAt = makeDateTime(dateStr, hour);
    const endAt = makeDateTime(dateStr, hour + 1);
    setEventForm({ title: "", description: "", color: "#ff7539" });
    setEventDialog({ open: true, mode: "create", startAt, endAt });
  };

  const openEditEvent = (event: CalendarEvent) => {
    setEventForm({ title: event.title, description: event.description, color: event.color });
    setEventDialog({ open: true, mode: "edit", event });
  };

  const saveEvent = async () => {
    if (!eventForm.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (eventDialog.mode === "create" && eventDialog.startAt && eventDialog.endAt) {
      await createEventMutation.mutateAsync({
        title: eventForm.title,
        description: eventForm.description,
        startAt: eventDialog.startAt,
        endAt: eventDialog.endAt,
        color: eventForm.color,
      });
    } else if (eventDialog.mode === "edit" && eventDialog.event) {
      await updateEventMutation.mutateAsync({
        id: eventDialog.event.id,
        title: eventForm.title,
        description: eventForm.description,
        color: eventForm.color,
      });
    }
    setEventDialog({ open: false, mode: "create" });
  };

  // Map events to [dayIndex][slotIndex]
  const eventGrid: Record<number, Record<number, CalendarEvent[]>> = {};
  weekDays.forEach((_, di) => {
    eventGrid[di] = {};
    TIME_SLOT_HOURS.forEach((_, si) => { eventGrid[di][si] = []; });
  });
  weekEvents.forEach((ev) => {
    const evDate = ev.startAt.split("T")[0];
    const dayIdx = weekDayStrings.indexOf(evDate);
    if (dayIdx < 0) return;
    const evHour = new Date(ev.startAt).getUTCHours();
    // Find nearest slot
    let slotIdx = 0;
    for (let s = 0; s < TIME_SLOT_HOURS.length; s++) {
      if (evHour >= TIME_SLOT_HOURS[s]) slotIdx = s;
    }
    eventGrid[dayIdx][slotIdx].push(ev);
  });

  // ── Tasks ────────────────────────────────────────────────────────────────────
  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });

  const createTaskMutation = useMutation({
    mutationFn: (data: Omit<Task, "id">) => apiRequest("POST", "/api/tasks", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Task> & { id: string }) =>
      apiRequest("PATCH", `/api/tasks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });

  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const cycleTaskStatus = (task: Task) => {
    const next = STATUS_CYCLE[task.status] ?? "in progress";
    updateTaskMutation.mutate({ id: task.id, status: next });
  };

  const submitNewTask = async () => {
    if (!newTaskTitle.trim()) return;
    await createTaskMutation.mutateAsync({
      title: newTaskTitle.trim(),
      status: "in progress",
      order: tasks.length + 1,
    });
    setNewTaskTitle("");
    setAddTaskOpen(false);
  };

  const doneCount = tasks.filter((t) => t.status === "done").length;

  // ── Main Goal ────────────────────────────────────────────────────────────────
  const { data: mainGoalData } = useQuery<MainGoal | null>({ queryKey: ["/api/main-goal"] });

  const updateGoalMutation = useMutation({
    mutationFn: (text: string) => apiRequest("PUT", "/api/main-goal", { text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/main-goal"] }),
  });

  const [goalEditing, setGoalEditing] = useState(false);
  const [goalText, setGoalText] = useState("");

  const startGoalEdit = () => {
    setGoalText(mainGoalData?.text ?? "");
    setGoalEditing(true);
  };
  const saveGoal = async () => {
    if (goalText.trim()) {
      await updateGoalMutation.mutateAsync(goalText.trim());
    }
    setGoalEditing(false);
  };

  // ── Notes ────────────────────────────────────────────────────────────────────
  const { data: notes = [] } = useQuery<Note[]>({ queryKey: ["/api/notes"] });

  const createNoteMutation = useMutation({
    mutationFn: (data: Omit<Note, "id">) => apiRequest("POST", "/api/notes", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notes"] }),
  });
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notes"] }),
  });

  const [notesOpen, setNotesOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");

  const submitNote = async () => {
    if (!newNoteText.trim()) return;
    await createNoteMutation.mutateAsync({
      content: newNoteText.trim(),
      createdAt: new Date().toISOString(),
    });
    setNewNoteText("");
  };

  // ── Life Areas ───────────────────────────────────────────────────────────────
  const { data: lifeAreas = [] } = useQuery<LifeArea[]>({ queryKey: ["/api/life-areas"] });

  const updateLifeAreaMutation = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      apiRequest("PATCH", `/api/life-areas/${id}`, { progress }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/life-areas"] }),
  });

  const progressBarRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const draggingAreaId = useRef<string | null>(null);

  const calcProgress = (el: HTMLDivElement, clientX: number): number => {
    const rect = el.getBoundingClientRect();
    return Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, area: LifeArea) => {
      const el = progressBarRefs.current[area.id];
      if (!el) return;
      updateLifeAreaMutation.mutate({ id: area.id, progress: calcProgress(el, e.clientX) });
    },
    [updateLifeAreaMutation]
  );

  const handleProgressPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, area: LifeArea) => {
      const el = progressBarRefs.current[area.id];
      if (!el) return;
      draggingAreaId.current = area.id;
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      updateLifeAreaMutation.mutate({ id: area.id, progress: calcProgress(el, e.clientX) });
    },
    [updateLifeAreaMutation]
  );

  const handleProgressPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, area: LifeArea) => {
      if (draggingAreaId.current !== area.id) return;
      const el = progressBarRefs.current[area.id];
      if (!el) return;
      updateLifeAreaMutation.mutate({ id: area.id, progress: calcProgress(el, e.clientX) });
    },
    [updateLifeAreaMutation]
  );

  const handleProgressPointerUp = useCallback(() => {
    draggingAreaId.current = null;
  }, []);

  // ── Metrics ──────────────────────────────────────────────────────────────────
  const { data: metricsData } = useQuery<Metrics | null>({ queryKey: ["/api/metrics"] });

  const updateMetricsMutation = useMutation({
    mutationFn: (data: Partial<Metrics>) => apiRequest("PATCH", "/api/metrics", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/metrics"] }),
  });

  const [editTimeSaved, setEditTimeSaved] = useState(false);
  const [timeSavedInput, setTimeSavedInput] = useState("");
  const [editAvgTask, setEditAvgTask] = useState(false);
  const [avgTaskInput, setAvgTaskInput] = useState("");

  const saveTimeSaved = () => {
    const val = parseInt(timeSavedInput, 10);
    if (!isNaN(val) && val >= 0) updateMetricsMutation.mutate({ timeSavedHours: val });
    setEditTimeSaved(false);
  };

  const saveAvgTask = () => {
    const val = parseInt(avgTaskInput, 10);
    if (!isNaN(val) && val >= 0) updateMetricsMutation.mutate({ avgTaskSeconds: val });
    setEditAvgTask(false);
  };

  return (
    <div className="flex flex-col w-full items-start gap-4 relative">
      {/* ── Row 1 ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">

        {/* Calendar Card */}
        <div className="flex flex-col w-[856px] items-start gap-2.5 p-6 relative bg-[#0a0701] rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="flex flex-col w-full items-start gap-[42px] relative flex-[0_0_auto]">

            {/* Week navigation */}
            <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
              <button
                data-testid="button-prev-week"
                onClick={prevWeek}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ffffff1a] rounded-[100px] shadow-[inset_0px_0px_6px_#ffffff40] cursor-pointer hover:bg-[#ffffff2a] transition-colors"
              >
                <span className="opacity-90 font-normal text-white text-sm">Last Week</span>
              </button>

              <div className="font-medium text-white text-base">
                {formatWeekHeader(weekStart)}
              </div>

              <button
                data-testid="button-next-week"
                onClick={nextWeek}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ffffff1a] rounded-[100px] shadow-[inset_0px_0px_6px_#ffffff40] cursor-pointer hover:bg-[#ffffff2a] transition-colors"
              >
                <span className="opacity-90 font-normal text-white text-sm">Next Week</span>
              </button>
            </div>

            {/* Calendar grid */}
            <div className="flex flex-col w-full gap-2">
              {/* Day headers */}
              <div className="flex">
                <div className="w-[76px] flex-shrink-0" />
                {weekDays.map((d, i) => {
                  const isToday = isoDate(d) === isoDate(today);
                  return (
                    <div
                      key={i}
                      className={`flex-1 flex flex-col items-center font-normal text-white text-sm text-center leading-[20px] ${isToday ? "opacity-100" : "opacity-50"}`}
                    >
                      <span>{dayAbbr(d)}</span>
                      <span>{d.getDate()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Time slot rows */}
              {TIME_SLOT_HOURS.map((hour, slotIdx) => (
                <div key={slotIdx} className="flex items-start">
                  {/* Time label */}
                  <div className="w-[76px] flex-shrink-0 font-normal text-white text-xs opacity-70 pt-1 pr-2 text-right whitespace-nowrap">
                    {TIME_SLOT_LABELS[slotIdx]}
                  </div>
                  {/* Day columns */}
                  {weekDays.map((d, dayIdx) => {
                    const slotEvents = eventGrid[dayIdx]?.[slotIdx] ?? [];
                    return (
                      <div
                        key={dayIdx}
                        data-testid={`calendar-slot-${dayIdx}-${slotIdx}`}
                        onClick={() => openCreateEvent(isoDate(d), hour)}
                        className="flex-1 min-h-[36px] border-l border-[#ffffff10] cursor-pointer hover:bg-[#ffffff05] transition-colors relative"
                      >
                        {slotEvents.map((ev) => (
                          <div
                            key={ev.id}
                            data-testid={`calendar-event-${ev.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditEvent(ev);
                            }}
                            className="absolute inset-x-0.5 inset-y-0.5 rounded px-1 py-0.5 cursor-pointer overflow-hidden"
                            style={{ backgroundColor: ev.color }}
                          >
                            <div className="font-semibold text-white text-[10px] truncate">{ev.title}</div>
                            {ev.description && (
                              <div className="text-white text-[9px] opacity-70 truncate">{ev.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <img
            className="absolute right-6 bottom-6 w-8 h-8"
            alt="Frame"
            src="/figmaAssets/frame-2147227707.svg"
          />
        </div>

        {/* Areas of Life Card */}
        <div className="relative w-[423px] h-[348px] bg-[url(/figmaAssets/rectangle-40092.svg)] bg-[100%_100%]">
          <div className="flex flex-col w-[296px] h-[316px] items-center gap-9 px-0 py-4 absolute top-4 left-[111px] bg-[#ffffff1a] rounded-2xl backdrop-blur-xl">
            <div className="font-medium text-transparent text-[38px]">
              <span className="text-white">Areas </span>
              <span className="text-[#ffffff80]">of life</span>
            </div>

            <div className="flex flex-col w-[256px] items-start gap-8 relative flex-[0_0_auto]">
              {lifeAreas.map((area) => (
                <div key={area.id} className="flex flex-col items-center relative self-stretch w-full">
                  {/* Progress track — clickable */}
                  <div
                    ref={(el) => { progressBarRefs.current[area.id] = el; }}
                    data-testid={`progress-area-${area.id}`}
                    className="absolute top-[calc(50%_-_5px)] left-0 w-full h-2.5 cursor-pointer select-none touch-none"
                    onClick={(e) => handleProgressClick(e, area)}
                    onPointerDown={(e) => handleProgressPointerDown(e, area)}
                    onPointerMove={(e) => handleProgressPointerMove(e, area)}
                    onPointerUp={handleProgressPointerUp}
                    title={`${area.progress}% — click or drag to adjust`}
                  >
                    <div className="relative w-full h-full">
                      {/* Track */}
                      <div className="absolute top-[4px] left-0 w-full h-px bg-white opacity-30" />
                      {/* Fill */}
                      <div
                        className="absolute top-0 left-0 h-2.5 bg-[#ff7539] rounded-full opacity-80 transition-all duration-150"
                        style={{ width: `${area.progress}%` }}
                      />
                      {/* Dot */}
                      <div
                        className="absolute top-0 w-2.5 h-2.5 bg-white rounded-full shadow transition-all duration-150"
                        style={{ left: `calc(${area.progress}% - 5px)` }}
                      />
                    </div>
                  </div>

                  {/* Label pill */}
                  <div className="flex items-center justify-center gap-2.5 px-7 py-2 relative z-10 bg-[#0a0701] rounded-[100px] border border-solid border-[#ffffff80]">
                    <span className="font-normal text-white text-lg leading-[22px] whitespace-nowrap">
                      {area.label}
                    </span>
                  </div>
                  <div className="text-[#ffffff60] text-xs mt-1 z-10 relative">{area.progress}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2 ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">

        {/* Memory Card */}
        <div className="flex flex-col w-[527px] h-[523px] items-start gap-6 p-6 relative bg-[#0a0701] rounded-2xl overflow-hidden">
          <div className="absolute top-[-70px] left-[calc(50.00%_-_148px)] w-[100px] h-[100px] bg-[#ff7439] rounded-[50px] blur-[100px]" />

          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="font-bold text-[#e8e6e3] text-xl leading-7 whitespace-nowrap">Memory</h2>
            <img className="w-6 h-6" alt="Button menu" src="/figmaAssets/button-menu.svg" />
          </div>

          <div className="flex flex-col items-start gap-4 relative flex-1 self-stretch w-full grow">
            {/* Documents section */}
            <div className="flex flex-col items-start gap-6 pt-3 pb-0 px-3 relative flex-1 self-stretch w-full grow bg-[#ffffff1a] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                <span className="opacity-90 font-medium text-white text-base leading-5 whitespace-nowrap">
                  Documents
                </span>
                <button
                  data-testid="button-notes-more"
                  onClick={() => setNotesOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-1 bg-[#ffffff1a] rounded-[100px] shadow-[inset_0px_0px_6px_#ffffff40] hover:bg-[#ffffff2a] transition-colors cursor-pointer"
                >
                  <span className="opacity-90 font-normal text-white text-sm">More</span>
                </button>
              </div>

              <div className="relative w-full h-[140px] overflow-hidden">
                <div className="inline-flex items-center gap-4">
                  <img className="w-[177px] h-[140px] object-cover" alt="Rectangle" src="/figmaAssets/rectangle-40095.png" />
                  <img className="w-[177px] h-[140px] object-cover" alt="Rectangle" src="/figmaAssets/rectangle-40095.png" />
                  <img className="w-[81px] h-[140px] object-cover" alt="Rectangle" src="/figmaAssets/rectangle-40095.png" />
                </div>
              </div>
            </div>

            {/* Main Goal section */}
            <div className="flex flex-col items-start gap-4 p-3 relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff1a] rounded-xl">
              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                <span className="opacity-90 font-medium text-white text-base leading-5 whitespace-nowrap">
                  Main Goal
                </span>
                <button
                  data-testid="button-edit-goal"
                  onClick={startGoalEdit}
                  className="hover:opacity-70 transition-opacity"
                >
                  <img className="w-[22px] h-[22px]" alt="Edit" src="/figmaAssets/frame-2147227700.svg" />
                </button>
              </div>

              {goalEditing ? (
                <div className="w-full flex flex-col gap-2">
                  <Textarea
                    data-testid="textarea-main-goal"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    className="w-full bg-[#ffffff0d] border-[#ffffff30] text-white text-sm leading-6 resize-none"
                    rows={5}
                  />
                  <div className="flex gap-2">
                    <Button
                      data-testid="button-save-goal"
                      size="sm"
                      onClick={saveGoal}
                      disabled={updateGoalMutation.isPending}
                      className="bg-[#ff763a] hover:bg-[#ff763a]/90 text-black"
                    >
                      Save
                    </Button>
                    <Button
                      data-testid="button-cancel-goal"
                      size="sm"
                      variant="ghost"
                      onClick={() => setGoalEditing(false)}
                      className="text-white hover:text-white hover:bg-[#ffffff1a]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p
                  data-testid="text-main-goal"
                  className="font-normal text-[#ffffff99] text-base leading-6 cursor-pointer hover:text-white transition-colors"
                  onClick={startGoalEdit}
                >
                  {mainGoalData?.text ?? "Click to set your main goal…"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Middle column: Time Saved + Average Task Time */}
        <div className="inline-flex flex-col items-start gap-4 relative self-stretch flex-[0_0_auto]">
          {/* Time Saved Card */}
          <div className="flex flex-col w-[307px] h-[123px] items-start gap-2.5 p-6 relative bg-[#0a0701] rounded-2xl overflow-hidden">
            <div className="flex flex-col w-[115px] items-start gap-1 relative flex-[0_0_auto] mb-[-11.00px]">
              <div className="font-medium text-white text-xl leading-7">Time Saved</div>
              {editTimeSaved ? (
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    data-testid="input-time-saved"
                    type="number"
                    value={timeSavedInput}
                    onChange={(e) => setTimeSavedInput(e.target.value)}
                    className="w-20 h-8 bg-[#ffffff0d] border-[#ffffff30] text-white text-lg"
                    onKeyDown={(e) => e.key === "Enter" && saveTimeSaved()}
                    autoFocus
                  />
                  <span className="text-white">h</span>
                  <button onClick={saveTimeSaved} className="text-[#ff7539] text-sm hover:underline ml-1">Save</button>
                </div>
              ) : (
                <button
                  data-testid="button-edit-time-saved"
                  onClick={() => {
                    setTimeSavedInput(String(metricsData?.timeSavedHours ?? 27));
                    setEditTimeSaved(true);
                  }}
                  className="font-medium text-white text-[45px] leading-[normal] hover:opacity-70 transition-opacity"
                >
                  {metricsData?.timeSavedHours ?? 27}h
                </button>
              )}
            </div>
            <img
              className="absolute top-0 right-[-15px] w-[110px] h-[94px] object-cover"
              alt="Screenshot"
              src="/figmaAssets/screenshot-2026-02-27-at-9-33-16-pm-1.png"
            />
          </div>

          {/* Average Task Time Card */}
          <div className="flex flex-col items-center gap-4 p-6 relative flex-1 self-stretch w-full grow rounded-2xl bg-[linear-gradient(180deg,rgba(67,28,16,1)_0%,rgba(10,7,1,1)_100%)]">
            <div className="font-bold text-[#e8e6e3] text-xl text-center leading-7">
              Average Task Time
            </div>

            <div className="relative w-[214px] h-[214px]">
              <div className="flex w-[115px] gap-0.5 absolute top-[65px] left-[54px] flex-col items-center">
                {editAvgTask ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <Input
                        data-testid="input-avg-task"
                        type="number"
                        value={avgTaskInput}
                        onChange={(e) => setAvgTaskInput(e.target.value)}
                        className="w-20 h-10 bg-[#ffffff0d] border-[#ffffff30] text-white text-2xl text-center"
                        onKeyDown={(e) => e.key === "Enter" && saveAvgTask()}
                        autoFocus
                      />
                      <span className="text-white text-sm">s</span>
                    </div>
                    <button onClick={saveAvgTask} className="text-[#ff7539] text-sm hover:underline">Save</button>
                  </div>
                ) : (
                  <button
                    data-testid="button-edit-avg-task"
                    onClick={() => {
                      setAvgTaskInput(String(metricsData?.avgTaskSeconds ?? 31));
                      setEditAvgTask(true);
                    }}
                    className="font-medium text-white text-[45px] text-center leading-[normal] hover:opacity-70 transition-opacity w-full"
                  >
                    {metricsData?.avgTaskSeconds ?? 31}s
                  </button>
                )}
                <div className="font-medium text-white text-xl text-center leading-7 w-full">Excellent</div>
              </div>

              <div className="absolute top-0 left-0 w-[214px] h-[214px]">
                <img className="absolute top-0 left-0 w-[214px] h-[190px]" alt="Ellipse" src="/figmaAssets/ellipse-7319.svg" />
                <img className="absolute top-0 left-0 w-[214px] h-[190px]" alt="Ellipse" src="/figmaAssets/ellipse-7320.svg" />
              </div>
            </div>

            <Button
              className="flex h-[49px] items-center justify-center gap-2.5 px-[67px] py-[3px] relative self-stretch w-full bg-[#ff763a] rounded-xl hover:bg-[#ff763a]/90 border-0"
              variant="default"
              data-testid="button-details"
            >
              <span className="font-semibold text-black text-xl leading-7 whitespace-nowrap">Details</span>
            </Button>
          </div>
        </div>

        {/* AI Assistant Card */}
        <div className="flex flex-col items-start justify-between p-6 relative flex-1 self-stretch grow bg-[#0a0701] rounded-2xl overflow-hidden">
          <img
            className="absolute top-[calc(50.00%_-_122px)] right-[-45px] w-[275px] h-[383px]"
            alt="Closeup shot white robots face"
            src="/figmaAssets/closeup-shot-white-robots-face-looking-directly-camera-1.png"
          />

          {/* Top section */}
          <div className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col h-[75px] items-start gap-2 relative self-stretch w-full">
              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                <h2 className="font-bold text-[#e8e6e3] text-xl leading-7 whitespace-nowrap">AI Assistant</h2>
                <img className="w-6 h-6" alt="Button menu" src="/figmaAssets/button-menu.svg" />
              </div>
              <div className="flex items-center justify-center gap-2.5 pl-0 pr-[100px] py-0 relative self-stretch w-full flex-[0_0_auto] mb-[-9.00px]">
                <p className="font-normal text-white text-base leading-6 flex-1">
                  A new analysis of achieving your goals has been prepared
                </p>
              </div>
            </div>

            <img className="w-full h-0.5" alt="Line" src="/figmaAssets/line-153-1.svg" />

            <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex gap-4 relative flex-[0_0_auto] flex-col items-start">
                {/* Goals Achieved header */}
                <div className="flex items-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
                  <span className="font-medium text-white text-xl leading-7 whitespace-nowrap">Goals Achieved</span>
                  <div
                    data-testid="badge-goals-achieved"
                    className="inline-flex items-center justify-center px-2.5 py-1 bg-[#ff763a] rounded-[100px]"
                  >
                    <span className="font-normal text-base leading-6 whitespace-nowrap text-white">
                      {doneCount}
                    </span>
                    <img className="w-4 h-4" alt="Arrow" src="/figmaAssets/solar-arrow-down-outline.svg" />
                  </div>
                </div>

                {/* Percentage stat */}
                <div className="inline-flex items-end gap-2 relative flex-[0_0_auto]">
                  <div className="inline-flex items-end gap-0.5 relative flex-[0_0_auto]">
                    <span
                      data-testid="text-goals-percent"
                      className="font-medium text-white text-[80px] leading-[70px] whitespace-nowrap"
                    >
                      {tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}
                    </span>
                    <span className="font-medium text-white text-2xl">%</span>
                  </div>
                  <span className="font-normal text-white text-base leading-6 whitespace-nowrap">
                    in one week
                  </span>
                </div>
              </div>

              <img className="flex-[0_0_auto] mb-[-6.00px]" alt="Frame" src="/figmaAssets/frame-2147227766.svg" />
            </div>
          </div>

          {/* Task list */}
          <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
            {tasks.map((task, idx) => {
              const style = STATUS_STYLE[task.status] ?? STATUS_STYLE["in progress"];
              return (
                <div
                  key={task.id}
                  data-testid={`task-row-${task.id}`}
                  className="flex items-center justify-between p-2 relative self-stretch w-full bg-[#161616] rounded-xl border border-solid border-[#ffffff0d]"
                >
                  <div className="flex items-center gap-3.5 relative flex-1 self-stretch grow">
                    <div className="flex w-16 items-center justify-center gap-2.5 p-1 bg-[#ffffff1a] rounded">
                      <span className="opacity-50 font-normal text-xs leading-[18px] whitespace-nowrap text-white">
                        {idx + 1}
                      </span>
                    </div>
                    <span className="font-normal text-[#d1d4db] text-xs leading-[15px] whitespace-nowrap">
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      data-testid={`badge-status-${task.id}`}
                      onClick={() => cycleTaskStatus(task)}
                      className={`w-[60px] justify-center gap-2.5 px-1.5 py-0.5 ${style.bg} rounded flex items-center cursor-pointer hover:opacity-80 transition-opacity`}
                      title="Click to cycle status"
                    >
                      <span className={`w-fit ${style.color} text-[8.8px] leading-[13px] whitespace-nowrap font-normal text-center`}>
                        {task.status}
                      </span>
                    </button>
                    <button
                      data-testid={`button-delete-task-${task.id}`}
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                      className="text-[#ffffff40] hover:text-[#ee4444] text-xs leading-none ml-1 transition-colors"
                      title="Delete task"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add task */}
            {addTaskOpen ? (
              <div className="flex items-center gap-2 w-full mt-1">
                <Input
                  data-testid="input-new-task"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitNewTask()}
                  placeholder="Task title…"
                  className="flex-1 h-8 bg-[#161616] border-[#ffffff1a] text-white text-xs"
                  autoFocus
                />
                <Button
                  data-testid="button-save-task"
                  size="sm"
                  onClick={submitNewTask}
                  disabled={createTaskMutation.isPending}
                  className="bg-[#ff763a] hover:bg-[#ff763a]/90 text-black h-8"
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAddTaskOpen(false)}
                  className="text-white hover:text-white hover:bg-[#ffffff1a] h-8"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                data-testid="button-add-task"
                onClick={() => setAddTaskOpen(true)}
                className="flex items-center gap-1 text-[#ffffff50] text-xs hover:text-white transition-colors mt-1"
              >
                <span>+ Add task</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Calendar Event Dialog ──────────────────────────────────────────────── */}
      <Dialog open={eventDialog.open} onOpenChange={(open) => !open && setEventDialog({ open: false, mode: "create" })}>
        <DialogContent className="bg-[#0a0701] border-[#ffffff20] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {eventDialog.mode === "create" ? "Add Event" : "Edit Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-[#ffffff80] mb-1 block">Title</label>
              <Input
                data-testid="input-event-title"
                value={eventForm.title}
                onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && saveEvent()}
                placeholder="Event title"
                className="bg-[#ffffff0d] border-[#ffffff30] text-white placeholder:text-[#ffffff40]"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-[#ffffff80] mb-1 block">Description</label>
              <Input
                data-testid="input-event-description"
                value={eventForm.description}
                onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                className="bg-[#ffffff0d] border-[#ffffff30] text-white placeholder:text-[#ffffff40]"
              />
            </div>
            <div>
              <label className="text-sm text-[#ffffff80] mb-2 block">Color</label>
              <div className="flex gap-2">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    data-testid={`button-color-${c.replace("#", "")}`}
                    onClick={() => setEventForm((f) => ({ ...f, color: c }))}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: c,
                      borderColor: eventForm.color === c ? "white" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            {eventDialog.mode === "edit" && (
              <Button
                data-testid="button-delete-event"
                variant="destructive"
                disabled={deleteEventMutation.isPending}
                onClick={async () => {
                  if (eventDialog.event) {
                    await deleteEventMutation.mutateAsync(eventDialog.event.id);
                  }
                  setEventDialog({ open: false, mode: "create" });
                }}
              >
                Delete
              </Button>
            )}
            <Button
              data-testid="button-save-event"
              onClick={saveEvent}
              className="bg-[#ff763a] hover:bg-[#ff763a]/90 text-black"
              disabled={createEventMutation.isPending || updateEventMutation.isPending}
            >
              {eventDialog.mode === "create" ? "Add Event" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Notes Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="bg-[#0a0701] border-[#ffffff20] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Notes</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
            {notes.length === 0 && (
              <p className="text-[#ffffff50] text-sm">No notes yet. Add one below.</p>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                data-testid={`note-${note.id}`}
                className="flex items-start gap-2 p-3 bg-[#ffffff0d] rounded-lg"
              >
                <p className="flex-1 text-white text-sm leading-5">{note.content}</p>
                <button
                  data-testid={`button-delete-note-${note.id}`}
                  onClick={() => deleteNoteMutation.mutate(note.id)}
                  disabled={deleteNoteMutation.isPending}
                  className="text-[#ffffff40] hover:text-[#ee4444] text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Textarea
              data-testid="textarea-new-note"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Write a note…"
              className="bg-[#ffffff0d] border-[#ffffff30] text-white placeholder:text-[#ffffff40] resize-none"
              rows={3}
            />
            <Button
              data-testid="button-add-note"
              onClick={submitNote}
              className="bg-[#ff763a] hover:bg-[#ff763a]/90 text-black"
              disabled={createNoteMutation.isPending}
            >
              Add Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
