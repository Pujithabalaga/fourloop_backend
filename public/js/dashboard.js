document.addEventListener('DOMContentLoaded', async () => {
    // ===== Wallet Balance Setup =====
    let userBalance = localStorage.getItem('balance');
    if (userBalance === null) {
      userBalance = 25000;
      localStorage.setItem('balance', userBalance);
    } else {
      userBalance = parseFloat(userBalance);
    }
    document.getElementById('walletBalance').textContent = `₹${userBalance.toFixed(2)}`;
  
    // ===== Fetch Portfolio and Render =====
    try {
      const portfolioRes = await fetch('/portfolio');
      const portfolio = await portfolioRes.json();
  
      renderPortfolio(portfolio);
      drawPortfolioPieChart(portfolio);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      document.getElementById('portfolioSummary').textContent = 'Failed to load portfolio.';
    }
  
    // ===== Fetch Transactions and Render =====
    try {
      const transactionsRes = await fetch('/transactions');
      const transactions = await transactionsRes.json();
  
      renderTransactions(transactions);
      drawProfitLossChart(transactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      document.getElementById('transactionSummary').textContent = 'Failed to load transactions.';
    }
  
    // ===== Render Portfolio Items =====
    function renderPortfolio(portfolio) {
      const container = document.getElementById('portfolioSummary');
      container.innerHTML = '';
      if (portfolio.length === 0) {
        container.textContent = 'No portfolio data available.';
        return;
      }
  
      portfolio.forEach(stock => {
        const div = document.createElement('div');
        div.classList.add('portfolio-item');
        div.textContent = `${stock.ticker} - ${stock.quantity} shares`;
        container.appendChild(div);
      });
    }
  
    // ===== Render Recent Transactions =====
    function renderTransactions(transactions) {
      const container = document.getElementById('transactionSummary');
      container.innerHTML = '';
      if (transactions.length === 0) {
        container.textContent = 'No transactions found.';
        return;
      }
  
      const recent = transactions.slice(-5).reverse();
      recent.forEach(tx => {
        const div = document.createElement('div');
        div.classList.add('transaction-item');
  
        const total = tx.total !== undefined
          ? tx.total
          : (tx.price * tx.quantity);
  
        div.textContent = `${tx.type.toUpperCase()} | ${tx.ticker} | ₹${tx.price} x ${tx.quantity} = ₹${total.toFixed(2)}`;
        container.appendChild(div);
      });
    }
  
    // ===== Portfolio Pie Chart =====
    function drawPortfolioPieChart(portfolio) {
      const ctx = document.getElementById('portfolioPieChart').getContext('2d');
      const labels = portfolio.map(s => s.ticker);
      const quantities = portfolio.map(s => s.quantity);
      const backgroundColors = ['#42a5f5', '#66bb6a', '#ef5350', '#ffa726', '#ab47bc', '#8d6e63', '#26c6da', '#d4e157'];
  
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Portfolio Distribution',
            data: quantities,
            backgroundColor: backgroundColors.slice(0, quantities.length)
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right'
            },
            title: {
              display: true,
              text: 'Stock Portfolio Distribution'
            }
          }
        }
      });
    }
  
    // ===== Profit/Loss Line Chart =====
    function drawProfitLossChart(transactions) {
      const ctx = document.getElementById('profitLossChart').getContext('2d');
  
      const grouped = {};
      transactions.forEach(tx => {
        const date = new Date(tx.created_at || Date.now()).toLocaleDateString();
        const total = tx.total || (tx.price * tx.quantity);
        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += (tx.type === 'buy' ? -total : total);
      });
  
      const labels = Object.keys(grouped);
      const values = Object.values(grouped);
  
      // Calculate running total (cumulative profit/loss)
      const runningTotals = [];
      let sum = 0;
      values.forEach(val => {
        sum += val;
        runningTotals.push(sum);
      });
  
      // Ensure at least 2 points for the chart
      if (labels.length < 2) {
        labels.unshift('Start');
        runningTotals.unshift(0);
      }
  
      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Net Profit/Loss Over Time',
            data: runningTotals,
            borderColor: '#1e88e5',
            backgroundColor: 'rgba(30,136,229,0.2)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Profit/Loss Timeline'
            },
            tooltip: {
              callbacks: {
                label: context => `₹${context.parsed.y.toFixed(2)}`
              }
            }
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Amount (₹)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            }
          }
        }
      });
    }
  });
  