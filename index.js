const { Telegraf } = require("telegraf");
const { addAddresses, removeAddresses, removeAllAddresses, listAddresses, makeChatTarget, setCheckEvery, setContractAddress, setNotificationTarget, getCheckEvery, getContractAddress, getNotificationTarget, start, commands } = require("./commandsHandlers");
const { checkForNewTransactions } = require("./checkForNewTransactions");
const saveConfigBeforeExit = require("./saveConfigBeforeExit");
const config = require("./config");

const bot = new Telegraf(config.bot_token);

bot.use(async (ctx, next) => 
{
  try 
  {
    if(ctx.message && ctx.message.entities && ctx.message.text && ctx.message.entities.findIndex((entity) => entity.type == "bot_command") != -1 )
    {
      ctx.message.argv = ctx.message.text.split(/\s+/);
    };
  }
  catch(err) 
  {
    console.log(err);
  }
  await next();
})

bot.telegram.setMyCommands(commands)

bot.start(start)

bot.command("add", addAddresses);

bot.command("remove", removeAddresses);
bot.command("removeall", removeAllAddresses);

bot.command("list", listAddresses);

bot.command("notify", makeChatTarget);

bot.command("setinterval", setCheckEvery)
bot.command("setcontractaddress", setContractAddress)
bot.command("setnotificationstarget", setNotificationTarget)

bot.command("getinterval", getCheckEvery);
bot.command("getcontractaddress", getContractAddress);
bot.command("getnotificationstarget", getNotificationTarget)

bot.on("message", (ctx) => 
{
  ctx.reply("Unexpected message");
})

bot.launch();

setInterval(() => { 
  checkForNewTransactions(bot) 
}, config.check_every * 1000);

saveConfigBeforeExit();