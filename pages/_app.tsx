
import Navbar from "@/components/layout/Navbar";
import TopBar from "@/components/layout/TopBar";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'public/assets/css/font-awesome.css'
import 'public/assets/css/vendors/animate.css'
import 'public/assets/css/vendors/feather-icon.css'
import 'public/assets/css/vendors/flag-icon.css'
import 'public/assets/css/vendors/icofont.css'
import 'public/assets/css/vendors/owlcarousel.css'
import 'public/assets/css/vendors/scrollbar.css'
import 'public/assets/css/vendors/themify.css'
import 'public/assets/css/vendors/sweetalert2.css'
import 'public/assets/css/vendors/bootstrap.css'
import 'public/assets/css/style.css'
import 'public/assets/css/color-1.css'
import 'public/assets/css/responsive.css'

import '@/styles/globals.css'

import Script from 'next/script';
import { useEffect } from "react";
import 'public/assets/js/jquery.min.js'
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hideNavRoutes = ["/login"];
  const showNav = !hideNavRoutes.includes(router.pathname);

  const sidebarWidth = "300px";

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
  return (
    <>
      <Script src="public/assets/js/icons/feather-icon/feather.min.js" />
      <Script src="public/assets/js/icons/feather-icon/feather-icon.js" />
      <Script src="public/assets/js/scrollbar/simplebar.js" />
      <Script src="public/assets/js/scrollbar/custom.js" />
      <Script src="public/assets/js/config.js" />
      <Script src="public/assets/js/sidebar-menu.js" />
      <Script src="public/assets/js/slick/slick.min.js" />
      <Script src="public/assets/js/slick/slick.js" />
      <Script src="public/assets/js/header-slick.js" />
      <Script src="public/assets/js/chart/morris-chart/raphael.js" />
      <Script src="public/assets/js/chart/morris-chart/morris.js" />
      <Script src="public/assets/js/chart/morris-chart/prettify.min.js" />
      <Script src="public/assets/js/chart/apex-chart/moment.min.js" />
      <Script src="public/assets/js/notify/bootstrap-notify.min.js" />
      <Script src="public/assets/js/notify/index.js" />
      <Script src="public/assets/js/datatable/datatables/jquery.dataTables.min.js" />
      <Script src="public/assets/js/datatable/datatables/datatable.custom.js" />
      <Script src="public/assets/js/datatable/datatables/datatable.custom1.js" />
      <Script src="public/assets/js/owlcarousel/owl.carousel.js" />
      <Script src="public/assets/js/owlcarousel/owl-custom.js" />
      <Script src="public/assets/js/typeahead/handlebars.js" />
      <Script src="public/assets/js/typeahead/typeahead.bundle.js" />
      <Script src="public/assets/js/typeahead/typeahead.custom.js" />
      <Script src="public/assets/js/typeahead-search/handlebars.js" />
      <Script src="public/assets/js/typeahead-search/typeahead-custom.js" />
      <Script src="public/assets/js/height-equal.js" />
      <div className="page-wrapper" id="pageWrapper">
        <div className="page-header">
          <div className="header-wrapper row m-0">
            {showNav &&
              <TopBar sidebarWidth={sidebarWidth} />}
          </div>
        </div>
        <div className="page-body-wrapper horizontal-menu ">
          <div className="sidebar-wrapper" data-layout="fill-svg">
            {showNav &&
              <Navbar setActiveView={() => { }} />}
          </div>
          <div className="page-body "  >
            <div className={'container-fluid'} style={{ paddingRight: '1.2em' }}>
              <Component {...pageProps} />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
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
}

export default MyApp;
