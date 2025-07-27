import React from 'react';

const LoadingSkeleton = ({ type = 'table', rows = 5 }) => {
  const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow bg-white">
        <table className="min-w-full table-auto">
          <thead className="bg-gradient-to-r from-teal-50 to-indigo-100">
            <tr>
              {[...Array(6)].map((_, i) => (
                <th key={i} className="px-5 py-3 text-left">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex} className="even:bg-gray-50">
                {[...Array(6)].map((_, colIndex) => (
                  <td key={colIndex} className="px-5 py-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CardSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const FormSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-24"></div>
    </div>
  );

  switch (type) {
    case 'table':
      return <TableSkeleton />;
    case 'card':
      return <CardSkeleton />;
    case 'list':
      return <ListSkeleton />;
    case 'form':
      return <FormSkeleton />;
    default:
      return <TableSkeleton />;
  }
};

export default LoadingSkeleton; 