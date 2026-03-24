import React, { createContext, useContext, useState, useEffect } from 'react';

const SiteSettingsContext = createContext();

export const SiteSettingsProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Saram Jewels',
    siteDescription: 'Premium Jewelry Collection',
    currency: 'INR',
    taxRate: 18,
    shippingCost: 200,
    freeShippingThreshold: 5000
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        setSiteSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading site settings:', error);
      }
    }
  }, []);

  const updateSiteSettings = (newSettings) => {
    const updatedSettings = { ...siteSettings, ...newSettings };
    setSiteSettings(updatedSettings);
    localStorage.setItem('siteSettings', JSON.stringify(updatedSettings));
  };

  const value = {
    siteSettings,
    updateSiteSettings
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
