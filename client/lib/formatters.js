// ============================================
// UTILITY FUNCTIONS FOR DATA FORMATTING
// ============================================
// Pure functions that transform data
// No side effects, no state - just input → output

/**
 * Transforms raw event data from the API into the format
 * that EventCard component expects.
 *
 * Why needed: Database uses snake_case (price_per_person),
 * but our React components use camelCase (pricePerPerson)
 */
export function formatEventForCard(event, club, host) {
  // Format date for display (e.g., "Dec 15, 2024")
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
    // Nested objects for club and host info
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
}

/**
 * Formats a date for HTML date input (YYYY-MM-DD format)
 */
export function formatDateForInput(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toISOString().split("T")[0];
}

/**
 * Default empty state for the event form
 * Extracted here to avoid repetition
 */
export const EMPTY_EVENT_FORM = {
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
};
