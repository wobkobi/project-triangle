"use client";
import { GoogleMaps } from "@/components/GoogleMaps";
import cn from "@/utils/cn";

const HomePage = () => {
  // Accessing the Google Maps API key from environment variables
  return (
    <div
      className={cn("flex min-h-screen flex-col items-center justify-center")}>
      <GoogleMaps />
    </div>
  );
};

export default HomePage;
