import Navbar from "@/components/layout/Navbar";
import TopBar from "@/components/layout/TopBar";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hideNavRoutes = ["/login"];
  const showNav = !hideNavRoutes.includes(router.pathname);

  const sidebarWidth = "300px";
  return (
    <>

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
          <div className="page-body " style={{ backgroundColor: '#f8f9fa' }}  >
            <div className={'container-fluid p-4 px-10 '}>
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
