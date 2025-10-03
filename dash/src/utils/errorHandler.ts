// Error structure from your API
export interface ApiError {
  status: number;
  errors?: Record<string, string>;
  message?: string;
}

// Error messages mapping
export const ERROR_MESSAGES: Record<string, string> = {
  notFound: "User not found",
  invalidCredentials: "Invalid email or password",
  emailRequired: "Email is required",
  passwordRequired: "Password is required",
  emailInvalid: "Please enter a valid email address",
  passwordTooShort: "Password must be at least 6 characters",
  userDisabled: "Account is disabled",
  tooManyAttempts: "Too many login attempts. Please try again later",
};

// Parse API error response
export const parseApiError = (error: any): string => {
  if (error?.response?.data) {
    const errorData: ApiError = error?.response?.data;

    // Handle validation errors (422)
    if (errorData.errors && typeof errorData.errors === "object") {
      const errorMessages = Object.entries(errorData.errors)
        .map(([field, errorCode]) => {
          console.log(`${field}: ${errorCode}`, "field errorData");

          return `${field}: ${errorCode}`;
        })
        .join(", ");
      return errorMessages;
    }
    console.log(errorData, "errorDataaaaa");

    // Handle general error message
    if (errorData?.message) {
      return errorData.message;
    }
  }

  // Fallback error message
  return error?.message || "An unexpected error occurred";
};

// Get field-specific error
export const getFieldError = (error: any, fieldName: string): string | null => {
  if (error?.response?.data?.errors?.[fieldName]) {
    const errorCode = error?.response?.data?.errors[fieldName];
    return ERROR_MESSAGES[errorCode] || errorCode;
  }
  return null;
};

// Check if error is a validation error
export const isValidationError = (error: any): boolean => {
  return error?.response?.status === 422;
};

// Check if error is an authentication error
export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401;
};
