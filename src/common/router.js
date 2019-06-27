/*
 * @Author: 刘文柱 
 * @Date: 2018-10-18 10:15:16 
 * @Last Modified by: 刘文柱
 * @Last Modified time: 2018-11-15 18:12:35
 */
import React, { createElement } from 'react';
import { Spin } from 'quant-ui';
import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { getMenuData } from './menu';

let routerDataCache;

const getRouterDataCache = app => {
    if (!routerDataCache) {
        routerDataCache = getRouterData(app);
    }
    return routerDataCache;
};

const modelNotExisted = (app, model) =>
    // eslint-disable-next-line
    !app._models.some(({ namespace }) => {
        return namespace === model.substring(model.lastIndexOf('/') + 1);
    });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
    // register models
    models.forEach(model => {
        if (modelNotExisted(app, model)) {
            // eslint-disable-next-line
            app.model(require(`../models/${model}`).default);
        }
    });

    // () => require('module')
    // transformed by babel-plugin-dynamic-import-node-sync
    if (component.toString().indexOf('.then(') < 0) {
        return props => {
            return createElement(component().default, {
                ...props,
                routerData: getRouterDataCache(app),
            });
        };
    }
    // () => import('module')
    return Loadable({
        loader: () => {
            return component().then(raw => {
                const Component = raw.default || raw;
                return props =>
                    createElement(Component, {
                        ...props,
                        routerData: getRouterDataCache(app),
                    });
            });
        },
        loading: ({ error, pastDelay }) => {
            if (pastDelay) {
                return <Spin size="large" className="global-spin" />;
            } else {
                return null;
            }
        },
    });
};

function getFlatMenuData(menus) {
    let keys = {};
    menus.forEach(item => {
        if (item.children) {
            keys[item.path] = { ...item };
            keys = { ...keys, ...getFlatMenuData(item.children) };
        } else {
            keys[item.path] = { ...item };
        }
    });
    return keys;
}

function findMenuKey(menuData, path) {
    const menuKey = Object.keys(menuData).find(key => pathToRegexp(path).test(key));
    if (menuKey == null) {
        if (path === '/') {
            return null;
        }
        const lastIdx = path.lastIndexOf('/');
        if (lastIdx < 0) {
            return null;
        }
        if (lastIdx === 0) {
            return findMenuKey(menuData, '/');
        }
        // 如果没有，使用上一层的配置
        return findMenuKey(menuData, path.substr(0, lastIdx));
    }
    return menuKey;
}

export const getRouterData = app => {
    const routerConfig = {
        '/': {
            component: dynamicWrapper(app, ['login','accountInfo'], () => import('../layouts/BasicLayout')),
        },
        '/home': {
            component: dynamicWrapper(app, ["instrument", "login"], () => import('../routes/home')),
        },
        '/transaction/:symbol': {
            component: dynamicWrapper(app, ["recentTrade","instrument","orderList","orderCommit","margin", "login", 'register'], () => import('../routes/transaction')),
        },
        '/account': {
            component: dynamicWrapper(app, ["accountInfo","tradeHistory","margin","instrument"], () => import('../routes/account/index.js')),
        },
        '/account/account-capital': {
            component: dynamicWrapper(app, ["accountInfo","instrument"], () => import('../routes/account/account/capital')),
        },
        '/account/account-iomanage': {
            component: dynamicWrapper(app, ["accountInfo"], () => import('../routes/account/account/iomanage')),
        },
        '/account/account-iosearch': {
            component: dynamicWrapper(app, ["accountInfo"], () => import('../routes/account/account/iosearch')),
        },
        '/account/trade-his': {
            component: dynamicWrapper(app, ["accountInfo","tradeHistory","margin"], () => import('../routes/account/trade/his')),
        },
        '/account/trade-order': {
            component: dynamicWrapper(app, ["accountInfo"], () => import('../routes/account/trade/order')),
        },
        '/account/personal-safety': {
            component: dynamicWrapper(app, ["safeSetting", "accountInfo", "login"], () => import('../routes/account/personal/safety')),
        },
        '/account/personal-noties': {
            component: dynamicWrapper(app, ["accountInfo"], () => import('../routes/account/personal/noties')),
        },
        '/account/personal-advice': {
            component: dynamicWrapper(app, ["accountInfo", "margin"], () => import('../routes/account/personal/advice')),
        },
        '/account/personal-activelog': {
            component: dynamicWrapper(app, ["accountInfo"], () => import('../routes/account/personal/activelog')),
        },
        '/account/personal-apiSecret': {
            component: dynamicWrapper(app, ["accountInfo"], () => import('../routes/account/personal/apiSecret')),
        },
        '/helpcenter': {
            component: dynamicWrapper(app, [], () => import('../routes/helpcenter')),
        },


        '/exception/403': {
            component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
        },
        '/exception/404': {
            component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
        },
        '/exception/500': {
            component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
        },

        '/user': {
            component: dynamicWrapper(app, [], () => import('../layouts/BasicLayout')),
        },
        '/user/login': {
            component: dynamicWrapper(app, ['login','register'], () => import('../routes/User/Login')),
        },
        '/user/register': {
            component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
        },
        '/user/register/:symbol': {
            component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
        },
        '/user/forget': {
            component: dynamicWrapper(app, ['register'], () => import('../routes/User/ForgetPsw')),
        }

    };
    // Get name from ./menu.js or just set it in the router data.
    const menuData = getFlatMenuData(getMenuData());

    // Route configuration data
    // eg. {name,authority ...routerConfig }
    const routerData = {};
    // The route matches the menu
    Object.keys(routerConfig).forEach(path => {
        // Regular match item name
        // eg.  router /user/:id === /user/chen
        let menuKey = Object.keys(menuData).find(key => pathToRegexp(path).test(`${key}`));
        const inherited = menuKey == null;
        if (menuKey == null) {
            menuKey = findMenuKey(menuData, path);
        }
        let menuItem = {};
        // If menuKey is not empty
        if (menuKey) {
            menuItem = menuData[menuKey];
        }
        let router = routerConfig[path];
        // If you need to configure complex parameter routing,
        // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
        // eg . /list/:type/user/info/:id
        router = {
            ...router,
            name: router.name || menuItem.name,
            authority: router.authority || menuItem.authority,
            hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
            inherited,
        };
        routerData[path] = router;
    });
    return routerData;
};
