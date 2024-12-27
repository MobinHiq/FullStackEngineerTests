import React, { createContext, useContext, useState, useCallback } from "react";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

const ConfigurationContext = createContext();

export const ConfigurationProvider = ({ children }) => {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshConfigurations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithTimeout("/api/configuration", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setConfigurations(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch configurations:", error);
      setConfigurations([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    configurations,
    loading,
    refreshConfigurations,
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error(
      "useConfiguration must be used within a ConfigurationProvider"
    );
  }
  return context;
};
