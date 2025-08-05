import React, { useState, useEffect } from "react";
import { Search, User, Mail, Phone, Award } from "lucide-react";

interface Judge {
  id: string;
  first_name: string;
  last_name: string;
  license_number: string;
  email: string;
  phone: string;
  is_active: boolean;
  specializations: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface JudgesListProps {}

const JudgesList: React.FC<JudgesListProps> = () => {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockJudges: Judge[] = [
    {
      id: "1",
      first_name: "Jan",
      last_name: "Kowalski",
      license_number: "JK-001",
      email: "jan.kowalski@example.com",
      phone: "+48 123 456 789",
      is_active: true,
      specializations: ["G1", "G2"],
    },
    {
      id: "2",
      first_name: "Anna",
      last_name: "Nowak",
      license_number: "AN-002",
      email: "anna.nowak@example.com",
      phone: "+48 987 654 321",
      is_active: true,
      specializations: ["G3", "G4"],
    },
    {
      id: "3",
      first_name: "Piotr",
      last_name: "Wiśniewski",
      license_number: "PW-003",
      email: "piotr.wisniewski@example.com",
      phone: "+48 555 123 456",
      is_active: false,
      specializations: ["G5", "G6"],
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJudges(mockJudges);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredJudges = judges.filter(
    (judge) =>
      judge.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      judge.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      judge.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      judge.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Lista sędziów</h2>
          <p className="text-sm text-gray-600">
            Znaleziono {filteredJudges.length} sędziów
          </p>
        </div>
        <button
          disabled
          className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
          title="Funkcja w trakcie rozwoju"
        >
          + Dodaj sędziego
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Szukaj sędziego..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Judges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJudges.map((judge) => (
          <div
            key={judge.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {judge.first_name} {judge.last_name}
                </h3>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  judge.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {judge.is_active ? "Aktywny" : "Nieaktywny"}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Licencja:</span>{" "}
                {judge.license_number}
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href={`mailto:${judge.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {judge.email}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href={`tel:${judge.phone}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {judge.phone}
                </a>
              </div>

              {judge.specializations.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Specjalizacje:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {judge.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
              <button
                disabled
                className="flex-1 bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm font-medium cursor-not-allowed"
                title="Funkcja w trakcie rozwoju"
              >
                Edytuj
              </button>
              <button
                disabled
                className="flex-1 bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm font-medium cursor-not-allowed"
                title="Funkcja w trakcie rozwoju"
              >
                Usuń
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredJudges.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nie znaleziono sędziów spełniających kryteria wyszukiwania.
        </div>
      )}

      {/* WIP Footer */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Uwaga:</strong> Zarządzanie sędziami jest w fazie rozwoju.
          Funkcje dodawania, edycji i usuwania będą dostępne w kolejnej wersji.
        </div>
      </div>
    </div>
  );
};

export default JudgesList;
