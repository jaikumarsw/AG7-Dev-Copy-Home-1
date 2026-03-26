import { Button } from "@/components/ui/button";

// Calendar day data
const calendarDays = [
  { day: "Mon", date: "11", active: false },
  { day: "Tue", date: "12", active: true },
  { day: "Wed", date: "13", active: false },
  { day: "Thu", date: "14", active: false },
  { day: "Fri", date: "15", active: false },
  { day: "Sat", date: "16", active: false },
];

// Time slots for calendar
const timeSlots = ["8:00 am", "12:00 pm", "04:00 pm", "08:00 pm"];

// Vertical divider lines count
const dividerLines = [0, 1, 2, 3, 4, 5];

// Areas of life data
const areasOfLife = [
  {
    label: "Dev",
    lineLeft: "/figmaAssets/line-153.svg",
    lineRight: "/figmaAssets/line-154.svg",
    dotRight: true,
    lineImg: null,
  },
  {
    label: "Fitness",
    lineImg: "/figmaAssets/group-1707481906.png",
    dotRight: false,
    lineLeft: null,
    lineRight: null,
  },
  {
    label: "Life balance",
    lineImg: "/figmaAssets/group-1707481906-1.png",
    dotRight: false,
    lineLeft: null,
    lineRight: null,
  },
];

// Document images
const documentImages = [
  { src: "/figmaAssets/rectangle-40095.png", width: "w-[177px]" },
  { src: "/figmaAssets/rectangle-40095.png", width: "w-[177px]" },
  { src: "/figmaAssets/rectangle-40095.png", width: "w-[81px]" },
];

// Goal task list
const goalTasks = [
  {
    num: "1",
    label: "Establish a workflow",
    statusLabel: "done",
    statusBg: "bg-[#22c55e33]",
    statusColor: "text-[#21c55e]",
  },
  {
    num: "2",
    label: "Fitness",
    statusLabel: "in progress",
    statusBg: "bg-[#3b82f633]",
    statusColor: "text-blue-500",
  },
  {
    num: "3",
    label: "Establish a workflow",
    statusLabel: "closed",
    statusBg: "bg-[#ee444433]",
    statusColor: "text-[#ee4444]",
  },
];

export const DashboardMainSection = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full items-start gap-4 relative">
      {/* Row 1 */}
      <div className="flex items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
        {/* Calendar Card */}
        <div className="flex flex-col w-[856px] items-start gap-2.5 p-6 relative bg-[#0a0701] rounded-2xl overflow-hidden backdrop-blur-md backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(12px)_brightness(100%)]">
          <div className="flex flex-col w-full items-start gap-[42px] relative flex-[0_0_auto]">
            {/* Week navigation */}
            <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 relative flex-[0_0_auto] bg-[#ffffff1a] rounded-[100px] shadow-[inset_0px_0px_6px_#ffffff40] cursor-pointer">
                <span className="relative w-fit mt-[-1.00px] opacity-90 [font-family:'Inter',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal]">
                  Last Week
                </span>
              </div>

              <div className="relative w-fit [font-family:'Inter',Helvetica] font-medium text-white text-lg tracking-[0] leading-[normal]">
                Wednesday June 12, 13:07
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 relative flex-[0_0_auto] bg-[#ffffff1a] rounded-[100px] shadow-[inset_0px_0px_6px_#ffffff40] cursor-pointer">
                <span className="relative w-fit mt-[-1.00px] opacity-90 [font-family:'Inter',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal]">
                  Next Week
                </span>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="flex flex-col w-[688px] items-end gap-4 relative flex-[0_0_auto]">
              {/* Day headers */}
              <div className="inline-flex items-center gap-[78px] relative flex-[0_0_auto]">
                {calendarDays.map((d) => (
                  <div
                    key={d.day + d.date}
                    className={`relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-white text-lg text-center tracking-[0] leading-[26px]${d.active ? "" : " opacity-50"}`}
                  >
                    {d.day}
                    <br />
                    {d.date}
                  </div>
                ))}
              </div>

              {/* Time slots + grid lines + events */}
              <div className="flex items-center gap-[54px] relative self-stretch w-full flex-[0_0_auto]">
                {/* Time labels */}
                <div className="inline-flex flex-col items-start gap-7 relative flex-[0_0_auto]">
                  {timeSlots.map((t) => (
                    <div
                      key={t}
                      className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-white text-base tracking-[0] leading-[normal] whitespace-nowrap"
                    >
                      {t}
                    </div>
                  ))}
                </div>

                {/* Grid lines + event cards */}
                <div className="inline-flex items-center gap-28 relative flex-[0_0_auto]">
                  {dividerLines.map((i) => (
                    <img
                      key={i}
                      className={`relative w-px h-40${i === 5 ? " mr-[-1.00px]" : ""}`}
                      alt="Line"
                      src="/figmaAssets/line-151.svg"
                    />
                  ))}

                  {/* Follow Up Email event */}
                  <div className="flex w-60 h-[58px] items-center justify-between px-3 py-2 absolute top-3 left-4 bg-[#ff7539] rounded-2xl">
                    <div className="flex flex-col w-[122px] items-start gap-0.5 relative">
                      <div className="relative self-stretch mt-[-1.00px] opacity-90 [font-family:'Inter',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
                        Follow Up Email
                      </div>
                      <div className="relative self-stretch opacity-50 [font-family:'Inter',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal]">
                        About new project
                      </div>
                    </div>
                    <div className="inline-flex items-center relative flex-[0_0_auto]">
                      <img
                        className="relative w-10 h-10 object-cover"
                        alt="Ellipse"
                        src="/figmaAssets/ellipse-7311.png"
                      />
                      <img
                        className="relative w-10 h-10 -ml-2.5 border border-solid border-[#ff7539] object-cover"
                        alt="Ellipse"
                        src="/figmaAssets/ellipse-7310.png"
                      />
                    </div>
                  </div>

                  {/* Contact Leads event */}
                  <div className="flex w-60 h-[58px] items-center justify-between px-3 py-2 absolute top-[74px] left-[272px] bg-[#22201a] rounded-2xl">
                    <div className="flex flex-col w-[122px] items-start gap-0.5 relative">
                      <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
                        Contact Leads
                      </div>
                      <div className="relative self-stretch opacity-50 [font-family:'Inter',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal]">
                        About new project
                      </div>
                    </div>
                    <div className="inline-flex items-center relative flex-[0_0_auto]">
                      <img
                        className="relative w-10 h-10 object-cover"
                        alt="Ellipse"
                        src="/figmaAssets/ellipse-7311-1.png"
                      />
                      <img
                        className="relative w-10 h-10 -ml-2.5 border border-solid border-[#22201a] object-cover"
                        alt="Ellipse"
                        src="/figmaAssets/ellipse-7310-1.png"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom right icon */}
          <img
            className="absolute right-6 bottom-6 w-8 h-8"
            alt="Frame"
            src="/figmaAssets/frame-2147227707.svg"
          />
        </div>

        {/* Areas of Life Card */}
        <div className="relative w-[423px] h-[348px] bg-[url(/figmaAssets/rectangle-40092.svg)] bg-[100%_100%]">
          <div className="flex flex-col w-[296px] h-[316px] items-center gap-9 px-0 py-4 absolute top-4 left-[111px] bg-[#ffffff1a] rounded-2xl backdrop-blur-xl backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(24px)_brightness(100%)]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-medium text-transparent text-[38px] tracking-[0] leading-[normal]">
              <span className="text-white">Areas </span>
              <span className="text-[#ffffff80]">of life</span>
            </div>

            <div className="flex flex-col w-[286px] items-start gap-6 relative flex-[0_0_auto]">
              {/* Dev row */}
              <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
                <div className="absolute top-[calc(50.00%_-_5px)] left-px w-[286px] h-2.5 opacity-50">
                  <img
                    className="absolute top-1 left-0 w-[73px] h-px"
                    alt="Line"
                    src="/figmaAssets/line-153.svg"
                  />
                  <img
                    className="absolute top-1 left-[212px] w-[74px] h-px"
                    alt="Line"
                    src="/figmaAssets/line-154.svg"
                  />
                  <div className="absolute top-0 left-[227px] w-2.5 h-2.5 bg-white rounded-[5px]" />
                </div>
                <div className="flex w-[139px] items-center justify-center gap-2.5 px-7 py-2 relative flex-[0_0_auto] rounded-[100px] border border-solid border-[#ffffff80]">
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-white text-lg tracking-[0] leading-[22px] whitespace-nowrap">
                    Dev
                  </div>
                </div>
              </div>

              {/* Fitness row */}
              <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
                <div className="inline-flex items-center justify-center gap-2.5 px-7 py-2 relative flex-[0_0_auto] rounded-[100px] border border-solid border-[#ffffff80]">
                  <div className="mt-[-1.00px] text-white text-lg leading-[22px] relative w-fit [font-family:'Inter',Helvetica] font-normal tracking-[0] whitespace-nowrap">
                    Fitness
                  </div>
                </div>
                <img
                  className="top-[calc(50.00%_-_5px)] h-2.5 absolute left-px w-[286px]"
                  alt="Group"
                  src="/figmaAssets/group-1707481906.png"
                />
              </div>

              {/* Life balance row */}
              <div className="flex flex-col items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
                <div className="inline-flex items-center justify-center gap-2.5 px-7 py-2 relative flex-[0_0_auto] rounded-[100px] border border-solid border-[#ffffff80]">
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-white text-lg tracking-[0] leading-[22px] whitespace-nowrap">
                    Life balance
                  </div>
                </div>
                <img
                  className="top-[calc(50.00%_-_2px)] h-px absolute left-px w-[286px]"
                  alt="Group"
                  src="/figmaAssets/group-1707481906-1.png"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
        {/* Memory Card */}
        <div className="flex flex-col w-[527px] h-[523px] items-start gap-6 p-6 relative bg-[#0a0701] rounded-2xl overflow-hidden backdrop-blur-md backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(12px)_brightness(100%)]">
          {/* Glow effect */}
          <div className="absolute top-[-70px] left-[calc(50.00%_-_148px)] w-[100px] h-[100px] bg-[#ff7439] rounded-[50px] blur-[100px]" />

          {/* Header */}
          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-bold text-[#e8e6e3] text-xl tracking-[0] leading-7 whitespace-nowrap">
              Memory
            </h2>
            <img
              className="relative w-6 h-6"
              alt="Button menu"
              src="/figmaAssets/button-menu.svg"
            />
          </div>

          <div className="flex flex-col items-start gap-4 relative flex-1 self-stretch w-full grow">
            {/* Documents section */}
            <div className="flex flex-col items-start gap-6 pt-3 pb-0 px-3 relative flex-1 self-stretch w-full grow bg-[#ffffff1a] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex w-[282px] items-center gap-1.5 relative self-stretch">
                  <span className="relative flex items-center w-fit opacity-90 [font-family:'Inter',Helvetica] font-medium text-white text-base tracking-[0] leading-5 whitespace-nowrap">
                    Documents
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1 relative flex-[0_0_auto] bg-[#ffffff1a] rounded-[100px] shadow-[inset_0px_0px_6px_#ffffff40] cursor-pointer">
                  <span className="relative w-fit mt-[-1.00px] opacity-90 [font-family:'Inter',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal]">
                    More
                  </span>
                </div>
              </div>

              <div className="relative w-[563px] h-[140px] mr-[-108.00px] overflow-hidden">
                <div className="inline-flex items-center gap-4 relative">
                  {documentImages.map((img, idx) => (
                    <img
                      key={idx}
                      className={`${img.width} relative h-[140px] object-cover`}
                      alt="Rectangle"
                      src={img.src}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Main Goal section */}
            <div className="flex flex-col items-start gap-4 p-3 relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff1a] rounded-xl">
              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex w-[282px] items-center gap-1.5 relative self-stretch">
                  <span className="relative flex items-center w-fit opacity-90 [font-family:'Inter',Helvetica] font-medium text-white text-base tracking-[0] leading-5 whitespace-nowrap">
                    Main Goal
                  </span>
                </div>
                <img
                  className="relative w-[22px] h-[22px]"
                  alt="Frame"
                  src="/figmaAssets/frame-2147227700.svg"
                />
              </div>

              <p className="relative flex items-center self-stretch [font-family:'Inter',Helvetica] font-normal text-transparent text-base tracking-[0] leading-6">
                <span className="text-[#ffffff99]">
                  I strive for steady growth and balance, improving my daily
                  routine, nutrition, and sleep. In business, I aim to scale the
                  studio internationally, attracting{" "}
                </span>
                <span className="text-white">at least 10 new clients</span>
                <span className="text-[#ffffff99]"> and </span>
                <span className="text-white">growing revenue by 50%</span>
                <span className="text-[#ffffff99]">
                  {" "}
                  while keeping a healthy work-life balance. Learning, exploring
                  new opportunities, and setting ambitious goals.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Middle column: Time Saved + Average Task Time */}
        <div className="inline-flex flex-col items-start gap-4 relative self-stretch flex-[0_0_auto]">
          {/* Time Saved Card */}
          <div className="flex flex-col w-[307px] h-[123px] items-start gap-2.5 p-6 relative bg-[#0a0701] rounded-2xl overflow-hidden">
            <div className="flex flex-col w-[115px] items-start gap-1 relative flex-[0_0_auto] mb-[-11.00px]">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-medium text-white text-xl tracking-[0] leading-7">
                Time Saved
              </div>
              <div className="relative flex items-center w-[141px] mr-[-26.00px] [font-family:'Inter',Helvetica] font-medium text-white text-[45px] tracking-[0] leading-[normal]">
                27h
              </div>
            </div>
            <img
              className="absolute top-0 right-[-15px] w-[110px] h-[94px] object-cover"
              alt="Screenshot"
              src="/figmaAssets/screenshot-2026-02-27-at-9-33-16-pm-1.png"
            />
          </div>

          {/* Average Task Time Card */}
          <div className="flex flex-col items-center gap-4 p-6 relative flex-1 self-stretch w-full grow rounded-2xl bg-[linear-gradient(180deg,rgba(67,28,16,1)_0%,rgba(10,7,1,1)_100%)]">
            <div className="relative flex items-center justify-center self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-bold text-[#e8e6e3] text-xl text-center tracking-[0] leading-7">
              Average Task Time
            </div>

            <div className="relative w-[214px] h-[214px]">
              {/* Center text */}
              <div className="flex w-[115px] gap-0.5 absolute top-[65px] left-[54px] flex-col items-start">
                <div className="relative flex items-center justify-center self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-medium text-white text-[45px] text-center tracking-[0] leading-[normal]">
                  31s
                </div>
                <div className="relative flex items-center justify-center self-stretch [font-family:'Inter',Helvetica] font-medium text-white text-xl text-center tracking-[0] leading-7">
                  Excellent
                </div>
              </div>

              {/* Donut chart images */}
              <div className="absolute top-0 left-0 w-[214px] h-[214px]">
                <img
                  className="absolute top-0 left-0 w-[214px] h-[190px]"
                  alt="Ellipse"
                  src="/figmaAssets/ellipse-7319.svg"
                />
                <img
                  className="absolute top-0 left-0 w-[214px] h-[190px]"
                  alt="Ellipse"
                  src="/figmaAssets/ellipse-7320.svg"
                />
              </div>
            </div>

            <Button
              className="flex h-[49px] items-center justify-center gap-2.5 px-[67px] py-[3px] relative self-stretch w-full bg-[#ff763a] rounded-xl hover:bg-[#ff763a]/90 border-0"
              variant="default"
            >
              <span className="relative flex items-center w-fit [font-family:'Inter',Helvetica] font-semibold text-black text-xl tracking-[0] leading-7 whitespace-nowrap">
                Details
              </span>
            </Button>
          </div>
        </div>

        {/* AI Assistant Card */}
        <div className="flex flex-col items-start justify-between p-6 relative flex-1 self-stretch grow bg-[#0a0701] rounded-2xl overflow-hidden">
          {/* Robot image */}
          <img
            className="absolute top-[calc(50.00%_-_122px)] right-[-45px] w-[275px] h-[383px]"
            alt="Closeup shot white"
            src="/figmaAssets/closeup-shot-white-robots-face-looking-directly-camera-1.png"
          />

          {/* Top section: AI Assistant info + Goals */}
          <div className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col h-[75px] items-start gap-2 relative self-stretch w-full">
              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                <h2 className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-bold text-[#e8e6e3] text-xl tracking-[0] leading-7 whitespace-nowrap">
                  AI Assistant
                </h2>
                <img
                  className="relative w-6 h-6"
                  alt="Button menu"
                  src="/figmaAssets/button-menu.svg"
                />
              </div>

              <div className="flex items-center justify-center gap-2.5 pl-0 pr-[100px] py-0 relative self-stretch w-full flex-[0_0_auto] mb-[-9.00px]">
                <p className="relative flex items-center flex-1 mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-white text-base tracking-[0] leading-6">
                  A new analysis of achieving your goals has been prepared
                </p>
              </div>
            </div>

            <img
              className="relative w-full h-0.5"
              alt="Line"
              src="/figmaAssets/line-153-1.svg"
            />

            <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex gap-4 relative flex-[0_0_auto] flex-col items-start">
                {/* Goals Achieved header */}
                <div className="flex items-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
                  <span className="relative flex items-center w-fit [font-family:'Inter',Helvetica] font-medium text-white text-xl tracking-[0] leading-7 whitespace-nowrap">
                    Goals Achieved
                  </span>
                  <div className="inline-flex items-center justify-center px-2.5 py-1 relative flex-[0_0_auto] bg-[#ff763a] rounded-[100px]">
                    <span className="flex items-end w-fit font-normal text-base leading-6 whitespace-nowrap relative mt-[-1.00px] [font-family:'Inter',Helvetica] text-white tracking-[0]">
                      24
                    </span>
                    <img
                      className="relative w-4 h-4"
                      alt="Solar arrow down"
                      src="/figmaAssets/solar-arrow-down-outline.svg"
                    />
                  </div>
                </div>

                {/* 88% stat */}
                <div className="inline-flex items-end gap-2 relative flex-[0_0_auto]">
                  <div className="inline-flex items-end gap-0.5 relative flex-[0_0_auto]">
                    <span className="flex items-center w-fit font-medium text-[80px] leading-[70px] whitespace-nowrap relative mt-[-1.00px] [font-family:'Inter',Helvetica] text-white tracking-[0]">
                      88
                    </span>
                    <span className="w-fit [font-family:'Inter',Helvetica] font-medium text-white text-2xl tracking-[0] leading-[normal] relative flex items-center">
                      %
                    </span>
                  </div>
                  <span className="relative flex items-end w-fit [font-family:'Inter',Helvetica] font-normal text-white text-base tracking-[0] leading-6 whitespace-nowrap">
                    in one week
                  </span>
                </div>
              </div>

              <img
                className="relative flex-[0_0_auto] mb-[-6.00px]"
                alt="Frame"
                src="/figmaAssets/frame-2147227766.svg"
              />
            </div>
          </div>

          {/* Bottom section: Task list */}
          <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
            {goalTasks.map((task) => (
              <div
                key={task.num}
                className="flex items-center justify-between p-2 relative self-stretch w-full flex-[0_0_auto] bg-[#161616] rounded-xl border border-solid border-[#ffffff0d]"
              >
                <div className="flex items-center gap-3.5 relative flex-1 self-stretch grow">
                  <div className="flex w-16 items-center justify-center gap-2.5 p-1 relative bg-[#ffffff1a] rounded">
                    <span className="w-fit opacity-50 font-normal text-xs leading-[18px] whitespace-nowrap relative mt-[-1.00px] [font-family:'Inter',Helvetica] text-white tracking-[0]">
                      {task.num}
                    </span>
                  </div>
                  <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#d1d4db] text-xs tracking-[0] leading-[15px] whitespace-nowrap">
                    {task.label}
                  </span>
                </div>
                <div
                  className={`w-[60px] justify-center gap-2.5 px-1.5 py-0.5 ${task.statusBg} rounded relative flex items-center`}
                >
                  <span
                    className={`w-fit mt-[-1.00px] ${task.statusColor} text-[8.8px] leading-[13px] whitespace-nowrap relative [font-family:'Inter',Helvetica] font-normal text-center tracking-[0]`}
                  >
                    {task.statusLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
