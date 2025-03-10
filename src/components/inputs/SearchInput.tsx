import { FC } from 'react';
import { useRouter } from 'next/router';
import CustomButton from "src/components/common/CustomButton";
import { Plus } from 'lucide-react';

interface SearchInputProps {
  searchQuery: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  createUrl: string;
  createText: string;
}

export const SearchInput: FC<SearchInputProps> = ({ searchQuery, handleSearch, createUrl, createText }) => {
  const router = useRouter();

  return (
    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 w-100">
      <div className="flex-grow-1 mb-2 mb-sm-0">
        <input
          type="text"
          className="form-control w-100"
          placeholder="🔍︎ Buscar..."
          value={searchQuery}
          onChange={handleSearch}
          style={{
            height: "42px",
            border: "none",
            outline: "none",
            fontSize: "0.95rem"
          }}
        />
      </div>
      <div className="flex-shrink-0">
        <CustomButton
          type="button"
          variant="save"
          onClick={() => router.push(createUrl)}
          margin="0"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span className="d-none d-sm-inline">{createText}</span>
          <span className="d-inline d-sm-none">Nuevo</span>
        </CustomButton>
      </div>
    </div>
  );
};

export default SearchInput;
