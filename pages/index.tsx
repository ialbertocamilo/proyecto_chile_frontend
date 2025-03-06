import { GetServerSideProps } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
