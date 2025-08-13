import React from "react";
import type { DogResponse } from "../../types";
import DogRow from "./DogRow";

type DogsTableProps = {
  dogs: DogResponse[];
  isLoading: boolean;
  onRowClick?: (dogId: string) => void;
};

const DogsTable: React.FC<DogsTableProps> = ({ dogs, onRowClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-amber-500/60">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Imię
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Hodowla
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Płeć
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Maść
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Data urodzenia
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Właściciel
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Chip
            </th>
            {/* <th className="px-6 py-3" /> */}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dogs.map((dog) => (
            <DogRow key={dog.id} dog={dog} onClick={onRowClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DogsTable;
