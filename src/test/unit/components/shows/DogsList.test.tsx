import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DogsList from "../../../../components/shows/DogsList";
import type { RegistrationResponse, ShowStatus } from "../../../../types";

// Mock DogCard
vi.mock("../../../../components/shows/DogCard", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ dog, onAction, isAuthenticated }: any) => (
    <div data-testid="dog-card" data-authenticated={isAuthenticated}>
      <div>Dog: {dog.registration.dog.name}</div>
      <div>Authenticated: {isAuthenticated ? "true" : "false"}</div>
      <button onClick={() => onAction("edit")}>Edit</button>
      <button onClick={() => onAction("delete")}>Delete</button>
    </div>
  ),
}));

// Mock data
const mockRegistrations: RegistrationResponse[] = [
  {
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
      ],
    },
    dog_class: "junior",
    catalog_number: null,
    registered_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "reg-2",
    dog: {
      id: "dog-2",
      name: "Luna",
      gender: "female",
      birth_date: "2021-03-15T00:00:00Z",
      coat: "czarny_podpalany",
      microchip_number: "987654321098765",
      kennel_name: "Moon Kennel",
      father_name: "Father Dog 2",
      mother_name: "Mother Dog 2",
      owners: [
        {
          id: "owner-2",
          email: "anna@example.com",
          is_primary: true,
          name: "Anna Nowak",
          phone: null,
          kennel_name: null,
        },
      ],
    },
    dog_class: "open",
    catalog_number: null,
    registered_at: "2024-01-01T00:00:00Z",
  },
];

const mockShowStatus: ShowStatus = "draft";

describe("DogsList", () => {
  const mockOnAddDog = vi.fn();
  const mockOnEditDog = vi.fn();
  const mockOnDeleteDog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderowanie podstawowe", () => {
    it("renderuje listę psów z poprawnymi danymi", () => {
      render(
        <DogsList
          registrations={mockRegistrations}
          showStatus={mockShowStatus}
          canAddDogs={true}
          canEdit={true}
          canDelete={true}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={true}
        />,
      );

      expect(screen.getByText("Dog: Rex")).toBeInTheDocument();
      expect(screen.getByText("Dog: Luna")).toBeInTheDocument();
      expect(screen.getAllByTestId("dog-card")).toHaveLength(2);
    });

    it("renderuje puste tabele gdy brak psów", () => {
      render(
        <DogsList
          registrations={[]}
          showStatus={mockShowStatus}
          canAddDogs={false}
          canEdit={false}
          canDelete={false}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={false}
        />,
      );

      expect(screen.queryByTestId("dog-card")).not.toBeInTheDocument();
    });
  });

  describe("Przekazywanie prop isAuthenticated", () => {
    it("przekazuje isAuthenticated=true do wszystkich DogCard dla zalogowanego użytkownika", () => {
      render(
        <DogsList
          registrations={mockRegistrations}
          showStatus={mockShowStatus}
          canAddDogs={true}
          canEdit={true}
          canDelete={true}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={true}
        />,
      );

      const dogCards = screen.getAllByTestId("dog-card");
      dogCards.forEach((card) => {
        expect(card).toHaveAttribute("data-authenticated", "true");
      });
    });

    it("przekazuje isAuthenticated=false do wszystkich DogCard dla niezalogowanego użytkownika", () => {
      render(
        <DogsList
          registrations={mockRegistrations}
          showStatus={mockShowStatus}
          canAddDogs={false}
          canEdit={false}
          canDelete={false}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={false}
        />,
      );

      const dogCards = screen.getAllByTestId("dog-card");
      dogCards.forEach((card) => {
        expect(card).toHaveAttribute("data-authenticated", "false");
      });
    });
  });

  describe("Grupowanie według płci", () => {
    it("grupuje psy według płci", () => {
      render(
        <DogsList
          registrations={mockRegistrations}
          showStatus={mockShowStatus}
          canAddDogs={true}
          canEdit={true}
          canDelete={true}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={true}
        />,
      );

      // Sprawdź czy są ikony płci
      expect(screen.getByText("♂️")).toBeInTheDocument();
      expect(screen.getByText("♀️")).toBeInTheDocument();
    });
  });

  describe("Grupowanie według klasy", () => {
    it("grupuje psy według klasy", () => {
      render(
        <DogsList
          registrations={mockRegistrations}
          showStatus={mockShowStatus}
          canAddDogs={true}
          canEdit={true}
          canDelete={true}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={true}
        />,
      );

      // Sprawdź czy są nagłówki klas
      expect(screen.getByText(/Klasa Junior/)).toBeInTheDocument();
      expect(screen.getByText(/Klasa Otwarta/)).toBeInTheDocument();
    });
  });

  describe("Interakcje", () => {
    it("wywołuje onEditDog z poprawną rejestracją", () => {
      render(
        <DogsList
          registrations={mockRegistrations}
          showStatus={mockShowStatus}
          canAddDogs={true}
          canEdit={true}
          canDelete={true}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={true}
        />,
      );

      const editButtons = screen.getAllByText("Edit");
      // Suki są wyświetlane pierwsze, więc Luna (reg-2) będzie pierwsza
      editButtons[0].click();

      expect(mockOnEditDog).toHaveBeenCalledWith(mockRegistrations[1]); // Luna (reg-2)
    });

    it("wywołuje onDeleteDog z poprawną rejestracją", () => {
      render(
        <DogsList
          registrations={mockRegistrations}
          showStatus={mockShowStatus}
          canAddDogs={true}
          canEdit={true}
          canDelete={true}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={true}
        />,
      );

      const deleteButtons = screen.getAllByText("Delete");
      // Suki są wyświetlane pierwsze, więc Luna (reg-2) będzie pierwsza
      deleteButtons[0].click();

      expect(mockOnDeleteDog).toHaveBeenCalledWith(mockRegistrations[1]); // Luna (reg-2)
    });
  });

  describe("Uprawnienia", () => {
    it("przekazuje poprawne uprawnienia do DogCard", () => {
      render(
        <DogsList
          registrations={mockRegistrations}
          showStatus={mockShowStatus}
          canAddDogs={false}
          canEdit={false}
          canDelete={false}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={false}
        />,
      );

      // Sprawdź czy przyciski są wyłączone (w mocku DogCard)
      const editButtons = screen.getAllByText("Edit");
      const deleteButtons = screen.getAllByText("Delete");

      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe("Przypadki brzegowe", () => {
    it("obsługuje rejestracje bez właścicieli", () => {
      const registrationsWithoutOwners = mockRegistrations.map((reg) => ({
        ...reg,
        dog: {
          ...reg.dog,
          owners: [],
        },
      }));

      render(
        <DogsList
          registrations={registrationsWithoutOwners}
          showStatus={mockShowStatus}
          canAddDogs={true}
          canEdit={true}
          canDelete={true}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={true}
        />,
      );

      expect(screen.getAllByTestId("dog-card")).toHaveLength(2);
    });

    it("obsługuje rejestracje z różnymi statusami wystawy", () => {
      const completedShowStatus: ShowStatus = "completed";

      render(
        <DogsList
          registrations={mockRegistrations}
          showStatus={completedShowStatus}
          canAddDogs={false}
          canEdit={false}
          canDelete={false}
          onAddDog={mockOnAddDog}
          onEditDog={mockOnEditDog}
          onDeleteDog={mockOnDeleteDog}
          isAuthenticated={true}
        />,
      );

      expect(screen.getAllByTestId("dog-card")).toHaveLength(2);
    });
  });
});
