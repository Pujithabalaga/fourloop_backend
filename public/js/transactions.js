document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
  });
  
  async function loadTransactions() {
    const res = await fetch(`/transactions?_=${Date.now()}`);  // ⏱ cache busting
    const transactions = await res.json();
    console.log("Fetched transactions:", transactions);  // 🐞 debug log
  
    const buyBody = document.querySelector('#buyTable tbody');
    const sellBody = document.querySelector('#sellTable tbody');
  
    buyBody.innerHTML = '';
    sellBody.innerHTML = '';
  
    transactions.forEach(tx => {
      const row = document.createElement('tr');
  
      row.innerHTML = `
        <td>${tx.id}</td>
        <td>${tx.ticker}</td>
        <td>${tx.quantity}</td>
        <td>${tx.price}</td>
        <td>${new Date(tx.created_at).toLocaleString()}</td>
      `;
  
      const type = tx.type.toLowerCase();  // ✅ normalize type for comparison
  
      if (type === 'buy') {
        const sellBtn = document.createElement('button');
        sellBtn.textContent = 'Sell';
        sellBtn.onclick = () => sellStock(tx);
  
        const actionCell = document.createElement('td');
        actionCell.appendChild(sellBtn);
        row.appendChild(actionCell);
  
        buyBody.appendChild(row);
      } else if (type === 'sell') {
        sellBody.appendChild(row);
      }
    });
  }
  
  async function sellStock(tx) {
    const confirmSell = confirm(`Are you sure you want to sell ${tx.quantity} of ${tx.ticker}?`);
    if (!confirmSell) return;
  
    const res = await fetch('/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker: tx.ticker,
        type: 'sell',
        quantity: tx.quantity,
        price: tx.price
      })
    });
  
    if (res.ok) {
      alert('Transaction successful!');
      console.log('Reloading transactions after sell...');
      loadTransactions();
    } else {
      alert('Sell failed.');
    }
  }
  