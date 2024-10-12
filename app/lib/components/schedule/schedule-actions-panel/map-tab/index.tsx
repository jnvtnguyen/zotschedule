import { APIProvider, Map } from "@vis.gl/react-google-maps";

export function ScheduleActionsPanelMapTab() {
  return (
    <APIProvider apiKey={process.env.GOOGLE_MAPS_API_KEY!}>
      <Map
        defaultCenter={{ lat: 22.54992, lng: 0 }}
        defaultZoom={3}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      />
    </APIProvider>
  );
}
