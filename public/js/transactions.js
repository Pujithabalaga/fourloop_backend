document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
  });
  
  async function loadTransactions() {
    const res = await fetch(`/transactions?_=${Date.now()}`);
    const transactions = await res.json();
  
    const buyBody = document.querySelector('#buyTable tbody');
    const sellBody = document.querySelector('#sellTable tbody');
  
    buyBody.innerHTML = '';
    sellBody.innerHTML = '';
  
    transactions.forEach(tx => {
      const row = document.createElement('tr');
  
      const formattedDate = new Date(tx.created_at).toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
  
      row.innerHTML = `
        <td>${tx.id}</td>
        <td>${tx.ticker}</td>
        <td>${tx.quantity}</td>
        <td>${tx.price}</td>
        <td>${tx.total.toFixed(2)}</td>
        <td>${formattedDate}</td>
      `;
  
      const type = tx.type.toLowerCase();
  
      if (type === 'buy') {
        const sellBtn = document.createElement('button');
        sellBtn.textContent = 'Sell';
        sellBtn.onclick = () => sellStock(tx, row); // Pass row for UI removal
  
        const actionCell = document.createElement('td');
        actionCell.appendChild(sellBtn);
        row.appendChild(actionCell);
  
        buyBody.appendChild(row);
      } else if (type === 'sell') {
        sellBody.appendChild(row);
      }
    });
  }
  
  async function sellStock(tx, row) {
    const confirmSell = confirm(`Are you sure you want to sell ${tx.quantity} of ${tx.ticker}?`);
    if (!confirmSell) return;
  
    const res = await fetch('/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker: tx.ticker,
        type: 'sell',
        quantity: tx.quantity,
        price: tx.price,
        buy_id: tx.id
      })
    });
  
    if (res.ok) {
      alert('Transaction successful!');
      row.remove();
  
      const sellBody = document.querySelector('#sellTable tbody');
      const newRow = document.createElement('tr');
  
      const now = new Date().toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
  
      newRow.innerHTML = `
        <td>New</td>
        <td>${tx.ticker}</td>
        <td>${tx.quantity}</td>
        <td>${tx.price}</td>
        <td>${(tx.price * tx.quantity).toFixed(2)}</td>
        <td>${now}</td>
      `;
      sellBody.appendChild(newRow);
    } else {
      alert('Sell failed.');
    }
  }
  