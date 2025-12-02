"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Calendar, Clock, Users, Timer, Check } from "lucide-react";

export default function EventModal({ event, isOpen, onClose }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isHostBioExpanded, setIsHostBioExpanded] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPhotoIndex(0);
      setIsHostBioExpanded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white/95 backdrop-blur-xl rounded-3xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 active:scale-95 transition-all shadow-xl text-2xl font-light z-20 border-2 border-gray-100"
        >
          ✕
        </button>

        {/* LEFT SIDE - Photos */}
        <div className="w-full md:w-1/2 h-80 md:h-full flex flex-col bg-gray-900">
          {/* Main Photo */}
          <div className="relative h-60 md:flex-1 md:min-h-0">
            {event.photos.length > 0 && (
              <Image
                src={event.photos[currentPhotoIndex]}
                alt={`${event.cuisine} photo ${currentPhotoIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={currentPhotoIndex === 0}
              />
            )}

            {/* Photo Counter */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              {currentPhotoIndex + 1} / {event.photos.length}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {event.photos.length > 1 && (
            <div className="flex gap-2 p-3 bg-black/50 backdrop-blur-sm overflow-x-auto h-20 md:h-24 flex-shrink-0">
              {event.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`relative w-16 h-12 md:w-20 md:h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                    index === currentPhotoIndex
                      ? "ring-2 ring-white opacity-100"
                      : "opacity-50 hover:opacity-75"
                  }`}
                >
                  <Image
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE - Content with Sticky Bottom */}
        <div className="w-full md:w-1/2 flex flex-col h-auto md:h-full relative overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-32 md:pb-36">
            <div className="p-6">
              {/* Title Section - Compact */}
              {event.name ? (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
                    {event.name}
                  </h2>
                  <p className="text-sm text-gray-600">{event.cuisine}</p>
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {event.cuisine}
                </h2>
              )}

              {/* Icon Grid - Event Details */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <Calendar size={18} className="text-gray-600 mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Date
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {event.date}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <Clock size={18} className="text-gray-600 mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Time
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {event.time}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <Timer size={18} className="text-gray-600 mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Duration
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {event.duration}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <Users size={18} className="text-gray-600 mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Availability
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      event.availableSeats <= 5
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {event.availableSeats} seats
                  </p>
                </div>
              </div>

              {/* Menu - Compact */}
              <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>🍽️</span>
                  <span>Menu</span>
                </h3>
                <div className="space-y-1">
                  {event.menu.map((dish, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 text-xs mt-0.5 font-medium">
                        {index + 1}.
                      </span>
                      <p className="text-gray-900 text-sm font-medium flex-1">
                        {dish}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              {event.includes && event.includes.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    What's Included
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {event.includes.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check
                          size={14}
                          className="text-green-600 flex-shrink-0"
                        />
                        <span className="text-xs text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Host - Compact */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Hosted by {event.host.name}
                </h3>
                <p
                  className={`text-xs text-gray-600 leading-relaxed ${
                    !isHostBioExpanded ? "line-clamp-2" : ""
                  }`}
                >
                  {event.host.bio}
                </p>
                {event.host.bio && event.host.bio.length > 100 && (
                  <button
                    onClick={() => setIsHostBioExpanded(!isHostBioExpanded)}
                    className="text-gray-900 text-xs font-medium mt-1 hover:underline"
                  >
                    {isHostBioExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>

              {/* Location - Compact */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {event.club.name}
                </h3>
                <p className="text-xs text-gray-600">
                  {event.club.location.area}, {event.club.location.city}
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Bottom - Price & Button */}
          <div className="sticky md:absolute bottom-0 left-0 right-0 p-4 md:p-6 border-t border-gray-200 bg-white shadow-2xl z-10">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Price per person</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  ₹{event.pricePerPerson.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  const phoneNumber = event.club.phone.replace(/[\s\-+]/g, "");
                  const message = encodeURIComponent(
                    `Hi! from bookmysupper.com I'd like to reserve seats for:\n\n` +
                      `Event: ${event.name}\n` +
                      `Date: ${event.date} • ${event.time}\n` +
                      `Location: ${event.club.location.area}\n\n` +
                      `Please let me know about availability. Thank you!`
                  );
                  window.open(
                    `https://wa.me/${phoneNumber}?text=${message}`,
                    "_blank"
                  );
                }}
                className="bg-black text-white px-5 md:px-6 py-2 md:py-2.5 rounded-full font-semibold hover:bg-gray-800 active:scale-95 transition-all text-sm whitespace-nowrap"
              >
                Reserve via whatsapp
              </button>
            </div>
            <p className="text-[10px] text-gray-500 text-center">
              Free cancellation up to 48 hours before
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
