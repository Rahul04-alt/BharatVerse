import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Image,
  MapPin,
  Calendar,
  Type,
  Camera,
  Mic,
  Globe,
  Star,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { uploadFileToStorage, insertHeritageGem } from "../lib/supabaseClient";

// Mock user data for testing (use this in your parent component)
export const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID format
  name: "Heritage Explorer",
  email: "explorer@bharatverse.com",
};

const UploadPage = ({ user, onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    culturalSignificance: "",
    state: "",
    city: "",
    category: "",
    coordinates: { lat: "", lng: "" },
    visitDate: "",
    bestTimeToVisit: "",
    howToReach: "",
    accessibility: "",
    localTips: "",
    nearbyAttractions: [],
    tags: [],
    isHidden: false,
    submitterInfo: {
      name: user?.name || "",
      email: user?.email || "",
      canContact: true,
    },
  });
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [audioRecording, setAudioRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Basic Info",
      icon: Type,
      description: "Tell us about your discovery",
    },
    {
      id: 2,
      title: "Location",
      icon: MapPin,
      description: "Where is this hidden gem?",
    },
    {
      id: 3,
      title: "Media",
      icon: Camera,
      description: "Share photos and recordings",
    },
    {
      id: 4,
      title: "Details",
      icon: Star,
      description: "Add cultural significance",
    },
    {
      id: 5,
      title: "Review",
      icon: CheckCircle,
      description: "Review and submit",
    },
  ];

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
  ];

  const categories = [
    "Hidden Tourist Place",
    "Ancient Temple",
    "Historical Fort",
    "Royal Palace",
    "Archaeological Site",
    "Natural Heritage",
    "Folk Art Tradition",
    "Traditional Craft",
    "Festival Site",
    "Architectural Marvel",
    "Cultural Landscape",
    "Hidden Village",
    "Sacred Grove",
    "Stepwell",
    "Cave Complex",
    "Rock Art",
    "Living Heritage",
    "Other",
  ];

  const suggestedTags = [
    "ancient",
    "temple",
    "fort",
    "palace",
    "sculpture",
    "architecture",
    "festival",
    "tradition",
    "craft",
    "spiritual",
    "historical",
    "cultural",
    "art",
    "music",
    "dance",
    "cuisine",
    "wildlife",
    "nature",
    "photography",
    "meditation",
  ];

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      caption: "",
    }));

    setImages((prev) => [...prev, ...newImages].slice(0, 8));
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  const updateImageCaption = (id, caption) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleInputChange(
            "coordinates.lat",
            position.coords.latitude.toFixed(6)
          );
          handleInputChange(
            "coordinates.lng",
            position.coords.longitude.toFixed(6)
          );
          toast.success("Location detected!");
        },
        (error) => {
          toast.error("Failed to get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  };

  const startAudioRecording = () => {
    if ("MediaRecorder" in window) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          const chunks = [];

          mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "audio/wav" });
            setAudioRecording({
              blob,
              url: URL.createObjectURL(blob),
              duration: Date.now() - recordingStartTime,
            });
          };

          const recordingStartTime = Date.now();
          mediaRecorder.start();
          setIsRecording(true);

          setTimeout(() => {
            if (mediaRecorder.state === "recording") {
              mediaRecorder.stop();
              setIsRecording(false);
              stream.getTracks().forEach((track) => track.stop());
            }
          }, 120000);
        })
        .catch((err) => {
          toast.error("Could not access microphone");
          console.error(err);
        });
    }
  };

  const addTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      handleInputChange("tags", [...formData.tags, tag]);
    }
  };

  const removeTag = (tag) => {
    handleInputChange(
      "tags",
      formData.tags.filter((t) => t !== tag)
    );
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return (
          formData.title.trim() &&
          formData.description.trim() &&
          formData.category
        );
      case 2:
        return formData.state && formData.city.trim();
      case 3:
        return images.length > 0;
      case 4:
        return formData.culturalSignificance.trim();
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // UPDATED HANDLESUBMIT WITH PROPER UUID HANDLING
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Please complete all required fields");
      return;
    }

    // Ensure user is authenticated
    if (!user || !user.id) {
      toast.error(
        "You must be logged in to submit heritage gems. Please sign in and try again."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Start upload process
      toast.loading("Starting upload...", { id: "upload" });

      // STEP 1: Upload all images
      const uploadedImages = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        // Create unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const extension = image.file.name.split(".").pop();
        const fileName = `images/${timestamp}-${random}.${extension}`;

        try {
          toast.loading(`Uploading image ${i + 1}/${images.length}...`, {
            id: "upload",
          });

          // Upload to Supabase
          const result = await uploadFileToStorage(image.file, fileName);

          uploadedImages.push({
            url: result.url,
            path: result.path,
            caption: image.caption || "",
            originalName: image.file.name,
            size: image.file.size,
            type: image.file.type,
            uploadedAt: new Date().toISOString(),
          });

          console.log(`Successfully uploaded image ${i + 1}:`, result);
        } catch (error) {
          console.error(`Failed to upload ${image.file.name}:`, error);
          toast.error(`Failed to upload ${image.file.name}: ${error.message}`);
        }
      }

      // Check if at least one image uploaded
      if (uploadedImages.length === 0) {
        throw new Error("No images uploaded successfully");
      }

      // STEP 2: Upload audio (if exists)
      let audioUrl = null;
      if (audioRecording && audioRecording.blob) {
        try {
          toast.loading("Uploading audio...", { id: "upload" });

          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2);
          const audioFileName = `audio/${timestamp}-${random}.wav`;

          const audioResult = await uploadFileToStorage(
            audioRecording.blob,
            audioFileName
          );
          audioUrl = audioResult.url;

          console.log("Audio recording uploaded successfully:", audioResult);
        } catch (error) {
          console.error("Audio upload failed:", error);
          toast.error("Audio upload failed but continuing with submission");
        }
      }

      // STEP 3: Save to database
      toast.loading("Saving to database...", { id: "upload" });

      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        cultural_significance: formData.culturalSignificance.trim(),
        state: formData.state,
        city: formData.city.trim(),
        category: formData.category,
        coordinates: {
          lat: formData.coordinates.lat
            ? parseFloat(formData.coordinates.lat)
            : null,
          lng: formData.coordinates.lng
            ? parseFloat(formData.coordinates.lng)
            : null,
        },
        visit_date: formData.visitDate || null,
        best_time_to_visit: formData.bestTimeToVisit.trim() || null,
        how_to_reach: formData.howToReach.trim() || null,
        accessibility: formData.accessibility.trim() || null,
        local_tips: formData.localTips.trim() || null,
        nearby_attractions: formData.nearbyAttractions || [],
        tags: formData.tags || [],
        is_hidden: formData.isHidden,
        submitter_info: {
          name: formData.submitterInfo.name || user.name || "",
          email: formData.submitterInfo.email || user.email || "",
          canContact: formData.submitterInfo.canContact,
        },
        submitter_id: user.id, // Use UUID string directly
        images: uploadedImages,
        audio_url: audioUrl,
        submitted_at: new Date().toISOString(),
        status: "pending_review",
      };

      console.log("Prepared submission data:", submissionData);
      console.log("User ID being used:", user.id);

      // Insert into database
      const result = await insertHeritageGem(submissionData);

      console.log("Successfully submitted heritage gem:", result);

      // Success!
      toast.success(`🎉 "${formData.title}" submitted for review!`, {
        id: "upload",
        duration: 5000,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        culturalSignificance: "",
        state: "",
        city: "",
        category: "",
        coordinates: { lat: "", lng: "" },
        visitDate: "",
        bestTimeToVisit: "",
        howToReach: "",
        accessibility: "",
        localTips: "",
        nearbyAttractions: [],
        tags: [],
        isHidden: false,
        submitterInfo: {
          name: user?.name || "",
          email: user?.email || "",
          canContact: true,
        },
      });

      setImages([]);
      setAudioRecording(null);
      setCurrentStep(1);

      // Call original onSubmit if exists
      if (onSubmit) {
        await onSubmit(result);
      }
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage = "Upload failed. Please try again.";
      if (
        error.message.includes("new row violates row-level security policy")
      ) {
        errorMessage =
          "Database permission error. Please ensure you're properly logged in and try again.";
      } else if (error.message.includes("invalid input syntax for type uuid")) {
        errorMessage = "Invalid user ID format. Please refresh and try again.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = "Network error. Check your internet connection.";
      } else if (error.message.includes("storage")) {
        errorMessage = "File upload failed. Check file sizes and try again.";
      } else if (
        error.message.includes("database") ||
        error.message.includes("insert")
      ) {
        errorMessage = "Database error. Please try again or contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: "upload", duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Name of the heritage site or tradition"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Detailed description of the heritage site, its history, and significance"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none h-32 resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hidden"
                checked={formData.isHidden}
                onChange={(e) =>
                  handleInputChange("isHidden", e.target.checked)
                }
                className="rounded border-gray-300 text-saffron-600 focus:ring-saffron-500"
              />
              <label htmlFor="hidden" className="text-sm text-gray-700">
                This is a hidden/lesser-known heritage site
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select state</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City/District *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Nearest city or district"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  value={formData.coordinates.lat}
                  onChange={(e) =>
                    handleInputChange("coordinates.lat", e.target.value)
                  }
                  placeholder="Latitude"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none"
                  step="any"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  value={formData.coordinates.lng}
                  onChange={(e) =>
                    handleInputChange("coordinates.lng", e.target.value)
                  }
                  placeholder="Longitude"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none"
                  step="any"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                >
                  📍 Get Current
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How to Reach
              </label>
              <textarea
                value={formData.howToReach}
                onChange={(e) =>
                  handleInputChange("howToReach", e.target.value)
                }
                placeholder="Detailed directions on how to reach this place"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none h-24 resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Photos * (Max 8 images, 10MB each)
              </label>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? "border-saffron-500 bg-saffron-50"
                    : "border-gray-300 hover:border-saffron-400"
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">
                  Drag & drop images or click to browse
                </p>
                <p className="text-sm text-gray-600">
                  High-quality images help showcase the heritage site better
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                      <input
                        type="text"
                        placeholder="Add caption..."
                        value={image.caption}
                        onChange={(e) =>
                          updateImageCaption(image.id, e.target.value)
                        }
                        className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Recording */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Audio Story (Optional)
              </label>

              <div className="bg-gray-50 rounded-xl p-6 text-center">
                {audioRecording ? (
                  <div>
                    <audio controls src={audioRecording.url} className="mb-4" />
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={() => setAudioRecording(null)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete Recording
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Mic size={32} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Record a personal story or description about this place
                    </p>
                    <button
                      onClick={startAudioRecording}
                      disabled={isRecording}
                      className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                        isRecording
                          ? "bg-red-500 text-white cursor-not-allowed"
                          : "bg-saffron-500 text-white hover:bg-saffron-600"
                      }`}
                    >
                      {isRecording
                        ? "Recording... (Max 2 min)"
                        : "Start Recording"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Significance *
              </label>
              <textarea
                value={formData.culturalSignificance}
                onChange={(e) =>
                  handleInputChange("culturalSignificance", e.target.value)
                }
                placeholder="Explain the cultural, historical, or spiritual importance of this place"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none h-32 resize-none"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When did you visit?
                </label>
                <input
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) =>
                    handleInputChange("visitDate", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Best time to visit
                </label>
                <input
                  type="text"
                  value={formData.bestTimeToVisit}
                  onChange={(e) =>
                    handleInputChange("bestTimeToVisit", e.target.value)
                  }
                  placeholder="e.g., October to March"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Tips & Advice
              </label>
              <textarea
                value={formData.localTips}
                onChange={(e) => handleInputChange("localTips", e.target.value)}
                placeholder="Share helpful tips for other visitors - what to bring, who to contact, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-transparent outline-none h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 bg-saffron-100 text-saffron-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-saffron-600 hover:text-saffron-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {suggestedTags
                  .filter((tag) => !formData.tags.includes(tag))
                  .slice(0, 10)
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-saffron-100 hover:text-saffron-800 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Review Your Submission
              </h3>
              <p className="text-gray-600">
                Please review all details before submitting
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {formData.title}
                </h4>
                <p className="text-gray-600">
                  {formData.category} • {formData.city}, {formData.state}
                </p>
              </div>

              <div>
                <p className="text-gray-700">{formData.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.slice(0, 4).map((image) => (
                  <img
                    key={image.id}
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-20 object-cover rounded-lg"
                  />
                ))}
                {images.length > 4 && (
                  <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    +{images.length - 4} more
                  </div>
                )}
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-saffron-100 text-saffron-800 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>Important:</strong> Your submission will be reviewed by
                our team before publishing. We may contact you for additional
                information. Thank you for contributing to India's heritage
                preservation!
              </p>
            </div>

            {/* Show user info */}
            {user && user.id && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700">
                  <strong>Submitting as:</strong> {user.name} ({user.email})
                </p>
              </div>
            )}

            {/* Show authentication warning if not logged in */}
            {(!user || !user.id) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">
                  <strong>Authentication Required:</strong> You must be logged
                  in to submit heritage gems. Please sign in before submitting.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heritage font-bold heritage-text-gradient mb-4">
            Share a Hidden Heritage Gem
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help preserve India's cultural heritage by sharing lesser-known
            sites, traditions, or cultural practices from your region.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="heritage-card p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-saffron-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle size={20} />
                    ) : (
                      <step.icon size={20} />
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div
                      className={`font-semibold text-sm ${
                        currentStep >= step.id
                          ? "text-saffron-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                      currentStep > step.id ? "bg-saffron-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="heritage-card p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}

            {currentStep < steps.length ? (
              <button onClick={nextStep} className="btn-heritage px-6 py-3">
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !user || !user.id}
                className="btn-heritage px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@bharatverse.com"
              className="text-saffron-600 hover:text-saffron-700"
            >
              support@bharatverse.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
