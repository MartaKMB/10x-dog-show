import React from "react";
import type { OwnerResponseDto } from "../../types";
import { Button } from "../ui/button";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  owner: OwnerResponseDto | null;
  isLoading: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  owner,
  isLoading,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  if (!isOpen || !owner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Potwierdź usunięcie
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <span className="text-2xl text-red-600">⚠️</span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Czy na pewno chcesz usunąć tego właściciela?
            </h3>

            <p className="text-gray-600 text-center mb-6">
              Ta operacja jest nieodwracalna. Właściciel zostanie usunięty z
              systemu.
            </p>
          </div>

          {/* Owner Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">
              Dane właściciela do usunięcia:
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Imię i nazwisko:</span>
                <span className="font-medium text-gray-900">
                  {owner.first_name} {owner.last_name}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{owner.email}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Miasto:</span>
                <span className="font-medium text-gray-900">{owner.city}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Kraj:</span>
                <span className="font-medium text-gray-900">
                  {owner.country}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Data utworzenia:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(owner.created_at)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Status RODO:</span>
                <span
                  className={`font-medium ${owner.gdpr_consent ? "text-green-600" : "text-red-600"}`}
                >
                  {owner.gdpr_consent ? "Zgoda udzielona" : "Brak zgody"}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                  Uwaga
                </h4>
                <p className="text-sm text-yellow-700">
                  Usunięcie właściciela może wpłynąć na powiązane psy w
                  systemie. Sprawdź czy właściciel nie ma przypisanych psów
                  przed usunięciem.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
            >
              Anuluj
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? "Usuwanie..." : "Usuń właściciela"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
