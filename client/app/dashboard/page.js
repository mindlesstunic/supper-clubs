"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, clearAuth } from "../../lib/auth";

export default function HostDashboard() {
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showClubForm, setShowClubForm] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: "",
    location_area: "",
    location_city: "Hyderabad",
  });
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();

    if (!currentUser || currentUser.role !== "host") {
      router.push("/login");
      return;
    }

    setUser(currentUser);
    fetchHostData();
  }, [router]);

  const fetchHostData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/hosts/me`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setClub(data.club);
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching host data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clubs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(clubForm),
      });

      if (res.ok) {
        const data = await res.json();
        setClub(data.club);
        setShowClubForm(false);
        alert("Club created successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create club");
      }
    } catch (error) {
      console.error("Create club error:", error);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!club ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Create Your Club</h2>

            {!showClubForm ? (
              <>
                <p className="text-gray-600 mb-6">
                  You need to create a club before adding events.
                </p>
                <button
                  onClick={() => setShowClubForm(true)}
                  className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
                >
                  Create Club
                </button>
              </>
            ) : (
              <form onSubmit={handleCreateClub}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-900">
                    Club Name
                  </label>
                  <input
                    type="text"
                    value={clubForm.name}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, name: e.target.value })
                    }
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
                    value={clubForm.location_area}
                    onChange={(e) =>
                      setClubForm({
                        ...clubForm,
                        location_area: e.target.value,
                      })
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
                    value={clubForm.location_city}
                    onChange={(e) =>
                      setClubForm({
                        ...clubForm,
                        location_city: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                    required
                  />
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
                    onClick={() => setShowClubForm(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 active:scale-95 cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{club.name}</h2>
                <p className="text-gray-600">
                  {club.location_area}, {club.location_city}
                </p>
              </div>
              <button
                onClick={() => alert("Edit club coming soon!")}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Edit
              </button>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
              <button className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all">
                + Add Event
              </button>
            </div>

            {events.length === 0 ? (
              <p className="text-gray-500">
                No events yet. Create your first event!
              </p>
            ) : (
              <div className="grid gap-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white p-6 rounded-2xl border border-gray-200"
                  >
                    <p className="font-semibold">{event.name}</p>
                    <p className="text-gray-600">
                      {event.date} at {event.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
