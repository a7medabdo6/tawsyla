import React, { useEffect, useState, useMemo } from "react";

import {
  Container,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  Nav,
  NavItem,
  NavLink,
  UncontrolledCollapse,
  Row,
  Card,
  CardHeader,
  Col,
  Spinner,
  Alert,
} from "reactstrap";
import classnames from "classnames";

// RangeSlider
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import DeleteModal from "../../../Components/Common/DeleteModal";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";

// Import product hooks
import {
  useProducts,
  useDeleteProduct,
  useBulkDeleteProducts,
  calculateProductStock,
  getLowStockVariants,
} from "../../../hooks/useProducts";
import { useCategories } from "../../../hooks/useCategories";
import { parseApiError } from "../../../utils/errorHandler";

import { isEmpty } from "lodash";
import Select from "react-select";

import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const EcommerceProducts = (props: any) => {
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Use the new product hooks with pagination and search
  const {
    data: productsResponse,
    isLoading,
    error,
  } = useProducts({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    isActive: selectedStatus || undefined,
  });

  // Fetch categories for filtering
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const deleteProductMutation = useDeleteProduct();
  const bulkDeleteMutation = useBulkDeleteProducts();

  const [productList, setProductList] = useState<any>([]);
  const [activeTab, setActiveTab] = useState<any>("1");
  const [selectedMulti, setselectedMulti] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);

  // Extract products from the API response

  // Handle page change
  const handlePageChange = (page: number) => {
    console.log(page, "pageeeee");

    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  useEffect(() => {
    console.log(currentPage, "currentPage");
  }, [currentPage]);

  // Handle search
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === "all" ? "" : categoryId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  function handleMulti(selectedMulti: any) {
    setselectedMulti(selectedMulti);
  }

  const [cate, setCate] = useState("all");

  const categories = (category: any) => {
    let filteredProducts = productsResponse?.data;
    if (category !== "all") {
      filteredProducts = productsResponse?.data.filter(
        (product: any) => product.category === category
      );
    }
    setProductList(filteredProducts);
    setCate(category);
  };

  //delete order
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);

  const onClickDelete = (product: any) => {
    setProduct(product);
    setDeleteModal(true);
  };

  const handleDeleteProduct = () => {
    if (product) {
      deleteProductMutation.mutate(product.id, {
        onSuccess: () => {
          setDeleteModal(false);
          toast.success("Product deleted successfully!");
        },
        onError: (error) => {
          toast.error(parseApiError(error));
        },
      });
    }
  };

  const [dele, setDele] = useState(0);

  // Displat Delete Button
  const displayDelete = () => {
    const ele = document.querySelectorAll(".productCheckBox:checked");
    const del = document.getElementById("selection-element") as HTMLElement;
    setDele(ele.length);
    if (ele.length === 0) {
      del.style.display = "none";
    } else {
      del.style.display = "block";
    }
  };

  // Delete Multiple
  const deleteMultiple = () => {
    const ele = document.querySelectorAll(".productCheckBox:checked");
    const del = document.getElementById("selection-element") as HTMLElement;
    const productIds = Array.from(ele).map((element: any) => element.value);

    if (productIds.length > 0) {
      bulkDeleteMutation.mutate(productIds, {
        onSuccess: () => {
          toast.success(`${productIds.length} products deleted successfully!`);
          del.style.display = "none";
        },
        onError: (error) => {
          toast.error(parseApiError(error));
        },
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cell: any) => {
          return (
            <input
              type="checkbox"
              className="productCheckBox form-check-input"
              value={cell.getValue()}
              onClick={() => displayDelete()}
            />
          );
        },
      },
      {
        header: "Product",
        accessorKey: "nameAr",
        enableColumnFilter: false,
        cell: (cell: any) => (
          <>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="avatar-sm bg-light rounded p-1">
                  <img
                    src={
                      "http://localhost:4000" + cell.row.original.image?.path ||
                      "../../assets/images/products/img-1.png"
                    }
                    alt={cell.getValue()}
                    className="img-fluid d-block"
                    onError={(e) => {
                      e.currentTarget.src =
                        "../../assets/images/products/img-1.png";
                    }}
                  />
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="fs-14 mb-1">
                  <Link
                    to={`/apps-ecommerce-product-details/${cell.row.original.id}`}
                    className="text-body"
                  >
                    {cell.getValue()}
                  </Link>
                </h5>
                <p className="text-muted mb-0">
                  Category:{" "}
                  <span className="fw-medium">
                    {cell.row.original.category?.nameEn || "Uncategorized"}
                  </span>
                </p>
                {cell.row.original.descriptionAr && (
                  <p className="text-muted mb-0 fs-12">
                    {cell.row.original.descriptionAr.length > 50
                      ? `${cell.row.original.descriptionAr.substring(0, 50)}...`
                      : cell.row.original.descriptionAr}
                  </p>
                )}
              </div>
            </div>
          </>
        ),
      },
      {
        header: "Stock",
        accessorKey: "stock",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const product = cell.row.original;
          const { totalStock, hasStock, variantCount } =
            calculateProductStock(product);

          // Check for low stock variants
          const lowStockVariants = getLowStockVariants(product, 10);
          const hasLowStock = lowStockVariants.length > 0;

          return (
            <div>
              <span
                className={`badge ${hasStock ? "bg-success" : "bg-danger"}`}
              >
                {hasStock ? `${totalStock} in stock` : "Out of stock"}
                {variantCount > 0 && (
                  <small className="d-block text-muted">
                    ({variantCount} variants)
                  </small>
                )}
              </span>
              {hasLowStock && (
                <div className="mt-1">
                  <small className="text-warning">
                    <i className="ri-alert-line me-1"></i>
                    {lowStockVariants.length} variant
                    {lowStockVariants.length > 1 ? "s" : ""} low stock
                  </small>
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: "Price",
        accessorKey: "price",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const price = cell.getValue() || 0;
          return <span className="fw-semibold">${price.toFixed(2)}</span>;
        },
      },
      {
        header: "Status",
        accessorKey: "isActive",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const isActive = cell.getValue();
          return (
            <span className={`badge ${isActive ? "bg-success" : "bg-warning"}`}>
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        header: "Created",
        accessorKey: "createdAt",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const date = cell.getValue();
          if (!date) return <span className="text-muted">-</span>;
          return (
            <span className="text-muted">
              {new Date(date).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        header: "Action",
        cell: (cell: any) => {
          const product = cell.row.original;
          return (
            <UncontrolledDropdown>
              <DropdownToggle
                href="#"
                className="btn btn-soft-secondary btn-sm"
                tag="button"
              >
                <i className="ri-more-fill" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem
                  tag={Link}
                  to={`/apps-ecommerce-product-details/${product.id}`}
                >
                  <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                  View
                </DropdownItem>

                <DropdownItem
                  tag={Link}
                  to={`/apps-ecommerce-add-product?edit=${product.id}`}
                >
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                  Edit
                </DropdownItem>

                <DropdownItem divider />
                <DropdownItem
                  href="#"
                  onClick={() => onClickDelete(product)}
                  className="text-danger"
                >
                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    []
  );
  document.title = "Products | Velzon - React Admin & Dashboard Template";

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteProduct}
        onCloseClick={() => setDeleteModal(false)}
      />
      <DeleteModal
        show={deleteModalMulti}
        onDeleteClick={() => {
          deleteMultiple();
          setDeleteModalMulti(false);
        }}
        onCloseClick={() => setDeleteModalMulti(false)}
      />
      <Container fluid>
        <BreadCrumb title="Products" pageTitle="Ecommerce" />
        {/* Loading State */}

        {/* Content - only show when not loading and no error */}
        <Row>
          <Col xl={3} lg={4}>
            <Card>
              <CardHeader>
                <div className="d-flex mb-3">
                  <div className="flex-grow-1">
                    <h5 className="fs-16">Filters</h5>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      to="#"
                      className="text-decoration-underline"
                      onClick={() => {
                        setSelectedCategory("");
                        setSearchTerm("");
                        setSelectedStatus("");
                        setCurrentPage(1);
                      }}
                    >
                      Clear All
                    </Link>
                  </div>
                </div>

                <div className="filter-choices-input">
                  <Select
                    value={
                      selectedStatus
                        ? {
                            value: selectedStatus,
                            label:
                              selectedStatus === "true"
                                ? "Active"
                                : selectedStatus === "false"
                                ? "Inactive"
                                : "All Status",
                          }
                        : null
                    }
                    isMulti={false}
                    onChange={(selected: any) => {
                      setSelectedStatus(selected?.value || "");
                      setCurrentPage(1); // Reset to first page when filtering
                    }}
                    options={statusOptions}
                    placeholder="Filter by status..."
                    isClearable={true}
                  />
                </div>
              </CardHeader>

              <div className="accordion accordion-flush">
                <div className="card-body border-bottom">
                  <div>
                    <p className="text-muted text-uppercase fs-12 fw-medium mb-2">
                      Categories
                    </p>
                    {categoriesLoading ? (
                      <div className="text-center py-3">
                        <Spinner size="sm" color="primary" />
                        <p className="text-muted mt-2 mb-0">
                          Loading categories...
                        </p>
                      </div>
                    ) : categoriesError ? (
                      <div className="text-center py-3">
                        <p className="text-danger mb-0">
                          Failed to load categories
                        </p>
                      </div>
                    ) : (
                      <ul className="list-unstyled mb-0 filter-list">
                        <li>
                          <Link
                            to="#"
                            className={
                              selectedCategory === ""
                                ? "active d-flex py-1 align-items-center"
                                : "d-flex py-1 align-items-center"
                            }
                            onClick={() => handleCategoryFilter("all")}
                          >
                            <div className="flex-grow-1">
                              <h5 className="fs-13 mb-0 listname">
                                All Categories
                              </h5>
                            </div>
                            <div className="flex-shrink-0 ms-2">
                              <span className="badge bg-light text-muted">
                                {productsResponse?.total || 0}
                              </span>
                            </div>
                          </Link>
                        </li>
                        {categoriesResponse?.map((category: any) => (
                          <li key={category.id}>
                            <Link
                              to="#"
                              className={
                                selectedCategory === category.id
                                  ? "active d-flex py-1 align-items-center"
                                  : "d-flex py-1 align-items-center"
                              }
                              onClick={() => handleCategoryFilter(category.id)}
                            >
                              <div className="flex-grow-1">
                                <h5 className="fs-13 mb-0 listname">
                                  {category.nameEn}
                                </h5>
                              </div>
                              <div className="flex-shrink-0 ms-2">
                                <span className="badge bg-light text-muted">
                                  {productsResponse?.data?.filter(
                                    (product: any) =>
                                      product.categoryId === category.id
                                  ).length || 0}
                                </span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {/* 
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button bg-transparent shadow-none"
                      type="button"
                      id="flush-headingBrands"
                    >
                      <span className="text-muted text-uppercase fs-12 fw-medium">
                        Brands
                      </span>{" "}
                      <span className="badge bg-success rounded-pill align-middle ms-1">
                        2
                      </span>
                    </button>
                  </h2>
                  <UncontrolledCollapse
                    toggler="#flush-headingBrands"
                    defaultOpen
                  >
                    <div
                      id="flush-collapseBrands"
                      className="accordion-collapse collapse show"
                      aria-labelledby="flush-headingBrands"
                    >
                      <div className="accordion-body text-body pt-0">
                        <div className="search-box search-box-sm">
                          <input
                            type="text"
                            className="form-control bg-light border-0"
                            placeholder="Search Brands..."
                          />
                          <i className="ri-search-line search-icon"></i>
                        </div>
                        <div className="d-flex flex-column gap-2 mt-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productBrandRadio5"
                              defaultChecked
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productBrandRadio5"
                            >
                              Boat
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productBrandRadio4"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productBrandRadio4"
                            >
                              OnePlus
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productBrandRadio3"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productBrandRadio3"
                            >
                              Realme
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productBrandRadio2"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productBrandRadio2"
                            >
                              Sony
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productBrandRadio1"
                              defaultChecked
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productBrandRadio1"
                            >
                              JBL
                            </label>
                          </div>

                          <div>
                            <button
                              type="button"
                              className="btn btn-link text-decoration-none text-uppercase fw-medium p-0"
                            >
                              1,235 More
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </UncontrolledCollapse>
                </div> */}

                {/* <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button bg-transparent shadow-none collapsed"
                      type="button"
                      id="flush-headingDiscount"
                    >
                      <span className="text-muted text-uppercase fs-12 fw-medium">
                        Discount
                      </span>{" "}
                      <span className="badge bg-success rounded-pill align-middle ms-1">
                        1
                      </span>
                    </button>
                  </h2>
                  <UncontrolledCollapse toggler="#flush-headingDiscount">
                    <div
                      id="flush-collapseDiscount"
                      className="accordion-collapse collapse show"
                    >
                      <div className="accordion-body text-body pt-1">
                        <div className="d-flex flex-column gap-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productdiscountRadio6"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productdiscountRadio6"
                            >
                              50% or more
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productdiscountRadio5"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productdiscountRadio5"
                            >
                              40% or more
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productdiscountRadio4"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productdiscountRadio4"
                            >
                              30% or more
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productdiscountRadio3"
                              defaultChecked
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productdiscountRadio3"
                            >
                              20% or more
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productdiscountRadio2"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productdiscountRadio2"
                            >
                              10% or more
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="productdiscountRadio1"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="productdiscountRadio1"
                            >
                              Less than 10%
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </UncontrolledCollapse>
                </div> */}
              </div>
            </Card>
          </Col>

          <Col xl={9} lg={8}>
            <div>
              <Card>
                <div className="card-header border-0">
                  <Row className=" align-items-center">
                    <div className="col-auto">
                      <div id="selection-element">
                        <div className="my-n1 d-flex align-items-center text-muted">
                          Select{" "}
                          <div
                            id="select-content"
                            className="text-body fw-semibold px-1"
                          >
                            {dele}
                          </div>{" "}
                          Result{" "}
                          <button
                            type="button"
                            className="btn btn-link link-danger p-0 ms-3"
                            onClick={() => setDeleteModalMulti(true)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </Row>
                </div>
                <div className="card-body pt-0">
                  <TableContainer
                    columns={columns}
                    data={productsResponse?.data || []}
                    isGlobalFilter={true}
                    customPageSize={pageSize}
                    divClass="table-responsive mb-1"
                    tableClass="mb-0 align-middle table-borderless"
                    theadClass="table-light text-muted"
                    isProductsFilter={true}
                    SearchPlaceholder="Search Products..."
                    isServerSidePagination={true}
                    totalCount={productsResponse?.total || 0}
                    currentPage={currentPage}
                    totalPages={productsResponse?.pageCount || 0}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onSearch={handleSearch}
                    serverSideSearch={true}
                    error={error}
                    isLoading={isLoading}
                  />
                </div>
              </Card>
            </div>
          </Col>
        </Row>
        {/* Close the conditional block */}
      </Container>
    </div>
  );
};

export default EcommerceProducts;
