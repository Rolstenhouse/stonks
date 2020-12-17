import { execOnce } from "next/dist/next-server/lib/utils";
import Head from "next/head";
import MainPage from "../components/MainPage";
import axios from "axios";

Date.prototype.toShortFormat = function () {
  let monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let monthIndex = this.getMonth();
  let monthName = monthNames[monthIndex];

  let year = this.getFullYear();

  return `${monthName}. ${year}`;
};

function Home({ userInfo, sub }) {
  let anyDate = new Date();
  return (
    <>
      <Head>
        <title>{`${userInfo.title} - ${anyDate.toShortFormat()}`}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content={`Stock portfolio, returns and notifications for ${
            userInfo.name ? userInfo.name : "Laguna"
          } - ${userInfo.description} - ${anyDate.toShortFormat()}`}
        />
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

  try {
    const res = await fetch(
      `https://api.withlaguna.com/stonks/userinfo/${sub}`
    );
    const userInfo = await res.json();

    return {
      props: {
        userInfo,
        sub,
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
}

export default Home;
