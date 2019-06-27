/*
 * @Author: 刘文柱 
 * @Date: 2018-10-18 10:10:52 
 * @Last Modified by: 刘文柱
 * @Last Modified time: 2018-11-15 18:12:18
 */
import { isUrl } from '../utils/utils';
import { language } from "quant-ui";
let $ = language.getLanguageData;
const menuData = [
    {
        name: $('首页'),
        // icon: 'home',
        path: '/',

    },
    {
        name: $('永续合约'),
        // icon: 'dollar',
        authority: ['guest','admin'],
        path: 'transaction/XBTUSD',

    },
    {
        name: $('账户信息'),
        // icon: 'team',
        path: 'account',
        authority: ['admin'],

    },
    {
        name: $('帮助中心'),
        // icon: 'issues-close',
        path: 'helpcenter',

    },
    
    // {
    //     name: '账户',
    //     icon: 'user',
    //     path: 'user',
    //     authority: ['guest'],
    //     children: [
    //         {
    //             name: '登录',
    //             path: 'login',
    //         },
    //         {
    //             name: '注册',
    //             path: 'register',
    //         }
    //     ],
    // },
];

function formatter(data, parentPath = '/', parentAuthority) {
    return data.map(item => {
        let { path } = item;
        if (!isUrl(path)) {
            path = parentPath + item.path;
        }
        const result = {
            ...item,
            path,
            authority: item.authority || parentAuthority,
        };
        if (item.children) {
            result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
        }
        return result;
    });
}

export const getMenuData = () => formatter(menuData);
