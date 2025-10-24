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
import StorageWrapper from "../components/ecommerce/storage-wrapper";
import "../public/assets/css/main.css";
import "../public/assets/css/customstyles.css";
import store from "../redux/store";
import "@smastrom/react-rating/style.css";

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <title>Nest - Redux NextJS eCommerce Template</title>
      </Head>
      <StorageWrapper>
        <Component {...pageProps} />
        <ToastContainer />
      </StorageWrapper>
    </Provider>
  );
}

export default MyApp;
