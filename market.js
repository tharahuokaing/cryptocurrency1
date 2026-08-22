/* =========================================================
   HUOKAING THARA TRADING SYSTEM - REDIRECT MARKET CONTROLLER
========================================================= */

(() => {
    "use strict";

    // Tracking 31 Cryptocurrencies (Top 31 Market Capitalization Assets)
    const cryptoIds =
        "bitcoin,ethereum,binancecoin,ripple,solana,cardano,dogecoin,avalanche-2,chainlink,polkadot,polygon,shiba-inu,uniswap,litecoin,cosmos,stellar,monero,bitcoin-cash,near,aptos,filecoin,arbitrum,render,optimism,vechain,hedera,sui,cosmos,thorchain,injective";

    const apiUrl =
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}&order=market_cap_desc&per_page=31&page=1&sparkline=false`;

    const tableBody = document.getElementById("cryptoTableBody");
    const totalVolumeEl = document.getElementById("totalVolume");

    /**
     * Custom T-Coin asset
     * Always displayed at the top with a value of $0.00
     */
    const tCoin = {
        id: "t-coin",
        name: "T-Coin",
        symbol: "tcoin",
        current_price: 0,
        price_change_percentage_24h: 0,
        total_volume: 0,

        // Simple built-in logo so no external image is required
        image:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23f0b90b'/%3E%3Ctext x='24' y='31' text-anchor='middle' font-family='Arial' font-size='20' font-weight='bold' fill='white'%3ET%3C/text%3E%3C/svg%3E"
    };

    /**
     * Fetch live market data for 31 assets from public API
     */
    async function fetchCryptoMarkets() {
        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();

            // Put T-Coin BEFORE Bitcoin.
            // CoinGecko assets remain in their normal market-cap order.
            const marketData = [tCoin, ...data];

            renderMarketTable(marketData);

        } catch (err) {
            console.error("[MARKET ERROR] Failed to fetch prices:", err);
        }
    }

    /**
     * Render assets into the Binance-style table
     */
    function renderMarketTable(coins) {
        if (!tableBody) return;

        tableBody.innerHTML = "";

        let cumulativeVolume = 0;

        coins.forEach((coin, index) => {
            cumulativeVolume += coin.total_volume || 0;

            const isPositive =
                (coin.price_change_percentage_24h || 0) >= 0;

            const changeClass =
                isPositive ? "price-up" : "price-down";

            const changeSign =
                isPositive ? "+" : "";

            const price = Number(coin.current_price || 0);

            const change =
                Number(coin.price_change_percentage_24h || 0);

            const volume =
                Number(coin.total_volume || 0);

            const row = document.createElement("tr");

            // Give T-Coin a special class so it can be styled separately.
            if (coin.id === "t-coin") {
                row.classList.add("t-coin-row");
            }

            row.innerHTML = `
                <td>
                    <div class="asset-info">
                        <img
                            src="${coin.image}"
                            alt="${coin.name}"
                            width="24"
                            height="24"
                        >

                        <span>${coin.name}</span>

                        <span class="asset-symbol">
                            ${coin.symbol.toUpperCase()}
                        </span>
                    </div>
                </td>

                <td>
                    $${price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6
                    })}
                </td>

                <td class="${changeClass}">
                    ${changeSign}${change.toFixed(2)}%
                </td>

                <td>
                    $${volume.toLocaleString()}
                </td>

                <td>
                    <div class="btn-trade-group">

                        <button
                            class="btn-buy"
                            data-coin="${coin.symbol.toUpperCase()}"
                            data-action="buy"
                        >
                            Buy
                        </button>

                        <button
                            class="btn-sell"
                            data-coin="${coin.symbol.toUpperCase()}"
                            data-action="sell"
                        >
                            Sell
                        </button>

                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        if (totalVolumeEl) {
            totalVolumeEl.textContent =
                `$${cumulativeVolume.toLocaleString()}`;
        }

        attachTradeListeners();
    }

    /**
     * Handle Buy/Sell button redirects to banking modules
     */
    function attachTradeListeners() {
        const buttons =
            document.querySelectorAll(".btn-buy, .btn-sell");

        buttons.forEach(btn => {
            btn.addEventListener("click", (e) => {

                const coinSymbol =
                    e.currentTarget.getAttribute("data-coin");

                const actionType =
                    e.currentTarget.getAttribute("data-action");

                if (actionType === "buy") {

                    // Redirect to deposit page
                    window.location.href =
                        `https://tharahuokaing.github.io/deposit/?asset=${encodeURIComponent(coinSymbol)}`;

                } else if (actionType === "sell") {

                    // Redirect to withdrawal page
                    window.location.href =
                        `https://tharahuokaing.github.io/withdrawal/?asset=${encodeURIComponent(coinSymbol)}`;
                }
            });
        });
    }

    /**
     * Initialize and poll live prices every 15 seconds
     */
    document.addEventListener("DOMContentLoaded", () => {

        fetchCryptoMarkets();

        setInterval(fetchCryptoMarkets, 15000);

    });

})();
