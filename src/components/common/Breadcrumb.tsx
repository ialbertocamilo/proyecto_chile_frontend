import React from "react";
import Link from "next/link"; // Si estás usando Next.js, de lo contrario, usa el enrutamiento que prefieras

const Breadcrumb: React.FC = () => {
  return (
    <div className="container-fluid row col-sm-6 p-0 page-title">
      <ol className="breadcrumb ">
        <li className="breadcrumb-item">
          <Link href="/">
            <svg className="stroke-icon">
              <use href="../assets/svg/icon-sprite.svg#stroke-home"></use>
            </svg>
          </Link>
        </li>
        <li className="breadcrumb-item">Dashboard</li>
        <li className="breadcrumb-item active">Default</li>
      </ol></div>
  );
};

export default Breadcrumb;