import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Spinner,
  Alert,
} from "reactstrap";
import { Link, useParams } from "react-router-dom";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { useCategory } from "../../../hooks/useCategories";
import { parseApiError } from "../../../utils/errorHandler";

const CategoryDetail = () => {
  const params = useParams<{ _id: string }>();
  const { _id: id } = params;

  const { data: category, isLoading, error } = useCategory(id || "");

  document.title = category
    ? `${category.nameEn} - Category Details`
    : "Category Details | Velzon - React Admin & Dashboard Template";

  if (isLoading) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Category Details" pageTitle="Ecommerce" />
          <Row>
            <Col>
              <div className="text-center py-4">
                <Spinner color="primary" />
                <p className="mt-2">Loading category details...</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Category Details" pageTitle="Ecommerce" />
          <Row>
            <Col>
              <Alert color="danger">
                <h5>Error loading category</h5>
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
        <BreadCrumb title="Category Details" pageTitle="Ecommerce" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Row className="gx-lg-5">
                  <Col xl={4} md={8} className="mx-auto">
                    <div className="category-img-slider sticky-side-div">
                      <div className="text-center">
                        <div className="avatar-lg mx-auto">
                          <div className="avatar-title bg-light rounded position-relative">
                            {category.image ? (
                              <img
                                src={`http://localhost:4000${
                                  typeof category.image === "string"
                                    ? category.image
                                    : category.image?.path
                                }`}
                                alt={category.nameEn}
                                className="img-fluid d-block rounded"
                                style={{
                                  maxWidth: "200px",
                                  maxHeight: "200px",
                                }}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "../../assets/images/products/img-1.png";
                                }}
                              />
                            ) : (
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: "200px", height: "200px" }}
                              >
                                <i
                                  className="ri-image-line"
                                  style={{ fontSize: "3rem", color: "#ccc" }}
                                ></i>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xl={8}>
                    <div className="mt-xl-0 mt-5">
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <h4>{category.nameEn}</h4>
                          <div className="hstack gap-3 flex-wrap">
                            <div className="text-muted">
                              Arabic Name:{" "}
                              <span className="text-dark fw-medium">
                                {category.nameAr || "N/A"}
                              </span>
                            </div>
                            <div className="vr"></div>
                            <div className="text-muted">
                              Created:{" "}
                              <span className="text-dark fw-medium">
                                {category.createdAt
                                  ? new Date(
                                      category.createdAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div>
                            <Link
                              to={`/apps-ecommerce-add-category?edit=${category.id}`}
                              className="btn btn-light"
                            >
                              <i className="ri-pencil-fill align-bottom"></i>
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
                        <Badge
                          color={category.isActive ? "success" : "warning"}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="mt-4 text-muted">
                        <h5 className="fs-14">Description (English):</h5>
                        <p>
                          {category.descriptionEn ||
                            "No description available."}
                        </p>
                      </div>

                      {category.descriptionAr && (
                        <div className="mt-4 text-muted">
                          <h5 className="fs-14">Description (Arabic):</h5>
                          <p>{category.descriptionAr}</p>
                        </div>
                      )}

                      <div className="product-content mt-5">
                        <h5 className="fs-14 mb-3">Category Details:</h5>
                        <div className="table-responsive">
                          <table className="table mb-0">
                            <tbody>
                              <tr>
                                <th scope="row" style={{ width: "200px" }}>
                                  Category ID
                                </th>
                                <td>{category.id}</td>
                              </tr>
                              <tr>
                                <th scope="row">Name (English)</th>
                                <td>{category.nameEn}</td>
                              </tr>
                              <tr>
                                <th scope="row">Name (Arabic)</th>
                                <td>{category.nameAr || "N/A"}</td>
                              </tr>
                              <tr>
                                <th scope="row">Status</th>
                                <td>
                                  <Badge
                                    color={
                                      category.isActive ? "success" : "warning"
                                    }
                                  >
                                    {category.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </td>
                              </tr>
                              <tr>
                                <th scope="row">Created At</th>
                                <td>
                                  {category.createdAt
                                    ? new Date(
                                        category.createdAt
                                      ).toLocaleString()
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <th scope="row">Updated At</th>
                                <td>
                                  {category.updatedAt
                                    ? new Date(
                                        category.updatedAt
                                      ).toLocaleString()
                                    : "N/A"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
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
};

export default CategoryDetail;
