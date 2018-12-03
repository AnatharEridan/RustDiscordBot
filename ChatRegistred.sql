/*
Navicat MySQL Data Transfer

Source Server         : 123
Source Server Version : 50558
Source Host           : localhost:3306
Source Database       : DataBase

Target Server Type    : MYSQL
Target Server Version : 50558
File Encoding         : 65001

Date: 2018-12-03 21:12:32
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for ChatRegistred
-- ----------------------------
DROP TABLE IF EXISTS `ChatRegistred`;
CREATE TABLE `ChatRegistred` (
  `steamid` varchar(255) NOT NULL,
  `discordid` varchar(255) DEFAULT NULL,
  `timecode` varchar(255) DEFAULT NULL,
  `confirmed` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
SET FOREIGN_KEY_CHECKS=1;
