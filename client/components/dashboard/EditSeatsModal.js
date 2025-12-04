"use client";

// ============================================
// EDIT SEATS MODAL COMPONENT
// ============================================
// A small modal for quickly updating available seats
// Used after manual bookings via WhatsApp
//
// Props:
// - event: The event object being edited (null = modal closed)
// - seatsValue: Current input value
// - onSeatsChange: Callback when input changes
// - onSave: Callback when Save is clicked
// - onClose: Callback when Cancel or backdrop is clicked

export default function EditSeatsModal({
  event,
  seatsValue,
  onSeatsChange,
  onSave,
  onClose,
}) {
  // Don't render if no event selected
  if (!event) return null;

  return (
    // Backdrop - clicking closes modal
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Content - stop propagation prevents backdrop click */}
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Edit Available Seats
        </h3>
        <p className="text-sm text-gray-600 mb-4">{event.name}</p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-900">
            Available Seats
          </label>
          <input
            type="number"
            value={seatsValue}
            onChange={(e) => onSeatsChange(e.target.value)}
            min="0"
            max={event.total_seats}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">
            Total capacity: {event.total_seats}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-3 bg-black text-white rounded-full hover:bg-gray-800 active:scale-95 transition-all"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
