import React, { useEffect, useState } from "react";
import Preloader from "../../components/elements/Preloader";
import Breadcrumb from "./Breadcrumb";
import Footer from "./Footer";
import Header from "./Header";
import MobileMenu from "./MobileMenu";
import { Head } from "next/document";

const Layout = ({
  children,
  parent,
  sub,
  subChild,
  noBreadcrumb,
  headerStyle,
}) => {
  const [isToggled, setToggled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleClick = () => {
    setToggled(!isToggled);
    isToggled
      ? document.querySelector("body").classList.remove("mobile-menu-active")
      : document.querySelector("body").classList.add("mobile-menu-active");
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // new WOW.WOW({
    //     live: false
    //   }).init()
  }, []);

  return (
    <>
      {isLoading ? (
        <Preloader />
      ) : (
        <>
          <Header
            headerStyle={headerStyle}
            isToggled={isToggled}
            toggleClick={toggleClick}
          />
          {isToggled && (
            <div className="body-overlay-1" onClick={toggleClick}></div>
          )}

          <MobileMenu isToggled={isToggled} toggleClick={toggleClick} />
          <main className="main">
            <Breadcrumb
              parent={parent}
              sub={sub}
              subChild={subChild}
              noBreadcrumb={noBreadcrumb}
            />
            {children}
          </main>
          <Footer />
        </>
      )}
    </>
  );
};

export default Layout;
