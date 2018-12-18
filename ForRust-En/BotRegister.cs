using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Oxide.Core;
using Oxide.Core.Libraries;
using Oxide.Core.Libraries.Covalence;


namespace Oxide.Plugins {
	[Info("BotRegister", "Anathar", "0.2.1")]
	[Description("Register in bot")]
	public class BotRegister : RustPlugin {
		private System.Random random = new System.Random();
		private StoredData DataBase = new StoredData();

		private string AdminPrefix = "<color=red>[Administrator]</color>";
		private string ModerPrefix = "<color=green>[Moderator]</color>";
		private string VipPrefix = "<color=yellow>[Vip]</color>";
		private string PlayerPrefix = "<color=orange>[From Discord]</color>";
		private string ConsoleAdminPrefix = "[Administrator]";
		private string ConsoleModerPrefix = "[Moderator]";
		private string ConsoleVipPrefix = "[Vip]";
		private string ConsolePlayerPrefix = "[From Discord]";

		private string BotUrl = "http://ip:3000/rustrequest";
		private string BotBonusUrl = "http://ip:3000/rustbonus";
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

        private new void LoadDefaultMessages()
        {
            lang.RegisterMessages(new Dictionary<string, string>()
            {
                ["ApplicationReply"] = "<color=orange>[Discord]</color> You have successfully submitted an application for registration, please confirm the registration by writing a command in your private messages to our bot in the discord, Command: <color=green>!confirm {0}</color>",
	            ["ApplicationAlreadySent"] = "You have already submitted an application"
            }, this);
        }

		private static ConfigFile config;

		public class ConfigFile
		{
			public bool Bonus { get; set; } = true;
			[JsonProperty(PropertyName = "BonusItems")]
			[DefaultValue(null)]
			public Dictionary<string, object> BonusItems { get; set; } = new Dictionary<string, object>
			{
				{"rifle.ak", 1},
				{"ammo.rifle",200},
				{"supply.signal", 1}
			};
		}

		protected override void LoadDefaultConfig()
		{
			var config = new ConfigFile();
			Config.WriteObject(config);
		}

		protected override void SaveConfig() => Config.WriteObject(config);
		protected override void LoadConfig()
		{
			base.LoadConfig();
			try
			{
				config = Config.ReadObject<ConfigFile>();
				if (config == null)
					LoadDefaultConfig();
			}
			catch { LoadDefaultConfig(); }
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
			SaveConfig();
			SaveData();
		}

		private void OnPlayerInit(BasePlayer player)
		{
			if (!DataBase.PlayerInfo.ContainsKey(player.userID)) return;
			DataBase.PlayerInfo[player.userID].DisplayName = player.displayName;

		}

		private void OnServerInitialized() {
			LoadConfig();
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
				Reply(lang.GetMessage($"ApplicationAlreadySent",this,player.UserIDString), player);
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
					Reply(lang.GetMessage($"ApplicationReply",this,player.UserIDString).Replace("{0}", data.TimedCode.ToString()), player);
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
		[ConsoleCommand("disbonus")]
				private void DiscordBonus(ConsoleSystem.Arg arg) {
					var msg = arg.Args[0].Substring(0, 1);
					if (msg != "|") return;
					string DiscordJoin = string.Join(" ", arg.Args);
					string[] DBS = DiscordJoin.Split('|');
					const float timeout = 1000f;
					var headers = new Dictionary<string, string> {
						{"Authorization", "2423452"}
					};
					var findPlayer = (BasePlayer.FindByID(ulong.Parse(DBS[1])));
					if (findPlayer == null)
					{

						webrequest.Enqueue(BotBonusUrl,
							"Check=NotFind&Steamid="+DBS[1]+"&Discordid="+DBS[2],
							(code, response) => {},
							this,
							RequestMethod.POST,
							headers,
							timeout);
							return;
					}

					webrequest.Enqueue(BotBonusUrl,
						"Check=Gived&Steamid="+DBS[1]+"&Discordid="+DBS[2],
						(code, response) => {},
						this,
						RequestMethod.POST,
						headers,
						timeout);

					for (int i = 0; i < config.BonusItems.Count; i++)
					{
						if (Convert.ToInt32(config.BonusItems.ElementAt(i).Value) > 0)
						{
							Item gift = ItemManager.CreateByName(config.BonusItems.ElementAt(i).Key, Convert.ToInt32(config.BonusItems.ElementAt(i).Value));
							 findPlayer.GiveItem(gift);
						}
				}
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
				Puts(ConsoleAdminPrefix+" "+ name + ": " + DiscordChat[3]);
			}else if(DiscordChat[2] == "Moder"){
				Server.Broadcast(ModerPrefix +""+ name + ": " + DiscordChat[3], cont.Key);
				Puts(ConsoleModerPrefix+" "+ name + ": " + DiscordChat[3]);
			}else if(DiscordChat[2] == "Vip"){
				Server.Broadcast(VipPrefix +" "+ name + ": " + DiscordChat[3], cont.Key);
				Puts(ConsoleVipPrefix+" "+ name + ": " + DiscordChat[3]);
			}else if(DiscordChat[2] == "User"){
				Server.Broadcast(PlayerPrefix +" "+ name + ": " + DiscordChat[3], cont.Key);
				Puts(ConsolePlayerPrefix+" "+ name + ": " + DiscordChat[3]);
			}
		}
	}
}
