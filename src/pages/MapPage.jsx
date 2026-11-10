import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import {
  Navigation,
  MapPin,
  Filter,
  Search,
  Layers,
  Compass,
  Route,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapPage = ({ heritage = [], onPageChange, user }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapView, setMapView] = useState("satellite");
  const [filteredSites, setFilteredSites] = useState(heritage);
  const [selectedSite, setSelectedSite] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Center of India
  const mapRef = useRef(null);

  // Sample heritage sites with coordinates
  const heritageData = [
    {
      id: 1,
      title: "Taj Mahal",
      state: "Uttar Pradesh",
      category: "UNESCO World Heritage Site",
      coords: [27.1751, 78.0421],
      description: "The epitome of love and Mughal architecture",
      image:
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      rating: 4.9,
      visitors: "6M+",
      openHours: "6:00 AM - 7:00 PM",
      entryFee: "₹50 (Indians), ₹1300 (Foreigners)",
    },
    {
      id: 2,
      title: "Red Fort",
      state: "Delhi",
      category: "UNESCO World Heritage Site",
      coords: [28.6562, 77.241],
      description: "Majestic Mughal fortress in Old Delhi",
      image:
        "https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      rating: 4.7,
      visitors: "3M+",
      openHours: "9:30 AM - 4:30 PM",
      entryFee: "₹35 (Indians), ₹500 (Foreigners)",
    },
    {
      id: 3,
      title: "Golden Temple",
      state: "Punjab",
      category: "Religious Site",
      coords: [31.62, 74.8765],
      description: "Holiest Gurudwara of Sikhism",
      image:
        "https://images.unsplash.com/photo-1604999333679-b86d54738315?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      visitors: "5M+",
      openHours: "24 Hours",
      entryFee: "Free",
    },
    {
      id: 4,
      title: "Hampi",
      state: "Karnataka",
      category: "UNESCO World Heritage Site",
      coords: [15.335, 76.46],
      description: "Ruins of Vijayanagar Empire",
      image:
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      rating: 4.8,
      visitors: "500K+",
      openHours: "6:00 AM - 6:00 PM",
      entryFee: "₹40 (Indians), ₹600 (Foreigners)",
    },
    {
      id: 5,
      title: "Mysore Palace",
      state: "Karnataka",
      category: "Royal Palace",
      coords: [12.3051, 76.6551],
      description: "Opulent palace of Wadiyar dynasty",
      image:
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      rating: 4.6,
      visitors: "2.7M+",
      openHours: "10:00 AM - 5:30 PM",
      entryFee: "₹70 (Indians), ₹200 (Foreigners)",
    },
    {
      id: 6,
      title: "Khajuraho Temples",
      state: "Madhya Pradesh",
      category: "UNESCO World Heritage Site",
      coords: [24.8318, 79.9199],
      description: "Medieval Hindu and Jain temples",
      image:
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      rating: 4.5,
      visitors: "1M+",
      openHours: "6:00 AM - 6:00 PM",
      entryFee: "₹40 (Indians), ₹600 (Foreigners)",
    },
  ];

  const categories = [
    {
      id: "all",
      name: "All Sites",
      count: heritageData.length,
      color: "#6366f1",
    },
    {
      id: "UNESCO World Heritage Site",
      name: "UNESCO Sites",
      count: 4,
      color: "#f59e0b",
    },
    { id: "Religious Site", name: "Religious", count: 1, color: "#10b981" },
    { id: "Royal Palace", name: "Palaces", count: 1, color: "#8b5cf6" },
    { id: "Fort", name: "Forts", count: 0, color: "#ef4444" },
  ];

  const mapLayers = [
    {
      id: "streets",
      name: "Streets",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },
    {
      id: "satellite",
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    },
    {
      id: "terrain",
      name: "Terrain",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    },
  ];

  useEffect(() => {
    // Get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    let filtered = heritageData.filter((site) => {
      const matchesSearch =
        site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || site.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredSites(filtered);
  }, [searchQuery, selectedCategory]);

  const createCustomIcon = (category, isSelected = false) => {
    const color =
      categories.find((cat) => cat.id === category)?.color || "#6366f1";
    const size = isSelected ? 40 : 30;

    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size / 2}px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ${isSelected ? "animation: bounce 1s infinite;" : ""}
        ">
          🏛️
        </div>
        <style>
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const addToRoute = (site) => {
    if (!selectedRoute.find((s) => s.id === site.id)) {
      setSelectedRoute([...selectedRoute, site]);
    }
  };

  const removeFromRoute = (siteId) => {
    setSelectedRoute(selectedRoute.filter((s) => s.id !== siteId));
  };

  const clearRoute = () => {
    setSelectedRoute([]);
  };

  const optimizeRoute = () => {
    // Simple nearest neighbor algorithm for route optimization
    if (selectedRoute.length < 2) return;

    const optimized = [selectedRoute[0]];
    const remaining = [...selectedRoute.slice(1)];

    while (remaining.length > 0) {
      const current = optimized[optimized.length - 1];
      let nearestIndex = 0;
      let nearestDistance = calculateDistance(
        current.coords[0],
        current.coords[1],
        remaining[0].coords[0],
        remaining[0].coords[1]
      );

      remaining.forEach((site, index) => {
        const distance = calculateDistance(
          current.coords[0],
          current.coords[1],
          site.coords[0],
          site.coords[1]
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      optimized.push(remaining[nearestIndex]);
      remaining.splice(nearestIndex, 1);
    }

    setSelectedRoute(optimized);
  };

  return (
    <div className="h-screen bg-gray-100 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-lg z-[1000] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-heritage font-bold heritage-text-gradient">
              🗺️ Heritage Map
            </h1>

            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search heritage sites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none w-64"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            {/* Map Layer Toggle */}
            <select
              value={mapView}
              onChange={(e) => setMapView(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none"
            >
              {mapLayers.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>

            {/* Route Mode Toggle */}
            <button
              onClick={() => setIsRouteMode(!isRouteMode)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                isRouteMode
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Route size={18} />
              <span>Route Planner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="pt-20 h-full relative">
        <MapContainer
          center={mapCenter}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            url={
              mapLayers.find((layer) => layer.id === mapView)?.url ||
              mapLayers[0].url
            }
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Heritage Site Markers */}
          {filteredSites.map((site) => (
            <Marker
              key={site.id}
              position={site.coords}
              icon={createCustomIcon(
                site.category,
                selectedSite?.id === site.id
              )}
              eventHandlers={{
                click: () => setSelectedSite(site),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <img
                    src={site.image}
                    alt={site.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-bold text-lg mb-1">{site.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{site.state}</p>
                  <p className="text-gray-700 text-sm mb-3">
                    {site.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-yellow-500">⭐ {site.rating}</span>
                    <span className="text-blue-600">
                      {site.visitors} visitors
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onPageChange("heritage", site)}
                      className="w-full bg-saffron-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-saffron-600 transition-colors"
                    >
                      View Details
                    </button>

                    {isRouteMode && (
                      <button
                        onClick={() => addToRoute(site)}
                        className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      >
                        Add to Route
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: "user-location-marker",
                html: `
                  <div style="
                    background: #3b82f6;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    animation: pulse 2s infinite;
                  "></div>
                  <style>
                    @keyframes pulse {
                      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                      70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                    }
                  </style>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            >
              <Popup>
                <div className="text-center p-2">
                  <p className="font-semibold">📍 Your Location</p>
                  <p className="text-sm text-gray-600">You are here</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Route Planner Panel */}
      <AnimatePresence>
        {isRouteMode && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-20 right-4 bottom-4 w-80 bg-white rounded-2xl shadow-xl p-6 z-[1000] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Route Planner</h2>
              <button
                onClick={() => setIsRouteMode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {selectedRoute.length === 0 ? (
              <div className="text-center py-8">
                <Route size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Click on heritage sites to add them to your route
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">💡 Tips:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Add multiple sites to plan your journey</li>
                    <li>• Optimize route for shortest distance</li>
                    <li>• Get estimated travel time</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                {/* Route Summary */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-800 font-semibold">
                      {selectedRoute.length} Sites Selected
                    </span>
                    <button
                      onClick={optimizeRoute}
                      className="text-blue-600 text-sm hover:text-blue-800"
                    >
                      Optimize Route
                    </button>
                  </div>
                  <div className="text-sm text-blue-600">
                    Estimated time: {selectedRoute.length * 2}+ hours
                  </div>
                </div>

                {/* Route Sites */}
                <div className="space-y-4 mb-6">
                  {selectedRoute.map((site, index) => (
                    <div
                      key={site.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{site.title}</h4>
                        <p className="text-xs text-gray-600">{site.state}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-blue-600">
                            ⏱️ 2-3 hours visit
                          </span>
                          <button
                            onClick={() => removeFromRoute(site.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Route Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      // Generate Google Maps route URL
                      const waypoints = selectedRoute
                        .map((site) => `${site.coords[0]},${site.coords[1]}`)
                        .join("/");
                      const url = `https://www.google.com/maps/dir/${waypoints}`;
                      window.open(url, "_blank");
                    }}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Navigation size={18} />
                    <span>Start Navigation</span>
                  </button>

                  <button
                    onClick={() => {
                      const routeData = JSON.stringify(selectedRoute);
                      navigator.clipboard.writeText(routeData);
                      toast.success("Route copied to clipboard!");
                    }}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Share Route
                  </button>

                  <button
                    onClick={clearRoute}
                    className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Clear Route
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h3 className="font-semibold mb-3">Map Legend</h3>
        <div className="space-y-2">
          {categories
            .filter((cat) => cat.id !== "all")
            .map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}</span>
              </div>
            ))}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-sm">Your Location</span>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 z-[1000] space-y-2">
        <button
          onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() + 1)}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() - 1)}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold"
        >
          −
        </button>
        <button
          onClick={() => {
            if (userLocation) {
              setMapCenter(userLocation);
              mapRef.current?.setView(userLocation, 12);
            }
          }}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
          title="Go to your location"
        >
          📍
        </button>
      </div>
    </div>
  );
};

export default MapPage;
