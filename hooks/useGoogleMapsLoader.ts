// hooks/useGoogleMapsLoader.ts
import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useState } from "react";

const useGoogleMapsLoader = (apiKey: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | undefined>();

  useEffect(() => {
    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        setLoadError(error);
        console.error("Google Maps API failed to load", error);
      });
  }, [apiKey]);

  return { isLoaded, loadError };
};

export default useGoogleMapsLoader;
