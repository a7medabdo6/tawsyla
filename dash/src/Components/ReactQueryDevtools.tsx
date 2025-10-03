import React from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface DevToolsProps {
  initialIsOpen?: boolean;
}

const QueryDevtools: React.FC<DevToolsProps> = ({ initialIsOpen = false }) => {
  // Only render devtools in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <ReactQueryDevtools initialIsOpen={initialIsOpen} />;
};

export default QueryDevtools;
