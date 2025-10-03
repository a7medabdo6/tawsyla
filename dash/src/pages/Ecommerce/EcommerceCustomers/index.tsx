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
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../../hooks/useUsers";
import { parseApiError } from "../../../utils/errorHandler";
import { AuthService } from "../../../services/authService";

//formik
import { useFormik } from "formik";
import * as Yup from "yup";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: 1, label: "Active" },
  { value: 2, label: "Inactive" },
];

const roleOptions = [
  { value: null, label: "All Roles" },
  { value: 1, label: "Admin" },
  { value: 2, label: "User" },
];

const EcommerceCustomers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [modal, setModal] = useState(false);

  // Fetch users with pagination and search
  const {
    data: usersResponse,
    isLoading,
    error,
  } = useUsers({
    page: currentPage,
    search: searchTerm || undefined,
    role: selectedRole || undefined,
    status: selectedStatus,
  });

  // API mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const currentUserId = AuthService.getCurrentUser()?.id;

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
  const onClickDelete = (user: any) => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        await deleteUserMutation.mutateAsync(selectedUser.id);
        toast.success("User deleted successfully!");
        setDeleteModal(false);
        setSelectedUser(null);
      } catch (error) {
        console.error("Delete user failed:", error);
        toast.error(parseApiError(error));
      }
    }
  };

  // Handle edit
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEdit(true);
    setModal(true);
  };

  // Handle add new user
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEdit(false);
    setModal(true);
  };

  // Form validation
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: selectedUser?.firstName || "",
      lastName: selectedUser?.lastName || "",
      email: selectedUser?.email || "",
      phone: selectedUser?.phone || "",
      password: "",
      role: selectedUser?.role?.name || "User",
      isActive: selectedUser?.status?.name === "Active" || true,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string(),
      password: Yup.string().when("isEdit", {
        is: false,
        then: (schema) => schema.required("Password is required"),
        otherwise: (schema) => schema,
      }),
      role: Yup.string().required("Role is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          const updateData: any = {
            id: selectedUser.id,
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone,
            role: values.role,
            isActive: values.isActive,
            ...(values.password && { password: values.password }),
          };

          // Only include email if it has changed
          if (values.email !== selectedUser.email) {
            updateData.email = values.email;
          }

          await updateUserMutation.mutateAsync(updateData);
          toast.success("User updated successfully!");
        } else {
          await createUserMutation.mutateAsync({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            password: values.password,
            role: values.role,
            isActive: values.isActive,
          });
          toast.success("User created successfully!");
        }
        setModal(false);
        validation.resetForm();
      } catch (error) {
        console.error("User operation failed:", error);
        toast.error(parseApiError(error));
      }
    },
  });

  const columns = useMemo(
    () => [
      {
        header: "Customer",
        accessorKey: "firstName",
        enableColumnFilter: false,
        cell: (cell: any) => (
          <>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="avatar-sm bg-light rounded p-1">
                  <div className="avatar-title bg-light rounded">
                    <i
                      className="ri-user-line text-muted"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                  </div>
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="fs-14 mb-1">
                  <Link
                    to={`/apps-ecommerce-customer-details/${cell.row.original.id}`}
                    className="text-body"
                  >
                    {cell.row.original.firstName} {cell.row.original.lastName}
                  </Link>
                </h5>
                <p className="text-muted mb-0">{cell.row.original.email}</p>
                <p className="text-muted mb-0 fs-12">
                  Role:{" "}
                  <span className="fw-medium">
                    {cell.row.original.role?.name || "User"}
                  </span>
                </p>
              </div>
            </div>
          </>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const status = cell.getValue()?.name || "Active";
          const isActive = status === "Active";
          return (
            <span className={`badge ${isActive ? "bg-success" : "bg-warning"}`}>
              {status}
            </span>
          );
        },
      },
      {
        header: "Role",
        accessorKey: "role",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const role = cell.getValue()?.name || "User";
          return (
            <Badge color="info" className="text-uppercase">
              {role}
            </Badge>
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
          const user = cell.row.original;
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
                  to={`/apps-ecommerce-customer-details/${user.id}`}
                >
                  <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                  View
                </DropdownItem>

                <DropdownItem href="#" onClick={() => handleEditUser(user)}>
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                  Edit
                </DropdownItem>

                <DropdownItem divider />
                <DropdownItem
                  href="#"
                  onClick={() => onClickDelete(user)}
                  className="text-danger"
                  disabled={deleteUserMutation.isPending}
                >
                  {deleteUserMutation.isPending ? (
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
    [deleteUserMutation.isPending]
  );
  console.log(usersResponse, "usersResponse");

  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => {
    if (!usersResponse?.data) return [];

    let filtered = usersResponse.data;

    // Hide current user from the list
    console.log(AuthService.getCurrentUser(), "AuthService.getCurrentUser()");
    const currentUserId = AuthService.getCurrentUser()?.id;
    if (currentUserId) {
      filtered = filtered.filter((user: any) => user.id != currentUserId);
    }

    return filtered;
  }, [usersResponse?.data]);

  document.title = "Customers | Velzon - React Admin & Dashboard Template";

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteUser}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid>
        <BreadCrumb title="Customers" pageTitle="Ecommerce" />

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
                        setSelectedRole("");
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
                      selectedStatus
                        ? statusOptions.find(
                            (item: any) => item.value == selectedStatus
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

                <div className="filter-choices-input">
                  <Select
                    value={
                      selectedRole
                        ? roleOptions.find(
                            (item: any) => item.value == selectedRole
                          )
                        : null
                    }
                    isMulti={false}
                    onChange={(selected: any) => {
                      setSelectedRole(selected?.value || "");
                      setCurrentPage(1);
                    }}
                    options={roleOptions}
                    placeholder="Filter by role..."
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
                      <h5 className="card-title mb-0">Customer List</h5>
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleAddUser}
                      >
                        <i className="ri-add-line align-bottom me-1"></i>
                        Add Customer
                      </button>
                    </div>
                  </Row>
                </div>
                <div className="card-body pt-0">
                  <TableContainer
                    columns={columns}
                    data={filteredUsers}
                    anotherPagination={true}
                    hasNextPage={usersResponse?.hasNextPage}
                    isGlobalFilter={true}
                    customPageSize={pageSize}
                    divClass="table-responsive mb-1"
                    tableClass="mb-0 align-middle table-borderless"
                    theadClass="table-light text-muted"
                    SearchPlaceholder="Search Customers..."
                    isServerSidePagination={true}
                    disablePagination={false}
                    totalCount={usersResponse?.total || 0}
                    currentPage={currentPage}
                    totalPages={usersResponse?.totalPages || 0}
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

      {/* Add/Edit User Modal */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered>
        <ModalHeader toggle={() => setModal(false)}>
          {isEdit ? "Edit Customer" : "Add Customer"}
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
                  <Label htmlFor="firstName" className="form-label">
                    First Name
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="firstName"
                    name="firstName"
                    placeholder="Enter first name"
                    value={validation.values.firstName}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.firstName &&
                      validation.touched.firstName
                        ? true
                        : false
                    }
                  />
                  {validation.errors.firstName &&
                  validation.touched.firstName ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.firstName)}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="lastName" className="form-label">
                    Last Name
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="lastName"
                    name="lastName"
                    placeholder="Enter last name"
                    value={validation.values.lastName}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.lastName && validation.touched.lastName
                        ? true
                        : false
                    }
                  />
                  {validation.errors.lastName && validation.touched.lastName ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.lastName)}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
            </Row>

            <div className="mb-3">
              <Label htmlFor="email" className="form-label">
                Email
              </Label>
              <Input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="Enter email"
                value={validation.values.email}
                onBlur={validation.handleBlur}
                onChange={validation.handleChange}
                invalid={
                  validation.errors.email && validation.touched.email
                    ? true
                    : false
                }
              />
              {validation.errors.email && validation.touched.email ? (
                <FormFeedback type="invalid">
                  {String(validation.errors.email)}
                </FormFeedback>
              ) : null}
            </div>

            <div className="mb-3">
              <Label htmlFor="phone" className="form-label">
                Phone
              </Label>
              <Input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={validation.values.phone}
                onBlur={validation.handleBlur}
                onChange={validation.handleChange}
                invalid={
                  validation.errors.phone && validation.touched.phone
                    ? true
                    : false
                }
              />
              {validation.errors.phone && validation.touched.phone ? (
                <FormFeedback type="invalid">
                  {String(validation.errors.phone)}
                </FormFeedback>
              ) : null}
            </div>

            {!isEdit && (
              <div className="mb-3">
                <Label htmlFor="password" className="form-label">
                  Password
                </Label>
                <Input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  value={validation.values.password}
                  onBlur={validation.handleBlur}
                  onChange={validation.handleChange}
                  invalid={
                    validation.errors.password && validation.touched.password
                      ? true
                      : false
                  }
                />
                {validation.errors.password && validation.touched.password ? (
                  <FormFeedback type="invalid">
                    {String(validation.errors.password)}
                  </FormFeedback>
                ) : null}
              </div>
            )}

            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="role" className="form-label">
                    Role
                  </Label>
                  <Input
                    type="select"
                    className="form-select"
                    id="role"
                    name="role"
                    value={validation.values.role}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    invalid={
                      validation.errors.role && validation.touched.role
                        ? true
                        : false
                    }
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </Input>
                  {validation.errors.role && validation.touched.role ? (
                    <FormFeedback type="invalid">
                      {String(validation.errors.role)}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
              <Col md={6}>
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
              </Col>
            </Row>
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
                createUserMutation.isPending || updateUserMutation.isPending
              }
            >
              {createUserMutation.isPending || updateUserMutation.isPending ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <i className="ri-save-line me-1"></i>
                  {isEdit ? "Update Customer" : "Create Customer"}
                </>
              )}
            </button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default EcommerceCustomers;
