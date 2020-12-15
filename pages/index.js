import { execOnce } from "next/dist/next-server/lib/utils";
import Head from "next/head";
import MainPage from "../components/MainPage";

function Home({ userInfo, sub }) {
  return (
    <>
      <Head>
        <title>{userInfo.title}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content={userInfo.description} />

        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XVSNB8VETM"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments)}
            gtag('js', new Date());
            
            gtag('config', 'G-XVSNB8VETM');
              `,
          }}
        />
      </Head>

      <MainPage userInfo={userInfo} sub={sub} />
    </>
  );
}

export async function getServerSideProps(ctx) {
  const host = ctx.req.headers.host;
  let sub = host.split(".")[0];
  if (process.env.NODE_ENV === "development") {
    sub = "rob";
  }

  const res = await fetch(`https://api.withlaguna.com/stonks/userinfo/${sub}`);
  let userInfo;
  try {
    userInfo = await res.json()
  } catch {}

  if (!userInfo) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      userInfo,
      sub,
    },
  };
}

export default Home;
