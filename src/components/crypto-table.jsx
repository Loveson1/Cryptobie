import { useEffect, useState, useRef } from "react";
import Sparkline from "./sparkline";



export default function CryptoTable() {
  const [cryptoData, setCryptoData] = useState([
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", image: "https://images.coingecko.com/coins/images/1/large/bitcoin.png", price: 0, change24h: 0, marketCap: 0, volume24h: 0, circulatingSupply: 0, sparkline: [] },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", image: "https://images.coingecko.com/coins/images/279/large/ethereum.png", price: 0, change24h: 0, marketCap: 0, volume24h: 0, circulatingSupply: 0, sparkline: [] },
    { id: "binancecoin", name: "Binance Coin", symbol: "BNB", image: "https://images.coingecko.com/coins/images/825/large/binance-coin-logo.png", price: 0, change24h: 0, marketCap: 0, volume24h: 0, circulatingSupply: 0, sparkline: [] },
    { id: "ripple", name: "Ripple", symbol: "XRP", image: "https://images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", price: 0, change24h: 0, marketCap: 0, volume24h: 0, circulatingSupply: 0, sparkline: [] },
    { id: "cardano", name: "Cardano", symbol: "ADA", image: "https://images.coingecko.com/coins/images/975/large/cardano.png", price: 0, change24h: 0, marketCap: 0, volume24h: 0, circulatingSupply: 0, sparkline: [] },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const priceHistoryRef = useRef({});
  useEffect(() => {
    // Fetch crypto data from CoinGecko API
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h,24h,7d"
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        const formattedData = data.map((coin) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          image: coin.image,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h_in_currency,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          circulatingSupply: coin.circulating_supply,
          sparkline: coin.sparkline_in_7d?.price || [],
        }));

       
        // Initialize price history for each coin
        formattedData.forEach((coin) => {
          priceHistoryRef.current[coin.symbol] = coin.sparkline;
        });

        setCryptoData(formattedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching crypto data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();

    // Refetch full data every 5 minutes for market cap, volume, etc.
    const fullDataInterval = setInterval(fetchCryptoData, 300000);

    // Connect to WebSocket for real-time price updates
const connectWebSocket = () => {
      const ws = new WebSocket("wss://stream.binance.com:9443/ws");

      ws.onopen = () => {
        // Subscribe to top 20 coins
        const symbols = [
          "btcusdt",
          "ethusdt",
          "bnbusdt",
          "xrpusdt",
          "adausdt",
          "dogeusdt",
          "trxusdt",
          "usdtusdt",
          "usdcusdt",
          "sushiusdt",
          "usdsusdt",
          "wbethusdt",
          "wbtcusdt",
          "bchusdt",
          "stethusdt",
          "weethusdt",
          "solusdt",
          "bscusdusdt",
          "figrhelocusdt",
          "wstethusdt",
        ];

        ws.send(
          JSON.stringify({
            method: "SUBSCRIBE",
            params: symbols.map((s) => `${s}@ticker`),
            id: 1,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.c && data.s) {
            const symbol = data.s.replace("USDT", "").toUpperCase();
            const newPrice = parseFloat(data.c);
        
            const change24h = parseFloat(data.P);
    

            // Add price to history for sparkline
            if (!priceHistoryRef.current[symbol]) {
              priceHistoryRef.current[symbol] = [];
            }
            priceHistoryRef.current[symbol].push(newPrice);

            // Keep only last 168 data points (7 days if updated frequently)
            if (priceHistoryRef.current[symbol].length > 168) {
              priceHistoryRef.current[symbol].shift();
            }

            // Update all coin data
            setCryptoData((prev) =>
              prev.map((coin) =>
                coin.symbol === symbol
                  ? {
                      ...coin,
                      price: newPrice,
                     
                      change24h: change24h,
                      
                      sparkline: [...priceHistoryRef.current[symbol]],
                    }
                  : coin
              )
            );
          }
        } catch (err) {
          console.error("WebSocket message error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      ws.onclose = () => {
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(fullDataInterval);
    };
    
  
  }, []);

  // Format large numbers
  const formatNumber = (num) => {
    if (!num) return "N/A";
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Format percentage with color
  const formatPercentage = (value) => {
    if (!value) return "0.00%";
    const rounded = parseFloat(value).toFixed(2);
    return `${rounded}%`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="heading-lg">Market Overview</h2>
        <p className="text-secondary mt-1">Real-time cryptocurrency prices</p>
      </div>

      {error && (
        <div className="card bg-red-500/10 border-red-500/20 px-4 py-3 text-red-400 text-sm">
          Error: {error}
        </div>
      )}
      
      {loading && (
        <div className="card bg-indigo-500/10 border-indigo-500/20 px-4 py-3 text-indigo-400 text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          Loading data...
        </div>
      )}

      <div className=" p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="table-header">Rank</th>
                <th className="table-header">Asset</th>
                <th className="table-header">Price</th>
                <th className="table-header">24h %</th>
                <th className="table-header">Market Cap</th>
                <th className="table-header">Volume</th>
                <th className="table-header">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {cryptoData.map((coin, index) => (
                <tr key={coin.id} className="hover:bg-slate-800/30 transition">
                  <td className="table-cell">
                    <span className="font-bold text-white pl-2">{index + 1}</span>
                  </td>
                  <td className="table-cell ">
                    <div className="flex items-center gap-2 pr-5">
                      <img src={coin.image} alt={coin.name} width={24} className=" w-6 rounded-full" />
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm">{coin.name}</p>
                        <p className="text-xs text-gray-500">{coin.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell  ">
                    <span className="font-bold text-white">${coin.price?.toFixed(2)}</span>
                  </td>
                  <td className="table-cell ">
                    <span className={coin.change24h >= 0 ? 'badge-success' : 'badge-danger'}>
                      {formatPercentage(coin.change24h)}
                    </span>
                  </td>
                  <td className="table-cell ">
                    <span className="text-white text-sm font-semibold">{formatNumber(coin.marketCap)}</span>
                  </td>
                  <td className="table-cell ">
                    <span className="text-gray-300 text-sm">{formatNumber(coin.volume24h)}</span>
                  </td>
                  <td className="">
                    <div className="flex justify-start pl-1 text-gray-300 text-sm">
                      <Sparkline
                        data={coin.sparkline}
                        isPositive={coin.change24h >= 0}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
