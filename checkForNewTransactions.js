const { request } = require("undici")
const config = require("./config");
const db = require("./db")

async function getLastTransaction(address) 
{
  const url = `https://api.trongrid.io/v1/accounts/${address}/transactions/trc20?limit=1&contract_address=${config.contract_address}`
  const { statusCode, body } = await request(url);
  if (statusCode != 200) 
  {
    return { transaction_id: "" };
  }
  const json = await body.json();
  return json.data[0];
}

async function checkForNewTransaction(addressesAndNames, address, name, bot) 
{
  try 
  {
      const lastTransaction = await getLastTransaction(address)
      const savedLastTransactionId = await db.getLastTransactionId(address) 
      if (lastTransaction.transaction_id && (lastTransaction.transaction_id != savedLastTransactionId) && config.sendNotificationsTo)
      {
        const addressFrom = addressesAndNames.find(({ address }) => address == lastTransaction.from);
        const addressTo = addressesAndNames.find(({ address }) => address == lastTransaction.to);

        if (!(addressFrom && addressTo))
        {
          return;
        }

        const symbol = lastTransaction.token_info.symbol;
        const message = `${addressTo.name || addressTo.address} received ${ (lastTransaction.value / 1_000_000).toLocaleString('en-US') } ${symbol} from ${addressFrom.name || addressFrom.address}`;
        if (config.sendNotificationsTo) 
        { 
          await bot.telegram.sendMessage(config.sendNotificationsTo, message);
        }     
        db.updateLastTransactionId(lastTransaction.from, lastTransaction.transaction_id);
        db.updateLastTransactionId(lastTransaction.to, lastTransaction.transaction_id);
      }
  }
  catch(err) 
  {
    console.log(err)
  }
}

module.exports.getLastTransaction = getLastTransaction;

module.exports.checkForNewTransactions = async (bot) => 
{
  const addressesAndNames = await db.getAllAddressesAndNames();
  await Promise.all(addressesAndNames.map(async ({ address, name }) => {
    checkForNewTransaction(addressesAndNames, address, name, bot);
  }));
} 