// pages/index.tsx
"use client";
import Head from "next/head";
import Map from "../components/Map";

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

      <main className="container mx-auto p-4">
        <h1 className="my-4 text-center text-2xl font-bold">Find Locations</h1>
        <Map apiKey={googleMapsApiKey} />
      </main>
    </>
  );
};

export default HomePage;
