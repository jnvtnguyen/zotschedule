import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/lib/components/ui/tabs";
import { useOfferingTermOptions } from "@/lib/hooks/use-offering-term-options";
import { SideViewSearchTab } from "./search-tab";
import { SideViewContext, createSideViewStore } from "./context";

export function ScheduleSideViewTabs() {
  const { data: terms, status } = useOfferingTermOptions();

  if (status === "pending") {
    return <></>;
  }

  if (status === "error") {
    return <></>;
  }

  return (
    <SideViewContext.Provider
      value={createSideViewStore({
        term: terms[0].value,
      })}
    >
      <Tabs className="w-full" defaultValue="search">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <SideViewSearchTab />
        </TabsContent>
      </Tabs>
    </SideViewContext.Provider>
  );
}
