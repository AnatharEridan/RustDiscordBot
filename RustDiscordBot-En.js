const WebSocket = require('ws');
var Discord = require('discord.io');
const Sequelize = require('sequelize');
var bodyParser = require("body-parser");
var express = require('express');

var ExpressPort = 3000; //Web Server Port
var DiscordToken = ""; // Bot Discord Token
var serverID = ""; //ID Server discord
var AdminRole = ""; //ID Administrator role
var ModerRole = ""; //ID Moderator role
var VipRole = ""; //ID vip role
var ChatRole = ""; //ID chat role
var ChatChannel = ""; //ID chat channel
var RegisterTable = "ChatRegistred"; //registration tablename in Mysql
var BonusTable = "ChatBonus"; //bonus tablename in Mysql
var RconIP = ''; //rcon ip 
var RconPort = ''; //rcon port
var RconPassword = ''; //rcon password

var RoleNotice1 = ""; //ID role administartor for mentions when anyone say admin
var RoleNotice2 = ""; //ID also second role 
var ChatNoticeList = ['admin', 'adm', 'odmen',"odmin"];

const RCON_IDENTIFIER_CONSOLE_RANGE_MIN = 1337000000;
const RCON_IDENTIFIER_CONSOLE_RANGE_MAX = 1337999999;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const sequelize = new Sequelize({
  database: 'database',
  username: 'root',
  password: 'password',
  dialect: 'mysql',
  logging: false,
  operatorsAliases: false
});


const ChatDB = sequelize.define(RegisterTable, {
steamid: { type: Sequelize.STRING, primaryKey: true },
discordid: Sequelize.STRING,
timecode: Sequelize.STRING,
confirmed: Sequelize.STRING
}, {
  tableName: RegisterTable,
  timestamps: false
});

const BonusDB = sequelize.define(BonusTable, {
steamid: { type: Sequelize.STRING, primaryKey: true },
discordid: Sequelize.STRING,
gived: Sequelize.STRING,
}, {
  tableName: BonusTable,
  timestamps: false
});

const prefix = "!";
var bot = new Discord.Client({
    autorun: true,
    token: DiscordToken
});

bot.on('ready', function() {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

var RconConnect = function(){

  socket = new WebSocket('ws://'+RconIP+':'+RconPort+'/'+RconPassword+'');

 socket.on('error', (error) => {
   console.log("connected");
   });

   socket.on('close', (e) => {
     console.log('RCON: Disconnected');
       setTimeout(reconnect,1000*60);
   });

   socket.on('open', (e) => {
     console.log('RCON: Connected');
   });

   socket.on('message', (serializedData) => {
     const data = JSON.parse(serializedData);
      if (data.Type === 'Chat')
      {
        const message = JSON.parse(data.Message);
        console.log('RCON: '+message.Message);
        const regex = RegExp(ChatNoticeList.join('|'), 'gi');

          if (regex.test(message.Message)) {
            bot.sendMessage({
              to: ChatChannel,
              message: '<@&'+RoleNotice1+'> <@&'+RoleNotice2+'> '+message.Message+''
            });
          }else{
            bot.sendMessage({
              to: ChatChannel,
              message: ''+message.Message+''
          });
        }
      }
  });
}
RconConnect();
function reconnect() {
  Console.log(`RCON: Trying to reconnect`);
  setTimeout(() => {
    RconConnect();
  }, 1000 * 60 * 5);
}

bot.on('message', function(user, userID, channelID, message, event) {
if (channelID in bot.directMessages) {
var discordid
var args = message.substring(prefix.length).split(" ");
cmd = args[0];

    if(cmd === "confirm")
    {
      ChatDB.findAll({
            where: {timecode: args[1]},
            attributes: ['steamid', 'discordid', 'confirmed', 'timecode']
          }).then(CDB => {
            console.log(CDB.length);
            if(CDB.length===0){
                bot.sendMessage({
                to: userID,
                message: 'Sorry, but your application is not present, write in the game / disreg'
                });
            }else if(CDB[0].dataValues.confirmed=="true"){
              bot.sendMessage({
              to: userID,
              message: 'You are already registered'
              });

            }else if(CDB[0].dataValues.confirmed==="false"){
            var steamid = CDB[0].dataValues.steamid;
              ChatDB.update(
                 {
                   discordid: userID,
                   confirmed: 'true'
                 },{
                   where: {timecode: args[1]}}
                 );

              confirmregister(steamid+" "+userID+" true");
              bot.addToRole({"serverID":serverID,"userID":userID,"roleID":chatrole},function(err,response) {
                if (err) console.error(err); /* Failed to apply role */
              });
              bot.sendMessage({
              to: userID,
              message: 'You have successfully confirmed the registration, you have been granted a role with access to the chat channel'
              });

            }
          });
        }
    if(cmd === "GetBonus"){
      ChatDB.findAll({
            where: {discordid: userID},
            attributes: ['steamid', 'discordid', 'confirmed', 'timecode']
          }).then(CDB => {
      if(CDB.length===0){
        bot.sendMessage({
        to: userID,
        message: 'Sorry, but your application is not present, write in the game / disreg'
        });
      }else if(CDB[0].dataValues.confirmed=="false"){
          bot.sendMessage({
          to: userID,
          message: 'You have not confirmed your registration, write! !confirm and the number that was issued to you was in the game'
          });
      }else if(CDB[0].dataValues.confirmed=="true"){
              var steamid = CDB[0].steamid;
      var discordid = CDB[0].discordid;
          BonusDB.findAll({
                where: {discordid: userID},
                attributes: ['steamid', 'discordid', 'gived']
              }).then(BDB => {

        if(BDB.length===0){
          BonusDB.bulkCreate([{
            steamid: CDB[0].steamid,
            discordid: userID,
            gived: 'false'
          }]);
        SendBonus("|"+CDB[0].steamid+"|"+CDB[0].discordid+"|");
      }else if(BDB[0].dataValues.gived==="true"){
          bot.sendMessage({
            to: userID,
            message: 'You have already received a bonus'
          });
        }
      });
    }
  });
}
}else{
var AdminRol = bot.servers[serverID].members[userID].roles.includes(AdminRole);
var ModerRol = bot.servers[serverID].members[userID].roles.includes(ModerRole)
var VipRol = bot.servers[serverID].members[userID].roles.includes(VipRole);
var ChatRol = bot.servers[serverID].members[userID].roles.includes(ChatRole);
var Args = message.substring(prefix.length).split(" ");
var ChatArgs = message.substring(0,1);
var MuteArgs = message.substring(5,64567);
var name = bot.users[userID].username;
cmd = Args[0];

if(ChatArgs!=="!" && channelID===ChatChannel){

if(AdminRol===true){
ChatsendMessage("|" + userID + "|Admin|" + message + "|");
}
else if(ChatRol===true && ModerRol===true){
ChatsendMessage("|" + userID + "|Moder|" + message + "|");
}
else if(ChatRol===true && VipRol===true){
ChatsendMessage("|" + userID + "|Vip|" + message + "|");
}
else if(ChatRol===true){
ChatsendMessage("|" + userID + "|User|" + message + "|");
}
}
if(AdminRol===true || ModerRol===true)
{
  if(cmd === "mute" && channelID===ChatChannel){
  mute(MuteArgs);
  }
}
}
});

function ChatsendMessage(message) {
    const packet = JSON.stringify({
      Identifier: -1,
      Message: `dissay ${message}`,
      Name: 'WebRcon',
    });

    socket.send(packet);
}
function confirmregister(message) {
      const packet = JSON.stringify({
        Identifier: -1,
        Message: `disconfirm ${message}`,
        Name: 'WebRcon',
      });
      socket.send(packet);
}
function SendBonus(message) {
   const packet = JSON.stringify({
     Identifier: -1,
     Message: `disbonus ${message}`,
     Name: 'WebRcon',
   });
   socket.send(packet);
 }
function mute(message) {
   const packet = JSON.stringify({
     Identifier: -1,
     Message: `mute ${message}`,
     Name: 'WebRcon',
   });
   socket.send(packet);
 }

 app.post('/rustbonus', function (req, res) {
    var post = req.body;
    console.log(post);
    if(post.Check == "NotFind"){
      bot.sendMessage({
      to: post.Discordid,
      message: 'I did not find you in the game, you need to go to our server'
      });
    }
    if(post.Check == "Gived"){
      BonusDB.update(
        {gived: 'true'},
        {where: {steamid: post.Steamid}}
      );
      bot.sendMessage({
      to: post.Discordid,
      message: 'You have been given a bonus for registration in a discord'
      });

     }

 });

 app.post('/rustrequest', function (req, res) {
var post = req.body;
  if(post.Check == "DisReg")
  {
           ChatDB.bulkCreate([{
            steamid: post.Steamid,
            discordid: 0,
            timecode: post.TimeCode,
            confirmed: 'false'
          }]);
        res.send("Writed");
     }
 });

 app.listen(ExpressPort);
