import React from 'react';

interface TabItem {
    key: string;
    label: string;
}

interface HorizontalTabsProps {
    tabs: TabItem[];
    currentTab: string;
    onTabChange: (tab: string) => void;
    className?: string;
}

const HorizontalTabs: React.FC<HorizontalTabsProps> = ({
    tabs,
    currentTab,
    onTabChange,
    className = ''
}) => {
    return (
        <ul
            className={`nav horizontal-tabs ${className}`}
            style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                padding: 0,
                listStyle: "none",
            }}
        >
            {tabs.map((item, index) => (
                <li key={item.key} className="nav-item" style={{ flex: 1, minWidth: "100px" }}>
                    <button
                        className={currentTab === item.key ? "active" : ""}
                        style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: "#fff",
                            color:
                                currentTab === item.key
                                    ? "#FEBE1B" // El color se aplicará desde el CSS pero también lo definimos aquí como respaldo
                                    : "var(--secondary-color)",
                            border: "none",
                            cursor: "pointer",
                            borderBottom:
                                currentTab === item.key
                                    ? `3px solid #FEBE1B`
                                    : "none",
                            fontFamily: "var(--font-family-base)",
                            fontWeight: "normal",
                        }}
                        onClick={() => onTabChange(item.key)}
                    >
                        <span className="tab-number">{index + 1}.</span> {item.label}
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default HorizontalTabs;
