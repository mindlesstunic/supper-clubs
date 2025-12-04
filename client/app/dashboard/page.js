"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, clearAuth } from "../../lib/auth";
import EventCard from "../../components/EventCard";

export default function HostDashboard() {
  const [host, setHost] = useState(null);
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

  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    time: "19:00",
    cuisine: "",
    description: "",
    price_per_person: "",
    total_seats: "",
    duration: "3 hours",
    alcohol_served: false,
    age_restriction: "",
    tags: "",
    includes: "",
    menu_items: "",
    photos: "",
  });
  const [editingEvent, setEditingEvent] = useState(null);

  const [editingSeatsEvent, setEditingSeatsEvent] = useState(null);
  const [newSeatsValue, setNewSeatsValue] = useState("");

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
        setHost(data.host);
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

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    const eventData = {
      ...eventForm,
      club_id: club.id,
      price_per_person: Number(eventForm.price_per_person),
      total_seats: Number(eventForm.total_seats),
      tags: eventForm.tags
        ? eventForm.tags.split(",").map((t) => t.trim())
        : [],
      includes: eventForm.includes
        ? eventForm.includes.split(",").map((t) => t.trim())
        : [],
      menu_items: eventForm.menu_items
        ? eventForm.menu_items.split(",").map((t) => t.trim())
        : [],
      photos: eventForm.photos
        ? eventForm.photos.split(",").map((t) => t.trim())
        : [],
    };

    try {
      let res;

      if (editingEvent) {
        // UPDATE existing event
        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events/${editingEvent.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(eventData),
          }
        );
      } else {
        // CREATE new event
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(eventData),
        });
      }

      if (res.ok) {
        const data = await res.json();

        if (editingEvent) {
          // Update in state
          setEvents(
            events.map((e) =>
              e.id === editingEvent.id
                ? {
                    ...data.event,
                    menu_items: eventData.menu_items,
                    photos: eventData.photos,
                  }
                : e
            )
          );
          alert("Event updated successfully!");
        } else {
          // Add to state
          setEvents([
            {
              ...data.event,
              menu_items: eventData.menu_items,
              photos: eventData.photos,
            },
            ...events,
          ]);
          alert("Event created successfully!");
        }

        // Reset form
        setShowEventForm(false);
        setEditingEvent(null);
        setEventForm({
          name: "",
          date: "",
          time: "19:00",
          cuisine: "",
          description: "",
          price_per_person: "",
          total_seats: "",
          duration: "3 hours",
          alcohol_served: false,
          age_restriction: "",
          tags: "",
          includes: "",
          menu_items: "",
          photos: "",
        });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save event");
      }
    } catch (error) {
      console.error("Event submit error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleUpdateSeats = async () => {
    const seats = Number(newSeatsValue);

    // Basic validation
    if (seats < 0 || seats > editingSeatsEvent.total_seats) {
      alert(`Seats must be between 0 and ${editingSeatsEvent.total_seats}`);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${editingSeatsEvent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ available_seats: seats }),
        }
      );

      if (res.ok) {
        // Update state with new value
        setEvents(
          events.map((e) =>
            e.id === editingSeatsEvent.id ? { ...e, available_seats: seats } : e
          )
        );
        setEditingSeatsEvent(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update seats");
      }
    } catch (error) {
      console.error("Update seats error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    // Confirm before deleting
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
        // Remove from state (the React way!)
        setEvents(events.filter((e) => e.id !== eventId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Delete event error:", error);
      alert("Network error. Please try again.");
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

  // Transform event data for EventCard component
  const formatEventForCard = (event) => {
    // Format date for display
    let formattedDate = "";
    if (event.date) {
      const d = new Date(event.date);
      formattedDate = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    return {
      id: event.id,
      date: formattedDate,
      time: event.time,
      name: event.name,
      cuisine: event.cuisine,
      description: event.description,
      tags: event.tags || [],
      includes: event.includes || [],
      photos: event.photos || [],
      menu: event.menu_items || [],
      pricePerPerson: event.price_per_person,
      totalSeats: event.total_seats,
      availableSeats: event.available_seats,
      duration: event.duration,
      alcoholServed: event.alcohol_served,
      ageRestriction: event.age_restriction,
      club: {
        id: club?.id,
        name: club?.name,
        location: {
          area: club?.location_area,
          city: club?.location_city,
        },
        phone: club?.phone || "",
      },
      host: {
        name: host?.name,
        bio: host?.bio,
        photo: host?.photo,
      },
    };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Home
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
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
        {!club ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Create Your Club
            </h2>

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

                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 w-4 h-4 accent-black"
                    />
                    <span className="text-sm text-gray-600">
                      I confirm that I am responsible for my supper club
                      operations. bookmysupper.com is a discovery platform only
                      and is not liable for any issues arising from events I
                      host.
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {club.name}
                </h2>
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

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventForm({
                    name: "",
                    date: "",
                    time: "19:00",
                    cuisine: "",
                    description: "",
                    price_per_person: "",
                    total_seats: "",
                    duration: "3 hours",
                    alcohol_served: false,
                    age_restriction: "",
                    tags: "",
                    includes: "",
                    menu_items: "",
                    photos: "",
                  });
                  setShowEventForm(true);
                }}
                className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
              >
                + Add Event
              </button>
            </div>

            {showEventForm && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingEvent ? "Edit Event" : "New Event"}
                </h3>
                <form onSubmit={handleEventSubmit}>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">
                        Event Name
                      </label>
                      <input
                        type="text"
                        value={eventForm.name}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, name: e.target.value })
                        }
                        placeholder="e.g., Italian Night"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">
                        Cuisine
                      </label>
                      <input
                        type="text"
                        value={eventForm.cuisine}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            cuisine: e.target.value,
                          })
                        }
                        placeholder="e.g., Italian"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">
                        Date
                      </label>
                      <input
                        type="date"
                        value={eventForm.date}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, date: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">
                        Time
                      </label>
                      <input
                        type="time"
                        value={eventForm.time}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, time: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={eventForm.price_per_person}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            price_per_person: e.target.value,
                          })
                        }
                        placeholder="1500"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">
                        Total Seats
                      </label>
                      <input
                        type="number"
                        value={eventForm.total_seats}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            total_seats: e.target.value,
                          })
                        }
                        placeholder="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={eventForm.duration}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            duration: e.target.value,
                          })
                        }
                        placeholder="3 hours"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Description
                    </label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Describe your event..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={eventForm.tags}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, tags: e.target.value })
                      }
                      placeholder="vegetarian, spicy, authentic"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Comma-separated
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Menu Items
                    </label>
                    <input
                      type="text"
                      value={eventForm.menu_items}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          menu_items: e.target.value,
                        })
                      }
                      placeholder="Bruschetta, Pasta Carbonara, Tiramisu"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Comma-separated
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Extras (What's Included)
                    </label>
                    <input
                      type="text"
                      value={eventForm.includes}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, includes: e.target.value })
                      }
                      placeholder="Welcome drink, Dessert, Live music"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Comma-separated
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Photo URLs
                    </label>
                    <input
                      type="text"
                      value={eventForm.photos}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, photos: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/... (comma-separated)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste Unsplash image URLs, separated by commas
                    </p>
                  </div>

                  {!editingEvent && (
                    <div className="mb-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          className="mt-1 w-4 h-4 accent-black"
                        />
                        <span className="text-sm text-gray-600">
                          I confirm that all event details are accurate and I am
                          responsible for delivering the experience as
                          described.
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
                    >
                      {editingEvent ? "Save Changes" : "Create Event"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEventForm(false);
                        setEditingEvent(null);
                        setEventForm({
                          name: "",
                          date: "",
                          time: "19:00",
                          cuisine: "",
                          description: "",
                          price_per_person: "",
                          total_seats: "",
                          duration: "3 hours",
                          alcohol_served: false,
                          age_restriction: "",
                          tags: "",
                          includes: "",
                          menu_items: "",
                          photos: "",
                        });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 active:scale-95 cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {events.length === 0 ? (
              <p className="text-gray-500">
                No events yet. Create your first event!
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div key={event.id} className="flex flex-col">
                    {/* Preview Card */}
                    <EventCard event={formatEventForCard(event)} />

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          let formattedDate = "";
                          if (event.date) {
                            const d = new Date(event.date);
                            formattedDate = d.toISOString().split("T")[0];
                          }
                          setEditingEvent(event);
                          setEventForm({
                            name: event.name || "",
                            date: formattedDate,
                            time: event.time || "",
                            cuisine: event.cuisine || "",
                            description: event.description || "",
                            price_per_person: event.price_per_person || "",
                            total_seats: event.total_seats || "",
                            duration: event.duration || "",
                            alcohol_served: event.alcohol_served || false,
                            age_restriction: event.age_restriction || "",
                            tags: event.tags ? event.tags.join(", ") : "",
                            includes: event.includes
                              ? event.includes.join(", ")
                              : "",
                            menu_items: event.menu_items
                              ? event.menu_items.join(", ")
                              : "",
                            photos: event.photos ? event.photos.join(", ") : "",
                          });
                          setShowEventForm(true);
                        }}
                        className="flex-1 px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full cursor-pointer hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all duration-200"
                      >
                        Edit Event
                      </button>
                      <button
                        onClick={() => {
                          setEditingSeatsEvent(event);
                          setNewSeatsValue(event.available_seats);
                        }}
                        className="flex-1 px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full cursor-pointer hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all duration-200"
                      >
                        Edit Seats
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="flex-1 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-full cursor-pointer hover:bg-red-50 hover:border-red-400 active:scale-95 transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Edit Seats Modal */}
        {editingSeatsEvent && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingSeatsEvent(null)}
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Edit Available Seats
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {editingSeatsEvent.name}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Available Seats
                </label>
                <input
                  type="number"
                  value={newSeatsValue}
                  onChange={(e) => setNewSeatsValue(e.target.value)}
                  min="0"
                  max={editingSeatsEvent.total_seats}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total capacity: {editingSeatsEvent.total_seats}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdateSeats}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingSeatsEvent(null)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
