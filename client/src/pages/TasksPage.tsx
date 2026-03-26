import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Task } from "@shared/schema";

type Status = "done" | "in progress" | "closed";

const STATUS_CONFIG: Record<Status, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  "done": { label: "Done", icon: CheckCircle2, color: "text-[#22c55e]", bg: "bg-[#22c55e33]" },
  "in progress": { label: "In Progress", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20" },
  "closed": { label: "Closed", icon: XCircle, color: "text-red-400", bg: "bg-red-500/20" },
};

const STATUS_CYCLE: Record<Status, Status> = {
  "done": "in progress",
  "in progress": "closed",
  "closed": "done",
};

const ALL_STATUSES: Status[] = ["done", "in progress", "closed"];

export const TasksPage = (): JSX.Element => {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { data: tasks = [], isLoading } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; status: Status; order: number }) =>
      apiRequest("POST", "/api/tasks", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Task> & { id: string }) =>
      apiRequest("PATCH", `/api/tasks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  const submitNew = async () => {
    if (!newTitle.trim()) return;
    await createMutation.mutateAsync({ title: newTitle.trim(), status: "in progress", order: tasks.length + 1 });
    setNewTitle("");
    setAdding(false);
  };

  const counts = {
    all: tasks.length,
    done: tasks.filter(t => t.status === "done").length,
    "in progress": tasks.filter(t => t.status === "in progress").length,
    closed: tasks.filter(t => t.status === "closed").length,
  };

  return (
    <div className="flex flex-col h-full px-6 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-semibold [font-family:'Inter',Helvetica]">Tasks</h1>
        <Button
          data-testid="add-task-btn"
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-white"
          style={{ background: "linear-gradient(180deg,#E97334,#CC4130)" }}
        >
          <Plus size={16} />
          New Task
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {[{ key: "all", label: "Total" }, { key: "in progress", label: "In Progress" }, { key: "done", label: "Done" }, { key: "closed", label: "Closed" }].map(({ key, label }) => (
          <button
            key={key}
            data-testid={`filter-${key}`}
            onClick={() => setFilter(key as Status | "all")}
            className="flex flex-col gap-1 p-4 rounded-xl text-left transition-all"
            style={{
              background: filter === key ? "rgba(233,115,52,0.2)" : "rgba(255,255,255,0.05)",
              border: filter === key ? "1px solid #E97334" : "1px solid transparent",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="text-2xl font-bold text-white [font-family:'Inter',Helvetica]">{counts[key as keyof typeof counts]}</span>
            <span className="text-white/50 text-sm [font-family:'Inter',Helvetica]">{label}</span>
          </button>
        ))}
      </div>

      {/* Add task input */}
      {adding && (
        <div className="flex gap-2 items-center">
          <Input
            data-testid="new-task-input"
            autoFocus
            placeholder="Task title..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submitNew(); if (e.key === "Escape") { setAdding(false); setNewTitle(""); } }}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Button
            data-testid="save-task-btn"
            onClick={submitNew}
            disabled={createMutation.isPending}
            style={{ background: "linear-gradient(180deg,#E97334,#CC4130)" }}
          >Save</Button>
          <Button variant="ghost" className="text-white/50" onClick={() => { setAdding(false); setNewTitle(""); }}>Cancel</Button>
        </div>
      )}

      {/* Task list */}
      <div
        className="flex-1 rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}
      >
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_140px_80px] px-5 py-3 border-b border-white/10">
          <span className="text-white/40 text-xs uppercase tracking-wider [font-family:'Inter',Helvetica]">Task</span>
          <span className="text-white/40 text-xs uppercase tracking-wider [font-family:'Inter',Helvetica]">Status</span>
          <span className="text-white/40 text-xs uppercase tracking-wider [font-family:'Inter',Helvetica] text-right">Actions</span>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-white/30 [font-family:'Inter',Helvetica]">Loading...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <span className="text-white/30 text-lg [font-family:'Inter',Helvetica]">No tasks</span>
              <span className="text-white/20 text-sm [font-family:'Inter',Helvetica]">Add a new task to get started</span>
            </div>
          ) : (
            filtered.map((task, idx) => {
              const cfg = STATUS_CONFIG[task.status as Status];
              const Icon = cfg.icon;
              return (
                <div
                  key={task.id}
                  data-testid={`task-row-${task.id}`}
                  className="grid grid-cols-[1fr_140px_80px] items-center px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/20 text-sm w-5 [font-family:'Inter',Helvetica]">{idx + 1}</span>
                    <span className="text-white text-sm [font-family:'Inter',Helvetica]">{task.title}</span>
                  </div>
                  <button
                    data-testid={`status-badge-${task.id}`}
                    onClick={() => updateMutation.mutate({ id: task.id, status: STATUS_CYCLE[task.status as Status] })}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs w-fit transition-all ${cfg.bg} ${cfg.color} hover:opacity-80`}
                  >
                    <Icon size={12} />
                    {cfg.label}
                  </button>
                  <div className="flex justify-end">
                    <button
                      data-testid={`delete-task-${task.id}`}
                      onClick={() => deleteMutation.mutate(task.id)}
                      className="opacity-30 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} color="white" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
