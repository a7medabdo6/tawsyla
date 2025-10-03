import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Modal,
  ModalHeader,
  Form,
  ModalBody,
  Label,
  Input,
  FormFeedback,
} from "reactstrap";
import { Link } from "react-router-dom";
import classnames from "classnames";
import Flatpickr from "react-flatpickr";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { isEmpty } from "lodash";

// Export Modal
import ExportCSVModal from "../../../Components/Common/ExportCSVModal";

// Formik
import * as Yup from "yup";
import { useFormik } from "formik";

// Custom hooks for orders
import {
  useOrders,
  useCreateOrder,
  useUpdateOrder,
  useCancelOrder,
  OrderStatus,
  PaymentMethod,
  type Order,
  type CreateOrderData,
  type UpdateOrderData,
} from "../../../hooks/useOrders";

import Loader from "../../../Components/Common/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";

const EcommerceOrders = () => {
  const [modal, setModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("1");
  const [currentFilter, setCurrentFilter] = useState<OrderStatus | "all">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  // Custom hooks for CRUD operations
  const {
    data: ordersResponse,
    isLoading,
    error,
  } = useOrders({
    status: currentFilter === "all" ? undefined : currentFilter,
    page: currentPage,
    search: searchTerm || undefined,
  });

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();
  const cancelOrderMutation = useCancelOrder();

  const [order, setOrder] = useState<Order | null>(null);

  const orderstatus = [
    {
      options: [
        { label: "Status", value: "Status" },
        { label: "All", value: "All" },
        { label: "Pending", value: OrderStatus.PENDING },
        { label: "Confirmed", value: OrderStatus.CONFIRMED },
        { label: "Shipped", value: OrderStatus.SHIPPED },
        { label: "Delivered", value: OrderStatus.DELIVERED },
        { label: "Cancelled", value: OrderStatus.CANCELLED },
      ],
    },
  ];

  const orderpayement = [
    {
      options: [
        { label: "Select Payment", value: "Select Payment" },
        { label: "All", value: "All" },
        { label: "Cash", value: PaymentMethod.CASH },
        { label: "Credit Card", value: PaymentMethod.CREDIT_CARD },
        { label: "Bank Transfer", value: PaymentMethod.BANK_TRANSFER },
        { label: "PayPal", value: PaymentMethod.PAYPAL },
      ],
    },
  ];

  const productname = [
    {
      options: [
        { label: "Product", value: "Product" },
        { label: "Puma Tshirt", value: "Puma Tshirt" },
        { label: "Adidas Sneakers", value: "Adidas Sneakers" },
        {
          label: "350 ml Glass Grocery Container",
          value: "350 ml Glass Grocery Container",
        },
        {
          label: "American egale outfitters Shirt",
          value: "American egale outfitters Shirt",
        },
        { label: "Galaxy Watch4", value: "Galaxy Watch4" },
        { label: "Apple iPhone 12", value: "Apple iPhone 12" },
        { label: "Funky Prints T-shirt", value: "Funky Prints T-shirt" },
        {
          label: "USB Flash Drive Personalized with 3D Print",
          value: "USB Flash Drive Personalized with 3D Print",
        },
        {
          label: "Oxford Button-Down Shirt",
          value: "Oxford Button-Down Shirt",
        },
        {
          label: "Classic Short Sleeve Shirt",
          value: "Classic Short Sleeve Shirt",
        },
        {
          label: "Half Sleeve T-Shirts (Blue)",
          value: "Half Sleeve T-Shirts (Blue)",
        },
        { label: "Noise Evolve Smartwatch", value: "Noise Evolve Smartwatch" },
      ],
    },
  ];

  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);

  const onClickDelete = (order: Order) => {
    setOrder(order);
    setDeleteModal(true);
  };

  const handleCancelOrder = () => {
    if (order) {
      cancelOrderMutation.mutate(order.id, {
        onSuccess: () => {
          toast.success("Order Cancelled successfully");
          setDeleteModal(false);
        },
        onError: (error) => {
          toast.error("Failed to cancel order");
        },
      });
    }
  };

  const toggleTab = (tab: string, type: OrderStatus | "all") => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setCurrentFilter(type);
    }
  };

  // validation
  const validation: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      orderId: (order && order.orderNumber) || "",
      customer: order && order.userId ? order.userId.toString() : "",
      product: (order && order.items && order.items[0]?.productName) || "",
      orderDate: (order && order.createdAt) || "",
      amount: order && order.total ? order.total.toString() : "",
      payment: (order && order.paymentMethod) || "",
      status: (order && order.status) || "",
    },
    validationSchema: Yup.object({
      orderId: Yup.string().required("Please Enter order Id"),
      customer: Yup.string().required("Please Enter Customer Name"),
      product: Yup.string().required("Please Enter Product Name"),
      orderDate: Yup.string().required("Please Enter Order Date"),
      amount: Yup.string().required("Please Enter Total Amount"),
      payment: Yup.string().required("Please Enter Payment Method"),
      status: Yup.string().required("Please Enter Delivery Status"),
    }),
    onSubmit: (values) => {
      if (isEdit && order) {
        const updateOrderData: UpdateOrderData = {
          id: order.id,
          userId:
            typeof values.customer === "string"
              ? parseInt(values.customer)
              : values.customer,
          paymentMethod: values.payment as PaymentMethod,
          status: values.status as OrderStatus,
          items: [
            {
              orderId: "temp-order-id",
              productId: "temp-id",
              variantId: "temp-variant-id",
              productName: values.product,
              variantName: "",
              quantity: 1,
              unitPrice: values.amount.toString(),
              totalPrice: values.amount.toString(),
              discountAmount: "0",
              finalPrice: values.amount.toString(),
              notes: "",
            },
          ],
        };

        updateOrderMutation.mutate(updateOrderData, {
          onSuccess: () => {
            toast.success("Order updated successfully");
            validation.resetForm();
            toggle();
          },
          onError: (error) => {
            toast.error("Failed to update order");
          },
        });
      } else {
        const newOrderData: CreateOrderData = {
          userId:
            typeof values.customer === "string"
              ? parseInt(values.customer)
              : values.customer,
          shippingAddressId: "temp-address-id",
          paymentMethod: values.payment as PaymentMethod,
          items: [
            {
              orderId: "temp-order-id",
              productId: "temp-id",
              variantId: "temp-variant-id",
              productName: values.product,
              variantName: "",
              quantity: 1,
              unitPrice: values.amount.toString(),
              totalPrice: values.amount.toString(),
              discountAmount: "0",
              finalPrice: values.amount.toString(),
              notes: "",
            },
          ],
        };

        createOrderMutation.mutate(newOrderData, {
          onSuccess: () => {
            toast.success("Order created successfully");
            validation.resetForm();
            toggle();
          },
          onError: (error) => {
            toast.error("Failed to create order");
          },
        });
      }
    },
  });

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setOrder(null);
    } else {
      setModal(true);
    }
  }, [modal]);

  const handleOrderClick = useCallback(
    (arg: Order) => {
      const orderData = arg;
      setOrder({
        id: orderData.id,
        orderNumber: orderData.orderNumber,
        userId: orderData.userId,
        items: orderData.items,
        createdAt: orderData.createdAt,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        status: orderData.status,
        shippingAddressId: orderData.shippingAddressId,
        paymentStatus: orderData.paymentStatus,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        taxAmount: orderData.taxAmount,
        discountAmount: orderData.discountAmount,
        couponUsageId: orderData.couponUsageId,
        loyaltyRewardId: orderData.loyaltyRewardId,
        notes: orderData.notes,
        adminNotes: orderData.adminNotes,
        confirmedAt: orderData.confirmedAt,
        shippedAt: orderData.shippedAt,
        deliveredAt: orderData.deliveredAt,
        cancelledAt: orderData.cancelledAt,
        trackingNumber: orderData.trackingNumber,
        trackingUrl: orderData.trackingUrl,
        isActive: orderData.isActive,
        updatedAt: orderData.updatedAt,
      });

      setIsEdit(true);
      toggle();
    },
    [toggle]
  );

  // Checked All
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".orderCheckBox");
    if (checkall.checked) {
      ele.forEach((ele: any) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele: any) => {
        ele.checked = false;
      });
    }
    deleteCheckbox();
  }, []);

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] =
    useState<boolean>(false);

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
  const deleteMultiple = () => {
    const checkall: any = document.getElementById("checkBoxAll");
    selectedCheckBoxDelete.forEach((element: any) => {
      cancelOrderMutation.mutate(element.value, {
        onSuccess: () => {
          toast.success("Order cancelled successfully");
        },
        onError: (error) => {
          toast.error("Failed to cancel order");
        },
      });
    });
    setIsMultiDeleteButton(false);
    checkall.checked = false;
  };

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".orderCheckBox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  // Column
  const columns = useMemo(
    () => [
      {
        header: (
          <input
            type="checkbox"
            id="checkBoxAll"
            className="form-check-input"
            onClick={() => checkedAll()}
          />
        ),
        cell: (cell: any) => {
          return (
            <input
              type="checkbox"
              className="orderCheckBox form-check-input"
              value={cell.getValue()}
              onChange={() => deleteCheckbox()}
            />
          );
        },
        id: "#",
        accessorKey: "id",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        header: "Order Id",
        accessorKey: "orderNumber",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const orderData = cell.row.original;
          return (
            <Link
              to={`/apps-ecommerce-order-details/${orderData.id}`}
              className="fw-medium link-primary"
            >
              {cell.getValue()}
            </Link>
          );
        },
      },
      {
        header: "Customer",
        accessorKey: "userId",
        enableColumnFilter: false,
      },
      {
        header: "Product",
        accessorKey: "items",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const items = cell.getValue() || [];
          return items.length > 0 ? items[0].productName : "N/A";
        },
      },
      {
        header: "Order Date",
        accessorKey: "createdAt",
        enableColumnFilter: false,
        cell: (cell: any) => (
          <>
            {handleValidDate(cell.getValue())},
            <small className="text-muted">
              {" "}
              {handleValidTime(cell.getValue())}
            </small>
          </>
        ),
      },
      {
        header: "Amount",
        accessorKey: "total",
        enableColumnFilter: false,
      },
      {
        header: "Payment Method",
        accessorKey: "paymentMethod",
        enableColumnFilter: false,
      },
      {
        header: "Delivery Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell: any) => {
          switch (cell.getValue()) {
            case OrderStatus.PENDING:
              return (
                <span className="badge text-uppercase bg-warning-subtle text-warning">
                  {" "}
                  {cell.getValue()}{" "}
                </span>
              );
            case OrderStatus.CANCELLED:
              return (
                <span className="badge text-uppercase bg-danger-subtle text-danger">
                  {" "}
                  {cell.getValue()}{" "}
                </span>
              );
            case OrderStatus.CONFIRMED:
              return (
                <span className="badge text-uppercase bg-info-subtle text-info">
                  {" "}
                  {cell.getValue()}{" "}
                </span>
              );
            case OrderStatus.SHIPPED:
              return (
                <span className="badge text-uppercase bg-primary-subtle text-primary">
                  {" "}
                  {cell.getValue()}{" "}
                </span>
              );
            case OrderStatus.DELIVERED:
              return (
                <span className="badge text-uppercase bg-success-subtle text-success">
                  {" "}
                  {cell.getValue()}{" "}
                </span>
              );
            default:
              return (
                <span className="badge text-uppercase bg-warning-subtle text-warning">
                  {" "}
                  {cell.getValue()}{" "}
                </span>
              );
          }
        },
      },

      {
        header: "Action",
        cell: (cellProps: any) => {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item">
                <Link
                  to={`/apps-ecommerce-order-details/${cellProps.row.original.id}`}
                  className="text-primary d-inline-block"
                >
                  <i className="ri-eye-fill fs-16"></i>
                </Link>
              </li>
              {/* <li className="list-inline-item edit">
                <Link
                  to="#"
                  className="text-primary d-inline-block edit-item-btn"
                  onClick={() => {
                    const orderData = cellProps.row.original;
                    handleOrderClick(orderData);
                  }}
                >
                  <i className="ri-pencil-fill fs-16"></i>
                </Link>
              </li> */}
              <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-danger d-inline-block remove-item-btn"
                  onClick={() => {
                    const orderData = cellProps.row.original;
                    onClickDelete(orderData);
                  }}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Link>
              </li>
            </ul>
          );
        },
      },
    ],
    [handleOrderClick, checkedAll]
  );

  const handleValidDate = (date: any) => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };

  const handleValidTime = (time: any) => {
    const time1 = new Date(time);
    const getHour = time1.getUTCHours();
    const getMin = time1.getUTCMinutes();
    const getTime = `${getHour}:${getMin}`;
    var meridiem = "";
    if (getHour >= 12) {
      meridiem = "PM";
    } else {
      meridiem = "AM";
    }
    const updateTime =
      moment(getTime, "hh:mm").format("hh:mm") + " " + meridiem;
    return updateTime;
  };

  // Export Modal
  const [isExportCSV, setIsExportCSV] = useState<boolean>(false);

  document.title = "Orders | Velzon - React Admin & Dashboard Template";

  return (
    <div className="page-content">
      <ExportCSVModal
        show={isExportCSV}
        onCloseClick={() => setIsExportCSV(false)}
        data={ordersResponse?.data}
      />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleCancelOrder}
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
        <BreadCrumb title="Orders" pageTitle="Ecommerce" />
        <Row>
          <Col lg={12}>
            <Card id="orderList">
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="card-title mb-0">Order History</h5>
                  </div>
                  <div className="col-sm-auto">
                    <div className="d-flex gap-1 flex-wrap">
                      <button
                        type="button"
                        className="btn btn-success add-btn"
                        id="create-btn"
                        onClick={() => {
                          setIsEdit(false);
                          toggle();
                        }}
                      >
                        <i className="ri-add-line align-bottom me-1"></i> Create
                        Order
                      </button>{" "}
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={() => setIsExportCSV(true)}
                      >
                        <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                        Import
                      </button>{" "}
                      {isMultiDeleteButton && (
                        <button
                          className="btn btn-soft-danger"
                          onClick={() => setDeleteModalMulti(true)}
                        >
                          <i className="ri-delete-bin-2-line"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div>
                  <Nav
                    className="nav-tabs nav-tabs-custom nav-success"
                    role="tablist"
                  >
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => {
                          toggleTab("1", "all");
                        }}
                        href="#"
                      >
                        <i className="ri-store-2-fill me-1 align-bottom"></i>{" "}
                        All Orders
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => {
                          toggleTab("2", OrderStatus.DELIVERED);
                        }}
                        href="#"
                      >
                        <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                        Delivered
                        {/* <span className="badge bg-success align-middle ms-1">
                          {ordersResponse?.total}
                        </span> */}
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => {
                          toggleTab("3", OrderStatus.SHIPPED);
                        }}
                        href="#"
                      >
                        <i className="ri-truck-line me-1 align-bottom"></i>{" "}
                        Shipped{" "}
                        {/* <span className="badge bg-danger align-middle ms-1">
                          {ordersResponse?.total}
                        </span> */}
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "4" })}
                        onClick={() => {
                          toggleTab("4", OrderStatus.CONFIRMED);
                        }}
                        href="#"
                      >
                        <i className="ri-arrow-left-right-fill me-1 align-bottom"></i>{" "}
                        Confirmed
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "5" })}
                        onClick={() => {
                          toggleTab("5", OrderStatus.CANCELLED);
                        }}
                        href="#"
                      >
                        <i className="ri-close-circle-line me-1 align-bottom"></i>{" "}
                        Cancelled
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TableContainer
                    isLoading={isLoading}
                    columns={columns}
                    data={ordersResponse?.data || []}
                    isGlobalFilter={true}
                    customPageSize={10}
                    divClass="table-responsive table-card mb-1 mt-0"
                    tableClass="align-middle table-nowrap"
                    theadClass="table-light text-muted text-uppercase"
                    isOrderFilter={true}
                    isServerSidePagination={true}
                    disablePagination={false}
                    totalCount={ordersResponse?.total || 0}
                    currentPage={currentPage}
                    totalPages={ordersResponse?.totalPages || 0}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onSearch={handleSearch}
                    serverSideSearch={true}
                    SearchPlaceholder="Search for order ID, customer, order status or something..."
                  />
                </div>
                <Modal id="showModal" isOpen={modal} toggle={toggle} centered>
                  <ModalHeader className="bg-light p-3" toggle={toggle}>
                    {!!isEdit ? "Edit Order" : "Add Order"}
                  </ModalHeader>
                  <Form
                    className="tablelist-form"
                    onSubmit={(e: any) => {
                      e.preventDefault();
                      validation.handleSubmit();
                      return false;
                    }}
                  >
                    <ModalBody>
                      <input type="hidden" id="id-field" />

                      <div className="mb-3">
                        <Label htmlFor="id-field" className="form-label">
                          Order Id
                        </Label>
                        <Input
                          name="orderId"
                          id="id-field"
                          className="form-control"
                          placeholder="Enter Order Id"
                          type="text"
                          validate={{
                            required: { value: true },
                          }}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.orderId || ""}
                          invalid={
                            validation.touched.orderId &&
                            validation.errors.orderId
                              ? true
                              : false
                          }
                        />
                        {validation.touched.orderId &&
                        validation.errors.orderId ? (
                          <FormFeedback type="invalid">
                            {validation.errors.orderId}
                          </FormFeedback>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <Label
                          htmlFor="customername-field"
                          className="form-label"
                        >
                          Customer Name
                        </Label>
                        <Input
                          name="customer"
                          id="customername-field"
                          className="form-control"
                          placeholder="Enter Name"
                          type="text"
                          validate={{
                            required: { value: true },
                          }}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.customer || ""}
                          invalid={
                            validation.touched.customer &&
                            validation.errors.customer
                              ? true
                              : false
                          }
                        />
                        {validation.touched.customer &&
                        validation.errors.customer ? (
                          <FormFeedback type="invalid">
                            {validation.errors.customer}
                          </FormFeedback>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <Label
                          htmlFor="productname-field"
                          className="form-label"
                        >
                          Product
                        </Label>

                        <Input
                          name="product"
                          type="select"
                          className="form-select"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.product || ""}
                          invalid={
                            validation.touched.product &&
                            validation.errors.product
                              ? true
                              : false
                          }
                        >
                          {productname.map((item, key) => (
                            <React.Fragment key={key}>
                              {item.options.map((item, key) => (
                                <option value={item.value} key={key}>
                                  {item.label}
                                </option>
                              ))}
                            </React.Fragment>
                          ))}
                        </Input>
                        {validation.touched.product &&
                        validation.errors.product ? (
                          <FormFeedback type="invalid">
                            {validation.errors.product}
                          </FormFeedback>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <Label htmlFor="date-field" className="form-label">
                          Order Date
                        </Label>

                        <Flatpickr
                          name="orderDate"
                          className="form-control"
                          id="datepicker-publish-input"
                          placeholder="Select a date"
                          options={{
                            enableTime: true,
                            altInput: true,
                            altFormat: "d M, Y, G:i K",
                            dateFormat: "d M, Y, G:i K",
                          }}
                          onChange={(orderDate: any) =>
                            validation.setFieldValue(
                              "orderDate",
                              moment(orderDate[0]).format("DD MMMM ,YYYY")
                            )
                          }
                          value={validation.values.orderDate || ""}
                        />
                        {validation.errors.orderDate &&
                        validation.touched.orderDate ? (
                          <FormFeedback type="invalid" className="d-block">
                            {validation.errors.orderDate}
                          </FormFeedback>
                        ) : null}
                      </div>

                      <div className="row gy-4 mb-3">
                        <div className="col-md-6">
                          <div>
                            <Label
                              htmlFor="amount-field"
                              className="form-label"
                            >
                              Amount
                            </Label>
                            <Input
                              name="amount"
                              type="text"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.amount || ""}
                              invalid={
                                validation.touched.amount &&
                                validation.errors.amount
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.amount &&
                            validation.errors.amount ? (
                              <FormFeedback type="invalid">
                                {validation.errors.amount}
                              </FormFeedback>
                            ) : null}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div>
                            <Label
                              htmlFor="payment-field"
                              className="form-label"
                            >
                              Payment Method
                            </Label>

                            <Input
                              name="payment"
                              type="select"
                              className="form-select"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.payment || ""}
                              invalid={
                                validation.touched.payment &&
                                validation.errors.payment
                                  ? true
                                  : false
                              }
                            >
                              {orderpayement.map((item, key) => (
                                <React.Fragment key={key}>
                                  {item.options.map((item, key) => (
                                    <option value={item.value} key={key}>
                                      {item.label}
                                    </option>
                                  ))}
                                </React.Fragment>
                              ))}
                            </Input>
                            {validation.touched.payment &&
                            validation.errors.payment ? (
                              <FormFeedback type="invalid">
                                {validation.errors.payment}
                              </FormFeedback>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="delivered-status"
                          className="form-label"
                        >
                          Delivery Status
                        </Label>

                        <Input
                          name="status"
                          type="select"
                          className="form-select"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.status || ""}
                          invalid={
                            validation.touched.status &&
                            validation.errors.status
                              ? true
                              : false
                          }
                        >
                          {orderstatus.map((item, key) => (
                            <React.Fragment key={key}>
                              {item.options.map((item, key) => (
                                <option value={item.value} key={key}>
                                  {item.label}
                                </option>
                              ))}
                            </React.Fragment>
                          ))}
                        </Input>
                        {validation.touched.status &&
                        validation.errors.status ? (
                          <FormFeedback type="invalid">
                            {validation.errors.status}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </ModalBody>
                    <div className="modal-footer">
                      <div className="hstack gap-2 justify-content-end">
                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={() => {
                            setModal(false);
                          }}
                        >
                          Close
                        </button>

                        <button type="submit" className="btn btn-success">
                          {!!isEdit ? "Update" : "Add Customer"}
                        </button>
                      </div>
                    </div>
                  </Form>
                </Modal>
                <ToastContainer closeButton={false} limit={1} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EcommerceOrders;
