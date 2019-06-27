/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react'
import OrderCommit from "./orderCommit";
import InstrumentDetal from "./instrumentDetal";
import PositionHold from "./positionHold";
import EarnOrLoss from "./earnOrLoss";
import LiquidationPrice from "./liquidationPrice";
import FocusPrice from "./focusPrice";
import TopMarketValue from "./topMarketValue";
import { Tabs, Collapse, Card, Button, Row, Icon, Menu, Dropdown, Tooltip, language, Col } from 'quant-ui';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Checkbox } from 'antd';
import { tooltipShow, setAllTradeLocalSetting, getAllTradeLocalSetting } from '@/utils/utils';
let { getLanguageData } = language;
let $ = getLanguageData;
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: getAllTradeLocalSetting().visible,
            visibleSetting: false,
            translateX: 0,
            translateY: 0,
        }
        this.moving = false;
        this.lastX = null;
        this.lastY = null;
        window.onmouseup = e => this.onMouseUp(e);
        window.onmousemove = e => this.onMouseMove(e);
    }
    onMouseDown(e) {
        e.stopPropagation();
        this.moving = true;
    }

    onMouseUp() {
        this.moving = false;
        this.lastX = null;
        this.lastY = null;
    }

    onMouseMove(e) {
        this.moving && this.onMove(e);
    }

    onMove(e) {
        if (this.lastX && this.lastY) {
            let dx = e.clientX - this.lastX;
            let dy = e.clientY - this.lastY;
            this.setState({ translateX: this.state.translateX + dx, translateY: this.state.translateY + dy })
        }
        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }
    register = () => {
        const { dispatch } = this.props;
        dispatch(routerRedux.push({
            pathname: '/user/register',
        }));
    }
    login = () => {
        const { dispatch } = this.props;
        dispatch(routerRedux.push({
            pathname: '/user/login',
        }));
    }
    callback = (key) => {

    }
    renderPosition = () => {
        const { positionHavaListData, symbolCurrent } = this.props;
        let positionHold = [];
        if (Array.isArray(positionHavaListData)) {
            positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent)
        }
        let avgEntryPrice = 0;
        try {
            avgEntryPrice = Math.round(positionHold.avgEntryPrice * 100) / 100;
            avgEntryPrice = avgEntryPrice.toFixed(2);
        } catch (error) {

        }
        return <div className="widget-footer">
            <span>{
                !!positionHold && !!positionHold.currentQty ? <span>
                    {$('仓位') + ": " + positionHold.currentQty + " @ " + avgEntryPrice}
                </span> : $('仓位') + ": ---"}</span>
            <span style={{ float: "right" }}>{$('合约')}: {symbolCurrent || "---"}</span>
        </div>
    }
    renderTabBar = (props, DefaultTabBar) => {
        return <div style={{ cursor: "all-scroll" }} onMouseDown={e => this.onMouseDown(e)}>
            <DefaultTabBar {...props} />
        </div>
    }
    titleCalculate = () => {
        let className = "";
        if (this.props.moveRight === 'layout') {
            className = "rightSideStyle"
        }
        return <div className={"calculateTitle " + className} style={{ transform: `translateX(${this.state.translateX}px)translateY(${this.state.translateY}px)` }} >
            <span onClick={this.changeVis} style={{ position: "absolute", right: 10, top: 10, cursor: "pointer", zIndex: 10 }}>
                <Icon style={{ fontSize: 16 }} type="close" />
            </span>
            <Tabs animated={false} type="card" renderTabBar={this.renderTabBar} animated={false} style={{ width: 440 }} size="small" onChange={this.callback}>
                <TabPane tab={$(' 盈亏 ')} key="earn">
                    <EarnOrLoss />
                    {this.renderPosition()}
                </TabPane>
                <TabPane tab={$('目标价格')} key="focus">
                    <FocusPrice />
                    {this.renderPosition()}
                </TabPane>
                <TabPane tab={$('强平价格')} key="liqudation">
                    <LiquidationPrice />
                    {this.renderPosition()}
                </TabPane>
            </Tabs>
        </div>
    }
    showSetting = (e) => {
        const { dispatch, showPlusMult } = this.props;
        setAllTradeLocalSetting("showPlusMult", !showPlusMult)
        dispatch({
            type: "login/save",
            payload: {
                showPlusMult: !showPlusMult
            }
        })
    }
    moveRight = () => {
        const { dispatch, moveRight } = this.props;
        let text = "layout";
        if (moveRight === "layout") {
            text = "";
        }
        setAllTradeLocalSetting("moveRight", text)
        dispatch({
            type: "login/save",
            payload: {
                moveRight: text
            }
        })
    }
    hideSlider = () => {
        const { dispatch } = this.props;
        setAllTradeLocalSetting("hideSlider", true)
        dispatch({
            type: "login/save",
            payload: {
                hideSlider: true
            }
        })
    }
    titleConfigure = () => {
        const { showPlusMult } = this.props;
        return <div style={{ width: 120, height: 140 }}>
            <div style={{ padding: 10 }}>
                <div className="optionsSection">
                    <lable className="optionLabel">
                        <Checkbox checked={showPlusMult} onChange={this.showSetting}>{$('显示 + / - 按钮')}</Checkbox>
                    </lable>
                </div>
                <div className="optionsSection">
                    <span onClick={this.changeVis} className="button-color-daybreak calculate_span">
                        {/* <Icon className="Icon_select" type="calculator" /> */}
                        <i className={'all-icon-img Icon_select cal'}></i>
                        <lable>{$('打开计算器')}</lable>
                    </span>
                </div>
                <div className="optionsSection">
                    <span onClick={this.moveRight} className="button-color-purple calculate_span">
                        {this.props.moveRight === 'layout' ?
                            <Icon className="Icon_select" type="double-right" /> :
                            <Icon className="Icon_select" type="double-left" />
                        }
                        <lable>{$('移动侧栏')}</lable>
                    </span>
                </div>
                <div className="optionsSection">
                    <span onClick={this.hideSlider} className="button-color-purple calculate_span">
                        <Icon className="Icon_select" type="double-left" />
                        <lable>{$('隐藏侧边栏')}</lable>
                    </span>
                </div>
            </div>
        </div>
    }
    handleVisibleChange = (flag) => {
        this.setState({
            visibleSetting: flag
        });
    }
    menu = () => {
        const { showPlusMult } = this.props;
        const { visible } = this.state;
        return <Menu className={'menu'} selectedKeys={[]}>
            <Menu.Item key="showPlusAdd">
                {/* <Checkbox checked={showPlusMult} onChange={this.showSetting}> */}
                    <span onClick={this.showSetting}>
                        {showPlusMult?$('隐藏 + / - 按钮'):$('显示 + / - 按钮')}
                    </span>
                {/* </Checkbox> */}
            </Menu.Item>
            <Menu.Item key="showCalculate">
                <span onClick={this.changeVis}>
                    {/* <i className={'all-icon-img Icon_select cal'}></i> */}
                    <label style={{ padding: '0 8px', cursor: 'pointer' }}>{visible?$('隐藏计算器'):$('打开计算器')}</label>
                </span>
            </Menu.Item>
            <Menu.Item key="showMoveLeft">
                <span onClick={this.moveRight}>
                    {/* {this.props.moveRight === '' ?
                        <Icon style={{ fontSize: 16 }} className="Icon_select" type="double-right" /> :
                        <Icon style={{ fontSize: 16 }} className="Icon_select" type="double-left" />
                    } */}
                    <label style={{ padding: '0 8px', cursor: 'pointer' }}>{$('移动侧栏')}</label>
                </span>
            </Menu.Item>
            <Menu.Item key="showHideSide">
                <span onClick={this.hideSlider} >
                    {/* {this.props.moveRight === '' ?
                        <Icon style={{ fontSize: 16 }} className="Icon_select" type="double-left" /> :
                        <Icon style={{ fontSize: 16 }} className="Icon_select" type="double-right" />
                    } */}
                    <label style={{ padding: '0 8px', cursor: 'pointer' }}>{$('隐藏侧边栏')}</label>
                </span>
            </Menu.Item>
        </Menu>
    }
    titleSetting = () => {
        return <div onClick={(e) => e.stopPropagation()}>
            {/* <Popconfirm
                style={{ width: 400 }}
                icon={null}
                title={this.titleCalculate()}
                visible={this.state.visible}
                okText={null}
                placement="bottomLeft"
                cancelText={null}
            > */}
            <span onClick={this.changeVis} className='setting'>
                <i className={'all-icon-img cal'}></i>
            </span>
            {/* <Icon onClick={this.changeVis} type="calculator" className="setting" /> */}
            {/* </Popconfirm> */}
            <Dropdown trigger={['click']}
                overlay={this.menu()}
                placement="bottomRight"
                onVisibleChange={this.handleVisibleChange}
                visible={this.state.visibleSetting}
            >
                <i className={'all-icon-img settingSecond set'}></i>
            </Dropdown>
            {/* <Popconfirm
                style={{ width: 100 }}
                icon={null}
                title={this.titleConfigure()}
                okText={null}
                placement="bottomLeft"
                cancelText={null}
            >
                <Icon type="setting" className="settingSecond" />
            </Popconfirm> */}
        </div>
    }
    changeVis = (e) => {
        e.currentTarget.blur();
        e.stopPropagation()
        setAllTradeLocalSetting("visible", !this.state.visible)
        this.setState({
            visible: !this.state.visible,
            visibleSetting: false
        })
    }
    renderHeader = () => {
        return <div className="titleSetting">
            {$('提交委托')}
            {this.titleSetting()}
        </div>
    }
    renderMarkHeader = () => {
        return <TopMarketValue />
    }
    renderPositionHeadr = () => {
        const { symbolCurrent } = this.props;
        return <div style={{ position: "relative" }}>
            <span className='titleSetting'>{$('持有仓位：') + symbolCurrent}</span>
            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('使用此滑块调整你的杠杆, 它仅影响被分配的保证金。点此查看详情。'))}>
                <Icon style={{ position: "absolute", fontSize: "12px", cursor: 'help', color: '#ffffff', opacity: '0.3' }} theme="filled" type="question-circle" />
            </Tooltip>
        </div>
    }
    renderInstrumentHeadr = () => {
        const { symbolCurrent } = this.props;
        return <div>
            <span className='titleSetting'>{$('合约明细') + ": " + symbolCurrent}</span>
        </div>
    }
    onChange = (e) => {
    }
    renderUnloginText = () => {
        return <div>
            {/* <p>{$('这是我们交易板块的预览。 这里的市场数据是实时的。')}</p> */}
            <p>我们是一家领先的数字货币衍生品交易所,这是我们交易板块的预览,这里的市场数据都是实时的.只需简单几步创建账户,即可开始交易.</p>
            <p>{$('想要开始交易吗?')}<a onClick={this.register}>{$('创建帐户只需几秒钟。')}</a></p>
            <p>{$('365MEX提供:')}</p>
            <ul style={{ listStyle: 'square' }}>
                <li style={{ margin: 5 }}>
                    {$('● 业界领先的高达100倍杠杆的永续合约。')}
                </li>
                <li style={{ margin: 5 }}>
                    {$('● 强大的委托类型。')}
                </li>
                <li style={{ margin: 5 }}>
                    {$('● 安全，多重签名冷钱包。')}
                </li>
                <li style={{ margin: 5 }}>
                    {$('● 银行级别 的交易引擎，任何其他比特币交 易都无法比拟。')}
                </li>
                <li style={{ margin: 5 }}>
                    {$('● 功能丰富的 API。')}
                </li>
            </ul>
        </div>
    }
    render() {
        let authority = localStorage.getItem('antd-pro-authority');
        return (
            authority === "admin" ?
                <span className='leftSider'>
                    <div className="leftSider_card">
                        {this.renderMarkHeader()}
                    </div>
                    <Card className="leftSider_card" bordered={false} title={this.renderHeader()}>
                        <OrderCommit />
                    </Card>
                    <Card className="leftSider_card" bordered={false} title={this.renderPositionHeadr()}>
                        <PositionHold />
                    </Card>
                    <Card style={{ flex: '1 1'}} className="leftSider_card" bordered={false} title={this.renderInstrumentHeadr()}>
                        <InstrumentDetal />
                    </Card>
                    {/* <Panel header={this.renderHeader()} key="1">
                        </Panel>
                        <Panel header={this.renderPositionHeadr()} key="2">
                            <PositionHold />
                        </Panel>
                        <Panel header={this.renderInstrumentHeadr()} key="3">
                            <InstrumentDetal />
                        </Panel> */}
                    {this.state.visible ? this.titleCalculate() : ''}
                </span>
                :
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Card
                        bordered={false}
                        className="leftSider_card"
                        style={{ fontSize: 12, padding: 0 }}
                        title={<div style={{ fontSize: 14, fontWeight: 600 }} className="titleSetting">
                            {$('欢迎来到 365MEX')}
                            {/* {this.titleSetting()} */}
                        </div>}
                    >
                        {this.renderUnloginText()}
                        <Row style={{ marginBottom: 5 }}>
                            <Button style={{ height: 36 }} className='loginBack' onClick={this.login} block>
                                <Icon type="login" />{$('登录')}
                            </Button>
                        </Row>
                        <Row>
                            <Button style={{ height: 36 }} className='loginOutBack' onClick={this.register} block><Icon type="user" />{$('注册')}</Button>
                        </Row>
                    </Card>
                    <Card style={{ flex: '1 1'}} className="leftSider_card" bordered={false} title={this.renderInstrumentHeadr()}>
                        <InstrumentDetal />
                    </Card>
                    {/* <Collapse className="leftSider" defaultActiveKey={['1']} bordered={false} >
                        <Panel header={this.renderInstrumentHeadr()} key="3">
                        </Panel>
                    </Collapse> */}
                    {this.state.visible ? this.titleCalculate() : ''}
                </div>
        )
    }
}

export default connect(({ instrument, login, orderList }) => {
    const { symbolCurrent } = instrument;
    const { publickKeyResponse, showPlusMult, moveRight } = login;
    const { positionHavaListData } = orderList;
    return {
        positionHavaListData,
        symbolCurrent,
        publickKeyResponse,
        showPlusMult,
        moveRight
    }
})(
    Index
)
