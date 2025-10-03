import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  CardHeader,
  Collapse,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import classnames from "classnames";
import { Link } from "react-router-dom";
import moment from "moment";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Loader from "../../../Components/Common/Loader";
import { toast } from "react-toastify";

// Custom hooks
import {
  useOrder,
  useUpdateOrder,
  useUpdateOrderStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  type Order,
  useCancelOrder,
} from "../../../hooks/useOrders";

// Default avatar
import avatar3 from "../../../assets/images/users/avatar-3.jpg";

const EcommerceOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [col1, setcol1] = useState(true);
  const [col2, setcol2] = useState(true);
  const [col3, setcol3] = useState(true);
  const [updateModal, setUpdateModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    trackingNumber: "",
    trackingUrl: "",
  });

  // Fetch order data
  const { data: order, isLoading, error } = useOrder(id || "");
  const updateOrderMutation = useUpdateOrder();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const cancelOrderStatusMutation = useCancelOrder();

  // Update form when order data changes
  useEffect(() => {
    if (order) {
      setUpdateForm({
        status: order.status,
        trackingNumber: order.trackingNumber || "",
        trackingUrl: order.trackingUrl || "",
      });
    }
  }, [order]);

  const togglecol1 = () => setcol1(!col1);
  const togglecol2 = () => setcol2(!col2);
  const togglecol3 = () => setcol3(!col3);

  const handleUpdateOrder = () => {
    if (!order) return;

    // Update status using dedicated endpoint
    updateOrderStatusMutation.mutate(
      {
        orderId: order.id,
        status: updateForm.status as OrderStatus,
      },
      {
        onSuccess: () => {
          toast.success("Order status updated successfully");
          setUpdateModal(false);
        },
        onError: (error) => {
          toast.error("Failed to update order status");
        },
      }
    );
  };

  const handleCancelOrder = () => {
    if (!order) return;

    cancelOrderStatusMutation.mutate(order.id, {
      onSuccess: () => {
        toast.success("Order cancelled successfully");
        setCancelModal(false);
      },
      onError: (error) => {
        toast.error("Failed to cancel order");
      },
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return (
          <Badge className="bg-warning-subtle text-warning">Pending</Badge>
        );
      case OrderStatus.CONFIRMED:
        return <Badge className="bg-info-subtle text-info">Confirmed</Badge>;
      case OrderStatus.SHIPPED:
        return (
          <Badge className="bg-primary-subtle text-primary">Shipped</Badge>
        );
      case OrderStatus.DELIVERED:
        return (
          <Badge className="bg-success-subtle text-success">Delivered</Badge>
        );
      case OrderStatus.CANCELLED:
        return (
          <Badge className="bg-danger-subtle text-danger">Cancelled</Badge>
        );
      default:
        return (
          <Badge className="bg-secondary-subtle text-secondary">{status}</Badge>
        );
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return (
          <Badge className="bg-warning-subtle text-warning">Pending</Badge>
        );
      case PaymentStatus.PAID:
        return <Badge className="bg-success-subtle text-success">Paid</Badge>;
      case PaymentStatus.FAILED:
        return <Badge className="bg-danger-subtle text-danger">Failed</Badge>;
      case PaymentStatus.REFUNDED:
        return <Badge className="bg-info-subtle text-info">Refunded</Badge>;
      default:
        return (
          <Badge className="bg-secondary-subtle text-secondary">{status}</Badge>
        );
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return "Cash";
      case PaymentMethod.CREDIT_CARD:
        return "Credit Card";
      case PaymentMethod.BANK_TRANSFER:
        return "Bank Transfer";
      case PaymentMethod.PAYPAL:
        return "PayPal";
      default:
        return method;
    }
  };

  const getOrderTimeline = (order: Order) => {
    const timeline = [];

    // Order Placed
    timeline.push({
      id: 1,
      title: "Order Placed",
      date: order.createdAt,
      icon: "ri-shopping-bag-line",
      color: "bg-success",
      completed: true,
      details: "Order has been placed successfully",
    });

    // Order Confirmed
    if (order.confirmedAt) {
      timeline.push({
        id: 2,
        title: "Order Confirmed",
        date: order.confirmedAt,
        icon: "ri-checkbox-circle-line",
        color: "bg-success",
        completed: true,
        details: "Order has been confirmed and is being processed",
      });
    }

    // Order Shipped
    if (order.shippedAt) {
      timeline.push({
        id: 3,
        title: "Order Shipped",
        date: order.shippedAt,
        icon: "ri-truck-line",
        color: "bg-success",
        completed: true,
        details: order.trackingNumber
          ? `Order shipped with tracking number: ${order.trackingNumber}`
          : "Order has been shipped",
      });
    }

    // Order Delivered
    if (order.deliveredAt) {
      timeline.push({
        id: 4,
        title: "Order Delivered",
        date: order.deliveredAt,
        icon: "ri-takeaway-fill",
        color: "bg-success",
        completed: true,
        details: "Order has been delivered successfully",
      });
    }

    // Order Cancelled
    if (order.cancelledAt) {
      timeline.push({
        id: 5,
        title: "Order Cancelled",
        date: order.cancelledAt,
        icon: "ri-close-circle-line",
        color: "bg-danger",
        completed: true,
        details: "Order has been cancelled",
      });
    }

    return timeline;
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !order) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Order Details" pageTitle="Ecommerce" />
          <div className="text-center py-5">
            <h4>Order not found</h4>
            <p className="text-muted">
              The order you're looking for doesn't exist.
            </p>
            <Button
              color="primary"
              onClick={() => navigate("/apps-ecommerce-orders")}
            >
              Back to Orders
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const timeline = getOrderTimeline(order);

  document.title = `Order #${order.orderNumber} | Velzon - React Admin & Dashboard Template`;

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Order Details" pageTitle="Ecommerce" />

        <Row>
          <Col xl={9}>
            <Card>
              <CardHeader>
                <div className="d-flex align-items-center">
                  <h5 className="card-title flex-grow-1 mb-0">
                    Order #{order.orderNumber}
                    <span className="ms-2">{getStatusBadge(order.status)}</span>
                  </h5>
                  <div className="flex-shrink-0">
                    <Button
                      color="success"
                      size="sm"
                      className="me-2"
                      onClick={() => setUpdateModal(true)}
                    >
                      <i className="ri-edit-line align-middle me-1"></i>
                      Update Status
                    </Button>
                    {order.status !== OrderStatus.CANCELLED && (
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => setCancelModal(true)}
                      >
                        <i className="ri-close-line align-middle me-1"></i>
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="table-responsive table-card">
                  <table className="table table-nowrap align-middle table-borderless mb-0">
                    <thead className="table-light text-muted">
                      <tr>
                        <th scope="col">Product Details</th>
                        <th scope="col">Item Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, key) => (
                        <tr key={key}>
                          <td>
                            <div className="d-flex">
                              <div className="flex-shrink-0 avatar-md bg-light rounded p-1">
                                {item.product?.image ? (
                                  <img
                                    src={item.product.image.path}
                                    alt={item.productName}
                                    className="img-fluid d-block rounded"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div className="avatar-title bg-light rounded">
                                    <i className="ri-shopping-bag-line fs-20"></i>
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <h5 className="fs-14">
                                  <Link to="#" className="link-dark">
                                    {item.productName}
                                  </Link>
                                </h5>
                                {item.variantName && (
                                  <p className="text-muted mb-0">
                                    Variant:{" "}
                                    <span className="fw-medium">
                                      {item.variantName}
                                    </span>
                                  </p>
                                )}
                                {item.variant?.sku && (
                                  <p className="text-muted mb-0">
                                    SKU:{" "}
                                    <span className="fw-medium">
                                      {item.variant.sku}
                                    </span>
                                  </p>
                                )}
                                {item.notes && (
                                  <p className="text-muted mb-0">
                                    <small>Note: {item.notes}</small>
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td className="fw-medium text-end">
                            ${parseFloat(item.totalPrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-top border-top-dashed">
                        <td colSpan={3}></td>
                        <td colSpan={1} className="fw-medium p-0">
                          <table className="table table-borderless mb-0">
                            <tbody>
                              <tr>
                                <td>Sub Total :</td>
                                <td className="text-end">
                                  ${parseFloat(order.subtotal).toFixed(2)}
                                </td>
                              </tr>
                              {parseFloat(order.discountAmount) > 0 && (
                                <tr>
                                  <td>Discount :</td>
                                  <td className="text-end">
                                    -$
                                    {parseFloat(order.discountAmount).toFixed(
                                      2
                                    )}
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <td>Shipping Charge :</td>
                                <td className="text-end">
                                  ${parseFloat(order.shippingCost).toFixed(2)}
                                </td>
                              </tr>
                              <tr>
                                <td>Tax :</td>
                                <td className="text-end">
                                  ${parseFloat(order.taxAmount).toFixed(2)}
                                </td>
                              </tr>
                              <tr className="border-top border-top-dashed">
                                <th scope="row">Total (USD) :</th>
                                <th className="text-end">
                                  ${parseFloat(order.total).toFixed(2)}
                                </th>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Order Timeline</h5>
              </CardHeader>
              <CardBody>
                <div className="profile-timeline">
                  <div
                    className="accordion accordion-flush"
                    id="accordionFlushExample"
                  >
                    {timeline.map((item, index) => (
                      <div className="accordion-item border-0" key={item.id}>
                        <div
                          className="accordion-header"
                          id={`heading${item.id}`}
                        >
                          <Link
                            to="#"
                            className={classnames(
                              "accordion-button",
                              "p-2",
                              "shadow-none",
                              { collapsed: index !== 0 }
                            )}
                          >
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0 avatar-xs">
                                <div
                                  className={`avatar-title ${item.color} rounded-circle`}
                                >
                                  <i className={item.icon}></i>
                                </div>
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <h6 className="fs-14 mb-0">
                                  {item.title} -{" "}
                                  <span className="fw-normal">
                                    {moment(item.date).format("MMM DD, YYYY")}
                                  </span>
                                </h6>
                              </div>
                            </div>
                          </Link>
                        </div>
                        <Collapse
                          id={`collapse${item.id}`}
                          className="accordion-collapse"
                          isOpen={index === 0}
                        >
                          <div className="accordion-body ms-2 ps-5 pt-0">
                            <h6 className="mb-1">{item.details}</h6>
                            <p className="text-muted mb-0">
                              {moment(item.date).format(
                                "MMM DD, YYYY - hh:mm A"
                              )}
                            </p>
                          </div>
                        </Collapse>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={3}>
            <Card>
              <CardHeader>
                <div className="d-flex">
                  <h5 className="card-title flex-grow-1 mb-0">
                    <i className="ri-truck-line align-middle me-1 text-muted"></i>
                    Order Information
                  </h5>
                </div>
              </CardHeader>
              <CardBody>
                <div className="text-center">
                  <i className="ri-shopping-bag-line display-5 text-primary"></i>
                  <h5 className="fs-16 mt-2">Order #{order.orderNumber}</h5>
                  <p className="text-muted mb-0">
                    Placed on {moment(order.createdAt).format("MMM DD, YYYY")}
                  </p>
                  <p className="text-muted mb-0">
                    Payment: {getPaymentMethodLabel(order.paymentMethod)}
                  </p>
                  <p className="text-muted mb-0">
                    Status: {getStatusBadge(order.status)}
                  </p>
                  {order.trackingNumber && (
                    <div className="mt-3">
                      <p className="text-muted mb-1">Tracking Number:</p>
                      <p className="fw-medium">{order.trackingNumber}</p>
                      {order.trackingUrl && (
                        <Button
                          color="primary"
                          size="sm"
                          href={order.trackingUrl}
                          target="_blank"
                        >
                          Track Package
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">
                    <i className="ri-map-pin-line align-middle me-1 text-muted"></i>{" "}
                    Shipping Address
                  </h5>
                </CardHeader>
                <CardBody>
                  <ul className="list-unstyled vstack gap-2 fs-13 mb-0">
                    <li className="fw-medium fs-14">
                      Customer #{order.userId}
                    </li>
                    <li>Phone: {order.shippingAddress.phone}</li>
                    <li>City: {order.shippingAddress.city}</li>
                    <li>State: {order.shippingAddress.state}</li>
                    {order.shippingAddress.additionalInfo && (
                      <li>
                        Additional Info: {order.shippingAddress.additionalInfo}
                      </li>
                    )}
                    <li>
                      <Badge
                        className={
                          order.shippingAddress.isDefault
                            ? "bg-success"
                            : "bg-secondary"
                        }
                      >
                        {order.shippingAddress.isDefault
                          ? "Default Address"
                          : "Not Default"}
                      </Badge>
                    </li>
                  </ul>
                </CardBody>
              </Card>
            )}

            {order.couponUsage && (
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">
                    <i className="ri-coupon-line align-middle me-1 text-muted"></i>{" "}
                    Coupon Applied
                  </h5>
                </CardHeader>
                <CardBody>
                  <div className="d-flex align-items-center mb-2">
                    <div className="flex-shrink-0">
                      <p className="text-muted mb-0">Coupon ID:</p>
                    </div>
                    <div className="flex-grow-1 ms-2">
                      <h6 className="mb-0">{order.couponUsage.couponId}</h6>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="flex-shrink-0">
                      <p className="text-muted mb-0">Order Amount:</p>
                    </div>
                    <div className="flex-grow-1 ms-2">
                      <h6 className="mb-0">
                        ${parseFloat(order.couponUsage.orderAmount).toFixed(2)}
                      </h6>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <p className="text-muted mb-0">Discount Applied:</p>
                    </div>
                    <div className="flex-grow-1 ms-2">
                      <h6 className="mb-0 text-success">
                        -$
                        {parseFloat(order.couponUsage.discountAmount).toFixed(
                          2
                        )}
                      </h6>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="d-flex">
                  <h5 className="card-title flex-grow-1 mb-0">Order Notes</h5>
                </div>
              </CardHeader>
              <CardBody>
                {order.notes ? (
                  <p className="text-muted mb-0">{order.notes}</p>
                ) : (
                  <p className="text-muted mb-0">No notes available</p>
                )}
                {order.adminNotes && (
                  <div className="mt-3">
                    <h6 className="fs-14 mb-2">Admin Notes:</h6>
                    <p className="text-muted mb-0">{order.adminNotes}</p>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-secure-payment-line align-bottom me-1 text-muted"></i>{" "}
                  Payment Details
                </h5>
              </CardHeader>
              <CardBody>
                <div className="d-flex align-items-center mb-2">
                  <div className="flex-shrink-0">
                    <p className="text-muted mb-0">Order ID:</p>
                  </div>
                  <div className="flex-grow-1 ms-2">
                    <h6 className="mb-0">#{order.orderNumber}</h6>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className="flex-shrink-0">
                    <p className="text-muted mb-0">Payment Method:</p>
                  </div>
                  <div className="flex-grow-1 ms-2">
                    <h6 className="mb-0">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </h6>
                  </div>
                </div>
                {/* <div className="d-flex align-items-center mb-2">
                  <div className="flex-shrink-0">
                    <p className="text-muted mb-0">Payment Status:</p>
                  </div>
                  <div className="flex-grow-1 ms-2">
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div> */}
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <p className="text-muted mb-0">Total Amount:</p>
                  </div>
                  <div className="flex-grow-1 ms-2">
                    <h6 className="mb-0">
                      ${parseFloat(order.total).toFixed(2)}
                    </h6>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Update Order Status Modal */}
        <Modal isOpen={updateModal} toggle={() => setUpdateModal(!updateModal)}>
          <ModalHeader toggle={() => setUpdateModal(!updateModal)}>
            Update Order Status
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="status">Order Status</Label>
                <Input
                  type="select"
                  id="status"
                  value={updateForm.status}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, status: e.target.value })
                  }
                >
                  <option value={OrderStatus.PENDING}>Pending</option>
                  <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                  <option value={OrderStatus.SHIPPED}>Shipped</option>
                  <option value={OrderStatus.DELIVERED}>Delivered</option>

                  <option value={OrderStatus.REFUNDED}>Refunded</option>
                </Input>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setUpdateModal(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleUpdateOrder}>
              Update Status
            </Button>
          </ModalFooter>
        </Modal>

        {/* Cancel Order Modal */}
        <Modal isOpen={cancelModal} toggle={() => setCancelModal(!cancelModal)}>
          <ModalHeader toggle={() => setCancelModal(!cancelModal)}>
            Cancel Order
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setCancelModal(false)}>
              No, Keep Order
            </Button>
            <Button color="danger" onClick={handleCancelOrder}>
              Yes, Cancel Order
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default EcommerceOrderDetail;
