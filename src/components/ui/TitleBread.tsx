import React from 'react';
import Title from '../Title';
import Card from '../common/Card';
import Breadcrumb from '../common/Breadcrumb';

interface BreadcrumbItem {
    title: string;
    href: string;
    active?: boolean;
}

interface TitleBreadProps {
    title: string;
    breadcrumbItems: BreadcrumbItem[];
}

const TitleBread: React.FC<TitleBreadProps> = ({ title, breadcrumbItems }) => {
    return (
        <Card>
            <div className="d-flex align-items-center w-100">
                <Title text={title} />
                <Breadcrumb items={breadcrumbItems} />
            </div>
        </Card>
    );
};



export default TitleBread;