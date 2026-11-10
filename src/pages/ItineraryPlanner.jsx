import React, { useState } from "react";
import GeminiItineraryForm from "../components/GeminiItineraryForm";
import GeminiItineraryDisplay from "../components/GeminiItineraryDisplay";

const ItineraryPlanner = () => {
  const [itinerary, setItinerary] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleItineraryGenerated = (result, form) => {
    setItinerary(result);
    setFormData(form);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 300);
  };

  const handleNewItinerary = () => {
    setItinerary(null);
    setFormData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
            🗺️ Plan Your Indian Journey
          </h1>
          <p className="text-lg text-amber-800">
            AI-powered itinerary planning powered by Google Gemini. Select a state or let our AI
            recommend the best destination based on your travel dates and duration.
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">📋 Trip Details</h2>
          <GeminiItineraryForm onItineraryGenerated={handleItineraryGenerated} />
        </div>

        {/* Results Section */}
        {itinerary && formData && (
          <>
            <GeminiItineraryDisplay itinerary={itinerary} formData={formData} />

            {/* Plan Another Button */}
            <button
              onClick={handleNewItinerary}
              className="mt-8 w-full md:w-auto mx-auto block bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 px-8 rounded-xl transition duration-300"
            >
              ← Plan Another Itinerary
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ItineraryPlanner;
