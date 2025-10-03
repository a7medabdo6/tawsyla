import React from "react";
import { Card, CardBody, CardTitle, CardText, Button, Alert } from "reactstrap";
import { useLoginForm } from "../../hooks/useLoginForm";
import { parseApiError } from "../../utils/errorHandler";

const ErrorHandlingExample: React.FC = () => {
  const loginMutation = useLoginForm();

  const handleTestError = async () => {
    // Simulate the error structure you provided
    const mockError = {
      response: {
        status: 422,
        data: {
          status: 422,
          errors: {
            email: "notFound",
          },
        },
      },
    };

    // This would normally come from the API
    console.log("Simulated error structure:", mockError);
    console.log("Parsed error message:", parseApiError(mockError));
    console.log("Email field error:", loginMutation.getEmailError());
  };

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Error Handling Example</CardTitle>
        <CardText>
          This demonstrates how the error handling works with your API's error
          structure.
        </CardText>

        <div className="mb-3">
          <h6>Error Structure Handled:</h6>
          <pre className="bg-light p-2 rounded" style={{ fontSize: "12px" }}>
            {`{
  "status": 422,
  "errors": {
    "email": "notFound"
  }
}`}
          </pre>
        </div>

        <div className="mb-3">
          <h6>Error Messages Mapping:</h6>
          <ul className="list-unstyled">
            <li>
              <strong>notFound:</strong> User not found
            </li>
            <li>
              <strong>invalidCredentials:</strong> Invalid email or password
            </li>
            <li>
              <strong>emailRequired:</strong> Email is required
            </li>
            <li>
              <strong>passwordRequired:</strong> Password is required
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <Button color="info" onClick={handleTestError}>
            Test Error Parsing
          </Button>
        </div>

        {loginMutation.error && (
          <Alert color="danger">
            <strong>Login Error:</strong>
            <br />
            {parseApiError(loginMutation.error)}
          </Alert>
        )}

        <div className="row">
          <div className="col-md-6">
            <h6>Field-Specific Errors:</h6>
            <ul className="list-unstyled">
              <li>
                <strong>Email:</strong>{" "}
                {loginMutation.getEmailError() || "No error"}
              </li>
              <li>
                <strong>Password:</strong>{" "}
                {loginMutation.getPasswordError() || "No error"}
              </li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Error Status:</h6>
            <ul className="list-unstyled">
              <li>
                <strong>Is Validation Error:</strong>{" "}
                {loginMutation.isValidationError() ? "Yes" : "No"}
              </li>
              <li>
                <strong>Has Email Error:</strong>{" "}
                {loginMutation.hasFieldError("email") ? "Yes" : "No"}
              </li>
              <li>
                <strong>Has Password Error:</strong>{" "}
                {loginMutation.hasFieldError("password") ? "Yes" : "No"}
              </li>
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ErrorHandlingExample;
