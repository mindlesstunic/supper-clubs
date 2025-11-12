// ========================================
// SUPPER CLUB DATA
// ========================================

const supperClubData = {
  // === CLUB-LEVEL INFORMATION ===
  club: {
    name: "Spice Route Stories",
    rating: 4.8,
    reviewCount: 23,
    location: {
      area: "Banjara Hills",
      city: "Hyderabad",
    },
    contact: {
      phone: "+91 98765 43210",
    },
  },

  // === HOST INFORMATION ===
  host: {
    name: "Priya Sharma",
    photo: "https://placehold.co/150x150/A8E6CF/white?text=Host",
    bio: [
      "Chef Priya has over 15 years of experience in fusion cuisine, combining traditional Indian flavors with modern cooking techniques. She trained at Le Cordon Bleu Paris and worked in Michelin-starred restaurants before returning to Hyderabad to share her passion for intimate dining experiences.",
      "Her supper clubs focus on storytelling through food - each dish represents a chapter from her culinary journey across India and Europe.",
    ],
  },

  // === UPCOMING EVENTS ===
  events: [
    {
      id: 1,
      date: "2024-11-15",
      time: "7:30 PM",
      cuisine: "Modern Indian Fusion",
      photos: [
        "https://placehold.co/600x300/FF6B6B/white?text=Event+Photo+1",
        "https://placehold.co/600x300/4ECDC4/white?text=Event+Photo+2",
        "https://placehold.co/600x300/45B7D1/white?text=Event+Photo+3",
      ],
      menu: [
        "Tandoori Cauliflower Steak",
        "Butter Chicken with Naan",
        "Gulab Jamun Cheesecake",
      ],
      pricePerPerson: 1500,
      totalSeats: 12,
      availableSeats: 5,
      duration: "3 hours",
      alcoholServed: true,
      ageRestriction: "21+",
      specialActivities: ["🎵 Live Tabla Performance", "👨‍🍳 Chef's Table Demo"],
    },
    {
      id: 2,
      date: "2024-11-22",
      time: "7:00 PM",
      cuisine: "Italian Night",
      photos: [
        "https://placehold.co/600x300/FFD93D/white?text=Italian+1",
        "https://placehold.co/600x300/6BCB77/white?text=Italian+2",
        "https://placehold.co/600x300/4D96FF/white?text=Italian+3",
      ],
      menu: [
        "Bruschetta with Fresh Tomatoes",
        "Handmade Pasta Carbonara",
        "Classic Tiramisu",
      ],
      pricePerPerson: 1800,
      totalSeats: 10,
      availableSeats: 10,
      duration: "2.5 hours",
      alcoholServed: false,
      ageRestriction: null,
      specialActivities: null,
    },
  ],
};
