using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Oxide.Core;
using Oxide.Core.Libraries;
using Oxide.Core.Libraries.Covalence;


namespace Oxide.Plugins {
	[Info("BotRegister", "Anathar", "0.1.1")]
	[Description("Register in bot")]
	public class BotRegister : RustPlugin {
		private System.Random random = new System.Random();
		private StoredData DataBase = new StoredData();

		private string AdminPrefix = "<color=red>[Администратор]</color>";
		private string ModerPrefix = "<color=green>[Модератор]</color>";
		private string VipPrefix = "<color=yellow>[Vip]</color>";
		private string PlayerPrefix = "<color=orange>[Из Discord'a]</color>";

		private string BotUrl = "http://ip:3000/rustrequest";
		public class StoredData {
			public Dictionary<ulong, PlayerInfo> PlayerInfo = new Dictionary<ulong, PlayerInfo>();
		}

		public class PlayerInfo {
			public string DisplayName;
			public ulong DiscordID;
			public int TimedCode;
			public bool Confirm;
			public PlayerInfo() { }
		}

		private void SaveData() => Interface.Oxide.DataFileSystem.WriteObject(Name, DataBase);

		private void LoadData() {
			try {
				DataBase = Interface.GetMod().DataFileSystem.ReadObject<StoredData>(Name);
			} catch (Exception e) {
				DataBase = new StoredData();
			}
		}

		private void Unload() {
			SaveData();
		}
		
		private void OnPlayerInit(BasePlayer player)
		{
			if (!DataBase.PlayerInfo.ContainsKey(player.userID)) return;
			DataBase.PlayerInfo[player.userID].DisplayName = player.displayName;

		}

		private void OnServerInitialized() {
			LoadData();
		}

		private static void Reply(string Message, BasePlayer player) {
			player.ChatMessage(Message);
		}
		
		public string SimpleColorFormat(string text, bool removeTags = false)
		{
			/*  Simple Color Format ( v3.0 ) by SkinN - Modified by LaserHydra
			    Formats simple color tags to game dependant color codes */

			// All patterns
			Regex end = new Regex(@"\<(end?)\>"); // End tags
			Regex clr = new Regex(@"\<(\w+?)\>"); // Names
			Regex hex = new Regex(@"\<#(\w+?)\>"); // Hex codes

			// Replace tags
			text = end.Replace(text, "[/#]");
			text = clr.Replace(text, "[#$1]");
			text = hex.Replace(text, "[#$1]");

			return removeTags ? Formatter.ToPlaintext(text) : covalence.FormatText(text);
		}

		[ChatCommand("disreg")]
		private void DiscordRegister(BasePlayer player, string command, string[] args) {
			if (DataBase.PlayerInfo.ContainsKey(player.userID)) {
				Reply("Вы уже подали заявку", player);
				return;
			}

			const float timeout = 1000f;
			var headers = new Dictionary<string, string> {
				{"Authorization", "2423452"}
			};
			
			var data = new PlayerInfo {
				DisplayName = player.displayName,
				DiscordID = 0,
				TimedCode = random.Next(1, 9999999),
				Confirm = false
			};
			
			DataBase.PlayerInfo.Add(Convert.ToUInt64(player.userID), data);
		
			webrequest.Enqueue(BotUrl,
				"Check=DisReg&Steamid="+player.UserIDString+"&TimeCode="+data.TimedCode,
				(code, response) => {
					Puts(response);

					if (response != "Writed") return;

					SaveData();
					Reply("<color=orange>[Discord]</color> Вы успешно подали заявку на регистрацию, пожалуйста подтвердите регистрацию написав в личные сообщения нашему боту в дискорде команду <color=green>!confirm "+ data.TimedCode+"</color>", player);
				},
				this,
				RequestMethod.POST,
				headers,
				timeout);
			
		}

		[ConsoleCommand("disconfirm")]
		private void DiscordConfirm(ConsoleSystem.Arg arg) {
			if (!DataBase.PlayerInfo.ContainsKey(Convert.ToUInt64(arg.Args[0]))) return;

			DataBase.PlayerInfo[ulong.Parse(arg.Args[0])].DiscordID = ulong.Parse(arg.Args[1]);
			DataBase.PlayerInfo[ulong.Parse(arg.Args[0])].Confirm = bool.Parse(arg.Args[2]);
			SaveData();
		}

		[ConsoleCommand("dissay")]
		private void DiscordSay(ConsoleSystem.Arg arg)
		{
			var msg = arg.Args[0].Substring(0, 1);
			if (msg != "|") return;
			string DiscordJoin = string.Join(" ", arg.Args);
			string[] DiscordChat = DiscordJoin.Split('|');
			var cont = DataBase.PlayerInfo.First(pair => pair.Value.DiscordID == ulong.Parse(DiscordChat[1]));
			if (cont.Value == null) return;
			var name = DataBase.PlayerInfo[cont.Key].DisplayName;
			if(DiscordChat[2] == "Admin"){
				Server.Broadcast(AdminPrefix +" "+ name + ": " + DiscordChat[3], cont.Key);
				Puts("[Модератор] "+ name + ": " + DiscordChat[3]);
			}else if(DiscordChat[2] == "Moder"){
				Server.Broadcast(ModerPrefix +""+ name + ": " + DiscordChat[3], cont.Key);
				Puts("[Модератор] "+ name + ": " + DiscordChat[3]);
			}else if(DiscordChat[2] == "Vip"){
				Server.Broadcast(VipPrefix +" "+ name + ": " + DiscordChat[3], cont.Key);
				Puts("[Vip] "+ name + ": " + DiscordChat[3]);
			}else if(DiscordChat[2] == "User"){
				Server.Broadcast(PlayerPrefix +" "+ name + ": " + DiscordChat[3], cont.Key);
				Puts("[Discord] "+ name + ": " + DiscordChat[3]);
			}
		}
	}
}