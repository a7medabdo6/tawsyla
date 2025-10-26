import Link from "next/link";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useTranslations } from "next-intl";
import CategoryProduct2 from "../ecommerce/Filter/CategoryProduct2";
import CategoryProduct3 from "../ecommerce/Filter/CategoryProduct3";
import Search from "../ecommerce/Search";
import LanguageSwitcher from "../elements/LanguageSwitcher";

const Header = ({
  totalCartItems,
  totalCompareItems,
  toggleClick,
  totalWishlistItems,
}) => {
  const t = useTranslations();
  const [isToggled, setToggled] = useState(false);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    document.addEventListener("scroll", () => {
      const scrollCheck = window.scrollY >= 100;
      if (scrollCheck !== scroll) {
        setScroll(scrollCheck);
      }
    });
  });

  const handleToggle = () => setToggled(!isToggled);

  return (
    <>
      <header className="header-area header-style-1 header-height-2">
        <div className="mobile-promotion">
          <span>
            {t.rich("header.topBanner", {
              b: (chunks) => <strong>{chunks}</strong>,
            })}
          </span>
        </div>
        <div className="header-top header-top-ptb-1 d-none d-lg-block">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-xl-3 col-lg-4">
                <div className="header-info">
                  <ul>
                    <li>
                      <Link href="/page-about">{t("nav.aboutUs")}</Link>
                    </li>
                    <li>
                      <Link href="/page-account">{t("nav.myAccount")}</Link>
                    </li>
                    <li>
                      <Link href="/shop-wishlist">{t("nav.wishlist")}</Link>
                    </li>
                    <li>
                      <Link href="/page-account">{t("nav.orderTracking")}</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-xl-6 col-lg-4">
                <div className="text-center">
                  <div id="news-flash" className="d-inline-block">
                    <ul>
                      <li>
                        {t("header.promoText")}
                        <Link href="/shop-grid-right">
                          {t("header.viewDetails")}
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4">
                <div className="header-info header-info-right">
                  <ul>
                    <li>
                      {t("header.needHelp")}{" "}
                      <strong className="text-brand">
                        {t("header.phoneNumber")}
                      </strong>
                    </li>
                    <li>
                      <LanguageSwitcher />
                    </li>
                    {/* <li>
                      <a className="language-dropdown-active" href="#">
                        USD <i className="fi-rs-angle-small-down"></i>
                      </a>
                      <ul className="language-dropdown">
                        <li>
                          <a href="#">
                            <img
                              src="/assets/imgs/theme/flag-fr.png"
                              alt="nest"
                            />
                            INR
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img
                              src="/assets/imgs/theme/flag-dt.png"
                              alt="nest"
                            />
                            MBP
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img
                              src="/assets/imgs/theme/flag-ru.png"
                              alt="nest"
                            />
                            EU
                          </a>
                        </li>
                      </ul>
                    </li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="header-middle header-middle-ptb-1 d-none d-lg-block">
          <div className="container">
            <div className="header-wrap">
              <div className="logo logo-width-1">
                <Link href="/">
                  <img src="/assets/imgs/theme/logo.svg" alt="logo" />
                </Link>
              </div>
              <div className="header-right">
                <div className="search-style-2">
                  <Search />
                </div>
                <div className="header-action-right">
                  <div className="header-action-2">
                    {/* <div className="search-location">
                      <form action="#">
                        <select className="select-active">
                          <option>Your Location</option>
                          <option>Alabama</option>
                          <option>Alaska</option>
                          <option>Arizona</option>
                          <option>Delaware</option>
                          <option>Florida</option>
                          <option>Georgia</option>
                          <option>Hawaii</option>
                          <option>Indiana</option>
                          <option>Maryland</option>
                          <option>Nevada</option>
                          <option>New Jersey</option>
                          <option>New Mexico</option>
                          <option>New York</option>
                        </select>
                      </form>
                    </div> */}
                    <div className="header-action-icon-2">
                      <Link href="/shop-compare">
                        <img
                          className="svgInject"
                          alt="Evara"
                          src="/assets/imgs/theme/icons/icon-compare.svg"
                        />
                        <span className="pro-count blue">
                          {totalCompareItems}
                        </span>
                      </Link>
                      <Link href="/shop-compare">
                        <span className="lable ml-0">{t("nav.compare")}</span>
                      </Link>
                    </div>
                    <div className="header-action-icon-2">
                      <Link href="/shop-wishlist">
                        <img
                          className="svgInject"
                          alt="Evara"
                          src="/assets/imgs/theme/icons/icon-heart.svg"
                        />
                        <span className="pro-count blue">
                          {totalWishlistItems}
                        </span>
                      </Link>
                      <Link href="/shop-wishlist">
                        <span className="lable">{t("nav.wishlist")}</span>
                      </Link>
                    </div>
                    <div className="header-action-icon-2">
                      <Link href="/shop-cart" className="mini-cart-icon">
                        <img
                          alt="Evara"
                          src="/assets/imgs/theme/icons/icon-cart.svg"
                        />
                        <span className="pro-count blue">{totalCartItems}</span>
                      </Link>
                      <Link href="/shop-cart">
                        <span className="lable">{t("nav.cart")}</span>
                      </Link>
                    </div>

                    <div className="header-action-icon-2">
                      <Link href="/page-account">
                        <img
                          className="svgInject"
                          alt="Nest"
                          src="/assets/imgs/theme/icons/icon-user.svg"
                        />
                      </Link>
                      <Link href="/page-account">
                        <span className="lable ml-0">{t("nav.account")}</span>
                      </Link>
                      <div className="cart-dropdown-wrap cart-dropdown-hm2 account-dropdown">
                        <ul>
                          <li>
                            <Link href="/page-account">
                              <i className="fi fi-rs-user mr-10"></i>
                              {t("account.myAccount")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/page-account">
                              <i className="fi fi-rs-location-alt mr-10"></i>
                              {t("account.orderTracking")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/page-account">
                              <i className="fi fi-rs-label mr-10"></i>
                              {t("account.myVoucher")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop-wishlist">
                              <i className="fi fi-rs-heart mr-10"></i>
                              {t("account.myWishlist")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/page-account">
                              <i className="fi fi-rs-settings-sliders mr-10"></i>
                              {t("account.setting")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/page-login">
                              <i className="fi fi-rs-sign-out mr-10"></i>
                              {t("account.signOut")}
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={
            scroll
              ? "header-bottom header-bottom-bg-color sticky-bar stick"
              : "header-bottom header-bottom-bg-color sticky-bar"
          }
        >
          <div className="container">
            <div className="header-wrap header-space-between position-relative">
              <div className="logo logo-width-1 d-block d-lg-none">
                <Link href="/">
                  <img src="/assets/imgs/theme/logo.svg" alt="logo" />
                </Link>
              </div>
              <div className="header-nav d-none d-lg-flex">
                <div className="main-categori-wrap d-none d-lg-block">
                  <a
                    className="categories-button-active"
                    onClick={handleToggle}
                  >
                    <span className="fi-rs-apps"></span>
                    {t("header.browseCategories")}
                    <i className="fi-rs-angle-down"></i>
                  </a>

                  <div
                    className={
                      isToggled
                        ? "categories-dropdown-wrap categories-dropdown-active-large font-heading open"
                        : "categories-dropdown-wrap categories-dropdown-active-large font-heading"
                    }
                  >
                    <div className="d-flex categori-dropdown-inner">
                      <CategoryProduct2 />
                      <CategoryProduct3 />
                    </div>
                    <div
                      className="more_slide_open"
                      style={{ display: "none" }}
                    >
                      <div className="d-flex categori-dropdown-inner">
                        <ul>
                          <li>
                            <Link href="/products">
                              <img
                                src="/assets/imgs/theme/icons/icon-1.svg"
                                alt="nest"
                              />
                              {t("categories.milksDairies")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/products">
                              <img
                                src="/assets/imgs/theme/icons/icon-2.svg"
                                alt="nest"
                              />
                              {t("categories.clothingBeauty")}
                            </Link>
                          </li>
                        </ul>
                        <ul className="end">
                          <li>
                            <Link href="/products">
                              <img
                                src="/assets/imgs/theme/icons/icon-3.svg"
                                alt="nest"
                              />
                              {t("categories.winesDrinks")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/products">
                              <img
                                src="/assets/imgs/theme/icons/icon-4.svg"
                                alt="nest"
                              />
                              {t("categories.freshSeafood")}
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="main-menu main-menu-padding-1 main-menu-lh-2 d-none d-lg-block  font-heading">
                  <nav>
                    <ul>
                      <li className="hot-deals">
                        <img
                          src="/assets/imgs/theme/icons/icon-hot.svg"
                          alt="hot deals"
                        />
                        <Link href="/products">{t("nav.hotDeals")}</Link>
                      </li>
                      <li>
                        <Link href="/" className="active">
                          {t("nav.home")}
                          <i className="fi-rs-angle-down"></i>
                        </Link>
                        <ul className="sub-menu">
                          <li>
                            <Link href="/">{t("menu.home1")}</Link>
                          </li>
                          <li>
                            <Link href="/index-2">{t("menu.home2")}</Link>
                          </li>
                          <li>
                            <Link href="/index-3">{t("menu.home3")}</Link>
                          </li>
                          <li>
                            <Link href="/index-4">{t("menu.home4")}</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link href="/page-about">{t("nav.about")}</Link>
                      </li>
                      <li>
                        <Link href="/shop-grid-right">
                          {t("nav.shop")}
                          <i className="fi-rs-angle-down"></i>
                        </Link>
                        <ul className="sub-menu">
                          <li>
                            <Link href="/shop-grid-right">
                              {t("menu.shopGridRight")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/products">
                              {t("menu.shopGridLeft")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop-list-right">
                              {t("menu.shopListRight")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop-list-left">
                              {t("menu.shopListLeft")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop-fullwidth">
                              {t("menu.shopWide")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop-filter">
                              {t("menu.shopFilter")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop-wishlist">
                              {t("menu.shopWishlist")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop-cart">{t("menu.shopCart")}</Link>
                          </li>
                          <li>
                            <Link href="/shop-checkout">
                              {t("menu.shopCheckout")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/shop-compare">
                              {t("menu.shopCompare")}
                            </Link>
                          </li>
                        </ul>
                      </li>

                      <li>
                        <a href="#">
                          {t("nav.vendors")}{" "}
                          <i className="fi-rs-angle-down"></i>
                        </a>
                        <ul className="sub-menu">
                          <li>
                            <Link href="/vendors">{t("menu.vendorsGrid")}</Link>
                          </li>
                          <li>
                            <Link href="/vendors-list">
                              {t("menu.vendorsList")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/vendor-dashboard">
                              {t("menu.vendorDashboard")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/vendor-guide">
                              {t("menu.vendorGuide")}
                            </Link>
                          </li>
                        </ul>
                      </li>

                      <li className="position-static">
                        <Link href="/#">
                          {t("nav.megaMenu")}
                          <i className="fi-rs-angle-down"></i>
                        </Link>
                        <ul className="mega-menu">
                          <li className="sub-mega-menu sub-mega-menu-width-22">
                            <a className="menu-title" href="#">
                              {t("megaMenu.fruitVegetables")}
                            </a>
                            <ul>
                              <li>
                                <a href="#">{t("megaMenu.meatPoultry")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.freshVegetables")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.herbsSeasonings")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.cutsSprouts")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.exoticFruits")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.packagedProduce")}</a>
                              </li>
                            </ul>
                          </li>
                          <li className="sub-mega-menu sub-mega-menu-width-22">
                            <a className="menu-title" href="#">
                              {t("megaMenu.breakfastDairy")}
                            </a>
                            <ul>
                              <li>
                                <a href="#">{t("megaMenu.milkFlavoured")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.butterMargarine")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.eggsSubstitutes")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.marmalades")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.sourCream")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.cheese")}</a>
                              </li>
                            </ul>
                          </li>
                          <li className="sub-mega-menu sub-mega-menu-width-22">
                            <a className="menu-title" href="#">
                              {t("megaMenu.meatSeafood")}
                            </a>
                            <ul>
                              <li>
                                <a href="#">{t("megaMenu.breakfastSausage")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.dinnerSausage")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.chicken")}</a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.slicedDeliMeat")}</a>
                              </li>
                              <li>
                                <a href="#">
                                  {t("megaMenu.wildCaughtFillets")}
                                </a>
                              </li>
                              <li>
                                <a href="#">{t("megaMenu.crabShellfish")}</a>
                              </li>
                            </ul>
                          </li>
                          <li className="sub-mega-menu sub-mega-menu-width-34">
                            <div className="menu-banner-wrap">
                              <a href="#">
                                <img
                                  src="/assets/imgs/banner/banner-menu.png"
                                  alt="Nest"
                                />
                              </a>
                              <div className="menu-banner-content">
                                <h4>{t("megaMenu.hotDeals")}</h4>
                                <h3>
                                  {t("megaMenu.dontMiss")}
                                  <br />
                                  {t("megaMenu.trending")}
                                </h3>
                                <div className="menu-banner-price">
                                  <span className="new-price text-success">
                                    {t("megaMenu.saveUpTo")}
                                  </span>
                                </div>
                                <div className="menu-banner-btn">
                                  <a href="#">{t("megaMenu.shopNow")}</a>
                                </div>
                              </div>
                              <div className="menu-banner-discount">
                                <h3>
                                  <span>25%</span>
                                  {t("megaMenu.off")}
                                </h3>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link href="/blog-category-grid">
                          {t("nav.blog")}
                          <i className="fi-rs-angle-down"></i>
                        </Link>
                        <ul className="sub-menu">
                          <li>
                            <Link href="/blog-category-grid">
                              {t("blog.categoryGrid")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/blog-category-list">
                              {t("blog.categoryList")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/blog-category-big">
                              {t("blog.categoryBig")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/blog-category-fullwidth">
                              {t("blog.categoryWide")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/#">
                              {t("blog.singlePost")}
                              <i className="fi-rs-angle-right"></i>
                            </Link>
                            <ul className="level-menu level-menu-modify">
                              <li>
                                <Link href="/blog-post-left">
                                  {t("blog.leftSidebar")}
                                </Link>
                              </li>
                              <li>
                                <Link href="/blog-post-right">
                                  {t("blog.rightSidebar")}
                                </Link>
                              </li>
                              <li>
                                <Link href="/blog-post-fullwidth">
                                  {t("blog.noSidebar")}
                                </Link>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link href="/#">
                          {t("nav.pages")}
                          <i className="fi-rs-angle-down"></i>
                        </Link>
                        <ul className="sub-menu">
                          <li>
                            <Link href="/page-about">{t("pages.aboutUs")}</Link>
                          </li>
                          <li>
                            <Link href="/page-contact">
                              {t("pages.contact")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/page-account">
                              {t("pages.myAccount")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/page-login">{t("pages.login")}</Link>
                          </li>
                          <li>
                            <Link href="/page-register">
                              {t("pages.register")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/page-purchase-guide">
                              {t("pages.purchaseGuide")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/page-privacy-policy">
                              {t("pages.privacyPolicy")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/page-terms">
                              {t("pages.termsOfService")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/page-404">{t("pages.page404")}</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link href="/page-contact">{t("nav.contact")}</Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              <div className="hotline d-none d-lg-flex">
                <img
                  src="/assets/imgs/theme/icons/icon-headphone.svg"
                  alt="hotline"
                />

                <p>
                  {t("header.hotline")}
                  <span>{t("header.support")}</span>
                </p>
              </div>

              <div className="header-action-icon-2 d-block d-lg-none">
                <div
                  className="burger-icon burger-icon-white"
                  onClick={toggleClick}
                >
                  <span className="burger-icon-top"></span>
                  <span className="burger-icon-mid"></span>
                  <span className="burger-icon-bottom"></span>
                </div>
              </div>

              <div className="header-action-right d-block d-lg-none">
                <div className="header-action-2">
                  <div className="header-action-icon-2">
                    <Link href="/shop-wishlist">
                      <img
                        alt="Evara"
                        src="/assets/imgs/theme/icons/icon-heart.svg"
                      />
                      <span className="pro-count white">
                        {totalWishlistItems}
                      </span>
                    </Link>
                  </div>
                  <div className="header-action-icon-2">
                    <Link href="/shop-cart" className="mini-cart-icon">
                      <img
                        alt="Evara"
                        src="/assets/imgs/theme/icons/icon-cart.svg"
                      />
                      <span className="pro-count white">{totalCartItems}</span>
                    </Link>
                    <div className="cart-dropdown-wrap cart-dropdown-hm2">
                      <ul>
                        <li>
                          <div className="shopping-cart-img">
                            <Link href="/shop-grid-right">
                              <img
                                alt="Evara"
                                src="/assets/imgs/shop/thumbnail-3.jpg"
                              />
                            </Link>
                          </div>
                          <div className="shopping-cart-title">
                            <h4>
                              <Link href="/shop-grid-right">
                                Plain Striola Shirts
                              </Link>
                            </h4>
                            <h3>
                              <span>1 × </span>
                              $800.00
                            </h3>
                          </div>
                          <div className="shopping-cart-delete">
                            <Link href="/#">
                              <i className="fi-rs-cross-small"></i>
                            </Link>
                          </div>
                        </li>
                        <li>
                          <div className="shopping-cart-img">
                            <Link href="/shop-grid-right">
                              <img
                                alt="Evara"
                                src="/assets/imgs/shop/thumbnail-4.jpg"
                              />
                            </Link>
                          </div>
                          <div className="shopping-cart-title">
                            <h4>
                              <Link href="/shop-grid-right">
                                Macbook Pro 2024
                              </Link>
                            </h4>
                            <h3>
                              <span>1 × </span>
                              $3500.00
                            </h3>
                          </div>
                          <div className="shopping-cart-delete">
                            <Link href="/#">
                              <i className="fi-rs-cross-small"></i>
                            </Link>
                          </div>
                        </li>
                      </ul>
                      <div className="shopping-cart-footer">
                        <div className="shopping-cart-total">
                          <h4>
                            {t("common.total")}
                            <span>$383.00</span>
                          </h4>
                        </div>
                        <div className="shopping-cart-button">
                          <Link href="/shop-cart">{t("common.viewCart")}</Link>
                          <Link href="/shop-checkout">
                            {t("common.checkout")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

const mapStateToProps = (state) => ({
  totalCartItems: state.cart.length,
  totalCompareItems: state.compare.items.length,
  totalWishlistItems: state.wishlist.items.length,
});

export default connect(mapStateToProps, null)(Header);
