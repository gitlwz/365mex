import React, { Component } from 'react';
import { Layout, Menu, Icon, language, Alert, webSocket, message } from 'quant-ui';
import { Route, Switch, routerRedux } from 'dva/router';
import "./index.less";
import { connect } from 'dva';
import { getRoutes, getAuthKeyExpires } from '@/utils/utils';
import throttle from "lodash/throttle";
let { getLanguageData } = language;
let $ = getLanguageData;
const { SubMenu } = Menu;
const { Content, Sider, Footer } = Layout;
let setinterTime = null;
let page = null;
class Index extends Component {
    constructor(props) {
        super(props);
        this.firstShow = true;
        this.ws = null;
        page = this;
        this.instrumentData = [];//所有合约信息
        this.instrument = {};//当前合约
        this.instrumentArr = {};//合约symbol对应index
    }
    instrumentUpdate = (data) => {
        let instrumentData = this.instrumentData;
        let index = this.instrumentArr[data.symbol];
        if (!!instrumentData) {
            instrumentData[index] = { ...instrumentData[index], ...data };
            this.instrumentData = instrumentData;
        }
    }
    throttleInstrument = throttle((instrumentData) => {
        const { dispatch } = this.props;
        dispatch({
            type: "instrument/instrumentupdate",
            payload: {
                dataSource: instrumentData,
            }
        })
    }, 250);
    componentWillMount = () =>{
        const { dispatch, symbolCurrent } = this.props;
        dispatch({
            type: "accountInfo/findUserInfo",
        });
        let symbol = symbolCurrent || "XBTUSD";
        if(this.firstShow){
            const { dispatch } = this.props;
            dispatch({
                type: "login/getPublicKey",
            })
            dispatch({
                type: "login/getUserSysApiKey",
            })
            this.firstShow = false;
        }
        if (process.env.NODE_ENV === 'development') {//开发环境
            this.ws = new webSocket("ws://192.168.100.113:9988", null, { breatheParams: "ping", reconnectInterval: 10000, timeoutInterval: 10000, debugger: false });
        } else {//部署环境
            // this.ws = new webSocket("ws://192.168.100.113:9988", null, { breatheParams: "ping", reconnectInterval: 600000, timeoutInterval: 10000, debugger: false });
            var ws_url = "ws://192.168.100.113:9988"
            if (document.location.host.startsWith("192.168.100.113")) {
                ws_url = "ws://192.168.100.113:9988"
            } else {
                var ws_proto = document.location.protocol === "https:" ? "wss:" : "ws:"
                ws_url = ws_proto + "//" + document.location.host + "/realtime"
            }
            this.ws = new webSocket(ws_url, null, { breatheParams: "ping", reconnectInterval: 10000, timeoutInterval: 10000, debugger: false });
        }
        this.ws.onopen = (evt) => {
            this.firstRender = true;
            this.webSocketStatus = true;
            // dispatch({
            //     type: "instrument/save",
            //     payload: { webSocket: this.ws }
            // })
            if (setinterTime === null) {
                setinterTime = setInterval(() => {
                    let { API_KEY, expires, signature } = getAuthKeyExpires();
                    if (API_KEY) {
                        this.ws.send(JSON.stringify({ op: "authKeyExpires", args: [API_KEY, expires, signature] }));
                        this.ws.send(JSON.stringify({
                            op: "subscribe", args: [
                                "margin",
                                "position",
                                "instrument:" + symbol,
                            ]
                        }));
                        clearInterval(setinterTime);
                        setinterTime = null;
                    }
                }, 200);
            }
        };
        this.ws.onmessage = ({ data }) => {
            if (data !== "pong") {
                let res = JSON.parse(data)
                if (res.table === "margin") {
                    if (res.action === "partial") {
                        if (Array.isArray(res.data)) {
                            dispatch({
                                type: "margin/save",
                                payload: {
                                    dataSource: res.data[0] || {}
                                }
                            })
                        } else {
                            message.error($('margin推送数据发送错误'));
                        }
                    }
                    if (res.action === "update") {
                        if (Array.isArray(res.data)) {
                            dispatch({
                                type: "margin/update",
                                payload: {
                                    dataSource: res.data[0]
                                }
                            })
                        } else {
                            message.error($('margin推送数据发送错误'));
                        }
                    }
                }else if (res.table === "position") {
                    if (res.action === "partial") {
                        if (Array.isArray(res.data)) {
                            dispatch({
                                type: "orderList/save",
                                payload: {
                                    positionHavaListData: res.data
                                }
                            })
                            // page.positionDataSave = res.data;
                            // page.updatePositionForce(res.data, true)
                        } else {
                            message.error($('position推送数据发送错误'));
                        }
                    }
                }else if (res.table === "instrument") {
                    if (res.action === "partial") {
                        page.instrumentData = res.data;
                        for (let index = 0; index < res.data.length; index++) {
                            page.instrumentArr[res.data[index].symbol] = index;
                        }
                        dispatch({
                            type: "instrument/instrumentSave",
                            payload: {
                                dataSource: res.data
                            }
                        })
                    }
                    //卡
                    if (res.action === "update") {
                        page.instrumentUpdate(res.data[0]);
                        page.throttleInstrument(page.instrumentData)
                    }
                }
            }
        }
        this.ws.onclose = function (evt) {
            this.firstRender = true;
            this.webSocketStatus = false;
        };
        this.ws.onerror = function () {
            this.firstRender = true;
            this.webSocketStatus = false;
        }
        this.ws.onconnecting = function () {
            this.firstRender = true;
            this.webSocketStatus = false;
        }
    }
    componentWillUnmount = () => {
        try {
            if (this.ws) {
                this.ws.close();
            }
        } catch (error) {
            
        }
    }
    onClick = (item) => {
        const { dispatch, match } = this.props;
        const { key } = item;
        dispatch(routerRedux.push(`${match.url}/` + key));
    }
    checkIsSetting = () => {
        let { dataSource } = this.props;
        if (!dataSource) {
            dataSource = {};
        }
        if (dataSource.email
            && (dataSource.applyStatus === '2' || dataSource.applyStatus === '4')
            && ((dataSource.googleStatus === "1" || dataSource.telephone))
            && dataSource.accountPassword === '1') {
            return true
        } else {
            return false;
        }
    }
    render() {
        const { match, routerData, selectedKeys, openKeys, dispatch } = this.props;
        const routes = getRoutes(match.path, routerData);
        return (
            <Layout className="account">
                <Sider style={{ overflow: 'auto', minHeight: 'calc(100vh - 44px)', left: 0 }}>
                    <Menu
                        onClick={this.onClick}
                        mode="inline"
                        theme="light"
                        selectedKeys={selectedKeys}
                        defaultOpenKeys={openKeys}
                        style={{ height: '100%', borderRight: 0 }}
                    >
                        <SubMenu key="account" title={<span><Icon type="user" />{$('账户信息')}</span>}>
                            <Menu.Item key="account-capital">{$('资产总览')}</Menu.Item>
                            <Menu.Item key="account-iomanage">{$('充提管理')}</Menu.Item>
                            <Menu.Item key="account-iosearch">{$('划转记录')}</Menu.Item>
                        </SubMenu>
                        <SubMenu key="trade" title={<span><Icon type="laptop" />{$('交易记录')}</span>}>
                            <Menu.Item key="trade-his">{$('交易历史')}</Menu.Item>
                            <Menu.Item key="trade-order">{$('委托历史')}</Menu.Item>
                        </SubMenu>
                        <SubMenu key="personal" title={<span><Icon type="notification" />{$('个人中心')}</span>}>
                            <Menu.Item key="personal-safety">{$('安全设置')}</Menu.Item>
                            <Menu.Item key="personal-noties">{$('通知与公告')}</Menu.Item>
                            <Menu.Item key="personal-advice">{$('我的邀请')}</Menu.Item>
                            <Menu.Item key="personal-activelog">{$('活动日志')}</Menu.Item>
                            <Menu.Item key="personal-apiSecret">{$('API密钥管理')}</Menu.Item>
                        </SubMenu>
                    </Menu>
                </Sider>
                <Layout>
                    <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                        {this.checkIsSetting() ? '' : <span style={{cursor:'pointer'}} onClick={() => dispatch(routerRedux.push({pathname: '/account/personal-safety'}))}>
                            <Alert
                                className='hoverText'
                                message={$('请先到个人中心完成"安全设置"')}
                                type="warning"
                                showIcon
                            />
                        </span>}
                        <Switch>
                            {routes.map(item => (
                                <Route key={item.key} path={item.path} component={item.component} exact={item.exact} />
                            ))}
                        </Switch>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                    </Footer>
                </Layout>
            </Layout>
        )
    }
}

export default connect(({ accountInfo, instrument }) => {
    const { selectedKeys, openKeys, dataSource } = accountInfo
    const { symbolCurrent } = instrument
    return {
        selectedKeys,
        openKeys,
        dataSource,
        symbolCurrent
    }
})(
    Index
)
