import React from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Spinner,
  Alert,
} from "reactstrap";
import { useDashboardData } from "../../hooks/useApi";

const ReactQueryExample: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center">
          <Spinner size="sm" className="me-2" />
          Loading dashboard data...
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert color="danger">
            Error loading dashboard data: {(error as any)?.message}
          </Alert>
          <button className="btn btn-primary btn-sm" onClick={() => refetch()}>
            Retry
          </button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Dashboard Data (React Query Example)</CardTitle>
        <CardText>
          This is an example of how to use React Query for data fetching. The
          data is automatically cached and will be refetched when needed.
        </CardText>
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <button className="btn btn-secondary btn-sm" onClick={() => refetch()}>
          Refresh Data
        </button>
      </CardBody>
    </Card>
  );
};

export default ReactQueryExample;
