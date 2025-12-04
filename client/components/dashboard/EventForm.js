"use client";

// ============================================
// EVENT FORM COMPONENT
// ============================================
// Handles both creating new events and editing existing ones
// The same form is reused for both operations
//
// Props:
// - eventForm: Current form data object
// - setEventForm: State setter for form data
// - editingEvent: The event being edited (null = creating new)
// - onSubmit: Form submit handler
// - onCancel: Cancel button handler

import { EMPTY_EVENT_FORM } from "../../lib/formatters";
import ImageUpload from "./ImageUpload";

export default function EventForm({
  eventForm,
  setEventForm,
  editingEvent,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-6">
      {/* Dynamic heading based on mode */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {editingEvent ? "Edit Event" : "New Event"}
      </h3>

      <form onSubmit={onSubmit}>
        {/* Row 1: Event Name & Cuisine */}
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
                setEventForm({ ...eventForm, cuisine: e.target.value })
              }
              placeholder="e.g., Italian"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
              required
            />
          </div>
        </div>

        {/* Row 2: Date & Time */}
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

        {/* Row 3: Price, Seats, Duration */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Price (₹)
            </label>
            <input
              type="number"
              value={eventForm.price_per_person}
              onChange={(e) =>
                setEventForm({ ...eventForm, price_per_person: e.target.value })
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
                setEventForm({ ...eventForm, total_seats: e.target.value })
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
                setEventForm({ ...eventForm, duration: e.target.value })
              }
              placeholder="3 hours"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-900">
            Description
          </label>
          <textarea
            value={eventForm.description}
            onChange={(e) =>
              setEventForm({ ...eventForm, description: e.target.value })
            }
            rows={3}
            placeholder="Describe your event..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
          />
        </div>

        {/* Tags */}
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
          <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
        </div>

        {/* Menu Items */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-900">
            Menu Items
          </label>
          <input
            type="text"
            value={eventForm.menu_items}
            onChange={(e) =>
              setEventForm({ ...eventForm, menu_items: e.target.value })
            }
            placeholder="Bruschetta, Pasta Carbonara, Tiramisu"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
        </div>

        {/* Extras */}
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
          <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
        </div>


        {/* Photos */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-900">
            Event Photos
          </label>
          <ImageUpload
            images={
              eventForm.photos
                ? eventForm.photos
                    .split(",")
                    .map((p) => p.trim())
                    .filter((p) => p)
                : []
            }
            onImagesChange={(urls) =>
              setEventForm({ ...eventForm, photos: urls.join(", ") })
            }
          />
        </div>

        {/* Terms Checkbox - only for new events */}
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
                responsible for delivering the experience as described.
              </span>
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
          >
            {editingEvent ? "Save Changes" : "Create Event"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 active:scale-95 cursor-pointer transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
