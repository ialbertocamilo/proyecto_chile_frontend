// pages/index.tsx
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};

export default function Home() {
  // Esta página nunca se renderiza, ya que el usuario será redirigido.
  return null;
}
