import { APIProvider, Map } from "@vis.gl/react-google-maps";

export function ScheduleActionsPanelMapTab() {
  return (
    <APIProvider apiKey={process.env.GOOGLE_MAPS_API_KEY!}>
      <Map
        defaultCenter={{ lat: 33.6424, lng: -117.8417 }}
        defaultZoom={15}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      />
    </APIProvider>
  );
}
