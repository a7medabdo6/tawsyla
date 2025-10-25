import { useState, useEffect } from "react";

const LOCALE_STORAGE_KEY = "preferred-locale";
const DEFAULT_LOCALE = "ar";

export const useLanguage = () => {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load locale from localStorage on mount
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (savedLocale && (savedLocale === "en" || savedLocale === "ar")) {
      setLocale(savedLocale);
      // Update HTML dir attribute
      document.documentElement.dir = savedLocale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = savedLocale;
    }
    setIsLoading(false);
  }, []);

  const changeLanguage = (newLocale) => {
    if (newLocale !== "en" && newLocale !== "ar") {
      console.error('Invalid locale. Only "en" and "ar" are supported.');
      return;
    }

    setLocale(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

    // Update HTML dir attribute for RTL/LTR
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLocale;
  };

  return {
    locale,
    changeLanguage,
    isLoading,
    isRTL: locale === "ar",
  };
};
