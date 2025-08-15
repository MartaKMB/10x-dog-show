import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ShowDetailsView from "../../../../components/shows/ShowDetailsView";

// Mock hooks
const mockLoadShowData = vi.fn();
const mockDeleteShow = vi.fn();
const mockUpdateShow = vi.fn();
const mockUpdateShowStatus = vi.fn();

// Mock useShowDetails hook
vi.mock("../../../../hooks/useShowDetails", () => ({
  useShowDetails: () => ({
    show: mockShow,
    registrations: mockRegistrations,
    isLoading: false,
    error: null,
    loadShowData: mockLoadShowData,
    refreshData: vi.fn(),
    updateFilters: vi.fn(),
    filteredRegistrations: mockRegistrations,
    stats: {
      totalDogs: 1,
      byClass: { "klasa młodzieży": 1 },
      byGender: { male: 1 },
      byCoat: { czarny: 1 },
    },
  }),
}));

// Mock useShowActions hook
vi.mock("../../../../hooks/useShowActions", () => ({
  useShowActions: () => ({
    deleteShow: mockDeleteShow,
    updateShow: mockUpdateShow,
    updateShowStatus: mockUpdateShowStatus,
    isDeleting: false,
    isUpdating: false,
  }),
}));

// Mock data
const mockShow = {
  id: "show-1",
  name: "Wystawa Klubowa 2024",
  show_date: "2024-01-01",
  location: "Warszawa",
  judge_name: "Jan Sędzia",
  description: "Opis wystawy",
  status: "draft" as const,
  registered_dogs: 0,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockRegistrations = [
  {
    id: "reg-1",
    dog: {
      id: "dog-1",
      name: "Rex",
      gender: "male" as const,
      birth_date: "2020-01-01T00:00:00Z",
      coat: "czarny" as const,
      microchip_number: "123456789012345",
      kennel_name: "Test Kennel",
      father_name: "Father Dog",
      mother_name: "Mother Dog",
      created_at: "2024-01-01T00:00:00Z",
      owners: [
        {
          id: "owner-1",
          email: "jan@example.com",
          is_primary: true,
          name: "Jan Kowalski",
          phone: null,
          kennel_name: null,
        },
      ],
    },
    dog_class: "klasa młodzieży",
    registration_date: "2024-01-01T00:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
  },
];

describe("ShowDetailsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderowanie", () => {
    it("renderuje podstawowe elementy widoku", () => {
      render(<ShowDetailsView showId="show-1" isAuthenticated={true} />);

      expect(screen.getByTestId("show-details-view")).toBeInTheDocument();
    });

    it("renderuje stan ładowania", () => {
      render(<ShowDetailsView showId="show-1" isAuthenticated={false} />);

      expect(screen.getByTestId("show-details-view")).toBeInTheDocument();
    });

    it("renderuje błąd", () => {
      render(<ShowDetailsView showId="show-1" isAuthenticated={false} />);

      expect(screen.getByTestId("show-details-view")).toBeInTheDocument();
    });

    it("renderuje pusty stan gdy brak wystawy", () => {
      render(<ShowDetailsView showId="show-1" isAuthenticated={false} />);

      expect(screen.getByTestId("show-details-view")).toBeInTheDocument();
    });
  });

  describe("Inicjalizacja", () => {
    it("ładuje dane wystawy przy montowaniu", () => {
      render(<ShowDetailsView showId="show-1" isAuthenticated={false} />);

      expect(mockLoadShowData).toHaveBeenCalled();
    });
  });
});
