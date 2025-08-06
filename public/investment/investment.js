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
    { ticker: "SBI", name: "State Bank of India", price: 650, logo: "https://logo.clearbit.com/onlinesbi.sbi" },
  ];
  
  const userId = 1;
  const companyHistoryData = {};
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
  });
  
  const companyGrid = document.getElementById("companyGrid");
  const modal = document.getElementById("buySellModal");
  const closeModalBtn = document.getElementById("closeModal");
  const modalName = document.getElementById("modalCompanyName");
  const modalPrice = document.getElementById("modalCompanyPrice");
  const shareCount = document.getElementById("shareCount");
  const buyBtn = document.getElementById("buyBtn");
  let selectedCompany = null;
  
  function renderCompanies() {
    companyGrid.innerHTML = "";
    stocks.forEach((company, index) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${company.logo}" class="company-logo" />
        <h3>${company.name}</h3>
        <div class="company-price">
          <span id="price-${index}" class="price-value">₹${company.price.toFixed(2)}</span>
          <span id="arrow-${index}" class="price-arrow"></span>
        </div>
      `;
      card.onclick = () => openModal(index);
      companyGrid.appendChild(card);
    });
  }
  
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
  
      const priceElement = document.querySelector(`#price-${index}`);
      const arrowElement = document.querySelector(`#arrow-${index}`);
  
      if (priceElement && arrowElement) {
        priceElement.innerText = `₹${newPrice}`;
        if (newPrice > oldPrice) {
          arrowElement.innerText = "🔼";
          priceElement.classList.add("price-up");
          setTimeout(() => priceElement.classList.remove("price-up"), 500);
        } else if (newPrice < oldPrice) {
          arrowElement.innerText = "🔽";
          priceElement.classList.add("price-down");
          setTimeout(() => priceElement.classList.remove("price-down"), 500);
        } else {
          arrowElement.innerText = "";
        }
      }
    });
  }
  
  function openModal(index) {
    selectedCompany = stocks[index];
    modal.style.display = "flex";
    modalName.textContent = selectedCompany.name;
    document.getElementById("investmentCompanyName").textContent = selectedCompany.name;
    modalPrice.textContent = Number(selectedCompany.price).toFixed(2);
    shareCount.value = "";
    renderHistoryChart(companyHistoryData[selectedCompany.ticker]);
  }
  
  closeModalBtn.onclick = () => modal.style.display = "none";
  
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
      if (balance < cost) {
        return alert("Insufficient wallet balance.");
      }
  
      const newBalance = balance - cost;
  
      // Step 1: Update wallet balance
      await fetch(`/users/${userId}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBalance })
      });
  
      // Step 2: Update/add to portfolio
      await fetch(`/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: selectedCompany.ticker,
          quantity,
          price
        })
      });
  
      // Step 3: Record transaction
      await fetch(`/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BUY",
          ticker: selectedCompany.ticker,
          quantity,
          price
        })
      });
  
      alert(`Successfully bought ${quantity} shares of ${selectedCompany.name}`);
      modal.style.display = "none";
      window.location.href = "dashboard.html";
  
    } catch (err) {
      console.error("Buy failed:", err);
      alert("Something went wrong. Please try again.");
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
  
  renderCompanies();
  setInterval(updatePrices, 3000);
  