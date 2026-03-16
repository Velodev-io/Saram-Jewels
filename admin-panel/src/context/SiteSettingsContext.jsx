import React, { createContext, useContext, useState } from 'react';

const SiteSettingsContext = createContext();

export const SiteSettingsProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Saram Jewels Admin',
    siteDescription: 'Admin panel for Saram Jewels',
    currency: 'INR',
    taxRate: 18,
    shippingCost: 50,
    freeShippingThreshold: 5000
  });

  const updateSiteSettings = (newSettings) => {
    setSiteSettings({ ...siteSettings, ...newSettings });
  };

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, updateSiteSettings }}>
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
