import { useEffect, useState } from "react";

import logo from "./logo.svg";
import "./App.css";
import axios from "axios";

import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@material-ui/core";

function App() {
  useEffect(() => {
    fetchPortfolio();
  }, []);

  const [holdings, setHoldings] = useState([]);
  const [trades, setTrades] = useState([]);

  const fetchPortfolio = () => {
    axios.get("https://api.withlaguna.com/stonks/holdings").then((res) => {
      setHoldings(res.data.holdings);
    });
    axios.get("https://api.withlaguna.com/stonks/trades").then((res) => {
      setTrades(res.data.trades);
    });
  };

  const toPercentage = (num) => {
    return `${(num*100).toFixed(2)}%`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
          <Table>
            <TableHead></TableHead>
            <TableBody>
              {holdings.map((holding) => {
                // Calculate return
                const percentageReturn = (holding.institution_price - holding.cost_basis)/holding.cost_basis;
                const amountHeld = holding.institution_value;
                return (
                  <TableRow>
                    <TableCell>{holding.ticker_symbol}</TableCell>
                    <TableCell>{holding.name}</TableCell>
                    <TableCell>{amountHeld.toFixed(2)}</TableCell>
                    <TableCell>{toPercentage(percentageReturn)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </a>
      </header>
    </div>
  );
}

export default App;
