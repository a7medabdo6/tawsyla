import { useCreateProduct } from "./useProducts";
import {
  getFieldError as getApiFieldError,
  isValidationError,
} from "../utils/errorHandler";

export const useProductForm = () => {
  const createProductMutation = useCreateProduct();

  const getFieldError = (fieldName: string) => {
    return getApiFieldError(createProductMutation.error, fieldName);
  };

  const hasFieldError = (fieldName: string) => {
    return !!getApiFieldError(createProductMutation.error, fieldName);
  };

  const clearErrors = () => {
    createProductMutation.reset();
  };

  const resetMutation = () => {
    createProductMutation.reset();
  };

  const isFieldInvalid = (
    fieldName: string,
    touched: boolean,
    formError: string | undefined
  ) => {
    return (touched && formError) || hasFieldError(fieldName);
  };

  return {
    ...createProductMutation,
    getFieldError,
    hasFieldError,
    clearErrors,
    resetMutation,
    isFieldInvalid,
    isValidationError: () => isValidationError(createProductMutation.error),
  };
};
