"use client";

// ============================================
// DASHBOARD HEADER COMPONENT
// ============================================
// Displays the header with title, nav links, and logout
// 
// Props:
// - email: User's email to display
// - onLogout: Callback function when logout is clicked

export default function DashboardHeader({ email, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-start">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>

        {/* Right side: Nav + User info */}
        <div className="flex flex-col items-end gap-2">
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            
              <a href="/"
              className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              View Events
            </a>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 active:scale-95 cursor-pointer transition-all"
            >
              Logout
            </button>
          </div>
          {/* User Email */}
          <p className="text-sm text-gray-600">{email}</p>
        </div>
      </div>
    </header>
  );
}