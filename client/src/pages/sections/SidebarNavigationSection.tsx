import { Card, CardContent } from "@/components/ui/card";

// Stat items data for the navigation stats section
const statItems = [
];

export const SidebarNavigationSection = (): JSX.Element => {
  return (
    <div className="flex w-full items-center gap-3">
      {statItems.map((item, index) => (
        <Card
          key={`stat-${index}`}
          className="flex flex-col items-center gap-2 px-4 py-3 flex-1 bg-[#3c3c3ccc] rounded-lg border-0 backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]"
        >
          <CardContent className="flex flex-col items-center gap-2 p-0 w-full">
            <span className="w-full font-semibold text-xl text-center leading-[normal] [font-family:'Inter',Helvetica] text-white tracking-[0]">
              {item.value}
            </span>
            <span className="w-full [font-family:'Inter',Helvetica] font-normal text-white text-sm text-center tracking-[0] leading-[normal]">
              {item.label}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
