"use client";

import { useState, useEffect } from "react";
import EventCard from "./EventCard";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const response = await fetch(`${apiUrl}/api/events`);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Group events by month
  const groupEventsByMonth = (events) => {
    const grouped = {};

    events.forEach((event) => {
      // Parse the date string (e.g., "Nov 15, 2024")
      const date = new Date(event.date);
      const monthYear = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(event);
    });

    return grouped;
  };

  const eventsByMonth = groupEventsByMonth(events);
  const monthNames = Object.keys(eventsByMonth);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Supper Clubs
          </h1>
          <p className="text-xl text-gray-600">Hyderabad</p>
        </div>
      </header>

      {/* Events by Month */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-12">
            {monthNames.map((monthYear) => (
              <section key={monthYear}>
                {/* Month Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {monthYear}
                  </h2>
                  <span className="text-gray-600">
                    {eventsByMonth[monthYear].length}{" "}
                    {eventsByMonth[monthYear].length === 1 ? "event" : "events"}
                  </span>
                </div>

                {/* Events Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {eventsByMonth[monthYear].map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
