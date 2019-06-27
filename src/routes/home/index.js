import React, { Component } from 'react'
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Button, Carousel, Row, Col, Card, Divider, webSocket, language, Utils } from 'quant-ui';
import "./index.less";
import { Layout } from 'antd';
import { translationParameters } from "@/utils/utils"
import throttle from "lodash/throttle";
const currency = Utils.currency;
let $ = language.getLanguageData;
let page = null;
const {
    Header, Footer, Sider, Content,
} = Layout;
const arrCard = ["XBTUSD", "XBTIndex", "Bitstamp", "Coinbase", "CoinbasePro"];
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            XBTUSD: {},
            XBTIndex: {},
            Bitstamp: {},
            Coinbase: {},
            CoinbasePro: {},
            webSocketStatus: false
        }
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
    componentWillMount = () => {
        if (process.env.NODE_ENV === 'development') {//开发环境
            this.ws = new webSocket("ws://192.168.1.22:9988", null, { breatheParams: "ping", reconnectInterval: 10000, timeoutInterval: 10000, debugger: false });
        } else {//部署环境
            // this.ws = new webSocket("ws://192.168.1.22:9988", null, { breatheParams: "ping", reconnectInterval: 600000, timeoutInterval: 10000, debugger: false });
            var ws_url = "ws://192.168.1.22:9988"
            if (document.location.host.startsWith("192.168.1.22")) {
                ws_url = "ws://192.168.1.22:9988"
            } else {
                var ws_proto = document.location.protocol === "https:" ? "wss:" : "ws:"
                ws_url = ws_proto + "//" + document.location.host + "/realtime"
            }
            this.ws = new webSocket(ws_url, null, { breatheParams: "ping", reconnectInterval: 10000, timeoutInterval: 10000, debugger: false });
        }
        const { dispatch, symbolCurrent } = this.props;
        let symbol = symbolCurrent || "XBTUSD";
        dispatch({
            type: "instrument/save",
            payload: { symbolCurrent: symbol }
        })
        this.ws.onopen = (evt) => {
            page.setState({
                webSocketStatus: true
            })
            dispatch({
                type: "instrument/save",
                payload: { webSocket: this.ws }
            })
            this.ws.send(JSON.stringify({
                op: "subscribe", args: [
                    "instrument:" + symbol,
                ]
            }));
        };
        this.ws.onmessage = ({ data }) => {
            if (data !== "pong") {
                let res = JSON.parse(data)
                if (res.table === "instrument") {
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

        };
        this.ws.onclose = function (evt) {
            page.setState({
                webSocketStatus: false
            })
        };
        this.ws.onerror = function () {
            page.setState({
                webSocketStatus: false
            })
        }
        this.ws.onconnecting = function () {
            page.setState({
                webSocketStatus: false
            })
        }

    }
    // componentDidMount = () => {
    //     const { dispatch , publickKeyResponse } = this.props;
    //     if (publickKeyResponse === "" || !publickKeyResponse) {
    //         dispatch({
    //             type: "login/getUserSysApiKey",
    //         })
    //     }
    // }
    componentWillUnmount = () => {
        try {
            this.ws.close();

        } catch (error) {

        }
    }
    toTrade = () => {
        const { dispatch, symbolCurrent } = this.props;
        dispatch(routerRedux.push({
            pathname: '/transaction/' + symbolCurrent,
        }));
    }
    login = () => {
        const { dispatch, symbolCurrent } = this.props;
        dispatch(routerRedux.push({
            pathname: '/user/login',
        }));
    }
    register = () => {
        const { dispatch, symbolCurrent } = this.props;
        dispatch(routerRedux.push({
            pathname: '/user/register',
        }));
    }
    componentWillReceiveProps = (props) => {
        const { dataSource, instrumentData } = props;
        let XBTUSD = dataSource.filter((item) => item.symbol === "XBTUSD");
        if (XBTUSD) {
            this.setState({
                XBTUSD: XBTUSD[0]
            })
        }
    }
    renderCart = () => {
        let { XBTUSD } = this.state;
        if (!XBTUSD) {
            XBTUSD = {};
        }
        return arrCard.map((item, index, arr) => {
            return <Col key={item} offset={index === 0 ? 0 : 1} span={4}>
                <Card
                    hoverable={true}
                    title="XBTUSD"
                >
                    <div>
                        <span>{XBTUSD.lastPrice || "0000.00"}</span>
                        <span style={{ float: "right" }}>{XBTUSD.lastPrice ? ((XBTUSD.lastPrice - XBTUSD.prevPrice24h) * 100 / XBTUSD.prevPrice24h).toFixed(2) + "%" : "00.00%"}</span>
                    </div>
                    <div>
                        <span>{$("24小时交易量")}</span>
                        <span style={{ float: "right" }}>{XBTUSD.volume24h ? currency(XBTUSD.volume24h, { separator: ',', precision: 0 }).format() : "0"}</span>
                    </div>
                </Card>
            </Col>
        })
    }
    render() {
        let authority = localStorage.getItem('antd-pro-authority');
        return (
            <Layout className="homePage" >
                <Content className="homePage-content">
                    {/* <div className="margin10">
                        <Button type="primary" onClick={this.toTrade}>{$("查看实时交易")}</Button>
                    </div> */}
                    {/* {authority === "admin" ?
                        ""
                        : <div className="margin10">
                            <a onClick={this.login}>{$("登录")} | </a>
                            <a onClick={this.register}>{$("注册")}</a>
                        </div>} */}
                    <div className="margin10 home-carousel">
                        {/* <Carousel autoplay={false}> */}
                        <div className="home-carousel-con">
                            <div className="home-carousel-background">
                                <Row className="home-carousel-item">
                                    <Col className='home-carousel-item-title'><h2>{$('专业的数字货币衍生品交易所')}</h2><p>{$('XBTUSD永续合约')}</p></Col>
                                    <Col><Button onClick={this.toTrade} type="primary" className="js-start-transaction">{$("开始交易")}</Button></Col>
                                </Row>
                            </div>
                        </div>
                            

                            {/* <div><h3>2</h3></div>
                            <div><h3>3</h3></div>
                            <div><h3>4</h3></div> */}
                        {/* </Carousel> */}
                    </div>
                    <Row className="homePage-content-details">
                        <Row>
                            <Col className="why-365mex" span={24}>
                                <h1>{$('为什么选择365MEX？')}</h1>
                                <p>{$('您的每一笔交易，都应该被公平对待')}</p>
                            </Col>
                        </Row>
                        <Row className="safety-row">
                            <Col className="safety-text" span={12}>
                                <div className="safety-text-content">
                                    <h1>{$('安全/SECURITY')}</h1>
                                    <p>{$('一流团队打造专业安全')}</p>
                                    <p>{$('多重防御让你资产无忧')}</p>
                                </div>
                                
                            </Col>
                            <Col className="safety-logo" span={12}>
                                <div className="safety-logo-image"></div>
                            </Col>
                        </Row>
                        <Row className="efficiency-row">
                            <Col className="efficiency-logo" span={12}>
                                <div className="efficiency-logo-image"></div>
                            </Col>
                            <Col className="efficiency-text" span={12}>
                                <div className="efficiency-text-content">
                                    <h1>{$('高效/EFFICIENCY')}</h1>
                                    <p>{$('资金流转快速')}</p>
                                    <p>{$('交易畅通无阻')}</p>
                                </div>
                                
                            </Col>
                        </Row>
                        <Row className="service-row">
                            <Col className="service-text" span={12}>
                                <div className="service-text-content">
                                    <h1>{$('服务/SERVICE')}</h1>
                                    <p>{$('24小时客服在线服务')}</p>
                                    <p>{$('保障您的优质服务')}</p>
                                </div>
                                
                            </Col>
                            <Col className="service-logo" span={12}>
                                <div className="service-logo-image"></div>
                            </Col>
                        </Row>
                    </Row>
                    <Row className="homePage-start-transaction">
                        <div className="background-logo">
                            <Row className="homePage-start-details">
                                <Col className="homePage-start-details-left" span={12}>
                                    <div className="homePage-start-details-left-logo"></div>
                                </Col>
                                <Col className="homePage-start-details-right" span={12}>
                                    <h1>{$('开启您的数字资产交易之路')}</h1>
                                    <p>{$('专业数字货币永续合约')}</p>
                                    <Button onClick={this.toTrade} type="primary" className="js-start-transaction">{$("开始交易")}</Button>
                                </Col>
                            </Row>
                        </div>
                    </Row>
                    {/* <div>
                        <Row span={24}>
                            {this.renderCart()}
                        </Row>
                    </div> */}
                </Content>
                <Divider className="homePage-divider" />
                <Footer className="homePage-footer" style={{ textAlign: "center" }}>
                    <Row>
                        <Col className="js-365mex-copyright" span={4}>
                            <div className="js-365mex-copyright-logo"></div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text-bold">{$('基本信息')}</div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text-bold">{$('产品')}</div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text-bold">{$('参考')}</div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text-bold">{$('社交')}</div>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="js-365mex-copyright" span={4}>
                            <div className="js-365mex-copyright-text special">@2019 365MEX</div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('关于365MEX')}</a></div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('XBTUSD永续合约')}</a></div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('交易费用')}</a></div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('微信群')}</a></div>
                        </Col>
                    </Row>
                    <Row>
                        {/* <Col className="js-365mex-copyright" span={4}>
                            <div className="js-365mex-copyright-text">@2019 365MEX</div>
                        </Col> */}
                        <Col offset={4} className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('安全性')}</a></div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('邀请返现')}</a></div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('常见问题')}</a></div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('Telegram')}</a></div>
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={4} className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('隐私政策')}</a></div>
                        </Col>
                        <Col offset={5} className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('API')}</a></div>
                        </Col>
                        <Col className="js-365mex-copyright" span={5}>
                            <div className="js-365mex-copyright-text"><a href="#">{$('Twitter')}</a></div>
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={4} className="js-365mex-copyright" span={5}>
                            <div offset={4} className="js-365mex-copyright-text"><a href="#">{$('服务条款')}</a></div>
                        </Col>
                    </Row>
                </Footer>
            </Layout>
        )
    }
}
export default connect(({ instrument, login }) => {
    const { symbolCurrent, dataSource, instrumentData } = instrument;
    const { publickKeyResponse } = login;
    return {
        symbolCurrent,
        dataSource,
        publickKeyResponse,
        instrumentData
    }
})(
    Index
)
