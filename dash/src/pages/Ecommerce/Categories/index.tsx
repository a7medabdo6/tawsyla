import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  Badge,
  Spinner,
  Alert,
} from "reactstrap";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import DeleteModal from "../../../Components/Common/DeleteModal";

import { useCategories, useDeleteCategory } from "../../../hooks/useCategories";
import { parseApiError } from "../../../utils/errorHandler";

const Categories = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Fetch categories with pagination and search
  const { data: categoriesResponse, isLoading, error } = useCategories();

  // Delete category mutation
  const deleteCategoryMutation = useDeleteCategory();

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
  const onClickDelete = (category: any) => {
    setSelectedCategory(category);
    setDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    if (selectedCategory) {
      try {
        await deleteCategoryMutation.mutateAsync(selectedCategory.id);
        toast.success("Category deleted successfully!");
        setDeleteModal(false);
        setSelectedCategory(null);
      } catch (error) {
        console.error("Delete category failed:", error);
        toast.error(parseApiError(error));
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Image",
        accessorKey: "image",
        cell: (cell: any) => {
          const image = cell.getValue();
          const imageUrl = image
            ? `http://localhost:4000${
                typeof image === "string" ? image : image?.path
              }`
            : null;

          return (
            <div className="d-flex align-items-center">
              <div className="avatar-sm">
                <div className="avatar-title bg-light rounded">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Category"
                      className="avatar-sm rounded"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        const nextSibling =
                          target.nextElementSibling as HTMLElement;
                        if (target) target.style.display = "none";
                        if (nextSibling) nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="avatar-title bg-light rounded d-flex align-items-center justify-content-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      display: imageUrl ? "none" : "flex",
                    }}
                  >
                    <i
                      className="ri-image-line text-muted"
                      style={{ fontSize: "1.2rem" }}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: "Category Name",
        accessorKey: "nameEn",
        cell: (cell: any) => (
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <h5 className="fs-14 mb-1">
                <Link
                  to={`/apps-ecommerce-category-details/${cell.row.original.id}`}
                  className="text-body"
                >
                  {cell.getValue()}
                </Link>
              </h5>
              <p className="text-muted mb-0">
                Arabic: {cell.row.original.nameAr || "N/A"}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Description",
        accessorKey: "descriptionEn",
        cell: (cell: any) => {
          const description =
            cell.getValue() ||
            cell.row.original.descriptionAr ||
            "No description";
          return (
            <p className="text-muted mb-0">
              {description.length > 50
                ? `${description.substring(0, 50)}...`
                : description}
            </p>
          );
        },
      },

      {
        header: "Created",
        accessorKey: "createdAt",
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
          const category = cell.row.original;
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
                  to={`/apps-ecommerce-category-details/${category.id}`}
                >
                  <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                  View
                </DropdownItem>

                <DropdownItem
                  tag={Link}
                  to={`/apps-ecommerce-add-category?edit=${category.id}`}
                >
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                  Edit
                </DropdownItem>

                <DropdownItem divider />
                <DropdownItem
                  href="#"
                  onClick={() => onClickDelete(category)}
                  className="text-danger"
                  disabled={deleteCategoryMutation.isPending}
                >
                  {deleteCategoryMutation.isPending ? (
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
    []
  );

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!categoriesResponse) return [];

    if (!searchTerm) return categoriesResponse;

    return categoriesResponse.filter(
      (category: any) =>
        category.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.descriptionEn
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        category.descriptionAr?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categoriesResponse, searchTerm]);

  // Paginate filtered categories
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize);

  document.title = "Categories | Velzon - React Admin & Dashboard Template";

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteCategory}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid>
        <BreadCrumb title="Categories" pageTitle="Ecommerce" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex align-items-center mb-3">
                  <h5 className="card-title flex-grow-1 mb-0">Categories</h5>
                  <div className="flex-shrink-0">
                    <Link
                      to="/apps-ecommerce-add-category"
                      className="btn btn-success"
                    >
                      <i className="ri-add-line align-bottom me-1"></i>
                      Add Category
                    </Link>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-4">
                    <Spinner color="primary" />
                    <p className="mt-2">Loading categories...</p>
                  </div>
                ) : error ? (
                  <Alert color="danger">
                    <h5>Error loading categories</h5>
                    <p>{parseApiError(error)}</p>
                  </Alert>
                ) : (
                  <TableContainer
                    columns={columns}
                    data={paginatedCategories}
                    isGlobalFilter={true}
                    customPageSize={pageSize}
                    divClass="table-responsive mb-1"
                    tableClass="mb-0 align-middle table-borderless"
                    theadClass="table-light text-muted"
                    SearchPlaceholder="Search Categories..."
                    isServerSidePagination={true}
                    totalCount={filteredCategories.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onSearch={handleSearch}
                    serverSideSearch={true}
                    isLoading={false}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Categories;
