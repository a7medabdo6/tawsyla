import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Label,
  FormFeedback,
  Form,
  Spinner,
  Alert,
  CardHeader,
} from "reactstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from "../../../hooks/useCategories";
import { parseApiError } from "../../../utils/errorHandler";

//formik
import { useFormik } from "formik";
import * as Yup from "yup";

const AddEditCategory = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  document.title = isEditMode
    ? "Edit Category | Velzon - React Admin & Dashboard Template"
    : "Add Category | Velzon - React Admin & Dashboard Template";

  const navigate = useNavigate();
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<any>();

  // Fetch category data for editing
  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategory(editId || "");

  // API mutations
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  // Set initial image when category data is loaded
  useEffect(() => {
    if (categoryData && isEditMode) {
      if (categoryData.image) {
        setSelectedImage(`http://localhost:4000${categoryData.image}`);
      }
    }
  }, [categoryData, isEditMode]);

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

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      nameEn: categoryData?.nameEn || "",
      nameAr: categoryData?.nameAr || "",
      descriptionEn: categoryData?.descriptionEn || "",
      descriptionAr: categoryData?.descriptionAr || "",
      isActive: categoryData?.isActive ?? true,
      image:
        typeof categoryData?.image === "object"
          ? categoryData.image?.id || ""
          : categoryData?.image || "",
    },
    validationSchema: Yup.object({
      nameEn: Yup.string()
        .min(2, "Category name must be at least 2 characters")
        .required("Please Enter a Category Name"),
      nameAr: Yup.string().required("Please Enter a Category Name in Arabic"),
      descriptionEn: Yup.string().required(
        "Please Enter a Category Description"
      ),
      descriptionAr: Yup.string().required(
        "Please Enter a Category Description in Arabic"
      ),
    }),
    onSubmit: async (values) => {
      try {
        if (isEditMode) {
          // Update existing category
          await updateCategoryMutation.mutateAsync({
            id: editId!,
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            descriptionEn: values.descriptionEn,
            descriptionAr: values.descriptionAr,
            isActive: values.isActive,
            image: values.image,
          });
          toast.success("Category updated successfully!");
        } else {
          // Create new category
          await createCategoryMutation.mutateAsync({
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            descriptionEn: values.descriptionEn,
            descriptionAr: values.descriptionAr,
            isActive: values.isActive,
            image: values.image,
          });
          toast.success("Category created successfully!");
          validation.resetForm();
          setSelectedImage("");
        }
        navigate("/apps-ecommerce-categories");
      } catch (error) {
        console.error("Category operation failed:", error);
        toast.error(parseApiError(error));
      }
    },
  });

  // Show loading state while fetching category data
  if (isEditMode && categoryLoading) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Edit Category" pageTitle="Ecommerce" />
          <Row>
            <Col>
              <div className="text-center py-4">
                <Spinner color="primary" />
                <p className="mt-2">Loading category data...</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Show error state if category fetch failed
  if (isEditMode && categoryError) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Edit Category" pageTitle="Ecommerce" />
          <Row>
            <Col>
              <Alert color="danger">
                <h5>Error loading category</h5>
                <p>{parseApiError(categoryError)}</p>
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
          title={isEditMode ? "Edit Category" : "Add Category"}
          pageTitle="Ecommerce"
        />

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
        >
          <Row>
            <Col lg={8}>
              <Card>
                <CardBody>
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="category-name-input">
                      Category Name (English)
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="category-name-input"
                      placeholder="Enter category name in English"
                      name="nameEn"
                      value={validation.values.nameEn || ""}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={
                        validation.errors.nameEn && validation.touched.nameEn
                          ? true
                          : false
                      }
                    />
                    {validation.errors.nameEn && validation.touched.nameEn ? (
                      <FormFeedback type="invalid">
                        {validation.errors.nameEn}
                      </FormFeedback>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <Label
                      className="form-label"
                      htmlFor="category-name-ar-input"
                    >
                      Category Name (Arabic)
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="category-name-ar-input"
                      placeholder="Enter category name in Arabic"
                      name="nameAr"
                      value={validation.values.nameAr || ""}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={
                        validation.errors.nameAr && validation.touched.nameAr
                          ? true
                          : false
                      }
                    />
                    {validation.errors.nameAr && validation.touched.nameAr ? (
                      <FormFeedback type="invalid">
                        {validation.errors.nameAr}
                      </FormFeedback>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <Label
                      className="form-label"
                      htmlFor="category-description-en-input"
                    >
                      Category Description (English)
                    </Label>
                    <textarea
                      className={`form-control ${
                        validation.errors.descriptionEn &&
                        validation.touched.descriptionEn
                          ? "is-invalid"
                          : ""
                      }`}
                      id="category-description-en-input"
                      placeholder="Enter category description in English"
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
                      htmlFor="category-description-ar-input"
                    >
                      Category Description (Arabic)
                    </Label>
                    <textarea
                      className={`form-control ${
                        validation.errors.descriptionAr &&
                        validation.touched.descriptionAr
                          ? "is-invalid"
                          : ""
                      }`}
                      id="category-description-ar-input"
                      placeholder="Enter category description in Arabic"
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
                    <Label className="form-label d-block">
                      Category Status
                    </Label>
                    <div className="form-check form-switch">
                      <Input
                        type="switch"
                        className="form-check-input"
                        id="category-status-switch"
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
                        htmlFor="category-status-switch"
                      >
                        {validation.values.isActive ? "Active" : "Inactive"}
                      </Label>
                    </div>
                    <small className="text-muted">
                      {validation.values.isActive
                        ? "Category will be visible to customers"
                        : "Category will be hidden from customers"}
                    </small>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Category Image</h5>
                </CardHeader>
                <CardBody>
                  <div className="mb-4">
                    <h5 className="fs-14 mb-1">Category Image</h5>
                    <p className="text-muted">Add Category main Image.</p>
                    <div className="text-center">
                      <div className="position-relative d-inline-block">
                        <div className="position-absolute top-100 start-100 translate-middle">
                          <Label
                            htmlFor="category-image-input"
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
                            id="category-image-input"
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
                                id="category-img"
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
            </Col>

            <Col lg={12}>
              <div className="text-end mb-4">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => navigate("/apps-ecommerce-categories")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending ||
                    isUploadingImage
                  }
                >
                  {createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line me-1"></i>
                      {isEditMode ? "Update Category" : "Create Category"}
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

export default AddEditCategory;
