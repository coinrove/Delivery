const { getLastTransaction } = require("./checkForNewTransactions");
const db = require("./db")
const config = require("./config");

module.exports.commands = 
[
  { command: "add", description: "[address] [name] add new address to receive notifiaction from. You can add multiple addreses at one time" },
  { command: "remove", description: "[address] remove new address to receive notifiaction from. You can remove multiple addreses at one time" },
  { command: "removeall", description: "remove all addresses" },
  { command: "list", description: "Get list of addresses and their names" },
  { command: "notify", description: "Call in chat to make it notifications target" },
  { command: "setinterval", description: "[interval] set checks interval (seconds)" },
  { command: "setcontractaddress", description: "[contract address] set contract address. You can find it here: https://tronscan.org/#/tokens/list. Default: USDT" },
  { command: "setnotificationstarget", description: "[chat_id/channel_name] set notifications target." },
  { command: "getinterval", description: "[get checks interval (seconds)" },
  { command: "getcontractaddress", description: "get contract address" },
  { command: "getnotificationstarget", description: "get notifications target." },
]

let startOutput = `Hello!\n Here is commands list:\n`;
module.exports.commands.forEach((botCommand) => 
{
  startOutput += `/${botCommand.command} – ${botCommand.description}\n`;
})

module.exports.start = (ctx) => 
{
  ctx.reply(startOutput);
}

module.exports.addAddresses = async (ctx) =>
{
  try 
  {
    const args = ctx.message.argv.slice(1);

    if (args.length < 1) 
    {
      ctx.reply("No arguments");
      return;
    }
    for (let i = 0; i + 1 <= args.length; i += 2) 
    {
      const address = args[i];
      const name = args[i + 1];
      if (!(await db.isAddressAdded(args[i]))) 
      {
        await db.addAddress(address, name, (await getLastTransaction(address)).transaction_id);
        ctx.reply(`${address} successfully added`);
      }
      else 
      {
        ctx.reply(`${address} – notifications enabled`);
      }
    }
  }
  catch(err) 
  {
    console.log(err);
    ctx.reply("Something went wrong");
  }
}

module.exports.removeAddresses = async (ctx) =>
{
  const args = ctx.message.argv.slice(1);
  
  if(args.length < 1) 
  {
    ctx.reply("No arguments");
    return;
  }

  try 
  {
    for(let i = 0; i < args.length; i++) 
    {
      if((await db.removeAddress(args[i])).rowCount || (await db.removeAddressByName(args[i])).rowCount) 
      {
        ctx.reply(`${args[i]} successfully removed`);
      }
      else 
      {
        ctx.reply(`${args[i]} is not there`);
      }
    }
  }
  catch(err) 
  {
    console.log(err);
    ctx.reply("Something went wrong");
  }
}

module.exports.removeAllAddresses = async (ctx) =>
{
  try 
  {
    await db.removeAllAddresses();
    console.log('All addresses successfully removed');
  }
  catch(err) 
  {
    console.log(err);
    ctx.reply("Something went wrong");
  }
}

module.exports.listAddresses = async (ctx) => 
{
  try 
  {
    const addresses = await db.getAddressesAndNames();

    if (addresses.length < 1) 
    {
      ctx.reply("No addresses specified");
      return;
    }

    let reply = 'Addresses:\n';

    for (let { address, name } of addresses) 
    {
      reply += address;
      if (name) 
      {
        reply += ` – ${name}`;
      }
      reply += '\n';
    }
    ctx.reply(reply);
  }
  catch(err)
  {
    console.log(err)
  }
}

module.exports.makeChatTarget = (ctx) => 
{
  config.sendNotificationsTo = ctx.from.id;
}

module.exports.setCheckEvery = (ctx) => 
{
  const [interval] = ctx.message.argv.slice(1);

  if (!interval) 
  {
    ctx.reply("No arguments");
    return;
  }
  let parsedInterval = parseFloat(interval);
  if (!isNan(parsedInterval)) 
  {
    config.check_every = parsedInterval;
  } else 
  {
    ctx.reply("Not a number");
  }
}

module.exports.setContractAddress = (ctx) => 
{
  const [address] = ctx.message.argv.slice(1);

  if (!address) 
  {
    ctx.reply("No arguments");
    return;
  }

  config.contract_address = address;
}

module.exports.setNotificationTarget = (ctx) => 
{
  try 
  {
    const [notificationTarget] = ctx.message.argv.slice(1);

    if (!notificationTarget)
    {
      config.sendNotificationsTo = null;
      return;
    }

    if (notificationTarget == "me") 
    {
      config.sendNotificationsTo = ctx.from.id;
    } else 
    {
      config.sendNotificationsTo = notificationTarget;
    }
  }
  catch(err) 
  {
    console.log(err);
  }
}

module.exports.getCheckEvery = (ctx) => 
{
  ctx.reply(`${config.check_every} second(s)`);
}

module.exports.getContractAddress = (ctx) => 
{
  ctx.reply(config.contract_address);
}

module.exports.getNotificationTarget = (ctx) => 
{
  ctx.reply(config.sendNotificationsTo || "Notifications target is not set");
}