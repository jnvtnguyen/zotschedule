import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/lib/components/ui/tabs";
import { useWebSocTermOptions } from "@/lib/hooks/use-websoc-term-options";
import {
  ScheduleActionsPanelContext,
  createScheduleActionsPanelStore,
} from "./context";
import { ScheduleActionsPanelSearchTab } from "./search-tab";
import { ScheduleActionsPanelEventsTab } from "./events-tab";
import { ScheduleActionsPanelMapTab } from "./map-tab";

export function ScheduleActionsPanelTabs() {
  const terms = useWebSocTermOptions();

  if (terms.status === "pending") {
    return <></>;
  }

  if (terms.status === "error") {
    return <></>;
  }

  return (
    <ScheduleActionsPanelContext.Provider
      value={createScheduleActionsPanelStore({
        term: terms.data[0].value,
      })}
    >
      <Tabs className="w-full h-full" defaultValue="search">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
        <TabsContent
          value="search"
          className="h-[calc(100%-2.8rem)] w-full overflow-y-auto px-2"
        >
          <ScheduleActionsPanelSearchTab />
        </TabsContent>
        <TabsContent
          value="events"
          className="h-[calc(100%-2.8rem)] w-full overflow-hidden p-2"
        >
          <ScheduleActionsPanelEventsTab />
        </TabsContent>
        <TabsContent
          value="map"
          className="h-[calc(100%-2.8rem)] w-full overflow-hidden p-2"
        >
          <ScheduleActionsPanelMapTab />
        </TabsContent>
      </Tabs>
    </ScheduleActionsPanelContext.Provider>
  );
}
