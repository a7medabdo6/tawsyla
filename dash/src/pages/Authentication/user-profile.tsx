import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";

import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
  Badge,
  Spinner,
} from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// React Query hooks
import {
  useCurrentUser,
  useAuthStatus,
  useUpdateProfile,
} from "../../hooks/useApi";
import { AuthService } from "../../services/authService";

import avatar from "../../assets/images/users/avatar-1.jpg";

const UserProfile = () => {
  // React Query hooks
  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();
  const { data: authStatus } = useAuthStatus();
  const updateProfileMutation = useUpdateProfile();

  // State for form
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  // Update state when user data is available
  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.firstName);
      setEmail(currentUser.email);
      setUserId(currentUser.id.toString());
    }
  }, [currentUser]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      firstName: userName || "",
      email: email || "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Please Enter Your First Name"),
      email: Yup.string()
        .email("Please Enter Valid Email")
        .required("Please Enter Your Email"),
    }),
    onSubmit: async (values) => {
      try {
        await updateProfileMutation.mutateAsync({
          id: userId,
          firstName: values.firstName,
          email: values.email,
        });
      } catch (error) {
        console.error("Profile update failed:", error);
      }
    },
  });

  document.title = "Profile | Velzon - React Admin & Dashboard Template";

  if (userLoading) {
    return (
      <div className="page-content mt-lg-5">
        <Container fluid>
          <div className="text-center">
            <Spinner color="primary" />
            <p className="mt-2">Loading user profile...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (userError || !currentUser) {
    return (
      <div className="page-content mt-lg-5">
        <Container fluid>
          <Alert color="danger">
            Failed to load user profile. Please try again.
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content mt-lg-5">
        <Container fluid>
          <Row>
            <Col lg="12">
              {updateProfileMutation.error && (
                <Alert color="danger">
                  {updateProfileMutation.error.message ||
                    "Profile update failed"}
                </Alert>
              )}
              {updateProfileMutation.isSuccess && (
                <Alert color="success">Profile updated successfully!</Alert>
              )}

              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="mx-3">
                      <img
                        src={avatar}
                        alt=""
                        className="avatar-md rounded-circle img-thumbnail"
                      />
                    </div>
                    <div className="flex-grow-1 align-self-center">
                      <div className="text-muted">
                        <h5>{AuthService.getUserFullName()}</h5>
                        <p className="mb-1">Email: {currentUser.email}</p>
                        <p className="mb-1">
                          Role:
                          <Badge color="primary" className="ms-2">
                            {currentUser.role.name}
                          </Badge>
                        </p>
                        <p className="mb-0">ID: #{currentUser.id}</p>
                        {currentUser.company && (
                          <p className="mb-0">
                            Company: {currentUser.company.nameEn}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <h4 className="card-title mb-4">Update Profile</h4>

          <Card>
            <CardBody>
              <Form
                className="form-horizontal"
                onSubmit={(e) => {
                  e.preventDefault();
                  validation.handleSubmit();
                  return false;
                }}
              >
                <div className="form-group mb-3">
                  <Label className="form-label">First Name</Label>
                  <Input
                    name="firstName"
                    className="form-control"
                    placeholder="Enter First Name"
                    type="text"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.firstName || ""}
                    invalid={
                      validation.touched.firstName &&
                      validation.errors.firstName
                        ? true
                        : false
                    }
                  />
                  {validation.touched.firstName &&
                  validation.errors.firstName ? (
                    <FormFeedback type="invalid">
                      {validation.errors.firstName}
                    </FormFeedback>
                  ) : null}
                </div>

                <div className="form-group mb-3">
                  <Label className="form-label">Email</Label>
                  <Input
                    name="email"
                    className="form-control"
                    placeholder="Enter Email"
                    type="email"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.email || ""}
                    invalid={
                      validation.touched.email && validation.errors.email
                        ? true
                        : false
                    }
                  />
                  {validation.touched.email && validation.errors.email ? (
                    <FormFeedback type="invalid">
                      {validation.errors.email}
                    </FormFeedback>
                  ) : null}
                </div>

                <div className="text-center mt-4">
                  <Button
                    type="submit"
                    color="primary"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UserProfile;
