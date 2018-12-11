/*
Navicat MySQL Data Transfer

Source Server         : Mysql
Source Server Version : 50558
Source Host           : localhost:3306
Source Database       : DataBase

Target Server Type    : MYSQL
Target Server Version : 50558
File Encoding         : 65001

Date: 2018-12-11 21:59:36
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for ChatBonus
-- ----------------------------
DROP TABLE IF EXISTS `ChatBonus`;
CREATE TABLE `ChatBonus` (
  `steamid` varchar(255) DEFAULT NULL,
  `discordid` varchar(255) DEFAULT NULL,
  `gived` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
SET FOREIGN_KEY_CHECKS=1;
