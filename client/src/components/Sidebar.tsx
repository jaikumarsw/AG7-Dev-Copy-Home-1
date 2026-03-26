import { useLocation } from "wouter";
import { Home, Calendar, LayoutGrid, MessageCircle, CheckSquare, Bot, Settings, LogOut } from "lucide-react";

const topNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: LayoutGrid, label: "Apps", path: "/apps" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Bot, label: "AI Assistant", path: "/ai" },
];

export const Sidebar = (): JSX.Element => {
  const [location, navigate] = useLocation();

  return (
    <div className="relative flex flex-col items-center w-16 min-h-full z-10 flex-shrink-0 py-6 gap-4">
      {/* Main nav pill */}
      <div
        className="flex flex-col items-center gap-2 py-3 px-2 rounded-[32px]"
        style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
      >
        {topNavItems.map(({ icon: Icon, label, path }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              data-testid={`sidebar-${label.toLowerCase().replace(" ", "-")}`}
              onClick={() => navigate(path)}
              title={label}
              className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:bg-white/10"
              style={
                isActive
                  ? { background: "linear-gradient(180deg, #E97334 0%, #CC4130 100%)" }
                  : {}
              }
            >
              <Icon size={22} color="white" strokeWidth={1.5} opacity={isActive ? 1 : 0.9} />
            </button>
          );
        })}
      </div>

      {/* Bottom pill */}
      <div
        className="flex flex-col items-center gap-2 py-3 px-2 rounded-[32px] mt-auto"
        style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
      >
        <button
          data-testid="sidebar-settings"
          title="Settings"
          onClick={() => navigate("/settings")}
          className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:bg-white/10"
          style={location === "/settings" ? { background: "linear-gradient(180deg,#E97334,#CC4130)" } : {}}
        >
          <Settings size={22} color="white" strokeWidth={1.5} opacity={0.9} />
        </button>
        <button
          data-testid="sidebar-logout"
          title="Logout"
          className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:bg-white/10"
        >
          <LogOut size={22} color="white" strokeWidth={1.5} opacity={0.9} />
        </button>
      </div>
    </div>
  );
};
