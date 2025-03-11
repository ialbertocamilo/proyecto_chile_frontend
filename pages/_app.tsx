
import Navbar from "@/components/layout/Navbar";
import TopBar from "@/components/layout/TopBar";
import '@/styles/globals.css';
import '@/styles/css/datatable-mobile.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { useRouter } from "next/router";
import Script from 'next/script';
import "../src/styles/css/globals.css";
import 'public/assets/css/color-1.css';
import 'public/assets/css/font-awesome.css';
import 'public/assets/css/responsive.css';
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
import 'public/assets/js/jquery.min.js';
import type { ReactElement } from 'react';
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'public/assets/css/font-awesome.css';
import 'public/assets/css/vendors/icofont.css';
import 'public/assets/css/vendors/themify.css';
import 'public/assets/css/vendors/flag-icon.css';
import 'public/assets/css/vendors/feather-icon.css';
import 'public/assets/css/vendors/sweetalert2.css';
import 'public/assets/css/vendors/bootstrap.css';
import 'public/assets/css/style.css';
import 'public/assets/css/color-1.css';
import 'public/assets/css/responsive.css';

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
  const sidebarWidth = "300px";

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => {
    return (
      <>
        <Script src="public/assets/js/icons/feather-icon/feather.min.js" />
        <div className="page-wrapper" id="pageWrapper">
          <div className="page-header">
            <div className="header-wrapper row m-0">
              {showNav && <TopBar sidebarWidth={sidebarWidth} />}
            </div>
          </div>
          <div className="page-body-wrapper horizontal-menu">
            <div className="sidebar-wrapper" data-layout="fill-svg">
              {showNav && <Navbar setActiveView={() => {}} />}
            </div>
            <div className="page-body">
              {!hideNavRoutes.includes(router.pathname) ? (
                <div className={'container-fluid'} style={{ paddingRight: '1.2em' }}>
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
    if (typeof window !== 'undefined') {
      const loadApexCharts = async () => {
        try {
          await import('public/assets/js/jquery.min.js')
          await import('public/assets/js/bootstrap/bootstrap.bundle.min.js')
          await import('apexcharts');
          await import('public/assets/js/chart/apex-chart/apex-chart.js');
        } catch (error) {
          console.error('Error loading ApexCharts:', error);
        }
      };
      loadApexCharts();
    }
  }, []);

  return getLayout(<Component {...pageProps} />);
}


export default MyApp;
