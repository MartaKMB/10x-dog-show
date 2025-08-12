import React from "react";
import type { RegistrationResponseDto } from "../../types";

interface DeleteDogConfirmationProps {
  registration: RegistrationResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  onDeleteDog: (registrationId: string) => Promise<void>;
}

const DeleteDogConfirmation: React.FC<DeleteDogConfirmationProps> = ({
  registration,
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  onDeleteDog,
}) => {
  const getGenderIcon = (gender: string): string => {
    return gender === "male" ? "♂️" : "♀️";
  };

  const getClassLabel = (dogClass: string): string => {
    const classLabels: Record<string, string> = {
      baby: "Baby",
      puppy: "Szczenię",
      junior: "Junior",
      intermediate: "Młodzież",
      open: "Otwarta",
      working: "Pracująca",
      champion: "Champion",
      veteran: "Weteran",
    };
    return classLabels[dogClass] || dogClass;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  if (!isOpen) return null;

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
              disabled={isProcessing}
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
              Czy na pewno chcesz usunąć tego psa z wystawy?
            </h3>

            <p className="text-gray-600 text-center mb-6">
              Ta operacja jest nieodwracalna. Pies zostanie usunięty z listy
              uczestników wystawy.
            </p>
          </div>

          {/* Dog Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">
              Dane psa do usunięcia:
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nazwa:</span>
                <span className="font-medium text-gray-900">
                  {registration.dog.name}{" "}
                  {getGenderIcon(registration.dog.gender)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Klasa:</span>
                <span className="font-medium text-gray-900">
                  {getClassLabel(registration.dog_class)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Data urodzenia:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(registration.dog.birth_date)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Nr katalogowy:</span>
                <span className="font-medium text-gray-900">
                  {registration.catalog_number || "Nie przypisano"}
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
                  Usunięcie psa z wystawy nie spowoduje usunięcia jego danych z
                  systemu. Dane psa i właściciela pozostaną dostępne w bazie
                  danych.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await onDeleteDog(registration.id);
                  onConfirm();
                } catch {
                  // Error handling is done in the hook
                }
              }}
              disabled={isProcessing}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? "Usuwanie..." : "Usuń psa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDogConfirmation;
