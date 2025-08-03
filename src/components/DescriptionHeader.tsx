import React, { useState, useEffect } from "react";
import type { DescriptionResponseDto, ShowStatus } from "../types";

interface DescriptionHeaderProps {
  description?: DescriptionResponseDto;
  showId?: string;
  dogId?: string;
  mode: "create" | "edit";
}

type DogData = DescriptionResponseDto["dog"];

interface ShowData {
  id: string;
  name: string;
  show_date: string;
  show_type: "national" | "international";
  status: ShowStatus;
}

export function DescriptionHeader({
  description,
  showId,
  dogId,
  mode,
}: DescriptionHeaderProps) {
  const [dogData, setDogData] = useState<DogData | null>(null);
  const [showData, setShowData] = useState<ShowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych w trybie create
  useEffect(() => {
    if (mode === "create" && showId && dogId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
          // Pobierz dane o psie
          const dogResponse = await fetch(`/api/dogs/${dogId}`);
          if (!dogResponse.ok) {
            throw new Error("Błąd ładowania danych o psie");
          }
          const dog: DogData = await dogResponse.json();
          setDogData(dog);

          // Pobierz dane o wystawie
          const showResponse = await fetch(`/api/shows/${showId}`);
          if (!showResponse.ok) {
            throw new Error("Błąd ładowania danych o wystawie");
          }
          const show: ShowData = await showResponse.json();
          setShowData(show);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Nieznany błąd");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [mode, showId, dogId]);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
        <div className="text-center text-gray-500">
          Ładowanie informacji o psie i wystawie...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
        <div className="text-center text-red-500">Błąd: {error}</div>
      </div>
    );
  }

  if (mode === "edit" && !description) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
        <div className="text-center text-gray-500">Ładowanie opisu...</div>
      </div>
    );
  }

  // W trybie create używamy pobranych danych, w trybie edit używamy description
  const dog = mode === "create" ? dogData : description?.dog;
  const show = mode === "create" ? showData : description?.show;

  if (!dog || !show) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Informacje o psie */}
        <div className="lg:col-span-1">
          <DogInfo dog={dog} />
        </div>

        {/* Informacje o wystawie */}
        <div className="lg:col-span-1">
          <ShowInfo show={show} />
        </div>

        {/* Status wystawy */}
        <div className="lg:col-span-1">
          <ShowStatusIndicator status={show.status} />
        </div>
      </div>
    </div>
  );
}

// Komponent DogInfo
interface DogInfoProps {
  dog: DescriptionResponseDto["dog"];
}

function DogInfo({ dog }: DogInfoProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Pies
      </h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Imię:</span>
          <span className="text-sm font-medium">{dog.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Rasa:</span>
          <span className="text-sm font-medium">{dog.breed.name_pl}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Płeć:</span>
          <span className="text-sm font-medium">
            {dog.gender === "male" ? "Samiec" : "Suczka"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Data urodzenia:</span>
          <span className="text-sm font-medium">
            {new Date(dog.birth_date).toLocaleDateString("pl-PL")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Chip:</span>
          <span className="text-sm font-medium font-mono">
            {dog.microchip_number}
          </span>
        </div>
      </div>
    </div>
  );
}

// Komponent ShowInfo
interface ShowInfoProps {
  show: DescriptionResponseDto["show"];
}

function ShowInfo({ show }: ShowInfoProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Wystawa
      </h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Nazwa:</span>
          <span className="text-sm font-medium">{show.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Data:</span>
          <span className="text-sm font-medium">
            {new Date(show.show_date).toLocaleDateString("pl-PL")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Typ:</span>
          <span className="text-sm font-medium">
            {show.show_type === "national" ? "Krajowa" : "Międzynarodowa"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Komponent ShowStatusIndicator
interface ShowStatusIndicatorProps {
  status: ShowStatus;
}

function ShowStatusIndicator({ status }: ShowStatusIndicatorProps) {
  const getStatusConfig = (status: ShowStatus) => {
    switch (status) {
      case "draft":
        return {
          label: "Szkic",
          color: "bg-gray-100 text-gray-800",
          icon: "📝",
        };
      case "open_for_registration":
        return {
          label: "Rejestracja otwarta",
          color: "bg-green-100 text-green-800",
          icon: "✅",
        };
      case "registration_closed":
        return {
          label: "Rejestracja zamknięta",
          color: "bg-yellow-100 text-yellow-800",
          icon: "⏰",
        };
      case "in_progress":
        return {
          label: "W trakcie",
          color: "bg-blue-100 text-blue-800",
          icon: "🏆",
        };
      case "completed":
        return {
          label: "Zakończona",
          color: "bg-purple-100 text-purple-800",
          icon: "🏁",
        };
      case "cancelled":
        return {
          label: "Anulowana",
          color: "bg-red-100 text-red-800",
          icon: "❌",
        };
      default:
        return {
          label: "Nieznany",
          color: "bg-gray-100 text-gray-800",
          icon: "❓",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Status wystawy
      </h3>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{config.icon}</span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}
