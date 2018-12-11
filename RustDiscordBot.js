const WebSocket = require('ws');
var Discord = require('discord.io');
var mysql = require('mysql');
var bodyParser = require("body-parser");
var express = require('express');

var ExpressPort = 3000; //Порт Web Сервера
var DiscordToken = ""; // Токен Discord Бота
var serverID = ""; //ID Дискорд сервера
var AdminRole = ""; //ID роли Администратора
var ModerRole = ""; //ID роли Модератора
var VipRole = ""; //ID роли Випа
var ChatRole = ""; //ID Роли для доступа к чату
var ChatChannel = ""; //ID Канала где будет чат
var RegisterTable = ""; //Название таблицы в базе Mysql
var BonusTable = ""; //Название таблицы в базе Mysql
var RconIP = ''; //Тут и так понятно
var RconPort = ''; //Тут и так понятно
var RconPassword = ''; //Тут и так понятно

var RoleNotice1 = ""; //ID роли упоминания если замечено одно из слов в соабщении представленых ниже
var RoleNotice2 = ""; //ID 2ой роли упоменания
var ChatNoticeList = ['админ', 'адм', 'одмин', 'admin', 'adm'];

const RCON_IDENTIFIER_CONSOLE_RANGE_MIN = 1337000000;
const RCON_IDENTIFIER_CONSOLE_RANGE_MAX = 1337999999;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'DataBase'
});
connection.connect();
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
			var sql = "SELECT steamid,timecode,confirmed FROM ?? WHERE timecode = ?";
			var query = connection.query(sql, [RegisterTable, args[1]], function(err, result) {
				var steamid = result[0].steamid;
				if(result.length!==0 && result[0].confirmed==="false"){
					var sql2 = "UPDATE ?? SET `discordid` =?,`confirmed` =? WHERE `timecode` = ?";
					var query2 = connection.query(sql2, [RegisterTable, userID,"true",args[1]], function(err, result) {

					confirmregister(steamid+" "+userID+" true");
					bot.addToRole({"serverID":serverID,"userID":userID,"roleID":ChatRole},function(err,response) {
						if (err) console.error(err);
					});
					bot.sendMessage({
					to: userID,
					message: 'Вы успешно подтвердили регистрацию,вам выдана роль с доступом к чат серверу'
					});
						});
				}
				if(result[0].confirmed=="true"){
					bot.sendMessage({
					to: userID,
					message: 'Вы уже зарегистрированы'
					});
				}
				if(result.length===0){
					bot.sendMessage({
					to: userID,
					message: 'Извините но вашей заявки нету,напишите в игре /disreg'
					});
				}
			});

		}
    if(cmd === "GetBonus"){
    var sql = "SELECT steamid,discordid,confirmed FROM ?? WHERE discordid = ?";
    var query = connection.query(sql, [RegisterTable, userID], function(err, result) {
      var steamid = result[0].steamid;
      var discordid = result[0].discordid;
      if(result[0].confirmed=="true"){
        var sql3 = "SELECT steamid,discordid,gived FROM ?? WHERE discordid = ?";
        var query3 = connection.query(sql3, [BonusTable, userID], function(err, result3) {
        if(result3.length===0){
        var sql2 = "INSERT INTO ?? SET `steamid` = ?, `discordid` = ?, `gived` = ?";
      var query2 = connection.query(sql2, [BonusTable, steamid, discordid, "false"], function(err, result2) {
        SendBonus("|"+steamid+"|"+discordid+"|");
      });
    }else if(result3[0].gived==="true"){
      bot.sendMessage({
      to: userID,
      message: 'Вы уже получали бонус'
      });
    }
      });
      }
      if(result[0].confirmed=="false"){
        bot.sendMessage({
        to: userID,
        message: 'Вы не подтвердили вашу регистраци напишите !confirm и номер который вам выдан был в игре'
        });
      }
      if(result.length===0){
        bot.sendMessage({
        to: userID,
        message: 'Извините но вы не зарегистрированы,напишите в игре /disreg'
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
   socketpve.send(packet);
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
       message: 'я не нашел вас в игре,вам нужно зайти на наш сервер'
       });
     }
     if(post.Check == "Gived"){
       var sql2 = "UPDATE ?? SET `gived` =? WHERE `steamid` = ?";
       var query2 = connection.query(sql2, [BonusTable, "true",post.Steamid], function(err, result) {
       console.log(err);
       bot.sendMessage({
       to: post.Discordid,
       message: 'Вам выдан бонус за регистрацию в дискорде'
       });

       });

     }

 });

 app.post('/rustrequest', function (req, res) {
var post = req.body;
  if(post.Check == "DisReg")
  {
 	  var sql = "INSERT INTO ?? SET `steamid` = ?, `discordid` = ?, `timecode` = ?, `confirmed` = ?";
    var query = connection.query(sql,[RegisterTable, post.Steamid, "0", post.TimeCode, "false"], function(err, result) {
      console.log(err);
      console.log(result);
      if(err==null)
      {
 	      res.send("Writed");
 	    }
      });
     }
 });

 app.listen(ExpressPort);
