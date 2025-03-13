import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
  title: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="container-fluid row col-sm-6 p-0 page-title">
      <ol
        className="breadcrumb"
        style={{ textDecoration: "none", color: "#2ab0c5" }}
      >
        <li className="breadcrumb-item">
          <Link href="/" style={{ textDecoration: "none", color: "#2ab0c5" }}>
            <svg className="stroke-icon">
              <use href="../assets/svg/icon-sprite.svg#stroke-home"></use>
            </svg>
          </Link>
        </li>
        {items.map((item, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${item.active ? "active" : ""}`}
          >
            {item.href ? (
              <Link
                href={item.href}
                style={{ textDecoration: "none", color: "#2ab0c5" }}
              >
                {item.title}
              </Link>
            ) : (
              <span style={{ color: "#2ab0c5" }}>{item.title}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Breadcrumb;
