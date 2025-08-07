document.addEventListener('DOMContentLoaded', () => {
  loadTransactions();
});

// 🔄 Generate a fake but realistic price between 100 and 2000
function getCurrentPrice(ticker) {
  const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = 100 + (seed % 500); // base between 100–600
  const fluctuation = (Math.random() * 10) - 5; // smaller ±5 range
  return parseFloat((base + fluctuation).toFixed(2));
}



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

    const currentPrice = getCurrentPrice(tx.ticker);
    const buyPrice = parseFloat(tx.price);
    const quantity = parseInt(tx.quantity);
    const valueNow = quantity * currentPrice;
    const profit = valueNow - (buyPrice * quantity);
    const profitClass = profit > 0 ? 'green' : profit < 0 ? 'red' : 'neutral';

    row.innerHTML = `
      <td>${tx.id}</td>
      <td>${tx.ticker}</td>
      <td>${tx.quantity}</td>
      <td>₹${buyPrice}</td>
      <td>₹${currentPrice.toFixed(2)}</td>
      <td>₹${valueNow.toFixed(2)}</td>
      <td class="${profitClass}">₹${profit.toFixed(2)}</td>
      <td>${formattedDate}</td>
    `;

    const type = tx.type.toLowerCase();
    if (type === 'buy') {
      const actionCell = document.createElement('td');

      const input = document.createElement('input');
      input.type = 'number';
      input.min = 1;
      input.max = quantity;
      input.value = quantity;
      input.style.width = '60px';

      const sellBtn = document.createElement('button');
      sellBtn.textContent = 'Sell';
      sellBtn.onclick = () => sellStock(tx, row, parseInt(input.value));

      const sellAllBtn = document.createElement('button');
      sellAllBtn.textContent = 'Sell All';
      sellAllBtn.style.marginLeft = '8px';
      sellAllBtn.onclick = () => sellStock(tx, row, quantity);

      actionCell.appendChild(input);
      actionCell.appendChild(sellBtn);
      actionCell.appendChild(sellAllBtn);

      row.appendChild(actionCell);
      buyBody.appendChild(row);
    } else if (type === 'sell') {
      sellBody.appendChild(row);
    }
  });
}
function updateLivePrices() {
  const rows = document.querySelectorAll('#buyTable tbody tr');
  
  rows.forEach(row => {
    const ticker = row.children[1].textContent;
    const quantity = parseInt(row.children[2].textContent);
    const buyPrice = parseFloat(row.children[3].textContent.replace('₹', ''));

    const currentPrice = getCurrentPrice(ticker);
    const valueNow = quantity * currentPrice;
    const profit = valueNow - (buyPrice * quantity);
    const profitClass = profit > 0 ? 'green' : profit < 0 ? 'red' : 'neutral';

    // ✅ Update cells directly
    row.children[4].textContent = `₹${currentPrice.toFixed(2)}`;
    row.children[5].textContent = `₹${valueNow.toFixed(2)}`;
    row.children[6].textContent = `₹${profit.toFixed(2)}`;
    row.children[6].className = profitClass;
  });
}



async function sellStock(tx, row, quantityToSell) {
  if (!quantityToSell || quantityToSell <= 0 || quantityToSell > tx.quantity) {
    alert('Invalid quantity selected to sell.');
    return;
  }

  const confirmSell = confirm(`Are you sure you want to sell ${quantityToSell} of ${tx.ticker}?`);
  if (!confirmSell) return;

  const res = await fetch('/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticker: tx.ticker,
      type: 'sell',
      quantity: quantityToSell,
      price: tx.price,
      buy_id: tx.id
    })
  });

  if (res.ok) {
    alert('Transaction successful!');
    loadTransactions(); // Refresh table
  } else {
    alert('Sell failed.');
  }
  
  
}
document.addEventListener('DOMContentLoaded', () => {
  loadTransactions(); // Load once

  // ✅ Update only prices & profit every 5 seconds
  setInterval(updateLivePrices, 3000);
});
