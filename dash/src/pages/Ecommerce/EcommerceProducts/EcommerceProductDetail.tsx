import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Tooltip,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Spinner,
  Alert,
  Badge,
} from "reactstrap";

//Simple bar
import SimpleBar from "simplebar-react";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "../../../hooks/useProducts";
import { parseApiError } from "../../../utils/errorHandler";
import {
  calculateProductStock,
  getLowStockVariants,
} from "../../../hooks/useProducts";

import { Swiper, SwiperSlide } from "swiper/react";
import classnames from "classnames";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { FreeMode, Navigation, Pagination, Thumbs } from "swiper/modules";

const ProductReview = (props: any) => {
  return (
    <React.Fragment>
      <li className="py-2">
        <div className="border border-dashed rounded p-3">
          <div className="d-flex align-items-start mb-3">
            <div className="hstack gap-3">
              <div className="badge rounded-pill bg-primary mb-0">
                <i className="mdi mdi-star"></i> {props.review.rating}
              </div>
              <div className="vr"></div>
              <div className="flex-grow-1">
                <p className="text-muted mb-0">{props.review.comment}</p>
              </div>
            </div>
          </div>
          {props.review.subitem && (
            <div className="d-flex flex-grow-1 gap-2 mb-3">
              {(props.review.subitem || []).map((subItem: any, key: number) => (
                <React.Fragment key={key}>
                  <Link to="#" className="d-block">
                    <img
                      src={subItem.img}
                      alt=""
                      className="avatar-sm rounded object-fit-cover"
                    />
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="d-flex align-items-end">
            <div className="flex-grow-1">
              <h5 className="fs-14 mb-0">{props.review.name}</h5>
            </div>

            <div className="flex-shrink-0">
              <p className="text-muted fs-13 mb-0">{props.review.date}</p>
            </div>
          </div>
        </div>
      </li>
    </React.Fragment>
  );
};

const PricingWidgetList = (props: any) => {
  return (
    <React.Fragment>
      <Col lg={3} sm={6}>
        <div className="p-2 border border-dashed rounded">
          <div className="d-flex align-items-center">
            <div className="avatar-sm me-2">
              <div className="avatar-title rounded bg-transparent text-primary fs-24">
                <i className={props.pricingDetails.icon}></i>
              </div>
            </div>
            <div className="flex-grow-1">
              <p className="text-muted mb-1">{props.pricingDetails.label} :</p>
              <h5 className="mb-0">{props.pricingDetails.labelDetail}</h5>
            </div>
          </div>
        </div>
      </Col>
    </React.Fragment>
  );
};

function EcommerceProductDetail() {
  const params = useParams<{ _id: string }>();
  const { _id: id } = params;
  const { data: product, isLoading, error } = useProduct(id || "");

  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [ttop, setttop] = useState(false);
  const [customActiveTab, setcustomActiveTab] = useState("1");

  const toggleCustom = (tab: any) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
    }
  };
  useEffect(() => {
    console.log("URL params:", params);
    console.log("Product ID:", id);
    console.log("Current URL:", window.location.href);
  }, [id, params]);
  // Calculate stock information
  const stockInfo = product ? calculateProductStock(product) : null;
  const lowStockVariants = product ? getLowStockVariants(product, 10) : [];

  // Generate pricing widgets based on product data
  const generatePricingWidgets = () => {
    if (!product) return [];

    return [
      {
        icon: "ri-money-dollar-circle-line",
        label: "Price",
        labelDetail: `$${product.variants?.[0]?.price || product.price || 0}`,
      },
      {
        icon: "ri-stack-line",
        label: "Stock",
        labelDetail: stockInfo ? `${stockInfo.totalStock} items` : "0 items",
      },
      {
        icon: "ri-star-line",
        label: "Rating",
        labelDetail: product.rating || "4.5",
      },
      {
        icon: "ri-eye-line",
        label: "Status",
        labelDetail: product.isActive ? "Active" : "Inactive",
      },
    ];
  };

  document.title = product
    ? `${product.nameEn} - Product Details`
    : "Product Details | Velzon - React Admin & Dashboard Template";

  if (isLoading) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Product Details" pageTitle="Ecommerce" />
          <Row>
            <Col>
              <div className="text-center py-4">
                <Spinner color="primary" />
                <p className="mt-2">Loading product details...</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Product Details" pageTitle="Ecommerce" />
          <Row>
            <Col>
              <Alert color="danger">
                <h5>Error loading product</h5>
                <p>{parseApiError(error)}</p>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Product Details" pageTitle="Ecommerce" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Row className="gx-lg-5">
                  <Col xl={4} md={8} className="mx-auto">
                    <div className="product-img-slider sticky-side-div">
                      <Swiper
                        navigation={true}
                        thumbs={{ swiper: thumbsSwiper }}
                        className="swiper product-thumbnail-slider p-2 rounded bg-light"
                        modules={[Thumbs, Navigation]}
                      >
                        <div className="swiper-wrapper">
                          <SwiperSlide>
                            <img
                              src={
                                typeof product.image === "object" &&
                                product.image?.path
                                  ? `http://localhost:4000${product.image.path}`
                                  : "../../assets/images/products/img-1.png"
                              }
                              alt={product.nameEn}
                              className="img-fluid d-block"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "../../assets/images/products/img-1.png";
                              }}
                            />
                          </SwiperSlide>
                        </div>
                      </Swiper>

                      <div className="product-nav-slider mt-2">
                        <Swiper
                          onSwiper={setThumbsSwiper}
                          slidesPerView={4}
                          freeMode={true}
                          watchSlidesProgress={true}
                          spaceBetween={10}
                          className="swiper product-nav-slider mt-2 overflow-hidden"
                          modules={[FreeMode, Pagination]}
                        >
                          <div className="swiper-wrapper">
                            <SwiperSlide className="rounded">
                              <div className="nav-slide-item">
                                <img
                                  src={
                                    typeof product.image === "object" &&
                                    product.image?.path
                                      ? `http://localhost:4000${product.image.path}`
                                      : "../../assets/images/products/img-1.png"
                                  }
                                  alt={product.nameEn}
                                  className="img-fluid d-block rounded"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "../../assets/images/products/img-1.png";
                                  }}
                                />
                              </div>
                            </SwiperSlide>
                          </div>
                        </Swiper>
                      </div>
                    </div>
                  </Col>

                  <Col xl={8}>
                    <div className="mt-xl-0 mt-5">
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <h4>{product.nameEn}</h4>
                          <div className="hstack gap-3 flex-wrap">
                            <div>
                              <Link to="#" className="text-primary d-block">
                                {product.category?.nameEn || "Uncategorized"}
                              </Link>
                            </div>
                            <div className="vr"></div>
                            <div className="text-muted">
                              Type :{" "}
                              <span className="text-dark fw-medium">
                                {product.type || "N/A"}
                              </span>
                            </div>
                            <div className="vr"></div>
                            <div className="text-muted">
                              Created :{" "}
                              <span className="text-dark fw-medium">
                                {product.createdAt
                                  ? new Date(
                                      product.createdAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div>
                            <Tooltip
                              placement="top"
                              isOpen={ttop}
                              target="TooltipTop"
                              toggle={() => {
                                setttop(!ttop);
                              }}
                            >
                              Edit
                            </Tooltip>
                            <Link
                              to={`/apps-ecommerce-add-product?edit=${product.id}`}
                              id="TooltipTop"
                              className="btn btn-light"
                            >
                              <i className="ri-pencil-fill align-bottom"></i>
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
                        <div className="text-muted fs-16">
                          <span className="mdi mdi-star text-warning"></span>
                          <span className="mdi mdi-star text-warning"></span>
                          <span className="mdi mdi-star text-warning"></span>
                          <span className="mdi mdi-star text-warning"></span>
                          <span className="mdi mdi-star text-warning"></span>
                        </div>
                        <div className="text-muted">
                          ( {product.rating || "4.5"} Rating )
                        </div>
                        <Badge color={product.isActive ? "success" : "warning"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <Row className="mt-4">
                        {generatePricingWidgets().map((pricingDetails, key) => (
                          <PricingWidgetList
                            pricingDetails={pricingDetails}
                            key={key}
                          />
                        ))}
                      </Row>

                      {/* Product Variants */}
                      {product.variants && product.variants.length > 0 && (
                        <Row className="mt-4">
                          <Col xl={12}>
                            <div className="mt-4">
                              <h5 className="fs-14">Product Variants :</h5>
                              <div className="table-responsive">
                                <table className="table table-bordered">
                                  <thead>
                                    <tr>
                                      <th>Size</th>
                                      <th>Weight</th>
                                      <th>Price</th>
                                      <th>Stock</th>
                                      <th>SKU</th>
                                      <th>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {product.variants.map((variant, index) => (
                                      <tr key={index}>
                                        <td>
                                          {variant.size} {variant.sizeUnit}
                                        </td>
                                        <td>
                                          {variant.weight} {variant.weightUnit}
                                        </td>
                                        <td>${variant.price}</td>
                                        <td>
                                          <Badge
                                            color={
                                              variant.stock > 0
                                                ? "success"
                                                : "danger"
                                            }
                                          >
                                            {variant.stock} in stock
                                          </Badge>
                                        </td>
                                        <td>{variant.sku}</td>
                                        <td>
                                          <Badge
                                            color={
                                              variant.isActive
                                                ? "success"
                                                : "warning"
                                            }
                                          >
                                            {variant.isActive
                                              ? "Active"
                                              : "Inactive"}
                                          </Badge>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      )}

                      {/* Stock Alerts */}
                      {lowStockVariants.length > 0 && (
                        <Row className="mt-4">
                          <Col>
                            <Alert color="warning">
                              <h6 className="alert-heading">
                                Low Stock Alert!
                              </h6>
                              <p className="mb-0">
                                {lowStockVariants.length} variant
                                {lowStockVariants.length > 1 ? "s" : ""} have
                                low stock (10 or fewer items).
                              </p>
                            </Alert>
                          </Col>
                        </Row>
                      )}

                      <div className="mt-4 text-muted">
                        <h5 className="fs-14">Description :</h5>
                        <p>
                          {product.descriptionEn ||
                            product.descriptionAr ||
                            "No description available."}
                        </p>
                      </div>

                      <div className="product-content mt-5">
                        <h5 className="fs-14 mb-3">Product Details :</h5>
                        <Nav tabs className="nav-tabs-custom nav-primary">
                          <NavItem>
                            <NavLink
                              style={{ cursor: "pointer" }}
                              className={classnames({
                                active: customActiveTab === "1",
                              })}
                              onClick={() => {
                                toggleCustom("1");
                              }}
                            >
                              Specification
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              style={{ cursor: "pointer" }}
                              className={classnames({
                                active: customActiveTab === "2",
                              })}
                              onClick={() => {
                                toggleCustom("2");
                              }}
                            >
                              Details
                            </NavLink>
                          </NavItem>
                        </Nav>

                        <TabContent
                          activeTab={customActiveTab}
                          className="border border-top-0 p-4"
                          id="nav-tabContent"
                        >
                          <TabPane id="nav-speci" tabId="1">
                            <div className="table-responsive">
                              <table className="table mb-0">
                                <tbody>
                                  <tr>
                                    <th scope="row" style={{ width: "200px" }}>
                                      Category
                                    </th>
                                    <td>{product.category?.nameEn || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Type</th>
                                    <td>{product.type || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Status</th>
                                    <td>
                                      {product.isActive ? "Active" : "Inactive"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Rating</th>
                                    <td>{product.rating || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Total Stock</th>
                                    <td>{stockInfo?.totalStock || 0} items</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Variants</th>
                                    <td>
                                      {product.variants?.length || 0} variants
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </TabPane>
                          <TabPane id="nav-detail" tabId="2">
                            <div>
                              <h5 className="font-size-16 mb-3">
                                {product.nameEn}
                              </h5>
                              <p>
                                {product.descriptionEn ||
                                  product.descriptionAr ||
                                  "No detailed description available."}
                              </p>
                              <div>
                                <p className="mb-2">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{" "}
                                  Product ID: {product.id}
                                </p>
                                <p className="mb-2">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{" "}
                                  Created:{" "}
                                  {product.createdAt
                                    ? new Date(
                                        product.createdAt
                                      ).toLocaleString()
                                    : "N/A"}
                                </p>
                                <p className="mb-2">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{" "}
                                  Updated:{" "}
                                  {product.updatedAt
                                    ? new Date(
                                        product.updatedAt
                                      ).toLocaleString()
                                    : "N/A"}
                                </p>
                                <p className="mb-0">
                                  <i className="mdi mdi-circle-medium me-1 text-muted align-middle"></i>{" "}
                                  Company ID: {product.companyId || "N/A"}
                                </p>
                              </div>
                            </div>
                          </TabPane>
                        </TabContent>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default EcommerceProductDetail;
