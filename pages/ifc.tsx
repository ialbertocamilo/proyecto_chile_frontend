import dynamic from "next/dynamic";

const IFCViewerComponent = dynamic(() => import("@/components/ifc/Viewer"), { ssr: false });

export default function Home() {
  return (
    <div>
      <h1>Visor IFC</h1>
      <IFCViewerComponent />
    </div>
  );
}
export async function getServerSideProps() {
  return { props: {} };
}
