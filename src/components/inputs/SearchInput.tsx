import { FC } from 'react';
import { useRouter } from 'next/router';

import CustomButton from "src/components/common/CustomButton";
import { Plus } from 'lucide-react';
interface SearchInputProps {
    searchQuery: string;
    handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;

    createUrl: string
    createText: string
}

export const SearchInput: FC<SearchInputProps> = ({ searchQuery, handleSearch, createUrl, createText }) => {
    const router = useRouter();

    return (
        <div className="d-flex align-items-center gap-2 w-100">
            <input
                type="text"
                className="form-control"
                placeholder="🔍︎ Buscar..."
                value={searchQuery}
                onChange={handleSearch}
                style={{
                    height: "42px", // Match CustomButton default height
                    border: "none",
                    outline: "none"
                }}
            />
            <div className="flex-shrink-0">
                <CustomButton
                    type="button"
                    variant="save"
                    onClick={() => router.push(createUrl)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {createText}
                </CustomButton>
            </div>
        </div>
    );
};

export default SearchInput;
