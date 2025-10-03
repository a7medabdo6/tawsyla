import React, { Fragment, useEffect, useState } from "react";
import {
  CardBody,
  Col,
  Row,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Alert,
  Spinner,
} from "reactstrap";
import { Link } from "react-router-dom";

// Global Filter Components
import {
  ProductsGlobalFilter,
  CustomersGlobalFilter,
  OrderGlobalFilter,
  ContactsGlobalFilter,
  CompaniesGlobalFilter,
  LeadsGlobalFilter,
  CryptoOrdersGlobalFilter,
  InvoiceListGlobalSearch,
  TicketsListGlobalFilter,
  NFTRankingGlobalFilter,
  TaskListGlobalFilter,
} from "../../Components/Common/GlobalSearchFilter";
import { parseApiError } from "utils/errorHandler";

interface TableContainerProps {
  columns?: any[];
  data?: any[];
  isGlobalFilter?: boolean;
  hasNextPage?: boolean;

  anotherPagination?: boolean;

  isProductsFilter?: boolean;
  isCustomerFilter?: boolean;
  isOrderFilter?: boolean;
  isContactsFilter?: boolean;
  isCompaniesFilter?: boolean;
  isLeadsFilter?: boolean;
  isCryptoOrdersFilter?: boolean;
  isInvoiceListFilter?: boolean;
  isTicketsListFilter?: boolean;
  isNFTRankingFilter?: boolean;
  isTaskListFilter?: boolean;
  handleTaskClick?: any;
  customPageSize?: number;
  tableClass?: string;
  theadClass?: string;
  trClass?: string;
  thClass?: string;
  divClass?: string;
  SearchPlaceholder?: string;
  handleLeadClick?: any;
  handleCompanyClick?: any;
  handleContactClick?: any;
  handleTicketClick?: any;
  disablePagination?: boolean;
  // Server-side pagination props
  isServerSidePagination?: boolean;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  // Server-side search props
  onSearch?: (searchTerm: string) => void;
  serverSideSearch?: boolean;
  isLoading?: boolean;
  error?: any;
}

const TableContainer = ({
  columns = [],
  data = [],
  isGlobalFilter,
  isProductsFilter,
  isCustomerFilter,
  isOrderFilter,
  isContactsFilter,
  isCompaniesFilter,
  isLeadsFilter,
  isCryptoOrdersFilter,
  isInvoiceListFilter,
  isTicketsListFilter,
  isNFTRankingFilter,
  isTaskListFilter,
  customPageSize = 10,
  tableClass,
  theadClass,
  trClass,
  thClass,
  divClass,
  SearchPlaceholder,
  disablePagination,
  isServerSidePagination,
  totalCount,
  currentPage = 1,
  totalPages = 0,
  onPageChange,
  onPageSizeChange,
  onSearch,
  serverSideSearch,
  isLoading,
  error,
  hasNextPage,
  anotherPagination,
}: TableContainerProps) => {
  const pageSize = 1;
  const [searchValue, setSearchValue] = useState("");

  // Handle search immediately
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (serverSideSearch && onSearch) {
      onSearch(value);
    }
  };

  // Generate pagination items for server-side pagination
  const generateServerPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (anotherPagination) {
      // Previous button
      items.push(
        <PaginationItem key="prev" disabled={currentPage <= 1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onPageChange) {
                onPageChange(currentPage - 1);
              }
            }}
          >
            Previous
          </PaginationLink>
        </PaginationItem>
      );
      // Next button
      items.push(
        <PaginationItem key="next" disabled={!hasNextPage}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onPageChange) {
                onPageChange(currentPage + 1);
              }
            }}
          >
            Next
          </PaginationLink>
        </PaginationItem>
      );
      return items;
    }
    // Previous button
    items.push(
      <PaginationItem key="prev" disabled={currentPage <= 1}>
        <PaginationLink
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (onPageChange && currentPage > 1) {
              onPageChange(currentPage - 1);
            }
          }}
        >
          Previous
        </PaginationLink>
      </PaginationItem>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i} active={i === currentPage}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onPageChange) {
                onPageChange(i);
              }
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next" disabled={currentPage >= totalPages}>
        <PaginationLink
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (onPageChange && currentPage < totalPages) {
              onPageChange(currentPage + 1);
            }
          }}
        >
          Next
        </PaginationLink>
      </PaginationItem>
    );

    return items;
  };

  return (
    <Fragment>
      {/* Search Filter */}
      <Row className="mb-3">
        <CardBody className="border border-dashed border-end-0 border-start-0">
          <form>
            <Row>
              <Col sm={5}>
                <div
                  className={
                    isProductsFilter ||
                    isContactsFilter ||
                    isCompaniesFilter ||
                    isNFTRankingFilter
                      ? "search-box me-2 mb-2 d-inline-block"
                      : "search-box me-2 mb-2 d-inline-block col-12"
                  }
                >
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={SearchPlaceholder}
                    className="form-control search"
                    id="search-bar-0"
                  />
                  <i className="bx bx-search-alt search-icon"></i>
                </div>
              </Col>
              {isProductsFilter && <ProductsGlobalFilter />}
              {isCustomerFilter && <CustomersGlobalFilter />}
              {isOrderFilter && <OrderGlobalFilter />}
              {isContactsFilter && <ContactsGlobalFilter />}
              {isCompaniesFilter && <CompaniesGlobalFilter />}
              {isLeadsFilter && <LeadsGlobalFilter />}
              {isCryptoOrdersFilter && <CryptoOrdersGlobalFilter />}
              {isInvoiceListFilter && <InvoiceListGlobalSearch />}
              {isTicketsListFilter && <TicketsListGlobalFilter />}
              {isNFTRankingFilter && <NFTRankingGlobalFilter />}
              {isTaskListFilter && <TaskListGlobalFilter />}
            </Row>
          </form>
        </CardBody>
      </Row>
      {isLoading && (
        <Row>
          <Col>
            <div className="text-center py-4">
              <Spinner color="primary" />
              <p className="mt-2">Loading products...</p>
            </div>
          </Col>
        </Row>
      )}
      {/* Error State */}
      {error && (
        <Row>
          <Col>
            <Alert color="danger">
              <h5>Error loading products</h5>
              <p>{parseApiError(error)}</p>
            </Alert>
          </Col>
        </Row>
      )}
      {/* Table */}
      {data && data.length > 0 ? (
        <div className={divClass}>
          <Table hover className={tableClass}>
            <thead className={theadClass}>
              <tr className={trClass}>
                {columns.map((column, index) => (
                  <th key={index} className={thClass}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {column.cell
                        ? column.cell({
                            getValue: () => row[column.accessorKey],
                            row: { original: row },
                          })
                        : row[column.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="py-4 text-center">
            <div>
              <i className="ri-search-line display-5 text-success"></i>
            </div>
            <div className="mt-4">
              <h5>Sorry! No Result Found</h5>
            </div>
          </div>
        )
      )}

      {/* Pagination */}
      {console.log(disablePagination, "disablePagination")}
      {!disablePagination && data.length > pageSize && (
        <Row className="align-items-center mt-2 g-3 text-center text-sm-start">
          {!anotherPagination ? (
            <div className="col-sm">
              <div className="text-muted">
                {isServerSidePagination ? (
                  <>
                    Showing{" "}
                    <span className="fw-semibold ms-1">{data.length}</span> of{" "}
                    <span className="fw-semibold">{totalCount || 0}</span>{" "}
                    Results
                    {totalPages && totalPages > 1 && (
                      <span className="ms-2">
                        (Page {currentPage} of {totalPages})
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Showing{" "}
                    <span className="fw-semibold ms-1">{data.length}</span> of{" "}
                    <span className="fw-semibold">{data.length}</span> Results
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="col-sm">
              <div className="text-muted"></div>
            </div>
          )}

          <div className="col-sm-auto">
            {isServerSidePagination ? (
              <Pagination size="sm" className="mb-0">
                {generateServerPaginationItems()}
              </Pagination>
            ) : (
              <div className="text-muted">
                <small>Client-side pagination not available</small>
              </div>
            )}
          </div>
        </Row>
      )}
    </Fragment>
  );
};

export default TableContainer;
