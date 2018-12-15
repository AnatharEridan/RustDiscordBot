### Русский

**Внимание для этого плагина требуется VPS, либо Деплой на подобии Heroku или OpenShift, либо любая машина где можно поставить Nodejs. Так же для него необходима MySql база,можете найти на любом хостинге.**

Плагин писал для себя,что бы было удобно общаться с игроками не заходя в игру и решать их проблемы,ткк бот работает с чатом в обе стороны,но многие заинтересовались им и вот он тут.

**Системные требования**:
* **Node.js 8.6.0** на других весиях не тестировал
* **Mysql server**

**что умеет данный бот**:
* **Выводить игровой чат**,
* **Отправлять соабщения на сервер отправленные в тот же канал**,
* **Выдавать бонус за привязку аккаунта к дискорду**,
* **Выдавать мут (при установленном плагине BetterChatMute)**.

**Необходимые плагин npm**:
* **discord.io** - `npm install izy521/discord.io`
* **mysql** - `npm install mysql`
* **body-parser** - `npm install body-parser`
* **WebSocket** - `npm install ws`
* **express** - `npm install express`

Так же для бота необходимо расставить все ID ролей и прописать все настройки в RustDiscordBot.js

**Внимание: перед использованием чата,администрации и модераторам необходимо пройти привязку командой /disreg.**

### English

 
**Attention for this plugin requires VPS, or Deploy on the similarity of Heroku or OpenShift, or any machine where you can install Nodejs. You also need MySql database for it, you can find it on any hosting.**
 
The plugin was written for myself that it would be convenient to communicate with the players without going into the game and solving their problems, as the bot works with chat in both directions, but many are interested in it and here it is.
 
**System requirements**: 
* **Node.js 8.6.0 ** hasn't been tested on other versions**
* **Mysql server**
 
**what this bot can do**: 
* **Display game chat**, 
* **Send messages to the server sent to the same channel**, 
* **Send a bonus for linking an account to discord**, 
* **Mute (with the BetterChatMute plugin installed)** 
 
**Required npm plugins**: 
* **discord.io** - `npm install izy521 / discord.io` 
* **mysql** - `npm install mysql` 
* **body-parser** - `npm install body-parser` 
* **WebSocket** - `npm install ws` 
* **express** - `npm install express`
 
Also for the bot you need to place all the roles IDs and register all the settings in RustDiscordBot.js 

**Attention: before using chat, administration and moderators need to link with the command /disreg.**
