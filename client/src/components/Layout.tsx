import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <div className="bg-[#0f0f0f] w-full min-w-[1440px] min-h-screen relative overflow-hidden flex">
      {/* Decorative bottom-left SVG */}
      <img
        className="absolute left-[25px] bottom-11 w-16 h-[120px] z-0 pointer-events-none"
        alt=""
        src="/figmaAssets/container.svg"
        style={{ opacity: 0 }}
      />

      {/* Orange glow effect */}
      <div className="absolute top-9 left-[calc(50%_-_156px)] w-[100px] h-[100px] bg-[#ff7439] rounded-[50px] blur-[100px] z-0 pointer-events-none" />

      {/* Sidebar */}
      <div className="relative z-10 flex-shrink-0 w-16 min-h-screen flex flex-col">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};
