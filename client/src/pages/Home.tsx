import { DashboardMainSection } from "./sections/DashboardMainSection";

export const Home = (): JSX.Element => {
  return (
    <>
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
            alt="Search"
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
    </>
  );
};
