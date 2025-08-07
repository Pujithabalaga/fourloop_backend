document.addEventListener('DOMContentLoaded', async () => {
    const userId = 1;
    await fetchAndRenderDashboard();
  
    async function fetchAndRenderDashboard() {
      try {
        const [balanceRes, portfolioRes, transactionsRes] = await Promise.all([
          fetch(`/users/${userId}`),
          fetch('/portfolio'),
          fetch('/transactions')
        ]);
  
        const userData = await balanceRes.json();
        const portfolio = await portfolioRes.json();
        const transactions = await transactionsRes.json();
  
        renderWalletBalance(userData.balance);
        renderPortfolio(portfolio);
        calculateTotalInvestment(portfolio);
        drawDonutChart(portfolio);
        drawValueBarChart(portfolio);
        drawProfitLossChart(transactions);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    }
  
    function renderWalletBalance(balance) {
      const userBalance = parseFloat(balance || 0);
      document.getElementById('walletBalance').textContent = `₹${userBalance.toFixed(2)}`;
    }
  
    function renderPortfolio(portfolio) {
      const body = document.getElementById('portfolioBody');
      body.innerHTML = '';
      portfolio.forEach(stock => {
        const avgPrice = parseFloat(stock.average_price || 0);
        const totalValue = stock.quantity * avgPrice;
  
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${stock.ticker}</td>
          <td>${stock.quantity}</td>
          <td>₹${avgPrice.toFixed(2)}</td>
          <td>₹${totalValue.toFixed(2)}</td>
        `;
        body.appendChild(row);
      });
    }
  
    function calculateTotalInvestment(portfolio) {
      const total = portfolio.reduce((sum, stock) => {
        const avgPrice = parseFloat(stock.average_price || 0);
        return sum + stock.quantity * avgPrice;
      }, 0);
      document.getElementById('totalInvestment').textContent = `₹${total.toFixed(2)}`;
    }
  
    function drawProfitLossChart(portfolio) {
        const ctx = document.getElementById('profitLossChart')?.getContext('2d');
        if (!ctx || !portfolio.length) return;
      
        const days = 30;
        const labels = [];
        const values = [];
      
        let lastTotal = 0;
      
        for (let i = days; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const label = date.toISOString().slice(0, 10);
          labels.push(label);
      
          let totalValue = 0;
      
          portfolio.forEach(stock => {
            const basePrice = parseFloat(stock.average_price || 100);
            const quantity = parseFloat(stock.quantity || 0);
      
            // Simulate fluctuation: +/- 5%
            const fluctuation = (Math.random() * 0.1 - 0.05);
            const simulatedPrice = basePrice * (1 + fluctuation);
      
            totalValue += simulatedPrice * quantity;
          });
      
          // Net change since previous day
          const profitLoss = i === days ? 0 : totalValue - lastTotal;
          values.push(profitLoss.toFixed(2));
          lastTotal = totalValue;
        }
      
        if (window.lineChartInstance) window.lineChartInstance.destroy();
      
        window.lineChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Net Daily P/L (₹)',
              data: values,
              borderColor: '#2e7d32',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Simulated Net Daily Profit / Loss'
              },
              tooltip: {
                callbacks: {
                  label: ctx => `₹${ctx.parsed.y}`
                }
              }
            },
            scales: {
              y: {
                title: { display: true, text: 'Profit / Loss (₹)' }
              },
              x: {
                title: { display: true, text: 'Date' }
              }
            }
          }
        });
      }
      
    function drawDonutChart(portfolio) {
      const ctx = document.getElementById('portfolioPieChart')?.getContext('2d');
      if (!ctx) return;
  
      const labels = portfolio.map(p => p.ticker);
      const data = portfolio.map(p => p.quantity * p.average_price);
  
      if (window.donutChartInstance) window.donutChartInstance.destroy();
  
      window.donutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            label: 'Investment Value',
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
              text: 'Portfolio Distribution by Value'
            }
          }
        }
      });
    }
  
    function drawValueBarChart(portfolio) {
      const ctx = document.getElementById('valueChart')?.getContext('2d');
      if (!ctx) return;
  
      const labels = portfolio.map(p => p.ticker);
      const values = portfolio.map(p => p.quantity * p.average_price);
  
      if (window.valueChartInstance) window.valueChartInstance.destroy();
  
      window.valueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Total Value (₹)',
            data: values,
            backgroundColor: '#64b5f6'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: 'Total Value Per Stock' },
            tooltip: {
              callbacks: {
                label: ctx => `₹${ctx.parsed.y.toFixed(2)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Total Value (₹)' }
            },
            x: {
              title: { display: true, text: 'Stocks' }
            }
          }
        }
      });
    }
  });
  