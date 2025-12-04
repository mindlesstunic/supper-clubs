"use client";

import { useState, useEffect } from "react";
import EventCard from "../components/EventCard";
import { getUser, clearAuth } from "../lib/auth";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

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
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Nav Bar */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                bookmysupper<span className="text-gray-400">.com</span>
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Intimate dinners hosted by passionate home chefs in Hyderabad
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {user ? (
                <>
                  <a
                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                    className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Host Dashboard
                  </a>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/become-host"
                    className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Become a Host
                  </a>

                  <a
                    href="/login"
                    className="px-4 py-2 text-sm bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Host Login
                  </a>
                </>
              )}
            </div>
          </div>
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
