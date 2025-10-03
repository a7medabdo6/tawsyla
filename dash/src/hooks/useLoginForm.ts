import { useLogin } from "./useApi";
import { getFieldError, isValidationError } from "../utils/errorHandler";

export const useLoginForm = () => {
  const loginMutation = useLogin();

  // Helper functions for field-specific error handling
  const getEmailError = () => {
    if (loginMutation.error) {
      return getFieldError(loginMutation.error, "email");
    }
    return null;
  };

  const getPasswordError = () => {
    if (loginMutation.error) {
      return getFieldError(loginMutation.error, "password");
    }
    return null;
  };

  const hasFieldError = (fieldName: string) => {
    return !!getFieldError(loginMutation.error, fieldName);
  };

  const clearErrors = () => {
    loginMutation.reset();
  };

  const isFieldInvalid = (
    fieldName: string,
    touched: boolean,
    formError: string | undefined
  ) => {
    return (touched && formError) || hasFieldError(fieldName);
  };

  return {
    ...loginMutation,
    getEmailError,
    getPasswordError,
    hasFieldError,
    clearErrors,
    isFieldInvalid,
    isValidationError: () => isValidationError(loginMutation.error),
  };
};
