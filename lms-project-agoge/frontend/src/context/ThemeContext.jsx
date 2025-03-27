// src/context/ThemeContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { DashboardService } from '../services/api'; // This should now work
// Remove the axios import since we're using the api service

// ... rest of your ThemeContext code remains the same ...

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primary_color: "#007bff",
    text_color: "#000000",
    secondary_color: "#6c757d",
    background_color: "#f5f5f5",
    logo: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const settings = await DashboardService.getSettings();
        setTheme(settings);
        
        // Sätt CSS-variabler för global styling
        document.documentElement.style.setProperty('--primary-color', settings.primary_color);
        document.documentElement.style.setProperty('--text-color', settings.text_color);
        document.documentElement.style.setProperty('--secondary-color', settings.secondary_color);
        document.documentElement.style.setProperty('--background-color', settings.background_color || '#f5f5f5');
      } catch (err) {
        console.error("Kunde inte hämta temainställningar:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  // Flytta updateTheme-funktionen inuti ThemeProvider-komponenten
  const updateTheme = async (newTheme) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Lägg till alla inställningar i formData
      if (newTheme.primary_color) formData.append("primary_color", newTheme.primary_color);
      if (newTheme.text_color) formData.append("text_color", newTheme.text_color);
      if (newTheme.secondary_color) formData.append("secondary_color", newTheme.secondary_color);
      if (newTheme.background_color) formData.append("background_color", newTheme.background_color);
      
      // Hantera logo separat om det är en fil
      if (newTheme.logoFile) {
        formData.append("logo", newTheme.logoFile);
      }

      // Använd DashboardService istället för direkt axios-anrop
      const updatedSettings = await DashboardService.updateSettings(formData);
      setTheme(updatedSettings);
      
      // Uppdatera CSS-variabler
      document.documentElement.style.setProperty('--primary-color', updatedSettings.primary_color);
      document.documentElement.style.setProperty('--text-color', updatedSettings.text_color);
      document.documentElement.style.setProperty('--secondary-color', updatedSettings.secondary_color);
      document.documentElement.style.setProperty('--background-color', updatedSettings.background_color || '#f5f5f5');
      
      return updatedSettings;
    } catch (err) {
      console.error("Error updating theme:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, loading, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
