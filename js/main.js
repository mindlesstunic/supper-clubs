// ========================================
// MAIN APPLICATION LOGIC
// ========================================

// Wait for DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
  console.log("Page loaded! Starting to render data...");

  // === RENDER CLUB HEADER ===
  renderClubHeader();
  renderHostSection();
  renderEvents();
  renderContactSection();
  // Initialize galleries AFTER events are rendered
  initializeGalleries(); // ← Add this line
});

// ========================================
// RENDER CLUB HEADER
// ========================================
function renderClubHeader() {
  // Get data
  const club = supperClubData.club;
  const contact = supperClubData.contact;

  // Select DOM elements
  const clubName = document.querySelector(".club-name");
  const ratingValue = document.querySelector(".rating-value");
  const reviewCount = document.querySelector(".review-count");
  const locationText = document.querySelector(".location-text");

  // Update content
  clubName.textContent = club.name;
  ratingValue.textContent = club.rating;
  reviewCount.textContent = `(${club.reviewCount} reviews)`;
  locationText.textContent = `${club.location.area}, ${club.location.city}`;

  console.log("✅ Club header rendered!");
}
// ========================================
// RENDER HOST SECTION
// ========================================
function renderHostSection() {
  const host = supperClubData.host;

  // Select DOM elements
  const hostPhoto = document.querySelector(".host-photo");
  const hostName = document.querySelector(".host-name");
  const hostInfo = document.querySelector(".host-info");

  // Update photo and name
  hostPhoto.src = host.photo;
  hostPhoto.alt = `${host.name} - Host`;
  hostName.textContent = host.name;

  // Clear existing bio paragraphs (in case of re-render)
  const existingBios = hostInfo.querySelectorAll(".host-bio");
  existingBios.forEach((p) => p.remove());

  // Create bio paragraphs from array
  host.bio.forEach((paragraph) => {
    const p = document.createElement("p");
    p.className = "host-bio";
    p.textContent = paragraph;
    hostInfo.appendChild(p);
  });

  console.log("✅ Host section rendered!");
}
// ========================================
// RENDER EVENTS SECTION
// ========================================

function renderEvents() {
  const events = supperClubData.events;
  const eventsContainer = document.querySelector(".events-section");

  //Clear existing event cards(keep the h2)

  const existingCards = eventsContainer.querySelectorAll(".event-card");
  existingCards.forEach((card) => card.remove());

  //Loop through each event and create card

  events.forEach((event) => {
    const eventcard = createEventCard(event);
    eventsContainer.appendChild(eventcard);
  });

  console.log(`Rendered ${events.length} event cards!`);
}
// ========================================
// CREATE SINGLE EVENT CARD
// ========================================

function createEventCard(event) {
  //Create article element

  const article = document.createElement("article");
  article.className = "event-card";

  //Build the HTML using template literal

  article.innerHTML = `
    <!-- Event Photos -->
<div class="event-gallery" data-current-index="0" data-event-id="${event.id}">
  <div class="gallery-images">
    ${event.photos
      .map(
        (photo) => `
      <img src="${photo}" alt="${event.cuisine} dish photo">
    `
      )
      .join("")}
  </div>
  
  <!-- Navigation Arrows -->
  <button class="gallery-arrow gallery-arrow-prev" aria-label="Previous image">
    ‹
  </button>
  <button class="gallery-arrow gallery-arrow-next" aria-label="Next image">
    ›
  </button>
  
  <!-- Pagination Dots -->
  <div class="gallery-dots">
    ${event.photos
      .map(
        (_, index) => `
      <button class="gallery-dot ${
        index === 0 ? "active" : ""
      }" data-index="${index}" aria-label="Go to image ${index + 1}"></button>
    `
      )
      .join("")}
  </div>
</div>
    
    <!-- Event Details -->
    <div class="event-details">
      <h3 class="event-date">${event.date} • ${event.time}</h3>
      <p class="event-cuisine">${event.cuisine}</p>
      
      <!-- Menu -->
      <div class="event-menu">
        <h4>Menu</h4>
        <ul>
          ${event.menu.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
      
      <!-- Price & Availability -->
      <div class="event-meta">
        <span class="price">₹${event.pricePerPerson.toLocaleString()} per person</span>
        <span class="seats">${event.availableSeats} seats ${
    event.availableSeats <= 5 ? "left" : "available"
  }</span>
      </div>
      
      <!-- Event Tags -->
      <div class="event-tags">
        ${
          event.alcoholServed
            ? '<span class="tag">🍷 Alcohol served</span>'
            : '<span class="tag">🚫 Non-alcoholic</span>'
        }
        ${
          event.ageRestriction
            ? `<span class="tag">🔞 ${event.ageRestriction}</span>`
            : '<span class="tag">👨‍👩‍👧‍👦 Family-friendly</span>'
        }
        <span class="tag">⏱️ ${event.duration}</span>
      </div>
      
      <!-- Special Activities (conditional) -->
      ${
        event.specialActivities
          ? `
        <div class="special-activities">
          <h4>Special Activities</h4>
          <ul>
            ${event.specialActivities
              .map((activity) => `<li>${activity}</li>`)
              .join("")}
          </ul>
        </div>
      `
          : ""
      }
    </div>
  `;

  return article;
}

// ========================================
// INITIALIZE GALLERY NAVIGATION
// ========================================
function initializeGalleries() {
  // Get all galleries on the page
  const galleries = document.querySelectorAll(".event-gallery");

  galleries.forEach((gallery) => {
    const images = gallery.querySelector(".gallery-images");
    const dots = gallery.querySelectorAll(".gallery-dot");
    const prevButton = gallery.querySelector(".gallery-arrow-prev");
    const nextButton = gallery.querySelector(".gallery-arrow-next");
    const totalImages = dots.length;

    // Get current index from data attribute
    const getCurrentIndex = () => parseInt(gallery.dataset.currentIndex);

    // Set current index to data attribute
    const setCurrentIndex = (index) => {
      gallery.dataset.currentIndex = index;
    };

    // Navigate to specific image
    const goToImage = (index) => {
      // Wrap around if out of bounds
      if (index < 0) index = totalImages - 1;
      if (index >= totalImages) index = 0;

      // Update state
      setCurrentIndex(index);

      // Scroll to image
      const imageWidth = images.querySelector("img").offsetWidth;
      images.scrollLeft = imageWidth * index;

      // Update dots
      updateDots(index);
    };

    // Update active dot
    const updateDots = (activeIndex) => {
      dots.forEach((dot, index) => {
        if (index === activeIndex) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    };

    // Previous button click
    prevButton.addEventListener("click", () => {
      const currentIndex = getCurrentIndex();
      goToImage(currentIndex - 1);
    });

    // Next button click
    nextButton.addEventListener("click", () => {
      const currentIndex = getCurrentIndex();
      goToImage(currentIndex + 1);
    });

    // Dot click
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        goToImage(index);
      });
    });

    console.log(`✅ Gallery initialized for event ${gallery.dataset.eventId}`);
  });
}

// ========================================
// RENDER CONTACT SECTION
// ========================================

function renderContactSection() {
  const contact = supperClubData.club.contact;

  //Select contact button

  const contactButton = document.querySelector(".contact-button");

  //Update href and text
  contactButton.href = `tel:${contact.phone}`;
  contactButton.innerHTML = `📞 Call / WhatsApp: ${contact.phone}`;

  console.log("Contact esction rendered!");
}
