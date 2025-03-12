import Navbar from "@/components/layout/Navbar";
import TopBar from "@/components/layout/TopBar";
import '@/styles/css/datatable-mobile.css';
import '@/styles/globals.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { useRouter } from "next/router";
import Script from 'next/script';
// import 'public/assets/css/responsive.css';
import 'public/assets/css/color-1.css';
import 'public/assets/css/font-awesome.css';
import 'public/assets/css/style.css';
import 'public/assets/css/vendors/animate.css';
import 'public/assets/css/vendors/bootstrap.css';
import 'public/assets/css/vendors/feather-icon.css';
import 'public/assets/css/vendors/flag-icon.css';
import 'public/assets/css/vendors/icofont.css';
import 'public/assets/css/vendors/owlcarousel.css';
import 'public/assets/css/vendors/scrollbar.css';
import 'public/assets/css/vendors/sweetalert2.css';
import 'public/assets/css/vendors/themify.css';
import type { ReactElement } from 'react';
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactElement;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const hideNavRoutes = ["/login","/twofactorauth"];
  const showNav = !hideNavRoutes.includes(router.pathname);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    // Set initial value
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Handle navbar toggle
  const handleNavbarToggle = (isOpen: boolean) => {
    setIsNavbarOpen(isOpen);
  };

  // Calculate sidebar width based on device type and state
  const navbarWidth = isMobile ? "40%" : "6.5em";
  const contentMarginLeft = isNavbarOpen ? navbarWidth : "0";

  const getLayout = Component.getLayout ?? ((page) => {
    return (
      <>
        <Script src="public/assets/js/icons/feather-icon/feather.min.js" />
        <div className="page-wrapper" id="pageWrapper">
          <div 
            className="page-header" 
            style={{ 
              marginLeft: showNav ? contentMarginLeft : "0", 
              transition: "margin-left 0.3s ease"
            }}
          >
            <div className="header-wrapper row m-0">
              {showNav && <TopBar sidebarWidth={navbarWidth} />}
            </div>
          </div>
          <div className="page-body-wrapper horizontal-menu">
            <div className="sidebar-wrapper" data-layout="fill-svg">
              {showNav && (
                <Navbar 
                  setActiveView={() => {}} 
                  onNavbarToggle={handleNavbarToggle}
                />
              )}
            </div>
            <div 
              className="page-body" 
              style={{ 
                marginLeft: showNav && isNavbarOpen ? contentMarginLeft : "0",
                transition: "margin-left 0.3s ease",
                width: showNav && isNavbarOpen ? `calc(100% - ${contentMarginLeft})` : "100%"
              }}
            >
              {!hideNavRoutes.includes(router.pathname) ? (
                <div style={{ paddingRight: '1.2em' }}>
                  {page}
                </div>
              ) : (
                page
              )}
            </div>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </>
    );
  });

  useEffect(() => {
    const loadClientSideLibraries = async () => {
      const { loadJQuery } = await import('@/utils/clientSideImports');
      await loadJQuery();
    };
    
    loadClientSideLibraries();
  }, []);

  return getLayout(<Component {...pageProps} />);
}

export default MyApp;