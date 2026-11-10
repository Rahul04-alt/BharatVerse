import React, { useState } from "react";
import { Search, Menu, X, User, Heart, Crown, MapPin } from "lucide-react";

const Header = ({
  currentPage,
  onPageChange,
  user,
  onLogin,
  onLogout, // could be omitted from props
  searchQuery,
  onSearchChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // SAFELY ADDED: New itinerary link - doesn't affect other links
  const navLinks = [
    { id: "home", label: "Home" },
    { id: "states", label: "States" },
    { id: "heritage", label: "Heritage" },
    { id: "festivals", label: "Festivals" },
    { id: "arts", label: "Arts" },
    { id: "gems", label: "Hidden Gems" },
    { id: "itinerary", label: "Plan Itinerary", icon: "MapPin" }, // SAFELY ADDED
    { id: "quiz", label: "Quiz" },
    { id: "chat", label: "AI Guide" },
    { id: "map", label: "Map" },
  ];

  const handleLogin = () => {
    const mockUser = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Heritage Explorer",
      email: "explorer@bharatverse.com",
    };
    onLogin(mockUser);
  };

  return (
    <>
      {/* Royal Border Patterns - UNCHANGED */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-orange-400 fixed top-0 w-full z-50" />
      <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent fixed top-1 w-full z-50 opacity-60" />
      <div className="fixed top-1.5 w-full z-40 h-0.5 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />

      {/* Header - UNCHANGED */}
      <header className="fixed top-0 w-full z-40 bg-gradient-to-r from-white via-amber-50/90 to-white backdrop-blur-xl border-b-2 border-amber-200 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-50/30 to-transparent opacity-50 pointer-events-none" />
        <div className="flex items-center justify-between h-20 px-6 relative">
          {/* Logo Section - UNCHANGED */}
          <div className="flex-shrink-0 flex items-center min-w-0 pl-2">
            <button
              onClick={() => {
                onPageChange("home");
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-xl"
              aria-label="Bharatverse Home"
            >
              <Crown className="w-6 h-6 text-amber-700 group-hover:text-amber-800 transition-colors duration-300" />
              <div className="flex flex-col items-start">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 bg-clip-text text-transparent tracking-wide group-hover:from-amber-800 group-hover:via-orange-700 group-hover:to-red-700 transition-all duration-300">
                  BharatVerse
                </h1>
                <p className="text-xs text-amber-700 font-semibold tracking-wide -mt-1 opacity-90">
                  Discover India's Heritage
                </p>
              </div>
            </button>
          </div>

          {/* Navigation - Center - SAFELY UPDATED */}
          <nav className="hidden xl:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-2xl p-2 backdrop-blur-sm border border-amber-200/50 shadow-lg">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onPageChange(link.id);
                    setIsMenuOpen(false);
                    setIsSearchOpen(false);
                  }}
                  className={`px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 border flex items-center gap-1 ${
                    currentPage === link.id
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg transform scale-105 border-amber-300"
                      : "text-amber-800 hover:text-amber-900 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 hover:shadow-md border-transparent hover:border-amber-200 hover:scale-102"
                  }`}
                  aria-current={currentPage === link.id ? "page" : undefined}
                >
                  {link.icon === "MapPin" && <MapPin size={16} />}
                  {link.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Actions - Right Side - UNCHANGED */}
          <div className="flex items-center space-x-3 flex-shrink-0 pl-2">
            {/* Search Button - UNCHANGED */}
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsMenuOpen(false);
              }}
              className={`p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 border ${
                isSearchOpen
                  ? "bg-gradient-to-r from-amber-200 to-orange-200 text-amber-800 border-amber-300 shadow-md"
                  : "text-amber-700 hover:text-amber-800 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 border-transparent hover:border-amber-200 hover:shadow-md"
              }`}
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              <Search size={20} />
            </button>

            {/* User Actions - UNCHANGED */}
            {user ? (
              <div className="flex items-center space-x-2 min-w-0">
                <button
                  onClick={() => onPageChange("account")}
                  className="p-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 border border-transparent hover:border-red-200 hover:shadow-md"
                  aria-label="View bookmarks"
                >
                  <Heart size={20} />
                </button>
                <button
                  onClick={() => onPageChange("account")}
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl text-amber-800 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 border border-transparent hover:border-amber-200 hover:shadow-md max-w-[160px] min-w-0"
                >
                  <User size={18} />
                  <span className="hidden sm:inline font-semibold text-sm truncate max-w-[90px] min-w-0">
                    {user.name}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLogin}
                  className="px-5 py-3 text-sm font-bold text-amber-800 hover:text-amber-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-xl hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 border border-transparent hover:border-amber-200 hover:shadow-md"
                >
                  Login
                </button>
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-amber-700 hover:via-orange-700 hover:to-red-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transform hover:scale-105 border border-amber-400"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button - UNCHANGED */}
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsSearchOpen(false);
              }}
              className="xl:hidden p-3 rounded-xl text-amber-700 hover:text-amber-800 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 border border-transparent hover:border-amber-200 hover:shadow-md"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - SAFELY UPDATED */}
        {isMenuOpen && (
          <div className="xl:hidden bg-gradient-to-r from-amber-50/95 via-white/95 to-amber-50/95 backdrop-blur-xl border-t border-amber-200/60 shadow-lg">
            <div className="max-w-7xl mx-auto px-2 py-6">
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      onPageChange(link.id);
                      setIsMenuOpen(false);
                      setIsSearchOpen(false);
                    }}
                    className={`px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 border flex items-center gap-1 justify-center ${
                      currentPage === link.id
                        ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg border-amber-300"
                        : "text-amber-800 hover:text-amber-900 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 border-amber-200 hover:border-amber-300 hover:shadow-md"
                    }`}
                    aria-current={currentPage === link.id ? "page" : undefined}
                  >
                    {link.icon === "MapPin" && <MapPin size={14} />}
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Bar - UNCHANGED */}
        {isSearchOpen && (
          <div className="bg-gradient-to-r from-amber-50/95 via-white/95 to-amber-50/95 backdrop-blur-xl border-t border-amber-200/60 shadow-lg">
            <div className="max-w-7xl mx-auto px-2 py-6">
              <div className="relative max-w-3xl mx-auto">
                <Search
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 text-amber-600"
                  size={22}
                />
                <input
                  type="search"
                  placeholder="Search heritage sites, festivals, arts and cultural treasures..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gradient-to-r from-white via-amber-50 to-white border-2 border-amber-200 rounded-2xl text-amber-900 placeholder-amber-600/70 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 focus:bg-white transition-all duration-300 outline-none shadow-lg focus:shadow-xl font-medium text-lg"
                  autoFocus
                />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 via-transparent to-amber-100/20 rounded-2xl pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </header>
      {/* Spacer to prevent content overlap - UNCHANGED */}
      <div className="h-20" />
    </>
  );
};

export default Header;