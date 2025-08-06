// investment.js (updated UI + features)
const stocks = [
    { ticker: "AAPL", name: "Apple", price: 182.9, logo: "https://logo.clearbit.com/apple.com" },
    { ticker: "GOOGL", name: "Google", price: 2715.5, logo: "https://logo.clearbit.com/google.com" },
    { ticker: "AMZN", name: "Amazon", price: 3300.3, logo: "https://logo.clearbit.com/amazon.com" },
    { ticker: "TSLA", name: "Tesla", price: 720.2, logo: "https://logo.clearbit.com/tesla.com" },
    { ticker: "HSBC", name: "HSBC", price: 610, logo: "https://logo.clearbit.com/hsbc.com" },
    { ticker: "MSFT", name: "Microsoft", price: 295.1, logo: "https://logo.clearbit.com/microsoft.com" },
    { ticker: "NFLX", name: "Netflix", price: 505.2, logo: "https://logo.clearbit.com/netflix.com" },
    { ticker: "META", name: "Meta", price: 350.4, logo: "https://logo.clearbit.com/meta.com" },
    { ticker: "NVDA", name: "NVIDIA", price: 420.8, logo: "https://logo.clearbit.com/nvidia.com" },
    { ticker: "TCS", name: "TCS", price: 3420, logo: "https://logo.clearbit.com/tcs.com" },
    { ticker: "INFY", name: "Infosys", price: 1450, logo: "https://logo.clearbit.com/infosys.com" },
    { ticker: "RELIANCE", name: "Reliance", price: 2700, logo: "https://logo.clearbit.com/reliance.com" },
    { ticker: "ADANIENT", name: "Adani Ent", price: 2150, logo: "https://logo.clearbit.com/adani.com" },
    { ticker: "WIPRO", name: "Wipro", price: 590, logo: "https://logo.clearbit.com/wipro.com" },
    { ticker: "HCL", name: "HCL Tech", price: 1340, logo: "https://logo.clearbit.com/hcltech.com" },
    { ticker: "BAJAJ", name: "Bajaj Auto", price: 3900, logo: "https://logo.clearbit.com/bajajauto.com" },
    { ticker: "JSWSTEEL", name: "JSW Steel", price: 750, logo: "https://logo.clearbit.com/jsw.in" },
    { ticker: "HDFCBANK", name: "HDFC Bank", price: 1580, logo: "https://logo.clearbit.com/hdfcbank.com" },
    { ticker: "ICICIBANK", name: "ICICI Bank", price: 940, logo: "https://logo.clearbit.com/icicibank.com" },
    { ticker: "SBI", name: "State Bank of India", price: 650, logo: "https://logo.clearbit.com/onlinesbi.sbi" }
  ];
  
  const userId = 1;
  const companyHistoryData = {};
  const priceChangeData = [];
  let currentView = 'all';

  stocks.forEach((stock, idx) => {
    const prices = [], dates = [];
    let price = stock.price;
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().slice(0, 10));
      const change = (Math.random() - 0.5) * 5;
      price = Math.max(price + change + idx * 0.1, 1);
      prices.push(parseFloat(price.toFixed(2)));
    }
    companyHistoryData[stock.ticker] = { prices, dates };
    const last = prices[prices.length - 1], secondLast = prices[prices.length - 2];
    const changePercent = ((last - secondLast) / secondLast * 100).toFixed(2);
    priceChangeData.push({ ticker: stock.ticker, change: parseFloat(changePercent) });
  });
  
  function renderCompanies(input = 'all') {
    const companyGrid = document.getElementById("companyGrid");
    const searchQuery = (document.getElementById("searchInput")?.value || '').toLowerCase();
  
    let filtered = [];
  
    if (Array.isArray(input)) {
      filtered = input;
    } else {
      filtered = [...stocks];
      if (searchQuery) {
        filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery));
      }
  
      if (input === 'gainers') {
        filtered.sort((a, b) => priceChangeData.find(p => p.ticker === b.ticker).change - priceChangeData.find(p => p.ticker === a.ticker).change);
      } else if (input === 'losers') {
        filtered.sort((a, b) => priceChangeData.find(p => p.ticker === a.ticker).change - priceChangeData.find(p => p.ticker === b.ticker).change);
      }
    }
  
    companyGrid.innerHTML = "";
    filtered.forEach((company, index) => {
      const priceChange = priceChangeData.find(p => p.ticker === company.ticker)?.change || 0;
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${company.logo}" class="company-logo" />
        <h3>${company.name}</h3>
        <div class="company-price">
          <span id="price-${index}" class="price-value">₹${Number(company.price).toFixed(2)}</span>
          <span class="price-percent ${priceChange >= 0 ? 'green' : 'red'}">${priceChange >= 0 ? '+' : ''}${priceChange}%</span>
        </div>
      `;
      card.onclick = () => openModal(index);
      companyGrid.appendChild(card);
    });
  }
  
  function getSortedByPerformance(isGainer = true) {
    const sorted = [...stocks].sort((a, b) => {
      const aHist = companyHistoryData[a.ticker];
      const bHist = companyHistoryData[b.ticker];
      const aChange = (aHist.prices.at(-1) - aHist.prices[0]) / aHist.prices[0];
      const bChange = (bHist.prices.at(-1) - bHist.prices[0]) / bHist.prices[0];
      return isGainer ? bChange - aChange : aChange - bChange;
    });
  
    return sorted.slice(0, 5); // Show top 5
  }
  document.getElementById('showGainers').addEventListener('click', () => {
    const topGainers = getSortedByPerformance(true);
    currentView = topGainers;
    renderCompanies(currentView);
  });
  
  document.getElementById('showLosers').addEventListener('click', () => {
    const topLosers = getSortedByPerformance(false);
    currentView = topLosers;
    renderCompanies(currentView);
  });
  
  document.getElementById('showAll').addEventListener('click', () => {
    currentView = 'all';
    renderCompanies(currentView);
  });
  
  
  
  
  
  function updatePrices() {
    stocks.forEach((company, index) => {
      const oldPrice = parseFloat(company.price);
      const change = (Math.random() * 10 - 5).toFixed(2);
      const newPrice = Math.max(1, oldPrice + parseFloat(change)).toFixed(2);
      company.price = newPrice;
  
      const history = companyHistoryData[company.ticker];
      if (history) {
        history.prices.push(parseFloat(newPrice));
        history.prices.shift();
        history.dates.push("Now");
        history.dates.shift();
      }
  
      const percent = ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
      const priceElement = document.querySelector(`#price-${index}`);
      const percentElement = priceElement?.nextElementSibling;
  
      if (priceElement && percentElement) {
        priceElement.innerText = `₹${newPrice}`;
        percentElement.innerText = `${percent >= 0 ? '+' : ''}${percent}%`;
        percentElement.className = `price-percent ${percent >= 0 ? 'green' : 'red'}`;
      }
    });
  }
  
  function openModal(index) {
    const modal = document.getElementById("buySellModal");
    const modalName = document.getElementById("modalCompanyName");
    const modalPrice = document.getElementById("modalCompanyPrice");
    const company = stocks[index];
    selectedCompany = company;
  
    modal.style.display = "flex";
    modalName.textContent = company.name;
    document.getElementById("investmentCompanyName").textContent = company.name;
    modalPrice.textContent = Number(company.price).toFixed(2);
    shareCount.value = "";
  
    renderHistoryChart(companyHistoryData[company.ticker]);
  }
  
  const closeModalBtn = document.getElementById("closeModal");
  closeModalBtn.onclick = () => document.getElementById("buySellModal").style.display = "none";
  
  const buyBtn = document.getElementById("buyBtn");
  buyBtn.onclick = async () => {
    const quantity = parseInt(shareCount.value);
    const price = parseFloat(selectedCompany.price);
  
    if (!selectedCompany || quantity <= 0) {
      return alert("Please enter a valid quantity.");
    }
  
    try {
      const walletRes = await fetch(`/users/${userId}`);
      const walletData = await walletRes.json();
      let balance = parseFloat(walletData.balance);
  
      const cost = quantity * price;
      if (balance < cost) return alert("Insufficient balance.");
  
      const newBalance = balance - cost;
      await fetch(`/users/${userId}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBalance })
      });
  
      await fetch(`/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: selectedCompany.ticker, quantity, price })
      });
  
      await fetch(`/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "BUY", ticker: selectedCompany.ticker, quantity, price })
      });
  
      alert(`Successfully bought ${quantity} shares of ${selectedCompany.name}`);
      document.getElementById("buySellModal").style.display = "none";
      window.location.href = "dashboard.html";
  
    } catch (err) {
      console.error("Buy failed:", err);
      alert("Something went wrong.");
    }
  };
  
  function renderHistoryChart(data) {
    const ctx = document.getElementById("historyChart").getContext("2d");
    if (window.historyChartInstance) window.historyChartInstance.destroy();
    window.historyChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.dates,
        datasets: [{
          label: "Stock Price",
          data: data.prices,
          borderColor: "#1976d2",
          backgroundColor: "rgba(25, 118, 210, 0.1)",
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: false } }
      }
    });
  }
  
  document.getElementById("searchInput")?.addEventListener("input", () => renderCompanies());
  
  setInterval(() => {
    updatePrices();
    renderCompanies(currentView);
  }, 3000);
  
  