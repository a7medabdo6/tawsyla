import { useEffect, useState } from "react";
// import "react-input-range/lib/css/index.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import "slick-carousel/slick/slick-theme.css";
// import "slick-carousel/slick/slick.css";
import "react-responsive-modal/styles.css";
// import WOW from 'wowjs';
// Swiper Slider
import "swiper/css";
import "swiper/css/navigation";
import Head from "next/head";
import { NextIntlClientProvider } from "next-intl";
import StorageWrapper from "../components/ecommerce/storage-wrapper";
import "../public/assets/css/main.css";
import "../public/assets/css/customstyles.css";
import "../public/assets/css/language-switcher.css";
import store from "../redux/store";
import "@smastrom/react-rating/style.css";
import { useLanguage } from "../hooks/useLanguage";
import { getMessages } from "../lib/getMessages";
import { LanguageContext } from "../contexts/LanguageContext";

function MyApp({ Component, pageProps }) {
  const { locale, changeLanguage, isLoading, isRTL } = useLanguage();
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    // Load messages for current locale
    setMessages(getMessages(locale));
  }, [locale]);

  // Show loading state while initializing
  if (isLoading || !messages) {
    return null;
  }

  return (
    <Provider store={store}>
      <LanguageContext.Provider
        value={{ locale, changeLanguage, isRTL, isLoading }}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Head>
            <title>Nest - Redux NextJS eCommerce Template</title>
          </Head>
          <StorageWrapper>
            <Component {...pageProps} />
            <ToastContainer />
          </StorageWrapper>
        </NextIntlClientProvider>
      </LanguageContext.Provider>
    </Provider>
  );
}

export default MyApp;
