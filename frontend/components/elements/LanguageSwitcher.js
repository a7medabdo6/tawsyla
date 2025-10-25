import React from "react";
import { useTranslations } from "next-intl";
import { useLanguageContext } from "../../contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { locale, changeLanguage } = useLanguageContext();
  const t = useTranslations("language");

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    changeLanguage(newLocale);
  };

  return (
    <div className="language-switcher">
      <button
        onClick={toggleLanguage}
        className="language-switcher-btn"
        aria-label={t("switchTo", {
          language: locale === "en" ? t("arabic") : t("english"),
        })}
      >
        <i className="fi-rs-world"></i>
        <span className="language-text">{locale === "en" ? "عربي" : "EN"}</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
