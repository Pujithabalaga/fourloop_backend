document.addEventListener('DOMContentLoaded', async () => {
    const userId = 1;
  
    // ===== Fetch Wallet Balance =====
    try {
      const res = await fetch(`/users/${userId}`);
      const data = await res.json();
      const userBalance = parseFloat(data.balance || 0);
      document.getElementById('walletBalance').textContent = `₹${userBalance.toFixed(2)}`;
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  
    // ===== Fetch Portfolio =====
    let portfolio = [];
    try {
      const res = await fetch('/portfolio');
      portfolio = await res.json();
      renderPortfolio(portfolio);
      drawPortfolioPieChart(portfolio);
      calculateTotalInvestment(portfolio);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    }
  
    // ===== Fetch Transactions =====
    try {
      const res = await fetch('/transactions');
      const transactions = await res.json();
      drawProfitLossChart(transactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  
    // ===== Render Portfolio Table =====
    function renderPortfolio(portfolio) {
      const body = document.getElementById('portfolioBody');
      body.innerHTML = '';
  
      portfolio.forEach(stock => {
        const row = document.createElement('tr');
        const avgPrice = parseFloat(stock.average_price || 0);
        const totalValue = stock.quantity * avgPrice;
  
        row.innerHTML = `
          <td>${stock.ticker}</td>
          <td>${stock.quantity}</td>
          <td>₹${avgPrice.toFixed(2)}</td>
          <td>₹${totalValue.toFixed(2)}</td>
        `;
        body.appendChild(row);
      });
    }
  
    // ===== Calculate Total Investment =====
    function calculateTotalInvestment(portfolio) {
      const total = portfolio.reduce((sum, stock) => {
        const avgPrice = parseFloat(stock.average_price || 0);
        return sum + stock.quantity * avgPrice;
      }, 0);
      document.getElementById('totalInvestment').textContent = `₹${total.toFixed(2)}`;
    }
  
    // ===== Portfolio Pie Chart =====
    function drawPortfolioPieChart(portfolio) {
      const ctx = document.getElementById('portfolioPieChart').getContext('2d');
      const labels = portfolio.map(s => s.ticker);
      const data = portfolio.map(s => s.quantity);
  
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Holdings',
            data,
            backgroundColor: [
              '#42a5f5', '#ef5350', '#66bb6a', '#ffa726', '#ab47bc',
              '#26c6da', '#d4e157', '#ff7043', '#8d6e63', '#78909c'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Portfolio Distribution'
            }
          }
        }
      });
    }
  
    // ===== Profit/Loss Chart =====
    function drawProfitLossChart(transactions) {
      const ctx = document.getElementById('profitLossChart').getContext('2d');
      const grouped = {};
  
      transactions.forEach(tx => {
        const date = new Date(tx.transaction_date || Date.now()).toLocaleDateString();
        const total = tx.total || (tx.price * tx.quantity);
        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += tx.type.toLowerCase() === 'buy' ? -total : total;
      });
  
      const labels = Object.keys(grouped);
      const values = Object.values(grouped);
  
      const cumulative = [];
      let sum = 0;
      values.forEach(v => {
        sum += v;
        cumulative.push(sum);
      });
  
      if (labels.length < 2) {
        labels.unshift('Start');
        cumulative.unshift(0);
      }
  
      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Net P/L',
            data: cumulative,
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
              text: 'Profit / Loss Over Time'
            },
            tooltip: {
              callbacks: {
                label: ctx => `₹${ctx.parsed.y.toFixed(2)}`
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
  