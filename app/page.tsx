// pages/index.tsx
"use client";
import Map from "@/components/Map";
import Head from "next/head";

const HomePage = () => {
  // Accessing the Google Maps API key from environment variables
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <>
      <Head>
        <title>Main Page</title>
        <meta
          name="description"
          content="Main page with address input and map"
        />
      </Head>

      <main className="container mx-auto flex h-screen items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <h1 className="mb-4 text-center text-2xl font-bold">
            Find Locations
          </h1>
          <Map apiKey={googleMapsApiKey} />
        </div>
      </main>
    </>
  );
};

export default HomePage;
