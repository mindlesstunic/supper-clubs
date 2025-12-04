"use client";

import { useState } from "react";
import { getToken } from "../../lib/auth";

// ============================================
// CLUB SECTION COMPONENT
// ============================================
// Handles both states:
// 1. No club exists → Show creation form
// 2. Club exists → Show club info with edit button
//
// Props:
// - club: Current club object (null if none exists)
// - onClubCreated: Callback when a new club is created

export default function ClubSection({ club, onClubCreated }) {
  // Local state for form visibility and data
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location_area: "",
    location_city: "Hyderabad",
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clubs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        // Notify parent component
        onClubCreated(data.club);
        setShowForm(false);
        alert("Club created successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create club");
      }
    } catch (error) {
      console.error("Create club error:", error);
    }
  };

  // ========== STATE 1: No club - show creation UI ==========
  if (!club) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Create Your Club
        </h2>

        {!showForm ? (
          // Initial prompt
          <>
            <p className="text-gray-600 mb-6">
              You need to create a club before adding events.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
            >
              Create Club
            </button>
          </>
        ) : (
          // Creation form
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Club Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Area
              </label>
              <input
                type="text"
                value={form.location_area}
                onChange={(e) =>
                  setForm({ ...form, location_area: e.target.value })
                }
                placeholder="e.g., Jubilee Hills"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-900">
                City
              </label>
              <input
                type="text"
                value={form.location_city}
                onChange={(e) =>
                  setForm({ ...form, location_city: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                required
              />
            </div>

            {/* Terms Checkbox */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 accent-black"
                />
                <span className="text-sm text-gray-600">
                  I confirm that I am responsible for my supper club operations.
                  bookmysupper.com is a discovery platform only and is not
                  liable for any issues arising from events I host.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 active:scale-95 cursor-pointer transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // ========== STATE 2: Club exists - show info ==========
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-8 flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{club.name}</h2>
        <p className="text-gray-600">
          {club.location_area}, {club.location_city}
        </p>
      </div>
      <button
        onClick={() => alert("Edit club coming soon!")}
        className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
      >
        Edit
      </button>
    </div>
  );
}
