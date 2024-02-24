// Selektorer för HTML-element
const accountInput = document.querySelector('#accountNumber');
const checkBalanceButton = document.querySelector('#checkBalance');
const displayBalance = document.querySelector('#balance');
const sendButton = document.querySelector('#sendTx');
const toAccountInput = document.querySelector('#toAccountNumber');
const valueInput = document.querySelector('#amount');
const blockCountDisplay = document.querySelector('#blockCount');
const transactionList = document.querySelector('#transactions');

// Web3-anslutning
//const rpc = new Web3('HTTP://127.0.0.1:7545');
//const rpc = new Web3('https://mainnet.infura.io/v3/3dba672872174b9587837971698b5a4c');
//const rpc = new Web3('https://goerli.infura.io/v3/3dba672872174b9587837971698b5a4c');
const rpc = new Web3('https://sepolia.infura.io/v3/3dba672872174b9587837971698b5a4c');

// Variabel för konton
let accounts;

// Funktion för att kontrollera saldo
async function checkBalance() {
  // Kontrollera om Ethereum-metamask är definierat
  if (typeof ethereum !== 'undefined') {
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    // Hämta balansen
    const balance = await ethereum.request({
      method: 'eth_getBalance',
      params: [accountInput.value, 'latest']
    });

    // Konvertera balansen till läsbar form och uppdatera visningen
    const parsedBalanced = parseInt(balance) / Math.pow(10, 18);
    displayBalance.innerText = parsedBalanced;
  } else {
    console.log('No ethereum');
  }

  // Hämta senaste block och transaktioner vid saldokontroll
  const block = await rpc.eth.getBlock('latest');
  if (block == null) return;
  const transactions = block.transactions;
  if (transactions !== null) {
    displayHistory(transactions)
  }
}

// Funktion för att visa transaktionshistorik
async function displayHistory(transactions) {
  transactionList.innerHTML ='';
  const maxTransactionsToShow = 5; // Maximalt antal transaktioner att visa

  // Begränsa antalet transaktioner
  const limitedTransactions = transactions.slice(0, maxTransactionsToShow);

  // Hämta och visa varje transaktion
  for (let hash of limitedTransactions) {
    let trx = await rpc.eth.getTransaction(hash);
    createTransactionList(trx);
  }
}

// Skapa en tabell för transaktioner
const transactionTable = document.createElement('table');

// Skapa <thead> för tabellen
const tableHead = document.createElement('thead');
tableHead.innerHTML = `
  <tr>
    <th>Från</th>
    <th>Till</th>
    <th>ETH</th>
  </tr>
`;
transactionTable.appendChild(tableHead);

// Lägg till tabellen i dokumentet
document.body.appendChild(transactionTable);

// Funktion för att skapa transaktionsrader
function createTransactionList(transaction) {
  const transactionRow = document.createElement('tr');
  transactionRow.innerHTML = `
    <td>${transaction.from}</td>
    <td>${transaction.to}</td>
    <td>${rpc.utils.fromWei(transaction.value, 'ether')} ETH</td>
  `;
  transactionTable.appendChild(transactionRow);
}

// CSS-styling för tabellen
transactionTable.style.borderCollapse = 'collapse';
transactionTable.style.width = '100%';
tableHead.style.backgroundColor = '#f2f2f2';

// Eventhanterare för knappar
checkBalanceButton.addEventListener('click', checkBalance);
sendButton.addEventListener('click', sendFunds);

// Hämta antalet block vid sidans inläsning
getBlockCount();

// Funktion för att skicka transaktioner
async function sendFunds() {
  try {
    const amount = parseFloat(valueInput.value) * Math.pow(10, 18);
    let params = [{
      from: accountInput.value,
      to: toAccountInput.value,
      value: Number(amount).toString(16),
      gas: Number(21000).toString(16),
      gasPrice: Number(2500000).toString(16),
    }];

    // Skicka transaktion
    await ethereum.request({
      method: 'eth_sendTransaction',
      params: params,
    });
  } catch (error) {
    console.log(error);
  }
}

// Funktion för att hämta antalet block
async function getBlockCount() {
  try {
    const latestBlock = await ethereum.request({
      method: 'eth_blockNumber'
    });
    const blockCount = parseInt(latestBlock, 16); // Lägg till 1 för att räkna med block 0
    blockCountDisplay.innerText = blockCount;
  } catch (error) {
    console.log(error);
  }
}
