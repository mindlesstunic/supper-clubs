"use client";

import { useState } from "react";
import Image from "next/image";
import EventModal from "./EventModal";
import { Calendar, Clock } from "lucide-react";

export default function EventCard({ event, index = 0 }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <article
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-white rounded-2xl overflow-hidden border border-gray-200 cursor-pointer transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl"
        style={{
          animationDelay: `${index * 100}ms`,
        }}
      >
        {/* Photo Section with Overlay Info */}
        <div className="relative h-56 overflow-hidden">
          {event.photos.length > 0 && (
            <Image
              src={event.photos[0]}
              alt={event.name}
              fill
              className={`object-cover transition-transform duration-700 ease-out ${
                isHovered ? "scale-110" : "scale-100"
              }`}
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Info on Photo */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <p className="text-[11px] tracking-widest uppercase text-gray-300 mb-1">
                {event.cuisine}
              </p>
              <h3 className="text-xl font-bold text-white">{event.name}</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-full text-sm font-semibold text-white">
              ₹{event.pricePerPerson.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Host */}
          <p className="text-sm text-gray-600 mb-3">
            Hosted by {event.host.name}
          </p>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {event.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-[11px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer - Date/Time & Seats */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-[13px] text-gray-600">{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                <span className="text-[13px] text-gray-600">{event.time}</span>
              </div>
            </div>
            <span
              className={`text-xs font-semibold ${
                event.availableSeats <= 5 ? "text-red-600" : "text-gray-600"
              }`}
            >
              {event.availableSeats} seats left
            </span>
          </div>
        </div>
      </article>

      <EventModal
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
