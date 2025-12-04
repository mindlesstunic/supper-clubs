"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, clearAuth } from "../../lib/auth";

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const fetchApplications = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/applications`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    const currentUser = getUser();

    if (!currentUser || currentUser.role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(currentUser);
    fetchApplications();
    fetchEvents();
  }, [router]);

  const handleApprove = async (applicationId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/applications/${applicationId}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      if (res.ok) {
        // Remove from list
        setApplications(applications.filter((app) => app.id !== applicationId));
        alert("Host approved successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Approval failed");
      }
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  const handleReject = async (applicationId) => {
    if (
      !confirm(
        "Are you sure you want to reject this application? This will delete the user account."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/applications/${applicationId}/reject`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      if (res.ok) {
        setApplications(applications.filter((app) => app.id !== applicationId));
        alert("Application rejected");
      } else {
        const data = await res.json();
        alert(data.error || "Rejection failed");
      }
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      if (res.ok) {
        setEvents(events.filter((e) => e.id !== eventId));
        alert("Event deleted");
      } else {
        const data = await res.json();
        alert(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete event error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                View Events
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Pending Host Applications</h2>

        {applications.length === 0 ? (
          <p className="text-gray-500">No pending applications</p>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <p className="font-semibold text-lg">{app.name}</p>
                <p className="text-gray-600">{app.email}</p>
                <p className="text-gray-600">{app.phone}</p>
                <p className="text-sm text-gray-500 mt-2">{app.bio}</p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="px-5 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(app.id)}
                    className="px-5 py-2 text-sm text-red-600 border border-red-200 rounded-full hover:bg-red-50 hover:border-red-400 active:scale-95 cursor-pointer transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* All Events Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">All Events</h2>

          {events.length === 0 ? (
            <p className="text-gray-500">No events yet</p>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white p-6 rounded-2xl border border-gray-200 flex justify-between items-start"
                >
                  <div>
                    <p className="font-semibold text-lg text-gray-900">
                      {event.name}
                    </p>
                    <p className="text-gray-600">
                      {event.date} at {event.time}
                    </p>
                    <p className="text-sm text-gray-500">
                      {event.club.name} • {event.club.location.area}
                    </p>
                    <p className="text-sm text-gray-500">
                      Hosted by {event.host.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-full hover:bg-red-50 hover:border-red-400 active:scale-95 cursor-pointer transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
