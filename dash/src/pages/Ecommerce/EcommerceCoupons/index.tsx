import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  Badge,
  Spinner,
  Alert,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  Label,
  Input,
  FormFeedback,
} from "reactstrap";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import DeleteModal from "../../../Components/Common/DeleteModal";

import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  CouponType,
  CouponStatus,
} from "../../../hooks/useCoupons";
import { parseApiError } from "../../../utils/errorHandler";

//formik
import { useFormik } from "formik";
import * as Yup from "yup";

const typeOptions = [
  { value: "", label: "All Types" },
  { value: CouponType.FIXED, label: "Fixed Amount" },
  { value: CouponType.PERCENTAGE, label: "Percentage" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: CouponStatus.ACTIVE, label: "Active" },
  { value: CouponStatus.EXPIRED, label: "Expired" },
  { value: CouponStatus.DISABLED, label: "Disabled" },
];

const EcommerceCoupons = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [modal, setModal] = useState(false);

  // Fetch coupons with pagination and search
  const {
    data: couponsResponse,
    isLoading,
    error,
  } = useCoupons({
    page: currentPage,
    search: searchTerm || undefined,
    type: (selectedType as CouponType) || undefined,
    status: (selectedStatus as CouponStatus) || undefined,
  });

  // API mutations
  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    setCurrentPage(1);
  };

  // Handle delete
  const onClickDelete = (coupon: any) => {
    setSelectedCoupon(coupon);
    setDeleteModal(true);
  };

  const handleDeleteCoupon = async () => {
    if (selectedCoupon) {
      try {
        await deleteCouponMutation.mutateAsync(selectedCoupon.id);
        toast.success("Coupon deleted successfully!");
        setDeleteModal(false);
        setSelectedCoupon(null);
      } catch (error) {
        console.error("Delete coupon failed:", error);
        toast.error(parseApiError(error));
      }
    }
  };

  // Handle edit
  const handleEditCoupon = (coupon: any) => {
    setSelectedCoupon(coupon);
    setIsEdit(true);
    setModal(true);
  };

  // Handle add new coupon
  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setIsEdit(false);
    setModal(true);
  };

  // Form validation
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: selectedCoupon?.code || "",
      name: selectedCoupon?.name || "",
      description: selectedCoupon?.description || "",
      type: selectedCoupon?.type || CouponType.PERCENTAGE,
      value: selectedCoupon?.value || 0,
      minimumOrderAmount: selectedCoupon?.minimumOrderAmount || 0,
      maximumDiscountAmount: selectedCoupon?.maximumDiscountAmount || 0,
      usageLimit: selectedCoupon?.usageLimit || 0,
      usageLimitPerUser: selectedCoupon?.usageLimitPerUser || 0,
      expiresAt: selectedCoupon?.expiresAt
        ? new Date(selectedCoupon.expiresAt).toISOString().slice(0, 16)
        : "",
      isActive: selectedCoupon?.isActive ?? true,
    },
    validationSchema: Yup.object({
      code: Yup.string().required("Coupon code is required"),
      name: Yup.string().required("Coupon name is required"),
      description: Yup.string().required("Description is required"),
      type: Yup.string().required("Type is required"),
      value: Yup.number()
        .min(0, "Value must be positive")
        .required("Value is required"),
      minimumOrderAmount: Yup.number()
        .min(0, "Minimum order amount must be positive")
        .required("Minimum order amount is required"),
      maximumDiscountAmount: Yup.number()
        .min(0, "Maximum discount amount must be positive")
        .when("type", {
          is: CouponType.PERCENTAGE,
          then: (schema) =>
            schema.required(
              "Maximum discount amount is required for percentage coupons"
            ),
          otherwise: (schema) => schema,
        }),
      usageLimit: Yup.number()
        .min(0, "Usage limit must be positive")
        .required("Usage limit is required"),
      usageLimitPerUser: Yup.number()
        .min(0, "Usage limit per user must be positive")
        .required("Usage limit per user is required"),
      expiresAt: Yup.string().required("Expiration date is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await updateCouponMutation.mutateAsync({
            id: selectedCoupon.id,
            code: values.code,
            name: values.name,
            description: values.description,
            type: values.type as CouponType,
            value: +values.value,
            minimumOrderAmount: +values.minimumOrderAmount,
            maximumDiscountAmount: +values.maximumDiscountAmount,
            usageLimit: values.usageLimit,
            usageLimitPerUser: values.usageLimitPerUser,
            expiresAt: values.expiresAt,
            isActive: values.isActive,
          });
          toast.success("Coupon updated successfully!");
        } else {
          await createCouponMutation.mutateAsync({
            code: values.code,
            name: values.name,
            description: values.description,
            type: values.type as CouponType,
            value: values.value,
            minimumOrderAmount: values.minimumOrderAmount,
            maximumDiscountAmount: values.maximumDiscountAmount,
            usageLimit: values.usageLimit,
            usageLimitPerUser: values.usageLimitPerUser,
            expiresAt: values.expiresAt,
            isActive: values.isActive,
          });
          toast.success("Coupon created successfully!");
        }
        setModal(false);
        validation.resetForm();
      } catch (error) {
        console.error("Coupon operation failed:", error);
        toast.error(parseApiError(error));
      }
    },
  });

  const columns = useMemo(
    () => [
      {
        header: "Coupon",
        accessorKey: "code",
        enableColumnFilter: false,
        cell: (cell: any) => (
          <>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="avatar-sm bg-light rounded p-1">
                  <div className="avatar-title bg-light rounded">
                    <i
                      className="ri-coupon-line text-muted"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                  </div>
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="fs-14 mb-1">
                  <Link
                    to={`/apps-ecommerce-coupon-details/${cell.row.original.id}`}
                    className="text-body"
                  >
                    {cell.row.original.code}
                  </Link>
                </h5>
                <p className="text-muted mb-0">{cell.row.original.name}</p>
                <p className="text-muted mb-0 fs-12">
                  {cell.row.original.description}
                </p>
              </div>
            </div>
          </>
        ),
      },
      {
        header: "Type",
        accessorKey: "type",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const type = cell.getValue();
          const isPercentage = type === CouponType.PERCENTAGE;
          return (
            <Badge
              color={isPercentage ? "info" : "warning"}
              className="text-uppercase"
            >
              {isPercentage ? "Percentage" : "Fixed"}
            </Badge>
          );
        },
      },
      {
        header: "Value",
        accessorKey: "value",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const value = cell.getValue();
          const type = cell.row.original.type;
          const isPercentage = type === CouponType.PERCENTAGE;
          return (
            <span className="fw-medium">
              {isPercentage ? `${value}%` : `$${value}`}
            </span>
          );
        },
      },
      {
        header: "Min Order",
        accessorKey: "minimumOrderAmount",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const amount = cell.getValue();
          return <span className="text-muted">${amount}</span>;
        },
      },
      {
        header: "Usage",
        accessorKey: "usageLimit",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const limit = cell.getValue();
          const perUser = cell.row.original.usageLimitPerUser;
          return (
            <div>
              <div className="fw-medium">{limit} total</div>
              <div className="text-muted fs-12">{perUser} per user</div>
            </div>
          );
        },
      },
      {
        header: "Expires",
        accessorKey: "expiresAt",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const date = cell.getValue();
          if (!date) return <span className="text-muted">-</span>;
          const expiryDate = new Date(date);
          const now = new Date();
          const isExpired = expiryDate < now;

          return (
            <div>
              <div
                className={`fw-medium ${
                  isExpired ? "text-danger" : "text-success"
                }`}
              >
                {expiryDate.toLocaleDateString()}
              </div>
              <div className="text-muted fs-12">
                {isExpired ? "Expired" : "Active"}
              </div>
            </div>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "isActive",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const isActive = cell.getValue();
          const expiresAt = cell.row.original.expiresAt;
          const expiryDate = new Date(expiresAt);
          const now = new Date();
          const isExpired = expiryDate < now;

          let status = "Active";
          let color = "success";

          if (!isActive) {
            status = "Disabled";
            color = "warning";
          } else if (isExpired) {
            status = "Expired";
            color = "danger";
          }

          return <span className={`badge bg-${color}`}>{status}</span>;
        },
      },
      {
        header: "Action",
        cell: (cell: any) => {
          const coupon = cell.row.original;
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
                  to={`/apps-ecommerce-coupon-details/${coupon.id}`}
                >
                  <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                  View
                </DropdownItem>

                <DropdownItem href="#" onClick={() => handleEditCoupon(coupon)}>
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                  Edit
                </DropdownItem>

                <DropdownItem divider />
                <DropdownItem
                  href="#"
                  onClick={() => onClickDelete(coupon)}
                  className="text-danger"
                  disabled={deleteCouponMutation.isPending}
                >
                  {deleteCouponMutation.isPending ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                      Delete
                    </>
                  )}
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    [deleteCouponMutation.isPending]
  );

  // Filter coupons based on search term and filters
  const filteredCoupons = useMemo(() => {
    if (!couponsResponse?.data) return [];
    return couponsResponse.data;
  }, [couponsResponse?.data]);

  document.title = "Coupons | Velzon - React Admin & Dashboard Template";

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteCoupon}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid>
        <BreadCrumb title="Coupons" pageTitle="Ecommerce" />

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
                        setSelectedStatus("");
                        setSelectedType("");
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                    >
                      Clear All
                    </Link>
                  </div>
                </div>

                <div className="filter-choices-input mb-3">
                  <Select
                    value={
                      selectedType
                        ? typeOptions.find(
                            (item: any) => item.value === selectedType
                          )
                        : null
                    }
                    isMulti={false}
                    onChange={(selected: any) => {
                      setSelectedType(selected?.value || "");
                      setCurrentPage(1);
                    }}
                    options={typeOptions}
                    placeholder="Filter by type..."
                    isClearable={true}
                  />
                </div>

                <div className="filter-choices-input">
                  <Select
                    value={
                      selectedStatus
                        ? statusOptions.find(
                            (item: any) => item.value === selectedStatus
                          )
                        : null
                    }
                    isMulti={false}
                    onChange={(selected: any) => {
                      setSelectedStatus(selected?.value || "");
                      setCurrentPage(1);
                    }}
                    options={statusOptions}
                    placeholder="Filter by status..."
                    isClearable={true}
                  />
                </div>
              </CardHeader>
            </Card>
          </Col>

          <Col xl={9} lg={8}>
            <div>
              <Card>
                <div className="card-header border-0">
                  <Row className="align-items-center">
                    <div className="col">
                      <h5 className="card-title mb-0">Coupon List</h5>
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleAddCoupon}
                      >
                        <i className="ri-add-line align-bottom me-1"></i>
                        Add Coupon
                      </button>
                    </div>
                  </Row>
                </div>
                <div className="card-body pt-0">
                  <TableContainer
                    columns={columns}
                    data={filteredCoupons}
                    anotherPagination={true}
                    hasNextPage={couponsResponse?.hasNextPage}
                    isGlobalFilter={true}
                    customPageSize={pageSize}
                    divClass="table-responsive mb-1"
                    tableClass="mb-0 align-middle table-borderless"
                    theadClass="table-light text-muted"
                    SearchPlaceholder="Search Coupons..."
                    isServerSidePagination={true}
                    disablePagination={false}
                    totalCount={couponsResponse?.total || 0}
                    currentPage={currentPage}
                    totalPages={couponsResponse?.totalPages || 0}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onSearch={handleSearch}
                    serverSideSearch={true}
                    isLoading={false}
                  />
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Add/Edit Coupon Modal */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered size="lg">
        <ModalHeader toggle={() => setModal(false)}>
          {isEdit ? "Edit Coupon" : "Add Coupon"}
        </ModalHeader>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
        >
          <ModalBody>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="code" className="form-label">
                    Coupon Code
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="code"
                    name="code"
                    placeholder="Enter coupon code"
                    value={validation.values.code}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.code && validation.touched.code
                        ? true
                        : false
                    }
                  />
                  {validation.errors.code && validation.touched.code ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.code)}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="name" className="form-label">
                    Coupon Name
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Enter coupon name"
                    value={validation.values.name}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.name && validation.touched.name
                        ? true
                        : false
                    }
                  />
                  {validation.errors.name && validation.touched.name ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.name)}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
            </Row>

            <div className="mb-3">
              <Label htmlFor="description" className="form-label">
                Description
              </Label>
              <Input
                type="textarea"
                className="form-control"
                id="description"
                name="description"
                placeholder="Enter description"
                value={validation.values.description}
                onBlur={validation.handleBlur}
                onChange={validation.handleChange}
                invalid={
                  validation.errors.description &&
                  validation.touched.description
                    ? true
                    : false
                }
              />
              {validation.errors.description &&
              validation.touched.description ? (
                <FormFeedback type="invalid">
                  {String(validation.errors.description)}
                </FormFeedback>
              ) : null}
            </div>

            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="type" className="form-label">
                    Type
                  </Label>
                  <Input
                    type="select"
                    className="form-select"
                    id="type"
                    name="type"
                    value={validation.values.type}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.type && validation.touched.type
                        ? true
                        : false
                    }
                  >
                    <option value={CouponType.PERCENTAGE}>Percentage</option>
                    <option value={CouponType.FIXED}>Fixed Amount</option>
                  </Input>
                  {validation.errors.type && validation.touched.type ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.type)}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="value" className="form-label">
                    Value
                  </Label>
                  <Input
                    type="number"
                    className="form-control"
                    id="value"
                    name="value"
                    placeholder="Enter value"
                    value={validation.values.value}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.value && validation.touched.value
                        ? true
                        : false
                    }
                  />
                  {validation.errors.value && validation.touched.value ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.value)}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="minimumOrderAmount" className="form-label">
                    Minimum Order Amount
                  </Label>
                  <Input
                    type="number"
                    className="form-control"
                    id="minimumOrderAmount"
                    name="minimumOrderAmount"
                    placeholder="Enter minimum order amount"
                    value={validation.values.minimumOrderAmount}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.minimumOrderAmount &&
                      validation.touched.minimumOrderAmount
                        ? true
                        : false
                    }
                  />
                  {validation.errors.minimumOrderAmount &&
                  validation.touched.minimumOrderAmount ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.minimumOrderAmount)}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="maximumDiscountAmount" className="form-label">
                    Maximum Discount Amount
                    {validation.values.type === CouponType.PERCENTAGE && (
                      <span className="text-danger"> *</span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    className="form-control"
                    id="maximumDiscountAmount"
                    name="maximumDiscountAmount"
                    placeholder={
                      validation.values.type === CouponType.PERCENTAGE
                        ? "Required for percentage coupons"
                        : "Enter maximum discount amount"
                    }
                    value={validation.values.maximumDiscountAmount}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.maximumDiscountAmount &&
                      validation.touched.maximumDiscountAmount
                        ? true
                        : false
                    }
                  />
                  {validation.errors.maximumDiscountAmount &&
                  validation.touched.maximumDiscountAmount ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.maximumDiscountAmount)}
                    </FormFeedback>
                  ) : null}
                  {validation.values.type === CouponType.PERCENTAGE && (
                    <small className="text-muted">
                      Required for percentage coupons to limit the maximum
                      discount amount
                    </small>
                  )}
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="usageLimit" className="form-label">
                    Usage Limit
                  </Label>
                  <Input
                    type="number"
                    className="form-control"
                    id="usageLimit"
                    name="usageLimit"
                    placeholder="Enter usage limit"
                    value={validation.values.usageLimit}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.usageLimit &&
                      validation.touched.usageLimit
                        ? true
                        : false
                    }
                  />
                  {validation.errors.usageLimit &&
                  validation.touched.usageLimit ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.usageLimit)}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="usageLimitPerUser" className="form-label">
                    Usage Limit Per User
                  </Label>
                  <Input
                    type="number"
                    className="form-control"
                    id="usageLimitPerUser"
                    name="usageLimitPerUser"
                    placeholder="Enter usage limit per user"
                    value={validation.values.usageLimitPerUser}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.usageLimitPerUser &&
                      validation.touched.usageLimitPerUser
                        ? true
                        : false
                    }
                  />
                  {validation.errors.usageLimitPerUser &&
                  validation.touched.usageLimitPerUser ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.usageLimitPerUser)}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
            </Row>

            <div className="mb-3">
              <Label htmlFor="expiresAt" className="form-label">
                Expiration Date
              </Label>
              <Input
                type="datetime-local"
                className="form-control"
                id="expiresAt"
                name="expiresAt"
                value={validation.values.expiresAt}
                onBlur={validation.handleBlur}
                onChange={validation.handleChange}
                invalid={
                  validation.errors.expiresAt && validation.touched.expiresAt
                    ? true
                    : false
                }
              />
              {validation.errors.expiresAt && validation.touched.expiresAt ? (
                <FormFeedback type="invalid">
                  {String(validation.errors.expiresAt)}
                </FormFeedback>
              ) : null}
            </div>

            <div className="mb-3">
              <Label className="form-label d-block">Status</Label>
              <div className="form-check form-switch">
                <Input
                  type="switch"
                  className="form-check-input"
                  id="isActive"
                  name="isActive"
                  checked={validation.values.isActive}
                  onChange={(e) => {
                    validation.setFieldValue("isActive", e.target.checked);
                  }}
                />
                <Label className="form-check-label" htmlFor="isActive">
                  {validation.values.isActive ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={
                createCouponMutation.isPending || updateCouponMutation.isPending
              }
            >
              {createCouponMutation.isPending ||
              updateCouponMutation.isPending ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <i className="ri-save-line me-1"></i>
                  {isEdit ? "Update Coupon" : "Create Coupon"}
                </>
              )}
            </button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default EcommerceCoupons;
