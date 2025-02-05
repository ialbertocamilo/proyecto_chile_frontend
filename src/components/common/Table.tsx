import React, { useState } from 'react';

interface TableProps {
  columns: string[];
  data: { [key: string]: any }[];
}

const Table: React.FC<TableProps> = ({ columns, data }) => {
  const [filter, setFilter] = useState('');

  const filteredData = data.filter((row) =>
    columns.some((col) => row[col].toString().toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar..."
        className="form-control mb-3"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table className="table table-bordered">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col}>{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
