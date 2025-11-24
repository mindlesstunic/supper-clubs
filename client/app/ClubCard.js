"use client";

import { useState } from "react";

export default function ClubCard({ club }) {
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [loading, setLoading] = useState(false);

  // Event handler function

  const handleClick = async () => {
    setLoading(true);
    //Fetch events for this club

    try {
      const response = await fetch(
        `http://localhost:3000/api/clubs/${club.id}/events`
      );
      const eventData = await response.json();
      setEvents(eventData);
      setShowEvents(true);
      console.log("Events fetched:", eventData);
    } catch (error) {
      console.error("Error fetching events", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      key={club.id}
      className="bg-white rounded-lg p-6 shasow-md hover:shadow-xl transition-shadow"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{club.name}</h2>
      <p className="text-gray-600 mb-3">
        📍 {club.location.area}, {club.location.city}
      </p>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-500">⭐</span>
        <span className="font-semibold">{club.rating}</span>
        <span className="text-gray-500 text-sm">
          ({club.reviewCount} reviews)
        </span>
      </div>

      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:cursor-not-allowed"
      >
        {loading ? "Loading..." : "View Details"}
      </button>

      {/* Show events if they exist */}
      {showEvents && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="font-semibold mb-2">Upcoming Events:</h3>
          {events.length > 0 ? (
            <ul className="space-y-2">
              {events.map((event) => (
                <li key={event.id} className="text-sm text-gray-700">
                  {event.date}- {event.cuisine} - ₹{event.pricePerPerson}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text -gray-500 text-sm">No upcoming events</p>
          )}
        </div>
      )}
    </div>
  );
}
