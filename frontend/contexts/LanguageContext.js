import { createContext, useContext } from "react";

export const LanguageContext = createContext({
  locale: "ar",
  changeLanguage: () => {},
  isRTL: true,
  isLoading: false,
});

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageProvider");
  }
  return context;
};
