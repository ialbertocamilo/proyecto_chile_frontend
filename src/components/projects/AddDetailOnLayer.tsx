import React, { useState } from 'react';
import CustomButton from '../common/CustomButton';

interface CreateDetailOnLayerProps {
    item: any;
    OnDetailOpened?: (e:any) => void;
}

export const AddDetailOnLayer: React.FC<CreateDetailOnLayerProps> = ({ item,  OnDetailOpened }) => {
    const [selectedItem, SetSelectedItem] = useState<any>(null);

    return (
        <>
            <CustomButton
                className="btn-table"
                variant="addIcon"
                onClick={(e) => {
                    e.stopPropagation();
                    SetSelectedItem(item)
                    if (item && OnDetailOpened)
                    OnDetailOpened(item);
                }}
            >
                +
            </CustomButton>
        </>
    );
};

export default AddDetailOnLayer;