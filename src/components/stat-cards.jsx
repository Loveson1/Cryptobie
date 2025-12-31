import { useState, useEffect, useRef } from "react";

export default function StatCards() {
  const [StatData, SetStatData] = useState([
    {
      name: "Bitcoin",
      marketCap: 0,
      change24h: 0,
    },
    {
      name: "Ethereum",
      marketCap: 0,
      change24h: 0,
    },
    {
      name: "Tether",
      marketCap: 0,
      change24h: 0,
    },
  ]);
  const [trendingData, setTrendingData] = useState([
    {
      name: "Bitcoin",
    },
    {
      name: "Ethereum",
    },
    {
      name: "Tether",
    },
  ]);
  const [cryptoNews, setcryptoNews] = useState([
    {
      title: "Crypto News",
      description:
        "Maybe, just maybe you are experiencing a network glitch at the moment.",
    },
  ]);
  const wsRef = useRef(null);
  // Fetch market stats
  const StatsData = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1&sparkline=true&price_change_percentage=1h,24h,7d"
      );
      const data = await response.json();

      const formattedData = data.map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        image: coin.image,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h_in_currency,
        marketCap: coin.market_cap,
      }));

      SetStatData(formattedData);
    } catch (error) {
      console.error("error", error);
    }
  };

  // Fetch trending coins
  const fetchTrending = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/search/trending"
      );
      const data = await response.json();
      const formattedTrending = data.coins.slice(0, 3).map((coin) => ({
        id: coin.item.id,
        name: coin.item.name,
        symbol: coin.item.symbol.toUpperCase(),
        image: coin.item.large || coin.item.image, // Use large image or fallback to image
        marketCapRank: coin.item.market_cap_rank,
      }));

      setTrendingData(formattedTrending);
    } catch (error) {
      console.error("Error fetching trending:", error);
    }
  };

  // fetch cryptpo news
  async function CryptoNews() {
    try {
      const response = await fetch(
        "https://newsapi.org/v2//everything?q=crypto&sortBy=publishedAt&language=en&apiKey=8c0c9134860b499d92897795d563c751"
      );
      const data = await response.json();
      const defaultImage =
        "https://images.unsplash.com/photo-1630463853299-75a5f73da1ca?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Fallback placeholder
      const newsData = data.articles.slice(0, 1).map((news) => ({
        image:
          news.urlToImage && news.urlToImage.trim()
            ? news.urlToImage
            : defaultImage,
        title: news.title,
        description: news.description,
        url: news.url,
      }));
      setcryptoNews(newsData);
    } catch (error) {}
  }

  useEffect(() => {
    // call socket takes two steps open socket then send message
    const connectWebSocket = () => {
      const ws = new WebSocket("wss://stream.binance.com:9443/ws");

      ws.onopen = () => {
        const symbols = ["btcusdt", "ethusdt", "usdtusdt"];

        ws.send(
          JSON.stringify({
            method: "SUBSCRIBE",
            params: symbols.map((s) => `${s}@ticker`),
            id: 1,
          })
        );
      };

      // take socket data one step gets data
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.c && data.s) {
            const symbol = data.s.replace("USDT", "").toUpperCase();
            const newPrice = parseFloat(data.c);
            const change24h = parseFloat(data.P);

            SetStatData((prev) =>
              prev.map((coin) =>
                coin.symbol === symbol
                  ? { 
                    ...coin, 
                    change24h:change24h,
                    price: newPrice
                  } 
                  : coin
              )
            );
          }
        } catch (error) {
          console.error("error:", error);
        }
      };
      ws.onerror = (error) => {
        console.log("error:", error);
      };

      ws.onclose = () => {
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    };


    connectWebSocket();
    StatsData();
    fetchTrending();
    CryptoNews();

    // set interval for calling api

    const fullStatDataInterval = setInterval(StatsData, 30000);
    // cleanup for data

    return () => {
      if (wsRef.current) {
        wsRef.current?.close();
        clearInterval(fullStatDataInterval);
      }
    };
  }, []);

  return (
    <div className="space-y-10">
      {/* Top Markets */}
      <section>
        <div className="mb-6">
          <h2 className="heading-lg">Top Markets</h2>
          <p className="text-secondary mt-1">
            Best performing cryptocurrencies
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          {StatData.map((coin, index) => (
            <div
              key={coin.name}
              className=" card border rounded-xl border-slate-800 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    width={24}
                    className=" rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm">{coin.name}</p>
                    <p className="text-xs text-gray-500">{coin.symbol}</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded">
                  {index + 1}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Price</span>
                  <span className="font-semibold">
                    ${coin.price?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between badge">
                  <span className="text-gray-400">24h Change</span>
                  <span
                    className={
                      coin.change24h >= 0 ? "badge-success" : "badge-danger"
                    }
                  >
                    {coin.change24h?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="mb-6">
          <h2 className="heading-lg">🔥 Trending</h2>
          <p className="text-secondary mt-1">Most popular this week</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingData.map((coin) => (
            <div
              key={coin.name}
              className="card p-4 rounded-xl bg-indigo-600/5 border-indigo-500/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={coin.image}
                  alt={coin.name}
                  width={24}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{coin.name}</p>
                  <p className="text-xs text-gray-500">{coin.symbol}</p>
                </div>
                <span className="text-sm font-bold text-indigo-400">
                  #{coin.marketCapRank}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News */}
      <section>
        <div className="mb-6">
          <h2 className="heading-lg">Latest News</h2>
          <p className="text-secondary mt-1">Cryptocurrency updates</p>
        </div>
        {cryptoNews.map((news, index) => (
          <div key={index} className="card-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <img
                src={news.image}
                alt="news"
                width={100}
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1630463853299-75a5f73da1ca?q=80&w=500&h=300&fit=crop";
                }}
                className="w-full sm:w-40 h-32 sm:h-auto object-cover"
              />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-2 mb-1 max-w-130">
                    {news.title}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-150 line-clamp-2">
                    {news.description}
                  </p>
                </div>
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-[10px] mt-2 w-fit"
                >
                  Read More
                </a>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
