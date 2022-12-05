import dynamic from "next/dynamic";
import { Suspense } from "react";

const Home = () => {
  const SocialLoginDynamic = dynamic(
    () => import("../components/Login").then((res) => res.default),
    {
      ssr: false,
    }
  );

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <SocialLoginDynamic />
      </Suspense>
    </div>
  );
};

export default Home;
