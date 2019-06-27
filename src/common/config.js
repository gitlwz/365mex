/*
 * @Author: 刘文柱 
 * @Date: 2018-10-18 10:10:38 
 * @Last Modified by: 刘文柱
 * @Last Modified time: 2018-11-01 18:05:19
 */
import { language, Icon } from "quant-ui";
import React from 'react';
import Logo from '../assets/logo.png';
import LogoAndTitle from '../assets/logo-title.png';
import LoginLogo from '../assets/login-logo.png';
import LOGIN_BG from "../assets/background.png";
//中文配置
let zhConfig = {
    'TITLE': "365MEX",                        //标题
    "LOGO": Logo,                           //LOGO  32x32
    "LOGOANTTITLE": LogoAndTitle,            //LOGO带标题  height 小于 50  width 小于 220
    "LOGON_LOGO": LoginLogo,                 //登录页标题
    "LOGIN_BG": LOGIN_BG,                    //登陆页背景
    "privacy": "当前版本:0.125",              //关于
    "isTop": true,                               //导航栏是否在顶部
    "FOOTER": <span>Copyright <Icon type="copyright" /> 2019 365MEX</span>  //页脚
}

//英文配置
let enConfig = {
    'TITLE': "365MEX",                     //标题
    "LOGO": Logo,                           //LOGO  32x32
    "LOGOANTTITLE": LogoAndTitle,            //LOGO带标题
    "LOGON_LOGO": LoginLogo,                 //登录页标题
    "LOGIN_BG": LOGIN_BG,                    //登陆页背景
    "privacy": "当前版本:0.125",              //关于
    "isTop": true,   
    "FOOTER": <span>Copyright <Icon type="copyright" /> 2019 365MEX</span>  //页脚
}

let config = zhConfig;
if (language.getCurrentLanguage() === "en_US") {
    config = enConfig;
}
export default config;