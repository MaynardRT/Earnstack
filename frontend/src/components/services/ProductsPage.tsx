import React from "react";
import { Card } from "../common/Card";
import { AlertCircle } from "lucide-react";

export const ProductsPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Products
      </h1>

      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle
            size={48}
            className="text-gray-400 dark:text-gray-600 mb-4"
          />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            The Products feature is currently under development. Check back soon
            for inventory and product management capabilities.
          </p>
        </div>
      </Card>
    </div>
  );
};
