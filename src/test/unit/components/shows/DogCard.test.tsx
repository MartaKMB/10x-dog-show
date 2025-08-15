import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DogCard from "../../../../components/shows/DogCard";
import type { DogCardViewModel, ShowStatus } from "../../../../types";

// Mock QuickActionMenu
vi.mock("../../../../components/shows/QuickActionMenu", () => ({
  default: ({
    actions,
    onAction,
  }: {
    actions: Array<{
      id: string;
      label: string;
      action: string;
      disabled?: boolean;
    }>;
    onAction: (action: string) => void;
  }) => (
    <div data-testid="quick-action-menu">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.action)}
          disabled={action.disabled}
        >
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

// Mock data
const mockDog: DogCardViewModel = {
  registration: {
    id: "reg-1",
    dog: {
      id: "dog-1",
      name: "Rex",
      gender: "male",
      birth_date: "2020-01-01T00:00:00Z",
      coat: "czarny",
      microchip_number: "123456789012345",
      kennel_name: "Test Kennel",
      father_name: "Father Dog",
      mother_name: "Mother Dog",

      owners: [
        {
          id: "owner-1",
          email: "jan@example.com",
          is_primary: true,
          name: "Jan Kowalski",
          phone: null,
          kennel_name: null,
        },
        {
          id: "owner-2",
          email: "anna@example.com",
          is_primary: false,
          name: "Anna Kowalska",
          phone: null,
          kennel_name: null,
        },
      ],
    },
    dog_class: "junior",
    catalog_number: null,
    registered_at: "2024-01-01T00:00:00Z",
    evaluation: null,
  },
  canEdit: true,
  canDelete: true,
  isExpanded: false,
  isProcessing: false,
};

const mockShowStatus: ShowStatus = "draft";

describe("DogCard", () => {
  const mockOnAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderowanie podstawowe", () => {
    it("renderuje podstawowe informacje o psie", () => {
      render(
        <DogCard
          dog={mockDog}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      expect(screen.getByText("Rex")).toBeInTheDocument();
      expect(screen.getByText(/Test Kennel/)).toBeInTheDocument();
      expect(screen.getByText("♂️")).toBeInTheDocument();
      expect(screen.getByText("Junior")).toBeInTheDocument();
    });

    it("renderuje informacje o wieku i maści", () => {
      render(
        <DogCard
          dog={mockDog}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      expect(screen.getByText(/lat/)).toBeInTheDocument();
      expect(screen.getByText("Czarny")).toBeInTheDocument();
    });
  });

  describe("Sekcja właściciela", () => {
    it("pokazuje sekcję właściciela dla zalogowanego użytkownika", () => {
      render(
        <DogCard
          dog={mockDog}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      expect(screen.getByText("Właściciel")).toBeInTheDocument();
      expect(screen.getByText("Główny właściciel:")).toBeInTheDocument();
      expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
      expect(screen.getByText("Współwłaściciel:")).toBeInTheDocument();
      expect(screen.getByText("Anna Kowalska")).toBeInTheDocument();
      expect(screen.getByText("jan@example.com")).toBeInTheDocument();
      expect(screen.getByText("anna@example.com")).toBeInTheDocument();
    });

    it("ukrywa sekcję właściciela dla niezalogowanego użytkownika", () => {
      render(
        <DogCard
          dog={mockDog}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={false}
        />,
      );

      expect(screen.queryByText("Właściciel")).not.toBeInTheDocument();
      expect(screen.queryByText("Jan Kowalski")).not.toBeInTheDocument();
      expect(screen.queryByText("Anna Kowalska")).not.toBeInTheDocument();
      expect(screen.queryByText("jan@example.com")).not.toBeInTheDocument();
    });

    it("obsługuje przypadek braku właścicieli dla zalogowanego użytkownika", () => {
      const dogWithoutOwners = {
        ...mockDog,
        registration: {
          ...mockDog.registration,
          dog: {
            ...mockDog.registration.dog,
            owners: [],
          },
        },
      };

      render(
        <DogCard
          dog={dogWithoutOwners}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      expect(screen.getByText("Właściciel")).toBeInTheDocument();
      expect(screen.getByText("Brak danych o właścicielu")).toBeInTheDocument();
    });

    it("nie pokazuje sekcji właściciela gdy brak właścicieli dla niezalogowanego użytkownika", () => {
      const dogWithoutOwners = {
        ...mockDog,
        registration: {
          ...mockDog.registration,
          dog: {
            ...mockDog.registration.dog,
            owners: [],
          },
        },
      };

      render(
        <DogCard
          dog={dogWithoutOwners}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={false}
        />,
      );

      expect(screen.queryByText("Właściciel")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Brak danych o właścicielu"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Interakcje", () => {
    it("wywołuje onAction z poprawną akcją", () => {
      render(
        <DogCard
          dog={mockDog}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      const editButton = screen.getByText("Edytuj psa");
      editButton.click();

      expect(mockOnAction).toHaveBeenCalledWith("edit");
    });

    it("renderuje menu akcji z poprawnymi uprawnieniami", () => {
      render(
        <DogCard
          dog={mockDog}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      expect(screen.getByTestId("quick-action-menu")).toBeInTheDocument();
      expect(screen.getByText("Edytuj psa")).toBeInTheDocument();
      expect(screen.getByText("Usuń")).toBeInTheDocument();
    });
  });

  describe("Rozszerzony widok", () => {
    it("pokazuje rozszerzone szczegóły po kliknięciu", () => {
      const expandedDog = { ...mockDog, isExpanded: true };

      render(
        <DogCard
          dog={expandedDog}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      expect(screen.getByText("Szczegóły psa")).toBeInTheDocument();
      expect(screen.getByText("Szczegóły rejestracji")).toBeInTheDocument();
      expect(screen.getByText("Numer chipa:")).toBeInTheDocument();
      expect(screen.getByText("123456789012345")).toBeInTheDocument();
    });

    it("ukrywa rozszerzone szczegóły gdy isExpanded jest false", () => {
      render(
        <DogCard
          dog={mockDog}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      expect(screen.queryByText("Szczegóły psa")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Szczegóły rejestracji"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Przypadki brzegowe", () => {
    it("obsługuje psa bez kennel_name", () => {
      const dogWithoutKennel = {
        ...mockDog,
        registration: {
          ...mockDog.registration,
          dog: {
            ...mockDog.registration.dog,
            kennel_name: null,
          },
        },
      };

      render(
        <DogCard
          dog={dogWithoutKennel}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      expect(screen.getByText("Rex")).toBeInTheDocument();
      expect(screen.queryByText("(Test Kennel)")).not.toBeInTheDocument();
    });

    it("obsługuje psa bez numeru chipa", () => {
      const dogWithoutChip = {
        ...mockDog,
        registration: {
          ...mockDog.registration,
          dog: {
            ...mockDog.registration.dog,
            microchip_number: null,
          },
        },
      };

      render(
        <DogCard
          dog={dogWithoutChip}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      // W rozszerzonym widoku
      const expandedDog = { ...dogWithoutChip, isExpanded: true };
      render(
        <DogCard
          dog={expandedDog}
          onAction={mockOnAction}
          showStatus={mockShowStatus}
          isAuthenticated={true}
        />,
      );

      expect(screen.getByText("Numer chipa:")).toBeInTheDocument();
      expect(screen.getByText("Brak")).toBeInTheDocument();
    });
  });
});
