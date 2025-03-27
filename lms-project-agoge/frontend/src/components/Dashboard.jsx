import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const Dashboard = () => {
  const { theme, loading, updateTheme } = useTheme();
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newSettings, setNewSettings] = useState({
    primary_color: "",
    text_color: "",
    secondary_color: "",
    background_color: "",
    logoFile: null
  });

  // Uppdatera newSettings när theme laddas
  useEffect(() => {
    if (theme) {
      setNewSettings({
        primary_color: theme.primary_color || "#007bff",
        text_color: theme.text_color || "#000000",
        secondary_color: theme.secondary_color || "#6c757d",
        background_color: theme.background_color || "#f5f5f5",
        logoFile: null
      });
    }
  }, [theme]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Återställ till nuvarande tema
      setNewSettings({
        primary_color: theme.primary_color,
        text_color: theme.text_color,
        secondary_color: theme.secondary_color,
        background_color: theme.background_color,
        logoFile: null
      });
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
      [name]: value,
      [`${name}_rgb`]: hexToRgb(value),
    }));
  };

  const handleLogoChange = (e) => {
    setNewSettings((prevSettings) => ({
      ...prevSettings,
      logoFile: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Lägg till alla färginställningar
      formData.append("primary_color", newSettings.primary_color);
      formData.append("text_color", newSettings.text_color);
      formData.append("secondary_color", newSettings.secondary_color);
      formData.append("background_color", newSettings.background_color);
      
      // Lägg till logotyp om den finns
      if (newSettings.logoFile) {
        formData.append("logo", newSettings.logoFile);
      }
      
      // Använd updateTheme från ThemeContext
      await updateTheme(newSettings);
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Error updating settings:", err);
      setError("Enbart administratören kan uppdatera inställningar. Kontakta din administratör.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">Laddar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-background" style={{ backgroundColor: theme.background_color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text_color }}>
            Välkommen till din dashboard
          </h2>
          <p style={{ color: theme.text_color }}>
            Här kan du hantera dina inställningar och se information om ditt konto.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primär färg ({newSettings.primary_color_rgb || hexToRgb(newSettings.primary_color)})
              </label>
              <input
                type="color"
                name="primary_color"
                value={newSettings.primary_color}
                onChange={handleColorChange}
                className="h-10 w-20 border-0 p-0 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Textfärg ({newSettings.text_color_rgb || hexToRgb(newSettings.text_color)})
              </label>
              <input
                type="color"
                name="text_color"
                value={newSettings.text_color}
                onChange={handleColorChange}
                className="h-10 w-20 border-0 p-0 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sekundär färg ({newSettings.secondary_color_rgb || hexToRgb(newSettings.secondary_color)})
              </label>
              <input
                type="color"
                name="secondary_color"
                value={newSettings.secondary_color}
                onChange={handleColorChange}
                className="h-10 w-20 border-0 p-0 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bakgrundsfärg ({newSettings.background_color_rgb || hexToRgb(newSettings.background_color)})
              </label>
              <input
                type="color"
                name="background_color"
                value={newSettings.background_color}
                onChange={handleColorChange}
                className="h-10 w-20 border-0 p-0 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logotyp
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: theme.primary_color, color: theme.text_color }}
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
            className="mt-4 px-4 py-2 rounded-md"
            style={{ backgroundColor: theme.primary_color, color: theme.text_color }}
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
