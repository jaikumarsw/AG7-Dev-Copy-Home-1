import { DashboardMainSection } from "./sections/DashboardMainSection";

export const Home = (): JSX.Element => {
  return (
    <div className="bg-[#0f0f0f] w-full min-w-[1440px] min-h-[1031px] relative overflow-hidden">
      {/* Decorative bottom-left SVG */}
      <img
        className="absolute left-[25px] bottom-11 w-16 h-[120px] z-0"
        alt="Container"
        src="/figmaAssets/container.svg"
      />

      {/* Decorative top-left SVG */}
      <img
        className="absolute top-6 left-[15px] w-16 h-[440px] z-0"
        alt="Frame"
        src="/figmaAssets/frame-2147227773.svg"
      />

      {/* Orange glow effect */}
      <div className="absolute top-9 left-[calc(50.00%_-_156px)] w-[100px] h-[100px] bg-[#ff7439] rounded-[50px] blur-[100px] z-0 pointer-events-none" />

      {/* Main layout */}
      <div className="flex w-full min-h-[1031px] relative z-10">
        {/* Top nav + main content */}
        <div className="flex flex-col flex-1">
          {/* Top navigation bar */}
          <header className="flex w-full items-center justify-between px-6 py-6 h-[72px]">
            {/* Left: Logo/Frame */}
            <img
              className="flex-[0_0_auto]"
              alt="Frame"
              src="/figmaAssets/frame-2147227759.svg"
            />

            {/* Center: Search bar */}
            <div className="flex w-[400px] items-center gap-2 px-4 py-3 bg-[#ffffff1a] rounded-[100px] shadow-[inset_0px_0px_6px_#ffffff40]">
              <img
                className="w-6 h-6 flex-shrink-0"
                alt="Lets icons search"
                src="/figmaAssets/lets-icons-search-alt.svg"
              />
              <span className="opacity-50 [font-family:'Inter',Helvetica] font-normal text-white text-base tracking-[0] leading-[normal] whitespace-nowrap">
                Enter your search request
              </span>
            </div>

            {/* Right: User controls */}
            <img
              className="flex-[0_0_auto]"
              alt="Frame"
              src="/figmaAssets/frame-2147227760.svg"
            />
          </header>

          {/* Main dashboard content */}
          <main className="flex-1">
            <DashboardMainSection />
          </main>
        </div>
      </div>
    </div>
  );
};
