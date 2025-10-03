import React, { useState, useEffect } from "react";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import {
  Alert,
  Card,
  CardBody,
  Col,
  Container,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Input,
  Label,
  FormFeedback,
  Form,
  Spinner,
} from "reactstrap";

// Import product hooks
import { useProductForm } from "../../../hooks/useProductForm";
import { useProduct, useUpdateProduct } from "../../../hooks/useProducts";
import { useCompanies } from "../../../hooks/useCompanies";
import { useCategories } from "../../../hooks/useCategories";
import { parseApiError } from "../../../utils/errorHandler";
import { toast, ToastContainer } from "react-toastify";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import classnames from "classnames";
import Dropzone from "react-dropzone";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

//formik
import { useFormik } from "formik";
import * as Yup from "yup";

// Import React FilePond
import { registerPlugin } from "react-filepond";
import Select from "react-select";
// Import FilePond styles
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const EcommerceAddProduct = (props: any) => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  document.title = isEditMode
    ? "Edit Product | Velzon - React Admin & Dashboard Template"
    : "Create Product | Velzon - React Admin & Dashboard Template";

  const history = useNavigate();
  const createProductMutation = useProductForm();
  const updateProductMutation = useUpdateProduct();
  const {
    data: companiesResponse,
    isLoading: companiesLoading,
    error: companiesError,
  } = useCompanies();
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  // Fetch product data for editing
  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
  } = useProduct(editId || "");

  const [customActiveTab, setcustomActiveTab] = useState<any>("1");
  const toggleCustom = (tab: any) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
    }
  };
  const [selectedVisibility, setselectedVisibility] = useState<any>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  function handleSelectVisibility(selectedVisibility: any) {
    setselectedVisibility(selectedVisibility);
  }

  /**
   * Formats the size
   */
  function formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  const productStatus = [
    {
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Scheduled", value: "scheduled" },
      ],
    },
  ];

  const productVisibility = [
    {
      options: [
        { label: "Hidden", value: "Hidden" },
        { label: "Public", value: "Public" },
      ],
    },
  ];

  // image
  const [selectedImage, setSelectedImage] = useState<any>();

  // Set initial image when product data is loaded
  useEffect(() => {
    if (productData && isEditMode) {
      if (typeof productData.image === "object" && productData.image?.path) {
        setSelectedImage(`http://localhost:4000${productData.image.path}`);
      }
    }
  }, [productData, isEditMode]);

  const handleImageChange = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e: any) => {
      setSelectedImage(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload file to API
      const response = await fetch(
        "http://localhost:4000/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
          headers: {
            // Don't set Content-Type header, let browser set it with boundary for FormData
            Authorization: `Bearer ${
              localStorage.getItem("token") ||
              sessionStorage.getItem("token") ||
              ""
            }`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const uploadResult = await response.json();

      // Set the imageId from the API response
      validation.setFieldValue("image", uploadResult?.file?.id);

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
      setSelectedImage(""); // Clear preview on error
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validation: any = useFormik({
    enableReinitialize: true,

    initialValues: {
      nameEn: productData?.nameEn || "",
      nameAr: productData?.nameAr || "",
      type: productData?.type || "",
      descriptionEn: productData?.descriptionEn || "",
      descriptionAr: productData?.descriptionAr || "",
      isActive: productData?.isActive ?? true,
      rating: productData?.rating ? +productData.rating : 4.5,
      companyId: productData?.companyId || "",
      image:
        typeof productData?.image === "object"
          ? productData.image.id || ""
          : productData?.image || "",
      categoryId: productData?.categoryId || "",
      variants: productData?.variants || [
        {
          size: "",
          sizeUnit: "",
          weight: 0,
          weightUnit: "g",
          ean: "",
          price: 0,
          stock: 0,
          isActive: true,
          sku: "",
        },
      ],
    },
    validationSchema: Yup.object({
      nameEn: Yup.string()
        .min(2, "Product title must be at least 2 characters")
        .required("Please Enter a Product Title"),
      nameAr: Yup.string().required("Please Enter a Product Title in Arabic"),
      type: Yup.string()
        .oneOf(
          ["food", "electronics", "clothing", "pharmacy", "grocery", "other"],
          "Type must be one of: food, electronics, clothing, pharmacy, grocery, other"
        )
        .required("Please Enter a Product Type"),
      descriptionEn: Yup.string().required(
        "Please Enter a Product Description"
      ),
      descriptionAr: Yup.string().required(
        "Please Enter a Product Description in Arabic"
      ),
      categoryId: Yup.string().required("Please Select a Category"),
      companyId: Yup.string().required("Please Select a Company"),
      variants: Yup.array().of(
        Yup.object({
          size: Yup.string().required("Size is required"),
          sizeUnit: Yup.string().required("Size unit is required"),
          weight: Yup.number()
            .min(0, "Weight must be positive")
            .required("Weight is required"),
          weightUnit: Yup.string().required("Weight unit is required"),
          ean: Yup.string().required("EAN is required"),
          price: Yup.number()
            .min(0, "Price must be positive")
            .required("Price is required"),
          stock: Yup.number()
            .min(0, "Stock must be positive")
            .required("Stock is required"),
          sku: Yup.string().required("SKU is required"),
        })
      ),
    }),
    onSubmit: (values) => {
      // Convert numeric fields to numbers
      const processedValues = {
        ...values,
        rating:
          typeof values.rating === "string"
            ? parseFloat(values.rating) || 4.5
            : values.rating,
        variants: values.variants.map((variant: any) => ({
          ...variant,
          weight:
            typeof variant.weight === "string"
              ? parseFloat(variant.weight) || 0
              : variant.weight,
          price:
            typeof variant.price === "string"
              ? parseFloat(variant.price) || 0
              : variant.price,
          stock:
            typeof variant.stock === "string"
              ? parseInt(variant.stock) || 0
              : variant.stock,
        })),
      };

      if (isEditMode) {
        // Update existing product
        updateProductMutation.mutate(
          { id: editId, ...processedValues },
          {
            onSuccess: () => {
              toast.success("Product updated successfully!");
              history("/apps-ecommerce-products");
            },
            onError: (error) => {
              toast.error(parseApiError(error));
              console.log("Product update failed:", error);
            },
          }
        );
      } else {
        // Create new product
        createProductMutation.mutate(processedValues, {
          onSuccess: () => {
            toast.success("Product created successfully!");
            history("/apps-ecommerce-products");
            validation.resetForm();
            setSelectedImage(""); // Clear image preview
          },
          onError: (error) => {
            toast.error(parseApiError(error));
            console.log("Product creation failed:", error);
          },
        });
      }
    },
  });

  // Show loading state while fetching product data
  if (isEditMode && productLoading) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Edit Product" pageTitle="Ecommerce" />
          <Row>
            <Col>
              <div className="text-center py-4">
                <Spinner color="primary" />
                <p className="mt-2">Loading product data...</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Show error state if product fetch failed
  if (isEditMode && productError) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Edit Product" pageTitle="Ecommerce" />
          <Row>
            <Col>
              <Alert color="danger">
                <h5>Error loading product</h5>
                <p>{parseApiError(productError)}</p>
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
        <BreadCrumb
          title={isEditMode ? "Edit Product" : "Create Product"}
          pageTitle="Ecommerce"
        />
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditMode) {
              updateProductMutation.reset();
            } else {
              createProductMutation.clearErrors();
            }
            validation.handleSubmit();
            return false;
          }}
        >
          <Row>
            <Col lg={8}>
              {(isEditMode
                ? updateProductMutation.error
                : createProductMutation.error) && (
                <Alert color="danger" className="mb-3">
                  {parseApiError(
                    isEditMode
                      ? updateProductMutation.error
                      : createProductMutation.error
                  )}
                </Alert>
              )}
              <Card>
                <CardBody>
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="product-title-input">
                      Product Title (English)
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="product-title-input"
                      placeholder="Enter product title in English"
                      name="nameEn"
                      value={validation.values.nameEn || ""}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={
                        (validation.errors.nameEn &&
                          validation.touched.nameEn) ||
                        (isEditMode
                          ? false
                          : createProductMutation.hasFieldError("nameEn"))
                          ? true
                          : false
                      }
                    />
                    {validation.errors.nameEn && validation.touched.nameEn ? (
                      <FormFeedback type="invalid">
                        {validation.errors.nameEn}
                      </FormFeedback>
                    ) : !isEditMode &&
                      createProductMutation.getFieldError("nameEn") ? (
                      <FormFeedback type="invalid">
                        {createProductMutation.getFieldError("nameEn")}
                      </FormFeedback>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <Label
                      className="form-label"
                      htmlFor="product-title-ar-input"
                    >
                      Product Title (Arabic)
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="product-title-ar-input"
                      placeholder="Enter product title in Arabic"
                      name="nameAr"
                      value={validation.values.nameAr || ""}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <Label className="form-label" htmlFor="product-type-input">
                      Product Type
                    </Label>
                    <Input
                      type="select"
                      className="form-select"
                      id="product-type-input"
                      name="type"
                      value={validation.values.type || ""}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={
                        (validation.errors.type && validation.touched.type) ||
                        (isEditMode
                          ? false
                          : createProductMutation.hasFieldError("type"))
                          ? true
                          : false
                      }
                    >
                      <option value="">Select Product Type</option>
                      <option value="food">Food</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="grocery">Grocery</option>
                      <option value="other">Other</option>
                    </Input>
                    {validation.errors.type && validation.touched.type ? (
                      <FormFeedback type="invalid">
                        {validation.errors.type}
                      </FormFeedback>
                    ) : !isEditMode &&
                      createProductMutation.getFieldError("type") ? (
                      <FormFeedback type="invalid">
                        {createProductMutation.getFieldError("type")}
                      </FormFeedback>
                    ) : null}
                  </div>
                  <div>
                    <Label>Product Description</Label>

                    <div className="mb-3">
                      <Label
                        className="form-label"
                        htmlFor="product-description-en-input"
                      >
                        Product Description (English)
                      </Label>
                      <textarea
                        className={`form-control ${
                          validation.errors.descriptionEn &&
                          validation.touched.descriptionEn
                            ? "is-invalid"
                            : ""
                        }`}
                        id="product-description-en-input"
                        placeholder="Enter product description in English"
                        name="descriptionEn"
                        value={validation.values.descriptionEn || ""}
                        onBlur={validation.handleBlur}
                        onChange={validation.handleChange}
                        rows={4}
                      />
                      {validation.errors.descriptionEn &&
                      validation.touched.descriptionEn ? (
                        <FormFeedback type="invalid">
                          {validation.errors.descriptionEn}
                        </FormFeedback>
                      ) : null}
                    </div>

                    <div className="mb-3">
                      <Label
                        className="form-label"
                        htmlFor="product-description-ar-input"
                      >
                        Product Description (Arabic)
                      </Label>
                      <textarea
                        className={`form-control ${
                          validation.errors.descriptionAr &&
                          validation.touched.descriptionAr
                            ? "is-invalid"
                            : ""
                        }`}
                        id="product-description-ar-input"
                        placeholder="Enter product description in Arabic"
                        name="descriptionAr"
                        value={validation.values.descriptionAr || ""}
                        onBlur={validation.handleBlur}
                        onChange={validation.handleChange}
                        rows={4}
                      />
                      {validation.errors.descriptionAr &&
                      validation.touched.descriptionAr ? (
                        <FormFeedback type="invalid">
                          {validation.errors.descriptionAr}
                        </FormFeedback>
                      ) : null}
                    </div>

                    <div className="mb-3">
                      <Label
                        className="form-label"
                        htmlFor="product-rating-input"
                      >
                        Rating
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        className="form-control"
                        id="product-rating-input"
                        placeholder="4.5"
                        name="rating"
                        value={validation.values.rating || ""}
                        onBlur={validation.handleBlur}
                        onChange={validation.handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <Label
                        className="form-label"
                        htmlFor="product-company-input"
                      >
                        Company
                      </Label>
                      <Input
                        type="select"
                        className="form-select"
                        id="product-company-input"
                        name="companyId"
                        value={validation.values.companyId || ""}
                        onBlur={validation.handleBlur}
                        onChange={validation.handleChange}
                        disabled={companiesLoading}
                        invalid={
                          validation.errors.companyId &&
                          validation.touched.companyId
                            ? true
                            : false
                        }
                      >
                        <option value="">
                          {companiesLoading
                            ? "Loading companies..."
                            : "Select Company"}
                        </option>
                        {companiesResponse?.data?.map((company: any) => (
                          <option key={company.id} value={company.id}>
                            {company.nameEn}
                          </option>
                        ))}
                      </Input>
                      {validation.errors.companyId &&
                      validation.touched.companyId ? (
                        <FormFeedback type="invalid">
                          {validation.errors.companyId}
                        </FormFeedback>
                      ) : null}
                      {companiesError && (
                        <small className="text-danger">
                          Failed to load companies:{" "}
                          {parseApiError(companiesError)}
                        </small>
                      )}
                    </div>

                    <div className="mb-3">
                      <Label
                        className="form-label"
                        htmlFor="product-category-input"
                      >
                        Category
                      </Label>
                      <Input
                        type="select"
                        className="form-select"
                        id="product-category-input"
                        name="categoryId"
                        value={validation.values.categoryId || ""}
                        onBlur={validation.handleBlur}
                        onChange={validation.handleChange}
                        disabled={categoriesLoading}
                        invalid={
                          validation.errors.categoryId &&
                          validation.touched.categoryId
                            ? true
                            : false
                        }
                      >
                        <option value="">
                          {categoriesLoading
                            ? "Loading categories..."
                            : "Select Category"}
                        </option>
                        {categoriesResponse?.map((category: any) => (
                          <option key={category.id} value={category.id}>
                            {category.nameEn}
                          </option>
                        ))}
                      </Input>
                      {validation.touched.categoryId &&
                      validation.errors.categoryId ? (
                        <FormFeedback type="invalid">
                          {validation.errors.categoryId}
                        </FormFeedback>
                      ) : null}
                      {categoriesError && (
                        <small className="text-danger">
                          Failed to load categories:{" "}
                          {parseApiError(categoriesError)}
                        </small>
                      )}
                    </div>

                    <div className="mb-3">
                      <Label className="form-label d-block">
                        Product Status
                      </Label>
                      <div className="form-check form-switch">
                        <Input
                          type="switch"
                          className="form-check-input"
                          id="product-status-switch"
                          name="isActive"
                          checked={validation.values.isActive || false}
                          onChange={(e) => {
                            validation.setFieldValue(
                              "isActive",
                              e.target.checked
                            );
                          }}
                        />
                        <Label
                          className="form-check-label"
                          htmlFor="product-status-switch"
                        >
                          {validation.values.isActive ? "Active" : "Inactive"}
                        </Label>
                      </div>
                      <small className="text-muted">
                        {validation.values.isActive
                          ? "Product will be visible to customers"
                          : "Product will be hidden from customers"}
                      </small>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Product Image</h5>
                </CardHeader>
                <CardBody>
                  <div className="mb-4">
                    <h5 className="fs-14 mb-1">Product Image</h5>
                    <p className="text-muted">Add Product main Image.</p>
                    <div className="text-center">
                      <div className="position-relative d-inline-block">
                        <div className="position-absolute top-100 start-100 translate-middle">
                          <Label
                            htmlFor="customer-image-input"
                            className="mb-0"
                            data-bs-toggle="tooltip"
                            data-bs-placement="right"
                            title="Select Image"
                          >
                            <div className="avatar-xs cursor-pointer">
                              <div className="avatar-title bg-light border rounded-circle text-muted">
                                <i className="ri-image-fill"></i>
                              </div>
                            </div>
                          </Label>
                          <Input
                            className="form-control d-none"
                            id="customer-image-input"
                            type="file"
                            accept="image/png, image/gif, image/jpeg"
                            onChange={handleImageChange}
                          />
                        </div>
                        <div className="avatar-lg">
                          <div className="avatar-title bg-light rounded position-relative">
                            {isUploadingImage ? (
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: "80px", height: "80px" }}
                              >
                                <div
                                  className="spinner-border spinner-border-sm text-primary"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Uploading...
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={selectedImage}
                                id="product-img"
                                alt=""
                                className="avatar-md h-auto"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Product Variants</h5>
                </CardHeader>
                <CardBody>
                  <p className="text-muted mb-2">
                    Add product variants with different sizes, prices, and stock
                    levels
                  </p>

                  {/* Variant Summary */}
                  <div className="alert alert-info mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Variant Summary:</strong>{" "}
                        {validation.values.variants?.length || 0} total variants
                      </div>
                      <div className="d-flex gap-2">
                        <span className="badge bg-info">
                          {validation.values.variants?.filter((v: any) => v.id)
                            .length || 0}{" "}
                          existing
                        </span>
                        <span className="badge bg-success">
                          {validation.values.variants?.filter((v: any) => !v.id)
                            .length || 0}{" "}
                          new
                        </span>
                      </div>
                    </div>
                  </div>

                  {validation.values.variants?.map(
                    (variant: any, index: number) => (
                      <div key={index} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="mb-0">Variant {index + 1}</h6>
                            {variant.id && (
                              <span className="badge bg-info">Existing</span>
                            )}
                            {!variant.id && (
                              <span className="badge bg-success">New</span>
                            )}
                          </div>
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                const newVariants = [
                                  ...validation.values.variants,
                                ];
                                const duplicatedVariant = {
                                  ...variant,
                                  id: undefined, // Remove id to make it a new variant
                                  sku: `${variant.sku || "SKU"}-copy`, // Modify SKU to avoid conflicts
                                };
                                newVariants.splice(
                                  index + 1,
                                  0,
                                  duplicatedVariant
                                );
                                validation.setFieldValue(
                                  "variants",
                                  newVariants
                                );
                              }}
                              title="Duplicate this variant"
                            >
                              <i className="ri-file-copy-line"></i>
                            </button>
                            {validation.values.variants.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  const newVariants = [
                                    ...validation.values.variants,
                                  ];
                                  newVariants.splice(index, 1); // Remove specific variant
                                  validation.setFieldValue(
                                    "variants",
                                    newVariants
                                  );
                                }}
                                title="Remove this variant"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            )}
                          </div>
                        </div>
                        <Row>
                          <Col md={4}>
                            <div className="mb-3">
                              <Label>Size</Label>
                              <Input
                                type="text"
                                placeholder="e.g., M, L, XL"
                                value={variant.size || ""}
                                onChange={(e) => {
                                  const newVariants = [
                                    ...validation.values.variants,
                                  ];
                                  newVariants[index].size = e.target.value;
                                  validation.setFieldValue(
                                    "variants",
                                    newVariants
                                  );
                                }}
                              />
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="mb-3">
                              <Label>Size Unit</Label>
                              <Input
                                type="select"
                                className="form-select"
                                value={variant.sizeUnit || ""}
                                onChange={(e) => {
                                  const newVariants = [
                                    ...validation.values.variants,
                                  ];
                                  newVariants[index].sizeUnit = e.target.value;
                                  validation.setFieldValue(
                                    "variants",
                                    newVariants
                                  );
                                }}
                              >
                                <option value="">Select Unit</option>
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                                <option value="xl">XL</option>
                                <option value="xxl">XXL</option>
                              </Input>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="mb-3">
                              <Label>SKU</Label>
                              <Input
                                type="text"
                                placeholder="e.g., PROD-001-M"
                                value={variant.sku || ""}
                                onChange={(e) => {
                                  const newVariants = [
                                    ...validation.values.variants,
                                  ];
                                  newVariants[index].sku = e.target.value;
                                  validation.setFieldValue(
                                    "variants",
                                    newVariants
                                  );
                                }}
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={4}>
                            <div className="mb-3">
                              <Label>Weight</Label>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={variant.weight || ""}
                                onChange={(e) => {
                                  const newVariants = [
                                    ...validation.values.variants,
                                  ];
                                  const weightValue = parseFloat(
                                    e.target.value
                                  );
                                  newVariants[index].weight = isNaN(weightValue)
                                    ? 0
                                    : weightValue;
                                  validation.setFieldValue(
                                    "variants",
                                    newVariants
                                  );
                                }}
                              />
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="mb-3">
                              <Label>Weight Unit</Label>
                              <Input
                                type="select"
                                className="form-select"
                                value={variant.weightUnit || "g"}
                                onChange={(e) => {
                                  const newVariants = [
                                    ...validation.values.variants,
                                  ];
                                  newVariants[index].weightUnit =
                                    e.target.value;
                                  validation.setFieldValue(
                                    "variants",
                                    newVariants
                                  );
                                }}
                              >
                                <option value="g">Grams (g)</option>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="lb">Pounds (lb)</option>
                                <option value="oz">Ounces (oz)</option>
                              </Input>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="mb-3">
                              <Label>EAN</Label>
                              <Input
                                type="text"
                                placeholder="1234567890123"
                                value={variant.ean || ""}
                                onChange={(e) => {
                                  const newVariants = [
                                    ...validation.values.variants,
                                  ];
                                  newVariants[index].ean = e.target.value;
                                  validation.setFieldValue(
                                    "variants",
                                    newVariants
                                  );
                                }}
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={4}>
                            <div className="mb-3">
                              <Label>Price</Label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={variant.price || ""}
                                onChange={(e) => {
                                  const newVariants = [
                                    ...validation.values.variants,
                                  ];
                                  const priceValue = parseFloat(e.target.value);
                                  newVariants[index].price = isNaN(priceValue)
                                    ? 0
                                    : priceValue;
                                  validation.setFieldValue(
                                    "variants",
                                    newVariants
                                  );
                                }}
                              />
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="mb-3">
                              <Label>Stock</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variant.stock || ""}
                                onChange={(e) => {
                                  const newVariants = [
                                    ...validation.values.variants,
                                  ];
                                  const stockValue = parseInt(e.target.value);
                                  newVariants[index].stock = isNaN(stockValue)
                                    ? 0
                                    : stockValue;
                                  validation.setFieldValue(
                                    "variants",
                                    newVariants
                                  );
                                }}
                              />
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="mb-3">
                              <Label>EAN</Label>
                              <Input
                                type="text"
                                placeholder="1234567890123"
                                value={variant.ean || ""}
                                onChange={(e) => {
                                  const newVariants = [
                                    ...validation.values.variants,
                                  ];
                                  newVariants[index].ean = e.target.value;
                                  validation.setFieldValue(
                                    "variants",
                                    newVariants
                                  );
                                }}
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={12}>
                            <div className="mb-3">
                              <Label className="form-label d-block">
                                Variant Status
                              </Label>
                              <div className="form-check form-switch">
                                <Input
                                  type="switch"
                                  className="form-check-input"
                                  id={`variant-status-switch-${index}`}
                                  checked={variant.isActive || false}
                                  onChange={(e) => {
                                    const newVariants = [
                                      ...validation.values.variants,
                                    ];
                                    newVariants[index].isActive =
                                      e.target.checked;
                                    validation.setFieldValue(
                                      "variants",
                                      newVariants
                                    );
                                  }}
                                />
                                <Label
                                  className="form-check-label"
                                  htmlFor={`variant-status-switch-${index}`}
                                >
                                  {variant.isActive ? "Active" : "Inactive"}
                                </Label>
                              </div>
                              <small className="text-muted">
                                {variant.isActive
                                  ? "This variant will be available for purchase"
                                  : "This variant will be hidden from customers"}
                              </small>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    )
                  )}

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        const newVariants = [...validation.values.variants];
                        newVariants.push({
                          size: "",
                          sizeUnit: "",
                          weight: 0,
                          weightUnit: "g",
                          ean: "",
                          price: 0,
                          stock: 0,
                          isActive: true,
                          sku: "",
                        });
                        validation.setFieldValue("variants", newVariants);
                      }}
                    >
                      <i className="ri-add-line me-1"></i>
                      Add Variant
                    </button>

                    {validation.values.variants.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => {
                          const newVariants = [...validation.values.variants];
                          newVariants.pop(); // Remove the last variant
                          validation.setFieldValue("variants", newVariants);
                        }}
                      >
                        <i className="ri-delete-bin-line me-1"></i>
                        Remove Last Variant
                      </button>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={12}>
              <div className="text-end mb-4">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => history("/apps-ecommerce-products")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={
                    isEditMode
                      ? updateProductMutation.isPending
                      : createProductMutation.isPending
                  }
                >
                  {(
                    isEditMode
                      ? updateProductMutation.isPending
                      : createProductMutation.isPending
                  ) ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line me-1"></i>
                      {isEditMode ? "Update Product" : "Create Product"}
                    </>
                  )}
                </button>
              </div>
            </Col>
          </Row>
        </Form>
        <ToastContainer closeButton={false} limit={1} />
      </Container>
    </div>
  );
};

export default EcommerceAddProduct;
