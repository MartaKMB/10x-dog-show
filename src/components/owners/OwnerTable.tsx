import React from "react";
import type { OwnerResponseDto } from "../../types";
import GDPRStatusBadge from "./GDPRStatusBadge";
import { Button } from "../ui/button";

interface OwnerTableProps {
  owners: OwnerResponseDto[];
  onEdit: (owner: OwnerResponseDto) => void;
  onDelete: (owner: OwnerResponseDto) => void;
  onViewDetails: (owner: OwnerResponseDto) => void;
  canEdit: boolean;
  canDelete: boolean;
  sortConfig: {
    field: keyof OwnerResponseDto;
    direction: "asc" | "desc";
  };
  onSort: (field: keyof OwnerResponseDto) => void;
  onWithdrawGDPRConsent: (ownerId: string) => void;
}

const OwnerTable: React.FC<OwnerTableProps> = ({
  owners,
  onEdit,
  onDelete,
  onViewDetails,
  canEdit,
  canDelete,
  sortConfig,
  onSort,
  onWithdrawGDPRConsent,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const getSortIcon = (field: keyof OwnerResponseDto) => {
    if (sortConfig.field !== field) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortConfig.direction === "asc" ? (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  const handleSort = (field: keyof OwnerResponseDto) => {
    onSort(field);
  };

  if (owners.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Brak właścicieli do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("first_name")}
            >
              <div className="flex items-center space-x-1">
                <span>Imię i nazwisko</span>
                {getSortIcon("first_name")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("email")}
            >
              <div className="flex items-center space-x-1">
                <span>Email</span>
                {getSortIcon("email")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("city")}
            >
              <div className="flex items-center space-x-1">
                <span>Miasto</span>
                {getSortIcon("city")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("country")}
            >
              <div className="flex items-center space-x-1">
                <span>Kraj</span>
                {getSortIcon("country")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("gdpr_consent")}
            >
              <div className="flex items-center space-x-1">
                <span>Status RODO</span>
                {getSortIcon("gdpr_consent")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("created_at")}
            >
              <div className="flex items-center space-x-1">
                <span>Data utworzenia</span>
                {getSortIcon("created_at")}
              </div>
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Akcje</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {owners.map((owner) => (
            <tr
              key={owner.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onViewDetails(owner)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-800">
                        {owner.first_name.charAt(0)}
                        {owner.last_name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {owner.first_name} {owner.last_name}
                    </div>
                    {owner.phone && (
                      <div className="text-sm text-gray-500">{owner.phone}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{owner.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{owner.city}</div>
                {owner.postal_code && (
                  <div className="text-sm text-gray-500">
                    {owner.postal_code}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{owner.country}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <GDPRStatusBadge
                  owner={owner}
                  onWithdrawConsent={onWithdrawGDPRConsent}
                  canWithdraw={canEdit}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(owner.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(owner);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edytuj
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(owner);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Usuń
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OwnerTable;
