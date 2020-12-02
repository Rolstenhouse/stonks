import { useEffect, useState } from "react";

import "./App.css";
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
} from "@material-ui/core";

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";

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
});

// UTILS
const toPercentage = (num) => {
  return `${(num * 100).toFixed(2)}%`;
};

const Hero = ({ userInfo }) => {
  return (
    <div style={{ padding: theme.spacing(12) }}>
      <Typography variant="h2">{userInfo.title}</Typography>
      <Typography variant="p1">{userInfo.description}</Typography>
      <Typography variant="d2">
        <Link href={userInfo.link}>{userInfo.link}</Link>
      </Typography>
      <Typography>
        Page built using <Link href="https://withlaguna.com/">Laguna</Link>
      </Typography>
    </div>
  );
};

const HoldingsTable = ({ holdings }) => {
  return (
    <>
      <Typography align="left" variant="h5">
        Current holdings
      </Typography>
      <Table size="small" style={{ paddingBottom: theme.spacing(4) }}>
        <TableHead>
          <TableRow>
            <TableCell>Ticker</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Amount Held (USD)</TableCell>
            <TableCell>Total percentage return</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.map((holding) => {
            if (holding.ticker_symbol.includes("CUR:")) {
              return <></>;
            }
            // Calculate return
            const percentageReturn =
              holding.institution_value / holding.cost_basis - 1;
            const amountHeld = holding.institution_value;
            return (
              <TableRow>
                <TableCell>{holding.ticker_symbol}</TableCell>
                <TableCell>{holding.name}</TableCell>
                <TableCell>${amountHeld.toFixed(2)}</TableCell>
                <TableCell>{toPercentage(percentageReturn)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

const SubscribeUpdateForm = ({ userInfo }) => {
  const [submitted, setSubmitted] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  console.log('userInfo', userInfo)

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
      });
  };

  return (
    <Paper
      style={{
        padding: theme.spacing(2),
        margin: theme.spacing(12),
        backgroundColor: "white",
      }}
    >
      <Typography variant="h6">Get texted as soon Rob makes a trade</Typography>
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
            helperText={error ? "Please enter the right phone number": "By submitting, you agree to data usage terms"}
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
  );
};

const TradesTable = ({ trades }) => {
  // Select only the three most recent trades
  const filteredTrades = trades.filter((trade) => {
    return trade.trade_date;
  });
  const recentTrades = filteredTrades.slice(0, 3);

  // CTA to sign up on bottom
  return (
    <>
      <Typography align="left" variant="h5">
        Three most recent trades
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Ticker</TableCell>
            <TableCell>Quantity (shares)</TableCell>
            <TableCell>Price (USD)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recentTrades.map((trade) => {
            return (
              <TableRow>
                <TableCell>{trade.trade_date.split(" ")[0]}</TableCell>
                <TableCell>{trade.ticker}</TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell>${trade.price}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
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
        href="https://withlaguna.com"
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

function App() {
  useEffect(() => {
    fetchPortfolio();
  }, []);

  const [holdings, setHoldings] = useState([]);
  const [trades, setTrades] = useState([]);
  const [userInfo, setUserInfo] = useState([]);

  const sub = window.location.host.split('.')[0]

  const fetchPortfolio = () => {
    axios.get("https://api.withlaguna.com/stonks/holdings").then((res) => {
      setHoldings(res.data.holdings);
    });
    axios.get("https://api.withlaguna.com/stonks/trades").then((res) => {
      setTrades(res.data.trades);
    });
    axios.get(`https://api.withlaguna.com/stonks/userinfo/${sub}`).then((res) => {
      // setUserInfo(res.data.user);
      setUserInfo(res.data)
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <div
          style={{
            backgroundImage: "linear-gradient(to top right, #669bbc, #ecd1e5)",
          }}
        >
          <Container maxWidth="md">
            <Hero userInfo={userInfo} />
            <TradesTable trades={trades} />
            <SubscribeUpdateForm userInfo={userInfo} />
            <HoldingsTable holdings={holdings} />
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
