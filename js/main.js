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
  initializeGalleries();

  // Initialize modal
  initializeContactModal();
  initializeInquiryForm();
  initializeLightbox();
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

// ========================================
// CONTACT MODAL FUNCTIONALITY
// ========================================
function initializeContactModal() {
  const modal = document.getElementById("contactModal");
  const openButton = document.querySelector(".contact-button");
  const closeButton = document.querySelector(".modal-close");
  const modalContent = document.querySelector(".modal-content");

  // Populate modal with host data
  populateModalData();

  // Open modal
  openButton.addEventListener("click", () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  });

  // Close modal - X button
  closeButton.addEventListener("click", () => {
    closeModal();
  });

  // Close modal - Click outside (on overlay)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal - ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // Prevent closing when clicking inside modal content
  modalContent.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Close modal function
  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
  }

  console.log("✅ Contact modal initialized!");
}

// ========================================
// POPULATE MODAL WITH HOST DATA
// ========================================
function populateModalData() {
  const host = supperClubData.host;
  const contact = supperClubData.club.contact;

  // Host photo and name
  document.querySelector(".modal-host-photo").src = host.photo;
  document.querySelector(".modal-host-photo").alt = `${host.name} - Host`;
  document.querySelector(".modal-host-name").textContent = host.name;

  // Phone numbers in contact options
  const phoneElements = document.querySelectorAll(".contact-phone");
  phoneElements.forEach((el) => {
    el.textContent = contact.phone;
  });

  // Call link
  document.querySelector(".contact-call").href = `tel:${contact.phone}`;

  // WhatsApp link
  const whatsappNumber = contact.phone.replace(/\D/g, ""); // Remove non-digits
  document.querySelector(
    ".contact-whatsapp"
  ).href = `https://wa.me/${whatsappNumber}`;

  console.log("✅ Modal data populated!");
}

// ========================================
// HANDLE INQUIRY FORM SUBMISSION
// ========================================
function initializeInquiryForm() {
  const form = document.getElementById("inquiryForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent page reload

    // Get form values
    const formData = new FormData(form);
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector("textarea").value;

    console.log("📧 Form submitted:", { name, email, message });

    // Show success message (for now, just alert - in V3 we'll send to backend)
    alert(
      `Thank you, ${name}! Your inquiry has been sent to ${supperClubData.host.name}. They will contact you at ${email} soon!`
    );

    // Reset form
    form.reset();

    // Close modal
    document.getElementById("contactModal").classList.remove("active");
    document.body.style.overflow = "";
  });

  console.log("✅ Inquiry form initialized!");
}
// ========================================
// IMAGE LIGHTBOX FUNCTIONALITY
// ========================================
function initializeLightbox() {
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImage = document.querySelector(".lightbox-image");
  const lightboxCounter = document.querySelector(".lightbox-counter");
  const lightboxDotsContainer = document.querySelector(".lightbox-dots");
  const closeButton = document.querySelector(".lightbox-close");
  const prevButton = document.querySelector(".lightbox-arrow-prev");
  const nextButton = document.querySelector(".lightbox-arrow-next");

  // Store current lightbox state
  let currentImages = [];
  let currentIndex = 0;

  // Make all gallery images clickable
  const allGalleryImages = document.querySelectorAll(".event-gallery img");

  allGalleryImages.forEach((img, globalIndex) => {
    img.style.cursor = "pointer";

    img.addEventListener("click", () => {
      // Get all images from THIS gallery
      const gallery = img.closest(".event-gallery");
      const galleryImages = gallery.querySelectorAll("img");

      // Store images and find which one was clicked
      currentImages = Array.from(galleryImages).map((img) => ({
        src: img.src,
        alt: img.alt,
      }));

      // Find index of clicked image within its gallery
      currentIndex = Array.from(galleryImages).indexOf(img);

      // Open lightbox
      openLightbox();
    });
  });

  // Open lightbox
  function openLightbox() {
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    showImage(currentIndex);
    createDots();
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Show specific image
  function showImage(index) {
    // Wrap around
    if (index < 0) index = currentImages.length - 1;
    if (index >= currentImages.length) index = 0;

    currentIndex = index;

    // Update image
    lightboxImage.src = currentImages[index].src;
    lightboxImage.alt = currentImages[index].alt;

    // Update counter
    lightboxCounter.textContent = `${index + 1} of ${currentImages.length}`;

    // Update dots
    updateLightboxDots(index);
  }

  // Create pagination dots
  function createDots() {
    lightboxDotsContainer.innerHTML = "";

    currentImages.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = "lightbox-dot";
      dot.setAttribute("aria-label", `Go to image ${index + 1}`);

      if (index === currentIndex) {
        dot.classList.add("active");
      }

      dot.addEventListener("click", () => {
        showImage(index);
      });

      lightboxDotsContainer.appendChild(dot);
    });
  }

  // Update active dot
  function updateLightboxDots(activeIndex) {
    const dots = lightboxDotsContainer.querySelectorAll(".lightbox-dot");
    dots.forEach((dot, index) => {
      if (index === activeIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  // Close button
  closeButton.addEventListener("click", closeLightbox);

  // Click outside (on overlay)
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Previous button
  prevButton.addEventListener("click", () => {
    showImage(currentIndex - 1);
  });

  // Next button
  nextButton.addEventListener("click", () => {
    showImage(currentIndex + 1);
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      showImage(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      showImage(currentIndex + 1);
    }
  });

  console.log("✅ Lightbox initialized!");
}
