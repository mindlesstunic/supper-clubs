"use client";

// ============================================
// HOST DASHBOARD - MAIN PAGE
// ============================================
// This is the main orchestrator component.
// It manages state and coordinates child components.
//
// Structure:
// - DashboardHeader: Navigation and logout
// - ClubSection: Club creation/display
// - EventForm: Create/edit events
// - EventCard: Display events (reused from public)
// - EditSeatsModal: Quick seats editing

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, clearAuth } from "../../lib/auth";
import {
  formatEventForCard,
  formatDateForInput,
  EMPTY_EVENT_FORM,
} from "../../lib/formatters";

// Components
import EventCard from "../../components/EventCard";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ClubSection from "../../components/dashboard/ClubSection";
import EventForm from "../../components/dashboard/EventForm";
import EditSeatsModal from "../../components/dashboard/EditSeatsModal";

export default function HostDashboard() {
  // ============================================
  // STATE
  // ============================================

  // Data from API
  const [host, setHost] = useState(null);
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [editingEvent, setEditingEvent] = useState(null);

  // Seats modal state
  const [editingSeatsEvent, setEditingSeatsEvent] = useState(null);
  const [newSeatsValue, setNewSeatsValue] = useState("");

  const router = useRouter();

  // ============================================
  // AUTH CHECK & DATA FETCHING
  // ============================================

  useEffect(() => {
    const currentUser = getUser();

    // Redirect if not logged in or not a host
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

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handles both creating new events and updating existing ones
   * Determined by whether editingEvent is set
   */
  const handleEventSubmit = async (e) => {
    e.preventDefault();

    // Prepare data - convert strings to arrays/numbers
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
          // Update in state - replace old with new
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
          // Add to state - prepend to list
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

        // Reset form state
        resetEventForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save event");
      }
    } catch (error) {
      console.error("Event submit error:", error);
      alert("Network error. Please try again.");
    }
  };

  /**
   * Updates available seats for an event
   */
  const handleUpdateSeats = async () => {
    const seats = Number(newSeatsValue);

    // Validation
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
        // Update state immutably
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

  /**
   * Deletes an event after confirmation
   */
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
        // Remove from state using filter
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

  /**
   * Opens the edit form for an event
   */
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name || "",
      date: formatDateForInput(event.date),
      time: event.time || "",
      cuisine: event.cuisine || "",
      description: event.description || "",
      price_per_person: event.price_per_person || "",
      total_seats: event.total_seats || "",
      duration: event.duration || "",
      alcohol_served: event.alcohol_served || false,
      age_restriction: event.age_restriction || "",
      tags: event.tags ? event.tags.join(", ") : "",
      includes: event.includes ? event.includes.join(", ") : "",
      menu_items: event.menu_items ? event.menu_items.join(", ") : "",
      photos: event.photos ? event.photos.join(", ") : "",
    });
    setShowEventForm(true);
  };

  /**
   * Resets the event form to empty state
   */
  const resetEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setEventForm(EMPTY_EVENT_FORM);
  };

  /**
   * Logs out the user
   */
  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  // ============================================
  // RENDER
  // ============================================

  // Loading state
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
      <DashboardHeader email={user?.email} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Club Section - handles both creation and display */}
        <ClubSection
          club={club}
          onClubCreated={(newClub) => setClub(newClub)}
        />

        {/* Events Section - only shown when club exists */}
        {club && (
          <div>
            {/* Events Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventForm(EMPTY_EVENT_FORM);
                  setShowEventForm(true);
                }}
                className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
              >
                + Add Event
              </button>
            </div>

            {/* Event Form - conditionally shown */}
            {showEventForm && (
              <EventForm
                eventForm={eventForm}
                setEventForm={setEventForm}
                editingEvent={editingEvent}
                onSubmit={handleEventSubmit}
                onCancel={resetEventForm}
              />
            )}

            {/* Events List */}
            {events.length === 0 ? (
              <p className="text-gray-500">
                No events yet. Create your first event!
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div key={event.id} className="flex flex-col">
                    {/* Preview Card - uses same component as public */}
                    <EventCard event={formatEventForCard(event, club, host)} />

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditEvent(event)}
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
        <EditSeatsModal
          event={editingSeatsEvent}
          seatsValue={newSeatsValue}
          onSeatsChange={setNewSeatsValue}
          onSave={handleUpdateSeats}
          onClose={() => setEditingSeatsEvent(null)}
        />
      </main>
    </div>
  );
}
