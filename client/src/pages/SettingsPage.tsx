import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, Bell, Palette, Shield, Globe, ChevronRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MainGoal } from "@shared/schema";

const ACCENT_COLORS = [
  { name: "Orange", value: "#E97334" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
];

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "language", label: "Language & Region", icon: Globe },
];

export const SettingsPage = (): JSX.Element => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("profile");
  const [profileName, setProfileName] = useState("Alex Morgan");
  const [profileEmail, setProfileEmail] = useState("alex@studio.com");
  const [accentColor, setAccentColor] = useState("#E97334");
  const [notifs, setNotifs] = useState({ email: true, push: true, reminders: false });
  const [language, setLanguage] = useState("English");

  const { data: mainGoalData } = useQuery<MainGoal | null>({ queryKey: ["/api/main-goal"] });
  const updateGoalMutation = useMutation({
    mutationFn: (text: string) => apiRequest("PUT", "/api/main-goal", { text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/main-goal"] }),
  });

  const [goalText, setGoalText] = useState("");
  const [goalEditing, setGoalEditing] = useState(false);

  const saveProfile = () => {
    toast({ title: "Profile saved", description: "Your profile has been updated." });
  };

  return (
    <div className="flex flex-col h-full px-6 py-6 gap-4">
      <h1 className="text-white text-2xl font-semibold [font-family:'Inter',Helvetica]">Settings</h1>

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Left nav */}
        <div
          className="w-56 flex-shrink-0 rounded-2xl p-2 flex flex-col gap-1"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}
        >
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              data-testid={`settings-nav-${id}`}
              onClick={() => setActiveSection(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
              style={{
                background: activeSection === id ? "rgba(233,115,52,0.15)" : "transparent",
                color: activeSection === id ? "#E97334" : "rgba(255,255,255,0.6)",
              }}
            >
              <Icon size={16} />
              <span className="text-sm [font-family:'Inter',Helvetica]">{label}</span>
              {activeSection === id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="flex-1 rounded-2xl p-6 overflow-y-auto"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}
        >
          {activeSection === "profile" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-white text-lg font-semibold [font-family:'Inter',Helvetica] mb-4">Profile</h2>
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold [font-family:'Inter',Helvetica]"
                    style={{ background: "linear-gradient(180deg,#E97334,#CC4130)" }}
                  >
                    {profileName.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium [font-family:'Inter',Helvetica]">{profileName}</p>
                    <p className="text-white/40 text-sm [font-family:'Inter',Helvetica]">{profileEmail}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider [font-family:'Inter',Helvetica] block mb-1.5">Full Name</label>
                    <input
                      data-testid="settings-name-input"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white [font-family:'Inter',Helvetica] text-sm outline-none focus:border-[#E97334] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider [font-family:'Inter',Helvetica] block mb-1.5">Email</label>
                    <input
                      data-testid="settings-email-input"
                      value={profileEmail}
                      onChange={e => setProfileEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white [font-family:'Inter',Helvetica] text-sm outline-none focus:border-[#E97334] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider [font-family:'Inter',Helvetica] block mb-1.5">Main Goal</label>
                    {goalEditing ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          data-testid="settings-goal-textarea"
                          value={goalText}
                          onChange={e => setGoalText(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white [font-family:'Inter',Helvetica] text-sm outline-none focus:border-[#E97334] transition-colors resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => { await updateGoalMutation.mutateAsync(goalText); setGoalEditing(false); toast({ title: "Goal updated" }); }}
                            className="px-4 py-2 rounded-lg text-white text-sm [font-family:'Inter',Helvetica]"
                            style={{ background: "linear-gradient(180deg,#E97334,#CC4130)" }}
                          >Save</button>
                          <button onClick={() => setGoalEditing(false)} className="px-4 py-2 rounded-lg text-white/50 text-sm [font-family:'Inter',Helvetica] bg-white/10">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white/60 [font-family:'Inter',Helvetica] text-sm cursor-pointer hover:border-white/20 transition-colors"
                        onClick={() => { setGoalText(mainGoalData?.text ?? ""); setGoalEditing(true); }}
                      >
                        {mainGoalData?.text ?? "Click to set your main goal..."}
                      </div>
                    )}
                  </div>
                  <button
                    data-testid="save-profile-btn"
                    onClick={saveProfile}
                    className="w-fit px-6 py-2.5 rounded-xl text-white text-sm [font-family:'Inter',Helvetica]"
                    style={{ background: "linear-gradient(180deg,#E97334,#CC4130)" }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <h2 className="text-white text-lg font-semibold [font-family:'Inter',Helvetica] mb-4">Notifications</h2>
              <div className="flex flex-col gap-3">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                  { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                  { key: "reminders", label: "Task Reminders", desc: "Reminder alerts for due tasks" },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-4 py-4 rounded-xl bg-white/5"
                  >
                    <div>
                      <p className="text-white text-sm [font-family:'Inter',Helvetica]">{label}</p>
                      <p className="text-white/40 text-xs [font-family:'Inter',Helvetica] mt-0.5">{desc}</p>
                    </div>
                    <button
                      data-testid={`toggle-${key}`}
                      onClick={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                      className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                      style={{ background: notifs[key as keyof typeof notifs] ? "linear-gradient(180deg,#E97334,#CC4130)" : "rgba(255,255,255,0.2)" }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                        style={{ left: notifs[key as keyof typeof notifs] ? "22px" : "2px" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div>
              <h2 className="text-white text-lg font-semibold [font-family:'Inter',Helvetica] mb-4">Appearance</h2>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider [font-family:'Inter',Helvetica] mb-3">Accent Color</p>
                <div className="flex gap-3">
                  {ACCENT_COLORS.map(({ name, value }) => (
                    <button
                      key={value}
                      data-testid={`accent-${name.toLowerCase()}`}
                      onClick={() => setAccentColor(value)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all"
                        style={{ background: value, borderColor: accentColor === value ? "white" : "transparent" }}
                      >
                        {accentColor === value && <Check size={16} color="white" strokeWidth={3} />}
                      </div>
                      <span className="text-white/40 text-xs [font-family:'Inter',Helvetica]">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "privacy" && (
            <div>
              <h2 className="text-white text-lg font-semibold [font-family:'Inter',Helvetica] mb-4">Privacy & Security</h2>
              <div className="flex flex-col gap-3">
                {["Change Password", "Two-Factor Authentication", "Active Sessions", "Delete Account"].map(item => (
                  <button
                    key={item}
                    className="flex items-center justify-between px-4 py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white text-sm [font-family:'Inter',Helvetica]">{item}</span>
                    <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === "language" && (
            <div>
              <h2 className="text-white text-lg font-semibold [font-family:'Inter',Helvetica] mb-4">Language & Region</h2>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider [font-family:'Inter',Helvetica] mb-3">Language</p>
                <div className="flex flex-col gap-2">
                  {["English", "Spanish", "French", "German", "Japanese"].map(lang => (
                    <button
                      key={lang}
                      data-testid={`lang-${lang.toLowerCase()}`}
                      onClick={() => setLanguage(lang)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                      style={{ background: language === lang ? "rgba(233,115,52,0.15)" : "rgba(255,255,255,0.05)" }}
                    >
                      <span className="text-white text-sm [font-family:'Inter',Helvetica]">{lang}</span>
                      {language === lang && <Check size={16} color="#E97334" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
