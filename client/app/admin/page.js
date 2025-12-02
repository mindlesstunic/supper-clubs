"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, clearAuth } from "../../lib/auth";

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();

    // Check auth and role
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(currentUser);
    fetchApplications();
  }, [router]);

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
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
                <button
                  onClick={() => handleApprove(app.id)}
                  className="mt-4 px-5 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
                >
                  Approve Host
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
