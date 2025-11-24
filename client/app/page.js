"use client";

import ClubCard from "./ClubCard";
import { useState, useEffect } from "react";

export default function Home() {
  const cityName = "Hyderabad";
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    async function fetchClubs() {
      const response = await fetch("http://localhost:3000/api/clubs/1");
      const club = await response.json();
      setClubs([club]);
    }
    fetchClubs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {" "}
        Supper Clubs {cityName}
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map(club => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
      <p className="mt-8 text-gray-600">
        {" "}
        Discover {clubs.length} intimate dining experiences
      </p>
    </div>
  );
}
