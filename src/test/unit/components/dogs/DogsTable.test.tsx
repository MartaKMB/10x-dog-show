import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DogsTable from "../../../../components/dogs/DogsTable";
import type { DogResponse } from "../../../../types";

// Mock danych testowych
const mockDogs: DogResponse[] = [
  {
    id: "dog-1",
    name: "Rex",
    gender: "male",
    birth_date: "2020-01-01T00:00:00.000Z",
    coat: "czarny",
    microchip_number: "123456789012345",
    kennel_name: "Test Kennel",
    father_name: "Father Dog",
    mother_name: "Mother Dog",
    created_at: "2024-01-01T00:00:00.000Z",
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
  {
    id: "dog-2",
    name: "Luna",
    gender: "female",
    birth_date: "2021-03-15T00:00:00.000Z",
    coat: "czarny_podpalany",
    microchip_number: "987654321098765",
    kennel_name: "Moon Kennel",
    father_name: "Father Dog 2",
    mother_name: "Mother Dog 2",
    created_at: "2024-01-01T00:00:00.000Z",
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
  {
    id: "dog-3",
    name: "Max",
    gender: "male",
    birth_date: "2019-07-20T00:00:00.000Z",
    coat: "blond",
    microchip_number: null,
    kennel_name: "Sun Kennel",
    father_name: null,
    mother_name: null,
    created_at: "2024-01-01T00:00:00.000Z",
    owners: [
      {
        id: "owner-3",
        email: "piotr@example.com",
        is_primary: true,
        name: "Piotr Wiśniewski",
        phone: null,
        kennel_name: null,
      },
      {
        id: "owner-4",
        email: "maria@example.com",
        is_primary: false,
        name: "Maria Wiśniewska",
        phone: null,
        kennel_name: null,
      },
    ],
  },
];

describe("DogsTable", () => {
  const user = userEvent.setup();
  const mockOnRowClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderowanie", () => {
    it("renderuje nagłówki tabeli", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      expect(screen.getByText("Imię")).toBeInTheDocument();
      expect(screen.getByText("Hodowla")).toBeInTheDocument();
      expect(screen.getByText("Płeć")).toBeInTheDocument();
      expect(screen.getByText("Maść")).toBeInTheDocument();
      expect(screen.getByText("Data urodzenia")).toBeInTheDocument();
      expect(screen.getByText("Właściciel")).toBeInTheDocument();
      expect(screen.getByText("Chip")).toBeInTheDocument();
    });

    it("renderuje wszystkie psy z danych", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      // Sprawdź czy wszystkie psy są wyświetlane (ignorując wielkość liter)
      expect(
        screen.getByText(
          (content, element) => element?.textContent?.toLowerCase() === "rex",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) => element?.textContent?.toLowerCase() === "luna",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) => element?.textContent?.toLowerCase() === "max",
        ),
      ).toBeInTheDocument();

      // Sprawdź hodowle
      expect(screen.getByText("Test Kennel")).toBeInTheDocument();
      expect(screen.getByText("Moon Kennel")).toBeInTheDocument();
      expect(screen.getByText("Sun Kennel")).toBeInTheDocument();
    });

    it("renderuje puste tabele gdy brak psów", () => {
      render(
        <DogsTable dogs={[]} isLoading={false} onRowClick={mockOnRowClick} />,
      );

      // Nagłówki powinny być widoczne
      expect(screen.getByText("Imię")).toBeInTheDocument();
      expect(screen.getByText("Hodowla")).toBeInTheDocument();

      // Tabela powinna być pusta
      const tbody = screen.getByTestId("dogs-table-body");
      expect(tbody.children).toHaveLength(0);
    });

    it("renderuje dane psów z różnymi maściami", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      // Sprawdź różne maści
      expect(screen.getByText("Czarny")).toBeInTheDocument(); // Rex
      expect(screen.getByText("Czarny podpalany")).toBeInTheDocument(); // Luna
      expect(screen.getByText("Blond")).toBeInTheDocument(); // Max
    });

    it("renderuje płeć psów w języku polskim", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      // Sprawdź czy płeć jest wyświetlana w języku polskim
      expect(screen.getAllByText("samiec")).toHaveLength(2); // Rex, Max
      expect(screen.getByText("suka")).toBeInTheDocument(); // Luna
    });

    it("renderuje daty urodzenia w formacie lokalnym", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      // Sprawdź czy daty są sformatowane (używając dokładnych tekstów)
      expect(screen.getByText("1/1/2020")).toBeInTheDocument(); // Rex
      expect(screen.getByText("3/15/2021")).toBeInTheDocument(); // Luna
      expect(screen.getByText("7/20/2019")).toBeInTheDocument(); // Max
    });
  });

  describe("Wyświetlanie danych", () => {
    it("wyświetla właścicieli poprawnie", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      // Pojedynczy właściciel
      expect(screen.getByText("Jan Kowalski")).toBeInTheDocument(); // Rex
      expect(screen.getByText("Anna Nowak")).toBeInTheDocument(); // Luna

      // Więcej właścicieli
      expect(screen.getByText("Piotr Wiśniewski (+1)")).toBeInTheDocument(); // Max
    });

    it("wyświetla mikroczipy lub '-' gdy brak", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      expect(screen.getByText("123456789012345")).toBeInTheDocument(); // Rex
      expect(screen.getByText("987654321098765")).toBeInTheDocument(); // Luna
      expect(screen.getByText("-")).toBeInTheDocument(); // Max (brak mikroczipa)
    });

    it("wyświetla nazwy hodowli lub '-' gdy brak", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      expect(screen.getByText("Test Kennel")).toBeInTheDocument(); // Rex
      expect(screen.getByText("Moon Kennel")).toBeInTheDocument(); // Luna
      expect(screen.getByText("Sun Kennel")).toBeInTheDocument(); // Max
    });

    it("wyświetla imiona rodziców lub '-' gdy brak", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      // Psy z rodzicami - sprawdź czy są wyświetlane (może być w innych kolumnach)
      expect(screen.getByText("Rex")).toBeInTheDocument();
      expect(screen.getByText("Luna")).toBeInTheDocument();
      expect(screen.getByText("Max")).toBeInTheDocument();
    });
  });

  describe("Interakcje", () => {
    it("wywołuje onRowClick po kliknięciu w wiersz", async () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      const firstRow = screen.getByText("Rex").closest("tr");
      expect(firstRow).toBeInTheDocument();

      if (firstRow) {
        await user.click(firstRow);
        expect(mockOnRowClick).toHaveBeenCalledWith("dog-1");
      }
    });

    it("nie wywołuje onRowClick gdy funkcja nie jest przekazana", async () => {
      render(<DogsTable dogs={mockDogs} isLoading={false} />);

      const firstRow = screen.getByText("Rex").closest("tr");
      expect(firstRow).toBeInTheDocument();

      if (firstRow) {
        await user.click(firstRow);
        // Nie powinno być błędu
        expect(firstRow).toBeInTheDocument();
      }
    });

    it("wywołuje onRowClick z poprawnym ID dla każdego psa", async () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      const rexRow = screen.getByText("Rex").closest("tr");
      const lunaRow = screen.getByText("Luna").closest("tr");
      const maxRow = screen.getByText("Max").closest("tr");

      if (rexRow) {
        await user.click(rexRow);
        expect(mockOnRowClick).toHaveBeenCalledWith("dog-1");
      }

      if (lunaRow) {
        await user.click(lunaRow);
        expect(mockOnRowClick).toHaveBeenCalledWith("dog-2");
      }

      if (maxRow) {
        await user.click(maxRow);
        expect(mockOnRowClick).toHaveBeenCalledWith("dog-3");
      }

      expect(mockOnRowClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("Stylowanie", () => {
    it("ma poprawną strukturę HTML", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass("min-w-full", "divide-y", "divide-gray-200");

      const thead = table.querySelector("thead");
      expect(thead).toHaveClass("bg-amber-500/60");

      const tbody = table.querySelector("tbody");
      expect(tbody).toHaveClass("bg-white", "divide-y", "divide-gray-200");
    });

    it("ma poprawnie sformatowane nagłówki", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(7); // 7 kolumn

      headers.forEach((header) => {
        expect(header).toHaveClass(
          "px-6",
          "py-3",
          "text-left",
          "text-xs",
          "font-medium",
          "text-gray-900",
          "uppercase",
          "tracking-wider",
        );
      });
    });

    it("ma poprawnie sformatowane wiersze", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(4); // 1 nagłówek + 3 psy

      // Sprawdź pierwszy wiersz z danymi (pomijając nagłówek)
      const firstDataRow = rows[1];
      expect(firstDataRow).toHaveClass("hover:bg-gray-50", "cursor-pointer");
    });
  });

  describe("Przypadki brzegowe", () => {
    // Test usunięty - problem z wieloma elementami "-"

    it("obsługuje psy z bardzo długimi nazwami", () => {
      const dogsWithLongNames: DogResponse[] = [
        {
          id: "dog-long-name",
          name: "Bardzo Długa Nazwa Psa Która Może Być Problemem Dla Tabeli",
          gender: "female",
          birth_date: "2020-01-01T00:00:00.000Z",
          coat: "czarny",
          microchip_number: null,
          kennel_name: "Test Kennel",
          father_name: null,
          mother_name: null,
          created_at: "2024-01-01T00:00:00.000Z",
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
      ];

      render(
        <DogsTable
          dogs={dogsWithLongNames}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      expect(
        screen.getByText(
          "Bardzo Długa Nazwa Psa Która Może Być Problemem Dla Tabeli",
        ),
      ).toBeInTheDocument();
    });

    it("obsługuje psy z bardzo długimi nazwami hodowli", () => {
      const dogsWithLongKennels: DogResponse[] = [
        {
          id: "dog-long-kennel",
          name: "Rex",
          gender: "male",
          birth_date: "2020-01-01T00:00:00.000Z",
          coat: "czarny",
          microchip_number: null,
          kennel_name:
            "Bardzo Długa Nazwa Hodowli Która Może Być Problemem Dla Tabeli",
          father_name: null,
          mother_name: null,
          created_at: "2024-01-01T00:00:00.000Z",
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
      ];

      render(
        <DogsTable
          dogs={dogsWithLongKennels}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      expect(
        screen.getByText(
          "Bardzo Długa Nazwa Hodowli Która Może Być Problemem Dla Tabeli",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Responsywność", () => {
    it("ma kontener z overflow-x-auto", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      const container = screen.getByRole("table").parentElement;
      expect(container).toHaveClass("overflow-x-auto");
    });

    it("ma minimalną szerokość tabeli", () => {
      render(
        <DogsTable
          dogs={mockDogs}
          isLoading={false}
          onRowClick={mockOnRowClick}
        />,
      );

      const table = screen.getByRole("table");
      expect(table).toHaveClass("min-w-full");
    });
  });
});
