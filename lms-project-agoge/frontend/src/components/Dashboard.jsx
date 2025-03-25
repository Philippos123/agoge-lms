import { useState, useEffect } from "react";
import { AuthService, DashboardService } from "../services/api";


const Dashboard = () => {
  const [settings, setSettings] = useState({
    primary_color: "#007bff",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newSettings, setNewSettings] = useState({
    primary_color: "#007bff",
    text_color: "#000000",
    secondary_color: "#f44336",
  });
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await DashboardService.getSettings();
        setSettings(data);
        setNewSettings({
          primary_color: data.primary_color,
        });
      } catch (err) {
        console.error("Error fetching settings:", err);
        setSettings({ primary_color: "#2196f3", text_color: "#000000", secondary_color: "#f44336" });
        setError("Kunde inte hämta inställningar. Försök igen senare.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setNewSettings({ primary_color: settings.primary_color, text_color: settings.text_color, secondary_color: settings.secondary_color });
      setLogoFile(null);
    }
  };

  const hexToRgb = (hex) => {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setNewSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value, // Spara HEX-värdet
      [`${name}_rgb`]: hexToRgb(value), // Spara RGB-värdet
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("primary_color", newSettings.primary_color);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const updatedSettings = await DashboardService.updateSettings(formData);
      setSettings(updatedSettings);
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Error updating settings:", err);
      setError("Kunde inte uppdatera inställningar. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 ">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">Laddar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vw-full">
    <div  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Välkommen till din dashboard
        </h2>
        <p className="text-gray-600">
          Här kan du hantera dina inställningar och se information om ditt
          konto.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
  Primär färg ({newSettings.primary_color_rgb || "rgb(0,0,0)"})
</label>
<input
  type="color"
  name="primary_color"
  value={newSettings.primary_color}
  onChange={handleColorChange}
  className="h-10 w-20 border-0 p-0 cursor-pointer"
/>

<label className="block text-sm font-medium text-gray-700 mb-1">
  Textfärg ({newSettings.text_color_rgb || "rgb(0,0,0)"})
</label>
<input
  type="color"
  name="text_color"
  value={newSettings.text_color}
  onChange={handleColorChange}
  className="h-10 w-20 border-0 p-0 cursor-pointer"
/>

<label className="block text-sm font-medium text-gray-700 mb-1">
  Sekundär färg ({newSettings.secondary_color_rgb || "rgb(0,0,0)"})
</label>
<input
  type="color"
  name="secondary_color"
  value={newSettings.secondary_color}
  onChange={handleColorChange}
  className="h-10 w-20 border-0 p-0 cursor-pointer"
/>
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-white"
              style={{ backgroundColor: settings.primary_color, color: settings.text_color }}
              disabled={loading}
            >
              {loading ? "Sparar..." : "Spara ändringar"}
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md"
              onClick={handleEditToggle}
              disabled={loading}
            >
              Avbryt
            </button>
          </div>
        </form>
      ) : (
        <button
          className="mt-4 px-4 py-2 rounded-md "
          style={{ backgroundColor: settings.primary_color, color: settings.text_color }}
          onClick={handleEditToggle}
        >
          Redigera inställningar
        </button>
      )}
    </div>
    </div>
  );
};

export default Dashboard;
