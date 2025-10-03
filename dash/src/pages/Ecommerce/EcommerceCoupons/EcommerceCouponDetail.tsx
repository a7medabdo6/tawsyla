import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Spinner,
  Alert,
  Button,
} from "reactstrap";
import { toast } from "react-toastify";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { useCoupon, CouponType, CouponStatus } from "../../../hooks/useCoupons";
import { parseApiError } from "../../../utils/errorHandler";

const EcommerceCouponDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [coupon, setCoupon] = useState<any>(null);

  const { data: couponData, isLoading, error } = useCoupon(id || "");

  useEffect(() => {
    if (couponData) {
      setCoupon(couponData);
    }
  }, [couponData]);

  const getStatusBadge = (coupon: any) => {
    if (!coupon) return null;

    const status = coupon.status || (coupon.isActive ? "active" : "disabled");
    const expiresAt = new Date(coupon.expiresAt);
    const now = new Date();
    const isExpired = expiresAt < now;

    let displayStatus = "Active";
    let color = "success";

    if (status === "disabled" || !coupon.isActive) {
      displayStatus = "Disabled";
      color = "warning";
    } else if (status === "expired" || isExpired) {
      displayStatus = "Expired";
      color = "danger";
    } else if (status === "active") {
      displayStatus = "Active";
      color = "success";
    }

    return <Badge color={color}>{displayStatus}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const isPercentage = type === CouponType.PERCENTAGE;
    return (
      <Badge
        color={isPercentage ? "info" : "warning"}
        className="text-uppercase"
      >
        {isPercentage ? "Percentage" : "Fixed"}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatValue = (value: number, type: string) => {
    const isPercentage = type === CouponType.PERCENTAGE;
    return isPercentage ? `${value}%` : `$${value}`;
  };

  if (isLoading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "400px" }}
          >
            <Spinner size="lg" />
          </div>
        </Container>
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="page-content">
        <Container fluid>
          <Alert color="danger">
            {error ? parseApiError(error) : "Coupon not found"}
          </Alert>
        </Container>
      </div>
    );
  }

  document.title = `Coupon: ${coupon.code} | Velzon - React Admin & Dashboard Template`;

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title={`Coupon: ${coupon.code}`} pageTitle="Ecommerce" />

        <Row>
          <Col lg={8}>
            <Card>
              <CardHeader>
                <div className="d-flex align-items-center justify-content-between">
                  <h4 className="card-title mb-0">Coupon Details</h4>
                  <div>
                    <Link
                      to="/apps-ecommerce-coupons"
                      className="btn btn-secondary me-2"
                    >
                      <i className="ri-arrow-left-line me-1"></i>
                      Back to List
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Coupon Code
                      </label>
                      <p className="text-muted mb-0">{coupon.code}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Status</label>
                      <div>{getStatusBadge(coupon)}</div>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Coupon Name
                      </label>
                      <p className="text-muted mb-0">{coupon.name}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Type</label>
                      <div>{getTypeBadge(coupon.type)}</div>
                    </div>
                  </Col>
                </Row>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <p className="text-muted mb-0">{coupon.description}</p>
                </div>

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Discount Value
                      </label>
                      <p className="text-muted mb-0">
                        {formatValue(coupon.value, coupon.type)}
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Minimum Order Amount
                      </label>
                      <p className="text-muted mb-0">
                        ${coupon.minimumOrderAmount}
                      </p>
                    </div>
                  </Col>
                </Row>

                {coupon.type === CouponType.PERCENTAGE && (
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Maximum Discount Amount
                        </label>
                        <p className="text-muted mb-0">
                          ${coupon.maximumDiscountAmount}
                        </p>
                      </div>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Usage Limit (Total)
                      </label>
                      <p className="text-muted mb-0">{coupon.usageLimit}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Usage Limit Per User
                      </label>
                      <p className="text-muted mb-0">
                        {coupon.usageLimitPerUser}
                      </p>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Times Used
                      </label>
                      <p className="text-muted mb-0">
                        {coupon.usageCount || 0}
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Remaining Uses
                      </label>
                      <p className="text-muted mb-0">
                        {coupon.usageLimit - (coupon.usageCount || 0)}
                      </p>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Expiration Date
                      </label>
                      <p className="text-muted mb-0">
                        {formatDate(coupon.expiresAt)}
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Created At
                      </label>
                      <p className="text-muted mb-0">
                        {coupon.createdAt
                          ? formatDate(coupon.createdAt)
                          : "N/A"}
                      </p>
                    </div>
                  </Col>
                </Row>

                {coupon.updatedAt && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Last Updated
                    </label>
                    <p className="text-muted mb-0">
                      {formatDate(coupon.updatedAt)}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Usage History */}
            {coupon.usages && coupon.usages.length > 0 && (
              <Card className="mt-3">
                <CardHeader>
                  <h4 className="card-title mb-0">Usage History</h4>
                </CardHeader>
                <CardBody>
                  <div className="table-responsive">
                    <table className="table table-borderless mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Order Amount</th>
                          <th>Discount Amount</th>
                          <th>Used At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupon.usages.map((usage: any, index: number) => (
                          <tr key={usage.id}>
                            <td>
                              <span className="fw-medium">{usage.orderId}</span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 me-2">
                                  <div className="avatar-sm bg-light rounded p-1">
                                    <div className="avatar-title bg-light rounded">
                                      <i
                                        className="ri-user-line text-muted"
                                        style={{ fontSize: "1rem" }}
                                      ></i>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="mb-0 fs-13">
                                    {usage.user?.firstName}{" "}
                                    {usage.user?.lastName}
                                  </h6>
                                  <p className="text-muted mb-0 fs-12">
                                    {usage.user?.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="fw-medium">
                                ${usage.orderAmount}
                              </span>
                            </td>
                            <td>
                              <span className="text-success fw-medium">
                                -${usage.discountAmount}
                              </span>
                            </td>
                            <td>
                              <span className="text-muted">
                                {formatDate(usage.createdAt)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            )}
          </Col>

          <Col lg={4}>
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">Quick Actions</h4>
              </CardHeader>
              <CardBody>
                <div className="d-grid gap-2">
                  <Button
                    color="primary"
                    className="mb-2"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(coupon.code)
                        .then(() => {
                          toast.success("Coupon code copied to clipboard!");
                        })
                        .catch(() => {
                          toast.error("Failed to copy coupon code");
                        });
                    }}
                  >
                    <i className="ri-copy-line me-1"></i>
                    Copy Coupon Code
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card className="mt-3">
              <CardHeader>
                <h4 className="card-title mb-0">Coupon Statistics</h4>
              </CardHeader>
              <CardBody>
                <div className="text-center">
                  <div className="mb-3">
                    <h3 className="text-primary mb-1">
                      {coupon.usageCount || 0}
                    </h3>
                    <p className="text-muted mb-0">Times Used</p>
                  </div>
                  <div className="mb-3">
                    <h3 className="text-success mb-1">
                      ${coupon.minimumOrderAmount}
                    </h3>
                    <p className="text-muted mb-0">Minimum Order</p>
                  </div>
                  <div className="mb-3">
                    <h3 className="text-info mb-1">
                      {coupon.usageLimit - (coupon.usageCount || 0)}
                    </h3>
                    <p className="text-muted mb-0">Remaining Uses</p>
                  </div>
                  <div>
                    <h3 className="text-warning mb-1">
                      $
                      {coupon.usages?.reduce(
                        (total: number, usage: any) =>
                          total + parseFloat(usage.discountAmount),
                        0
                      ) || 0}
                    </h3>
                    <p className="text-muted mb-0">Total Discount Given</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EcommerceCouponDetail;
