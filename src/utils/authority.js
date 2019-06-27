/*
 * @Author: 刘文柱 
 * @Date: 2018-10-18 10:08:38 
 * @Last Modified by: 刘文柱
 * @Last Modified time: 2018-10-18 13:08:43
 */
import { utils } from "quant-ui";
import { encrypt,decrypt } from "./privacy";
const { getCookie ,setCookie,removeCookie} = utils;
//设置权限
export function getAuthority() {
  return localStorage.getItem('antd-pro-authority') || 'guest';
}
export function setAuthority(authority) {
  return localStorage.setItem('antd-pro-authority', authority);
}

//设置密码
export function setUserUserlogin(userlogin) {
    setCookie('quant-token',encrypt(JSON.stringify(userlogin),"518de8d99fd5d9b104360ab3"),7)
}
export function getUserUserlogin() {
    let data = undefined
    let cookiedata = getCookie('quant-token')
    try {
        data = cookiedata&&JSON.parse(decrypt(cookiedata,"518de8d99fd5d9b104360ab3"));
    } catch (error) {
        data = undefined;
    }
    return data
}
//设置用户信息
export function setUserUserInfo(userlogin) {
    localStorage.setItem('qtCoin_LoginID', encrypt(JSON.stringify(userlogin),"518de8d99fd5d9b104360ab3"));
}
export function getUserUserInfo() {
    let data = undefined
    let cookiedata = localStorage.getItem('qtCoin_LoginID');
    try {
        data = cookiedata&&JSON.parse(decrypt(cookiedata,"518de8d99fd5d9b104360ab3"));
    } catch (error) {
        data = undefined;
    }
    return data
}
export function removeUserUserlogin() {
    removeCookie("quant-token")
}
//end