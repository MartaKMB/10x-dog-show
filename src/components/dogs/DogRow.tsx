import React from "react";
import type { DogResponse } from "../../types";

type DogRowProps = {
  dog: DogResponse;
  onClick?: (dogId: string) => void;
};

const formatOwners = (owners: DogResponse["owners"]) => {
  if (!owners || owners.length === 0) return "-";
  const primary = owners.find((o) => o.is_primary) || owners[0];
  const others = owners.length - 1;
  return others > 0 ? `${primary.name} (+${others})` : primary.name;
};

const DogRow: React.FC<DogRowProps> = ({ dog, onClick }) => {
  const handleClick = () => {
    if (onClick) onClick(dog.id);
  };

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={handleClick}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold uppercase">
        {dog.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold">
        {dog.kennel_name || "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {dog.gender === "male" ? "samiec" : "suka"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {dog.coat === "czarny"
          ? "Czarny"
          : dog.coat === "czarny_podpalany"
            ? "Czarny podpalany"
            : dog.coat === "blond"
              ? "Blond"
              : String(dog.coat)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {new Date(dog.birth_date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {formatOwners(dog.owners)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {dog.microchip_number || "-"}
      </td>
      {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          type="button"
          className="text-blue-600 hover:text-blue-900"
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick(dog.id);
          }}
        >
          Szczegóły
        </button>
      </td> */}
    </tr>
  );
};

export default DogRow;
