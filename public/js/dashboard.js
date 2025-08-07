document.addEventListener('DOMContentLoaded', async () => {
    const userId = 1;
    await fetchAndRenderDashboard();
  
    // Simulate current price based on ticker
    function getCurrentPrice(ticker) {
      const seed = ticker.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      const base = 100 + (seed % 300); // base price
      const fluctuation = (Math.random() * 20) - 10; // ±10
      return parseFloat((base + fluctuation).toFixed(2));
    }
  
    async function fetchAndRenderDashboard() {
        try {
          const [userRes, portfolioRes] = await Promise.all([
            fetch(`/users/${userId}`),
            fetch('/portfolio')
          ]);
      
          const userData = await userRes.json();
          const portfolio = await portfolioRes.json();
      
          let totalInvestment = 0;
          let currentValue = 0;
          const labels = [];
          const values = [];
      
          const holdingsTable = document.getElementById('holdingsTable');
          holdingsTable.innerHTML = '';
      
          portfolio.forEach(item => {
            const { ticker, quantity, average_price } = item;
            const currentPrice = getCurrentPrice(ticker);
            const invested = quantity * average_price;
            const valueNow = quantity * currentPrice;
      
            totalInvestment += invested;
            currentValue += valueNow;
      
            // Store for charts
            labels.push(ticker);
            values.push(valueNow);
      
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${ticker}</td>
              <td>${quantity}</td>
              <td>₹${currentPrice.toFixed(2)}</td>
              <td>₹${valueNow.toFixed(2)}</td>
            `;
            holdingsTable.appendChild(row);
          });
      
          // ✅ Set total investment
          document.getElementById('totalInvestment').textContent = `₹${totalInvestment.toFixed(2)}`;
      
          // ✅ Handle balance object or array
          const balance = Array.isArray(userData)
            ? parseFloat(userData[0]?.balance || 0)
            : parseFloat(userData.balance || 0);
      
          document.getElementById('walletBalance').textContent = `₹${balance.toFixed(2)}`;
      
          // ✅ Draw charts
          const portfolioForCharts = labels.map((ticker, i) => ({
            ticker,
            quantity: 1,
            average_price: values[i]
          }));
      
          drawDonutChart(portfolioForCharts);
          drawValueBarChart(portfolioForCharts);
          drawProfitLossChart(portfolioForCharts);
        } catch (err) {
          console.error('Failed to load dashboard:', err);
        }
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
            title: {
              display: true,
              text: 'Total Value Per Stock'
            },
            tooltip: {
              callbacks: {
                label: ctx => `₹${ctx.parsed.y.toFixed(2)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Total Value (₹)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Stocks'
              }
            }
          }
        }
      });
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
        labels.push(date.toISOString().slice(0, 10));
  
        let totalValue = 0;
        portfolio.forEach(stock => {
          const base = stock.average_price;
          const fluctuation = Math.random() * 0.1 - 0.05;
          const simulatedPrice = base * (1 + fluctuation);
          totalValue += simulatedPrice * stock.quantity;
        });
  
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
              title: {
                display: true,
                text: 'Profit / Loss (₹)'
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
  