import { useEffect, useState } from "react";
import axios from "axios";

import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Paper,
  Grid,
} from "@material-ui/core";

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { getServerSideProps } from "../pages";

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "Nunito",
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
  palette: {
    secondary: {
      main: "#ffffff",
    },
  },
});

// UTILS
const toPercentage = (num) => {
  return `${(num * 100).toFixed(2)}%`;
};

const Hero = ({ userInfo }) => {
  return (
    <Grid container justify="center">
      <Grid item xs={11} sm={8}>
        <div
          style={{
            paddingTop: theme.spacing(12),
            paddingBottom: theme.spacing(12),
          }}
        >
          <Typography variant="h2">{userInfo.title}</Typography>
          <Typography variant="h6">{userInfo.description}</Typography>
          <Typography variant="body1">
            <Link href={userInfo.link} color="secondary">
              {userInfo.link}
            </Link>
          </Typography>
          <Typography variant="caption">
            Page built using{" "}
            <Link
              href="https://withlaguna.com/create-your-page"
              color="secondary"
            >
              Laguna
            </Link>
          </Typography>
        </div>
      </Grid>
    </Grid>
  );
};

function calculateReturn(value, cost_basis) {
  return value / cost_basis - 1;
}

const HoldingsTable = ({ holdings, showAmounts }) => {
  if (!holdings) return <></>;

  const portfolioTotal = holdings.reduce(
    (sum, holding) => holding.institution_value + sum,
    0
  );

  // Sort by percentage return
  let sorted_holdings = [...holdings];
  sorted_holdings.sort((a, b) => {
    return b.institution_value - a.institution_value;
    // return (
    //   calculateReturn(b.institution_value, b.cost_basis) -
    //   calculateReturn(a.institution_value, a.cost_basis)
    // );
  });

  return (
    <>
      <Typography align="left" variant="h5">
        Current holdings
      </Typography>
      <div style={{ overflowX: "auto", width: "100%" }}>
        <Table size="small" style={{ paddingBottom: theme.spacing(4) }}>
          <TableHead>
            <TableRow>
              {[
                "Ticker",
                "Name",
                !!showAmounts
                  ? "Amount held (USD)"
                  : "Portfolio allocation (%)",
                "Total percentage return",
              ].map((title) => (
                <TableCell style={{ fontWeight: 800 }}>{title}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted_holdings.map((holding) => {
              if (holding.ticker_symbol.includes("CUR:")) {
                return <></>;
              }
              // Calculate return
              const percentageReturn = calculateReturn(
                holding.institution_value,
                holding.cost_basis
              );
              let amountHeld = toPercentage(
                holding.institution_value / portfolioTotal
              );
              if (showAmounts) {
                amountHeld = `$${holding.institution_value.toFixed(2)}`;
              }
              return (
                <TableRow>
                  <TableCell style={{ maxWidth: "80px", overflowX: "auto" }}>
                    {holding.ticker_symbol}
                  </TableCell>
                  <TableCell>{holding.name}</TableCell>
                  <TableCell>{amountHeld}</TableCell>
                  <TableCell>{toPercentage(percentageReturn)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

const SubscribeUpdateForm = ({ userInfo }) => {
  const [submitted, setSubmitted] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    setError(false);
    setSubmitted(true);
    axios
      .post("https://api.withlaguna.com/stonks/submit", {
        owner_id: userInfo.id,
        phone: value,
      })
      .then((res) => {
        setSubmitted(true);
      })
      .catch(() => {
        setSubmitted(false);
        setError(true);
        setValue("");
      });
  };

  return (
    <Grid container justify="center">
      <Grid item xs={11} sm={8}>
        <Paper
          style={{
            padding: theme.spacing(2),
            marginTop: theme.spacing(12),
            marginBottom: theme.spacing(12),
            backgroundColor: "white",
          }}
        >
          <Typography variant="h6">
            Get notified when {userInfo.title} makes a trade
          </Typography>
          {submitted ? (
            <Typography>Thanks for subscribing :)</Typography>
          ) : (
            <form
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TextField
                id="phone"
                lable="Phone number"
                variant="filled"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="555-555-5555"
                helperText={
                  error
                    ? "Please enter the right phone number"
                    : "By submitting, you agree to data usage terms"
                }
                error={error}
              />
              <Button
                variant="contained"
                onClick={handleSubmit}
                style={{
                  backgroundImage:
                    "linear-gradient(to top right, #A01A7D, #EC4067)",
                  color: "white",
                  marginLeft: theme.spacing(4),
                }}
              >
                Get notified
              </Button>
            </form>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

const TradesTable = ({ trades }) => {
  if (!trades) return <></>;
  // Select only the three most recent trades
  let sortedTrades = [...trades];
  sortedTrades = sortedTrades.filter((trade) => {
    return trade.trade_date;
  });

  sortedTrades.sort((a, b) => b.trade_date.localeCompare(a.trade_date));
  const recentTrades = sortedTrades.slice(0, 3);

  // CTA to sign up on bottom
  return (
    <>
      <Typography align="left" variant="h5">
        Three most recent trades
      </Typography>
      <div style={{ overflowX: "auto", width: "100%" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Date", "Ticker", "Quantity (shares)", "Price (USD)"].map(
                (title) => (
                  <TableCell style={{ fontWeight: 800 }}>{title}</TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {recentTrades.map((trade) => {
              return (
                <TableRow>
                  <TableCell>{trade.trade_date.split(" ")[0]}</TableCell>
                  <TableCell>{trade.ticker}</TableCell>
                  <TableCell>{trade.quantity}</TableCell>
                  <TableCell>${trade.price.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

function CreateYourOwnPage() {
  return (
    <>
      <Typography
        variant="h5"
        style={{ color: "white", padding: theme.spacing(2) }}
      >
        Interested in having your own page?
      </Typography>
      <Button
        href="https://airtable.com/shr3XDgLgKL6AoCgy"
        style={{
          backgroundImage: "linear-gradient(to top right, #A01A7D, #EC4067)",
          color: "white",
        }}
      >
        Join Laguna
      </Button>
    </>
  );
}

function App({userInfo, sub}) {
  useEffect(() => {
    fetchPortfolio();
  }, []);

  const [holdings, setHoldings] = useState([]);
  const [trades, setTrades] = useState([]);
//   const [userInfo, setUserInfo] = useState([]);

//   let sub = window.location.host.split(".")[0];

  const fetchPortfolio = () => {
    // if (process.env.NODE_ENV === "development") {
    //   sub = "parth";
    // }

    axios
      .get(`https://api.withlaguna.com/stonks/holdings/${sub}`)
      .then((res) => {
        setHoldings(res.data.holdings);
      });
    axios.get(`https://api.withlaguna.com/stonks/trades/${sub}`).then((res) => {
      setTrades(res.data.trades);
    });
    // axios
    //   .get(`https://api.withlaguna.com/stonks/userinfo/${sub}`)
    //   .then((res) => {
    //     // setUserInfo(res.data.user);
    //     setUserInfo(res.data);
    //   });
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <div
          style={{
            backgroundImage: "linear-gradient(to top right, #669bbc, #ecd1e5)",
            paddingBottom: theme.spacing(6)
          }}
        >
          <Container maxWidth="md">
            <Hero userInfo={userInfo} />
            <TradesTable trades={trades} />
            <SubscribeUpdateForm userInfo={userInfo} />
            <HoldingsTable
              holdings={holdings}
              showAmounts={userInfo.show_amounts}
            />
          </Container>
        </div>
        <div style={{ backgroundColor: "black", padding: theme.spacing(12) }}>
          <Container>
            <CreateYourOwnPage />
          </Container>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
