import { FC } from 'react';
import { useRouter } from 'next/router';

import CustomButton from "src/components/common/CustomButton";
interface SearchInputProps {
  searchQuery: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;

  createUrl : string
  createText:string
}

export const SearchInput: FC<SearchInputProps> = ({ searchQuery, handleSearch,createUrl,createText }) => {
  const router = useRouter();

  return (
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        placeholder="🔍︎ Buscar..."
        value={searchQuery}
        onChange={handleSearch}
        style={{ fontFamily: "var(--font-family-base)" }}
      />
      <div className="search-btn">
        <CustomButton
          type="button"
          variant="save"
          onClick={() => router.push(createUrl)}
        >
          {createText}
        </CustomButton>
      </div>
    </div>
  );
};

export default SearchInput;
