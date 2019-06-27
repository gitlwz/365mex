/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react'
import { Tabs, Icon, language, Dropdown, Menu, Tooltip } from 'quant-ui';
import OrderLimitPrice from './orderLimitPrice.js';
import OrderMarketPrice from './orderMarketPrice.js';
import MarketStopLose from './marketStopLose.js';
import MarketStopTarget from './marketStopTarget.js';
import TrailingStop from './trailingStop.js';
import LimitStopLoss from './limitStopLoss.js';
import LimitStopTrai from './limitStopTrai.js';
import { tooltipShow } from '@/utils/utils';
let { getLanguageData } = language;
let $ = getLanguageData;
// const TabPane = Tabs.TabPane;
const data = {
    "limit": $('限价'),
    "market": $('市价'),
    "marketStopLoss": $('市价止损'),
    "marketStopTarget": $('市价止盈'),
    "limitStopLoss": $('限价止损'),
    "limitStopTrai": $('限价止盈'),
    "trailingStop": $('追踪止损'),
}
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "limit",
            name: $('限价'),
            showLimit: false,
            showMarket: false,
            showStop: false,
            marketStop: false,
            marketTrai: false,
            limitLoss: false,
            limitTrat: false,
        }
    }
    handleChange = (e) => {
        this.setState({
            value: e.key,
            name: data[e.key]
        })
    }
    handleChangeShow = () => {
        switch (this.state.value) {
            case "limit":
                return <OrderLimitPrice />
            case "market":
                return <OrderMarketPrice showMarket={this.state.showMarket} />
            case "marketStopLoss":
                return <MarketStopLose />;
            case "marketStopTarget":
                return <MarketStopTarget />;
            case "limitStopLoss":
                return <LimitStopLoss />;
            case "limitStopTrai":
                return <LimitStopTrai />;
            case "trailingStop":
                return <TrailingStop />;
            default:
                return "123";
        }
    }
    onClick = () => {

    }
    menu = () => {
        return <Menu style={{ fontSize: "14px",width: 148, textAlign: 'center' }} onClick={this.handleChange}>
            <Menu.Item key="limit">
                <div style={{  position:'relative' }} onMouseEnter={() => this.changeIconShowEnter("showLimit")} onMouseLeave={() => this.changeIconShowLeave("showLimit")}>
                    {$('限价')}
                    {this.state.showLimit ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(this.textReturn($('限价')))}>
                        <Icon style={{ cursor: "help", color: '#ffffff', opacity: '0.3', position:'absolute', right: 2, top: 5}} theme="filled" type="question-circle" />
                    </Tooltip> : ''}
                </div>
            </Menu.Item>
            <Menu.Item key="market">
                <div style={{  position:'relative' }} onMouseEnter={() => this.changeIconShowEnter("showMarket")} onMouseLeave={() => this.changeIconShowLeave("showMarket")}>
                    {$('市价')}
                    {this.state.showMarket ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(this.textReturn($('市价')))}>
                        <Icon style={{ cursor: "help", color: '#ffffff', opacity: '0.3', position:'absolute', right: 2, top: 5 }} theme="filled" type="question-circle" />
                    </Tooltip> : ''}
                </div>
            </Menu.Item>
            <Menu.Item key="marketStopLoss">
                <div style={{  position:'relative' }} onMouseEnter={() => this.changeIconShowEnter("marketStop")} onMouseLeave={() => this.changeIconShowLeave("marketStop")}>
                    {$('市价止损')}
                    {this.state.marketStop ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(this.textReturn($('市价止损')))}>
                        <Icon style={{ cursor: "help", color: '#ffffff', opacity: '0.3', position:'absolute', right: 2, top: 5 }} theme="filled" type="question-circle" />
                    </Tooltip> : ''}
                </div>
            </Menu.Item>
            <Menu.Item key="marketStopTarget">
                <div style={{  position:'relative' }} onMouseEnter={() => this.changeIconShowEnter("marketTrai")} onMouseLeave={() => this.changeIconShowLeave("marketTrai")}>
                    {$('市价止盈')}
                    {this.state.marketTrai ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(this.textReturn($('市价止盈')))}>
                        <Icon style={{ cursor: "help", color: '#ffffff', opacity: '0.3', position:'absolute', right: 2, top: 5 }} theme="filled" type="question-circle" />
                    </Tooltip> : ''}
                </div>
            </Menu.Item>
            <Menu.Item key="limitStopLoss">
                <div style={{  position:'relative' }} onMouseEnter={() => this.changeIconShowEnter("limitLoss")} onMouseLeave={() => this.changeIconShowLeave("limitLoss")}>
                    {$('限价止损')}
                    {this.state.limitLoss ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(this.textReturn($('限价止损')))}>
                        <Icon style={{ cursor: "help", color: '#ffffff', opacity: '0.3', position:'absolute', right: 2, top: 5 }} theme="filled" type="question-circle" />
                    </Tooltip> : ''}
                </div>
            </Menu.Item>
            <Menu.Item key="limitStopTrai">
                <div style={{  position:'relative' }} onMouseEnter={() => this.changeIconShowEnter("limitTrat")} onMouseLeave={() => this.changeIconShowLeave("limitTrat")}>
                    {$('限价止盈')}
                    {this.state.limitTrat ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(this.textReturn($('限价止盈')))}>
                        <Icon style={{ cursor: "help", color: '#ffffff', opacity: '0.3', position:'absolute', right: 2, top: 5 }} theme="filled" type="question-circle" />
                    </Tooltip> : ''}
                </div>
            </Menu.Item>
            {/* <Menu.Item key="trailingStop">
                {$('追踪止损')}
            </Menu.Item> */}
        </Menu>
    }
    textReturn = (title) => {
        let text = $("止盈委托可被用于设置仓位的目标价格。它类似于止损委托, 但是价格触发的方向相反。") + "<br /><br />" + $("使用该种委托来对持有仓位止盈平仓, 或是设置新的开仓价位。被触发后, 止盈委托将变成市价委托。");
        if (title === $('市价止损')) {
            text = $("止损委托只有当市场价格达到某个触发价格后才会被投入市场。交易员一般用它做两种主要策略") + ":<br /><br />1." + $('作为一种风险管理工具来对持有仓位进行止损。') + "<br />2." + $("作为一种自动工具, 在期望的价位下单并进入市场, 而不需要人工等待并下单。") + "<br /><br />" + $("被触发后, 止损委托将变成市价委托。");
        }
        if (title === $('限价')) {
            text = $('限价委托上移显示信息');
        }
        if (title === $('市价')) {
            text = $('市价委托上移显示信息');
        }
        if (title === $('限价止损')) {
            text = $("限价止损委托类似于止损委托, 但是允许在被触发后对委托设置限价。你可以使用该种委托来控制你的退出价位。") + "<br /><br />" + $("请注意, 如果被触发后该限价无法匹配委托列表的任何其他委托, 你的仓位可能无法被平仓。你可以选择更加激进的限价。");
        }
        if (title === $('限价止盈')) {
            text = $("限价止盈委托可被用于设置仓位的目标价格, 它类似于止损委托, 但是价格触发的方向相反。") + "<br /><br />" + $("利用该种委托来止盈平仓，或者是设置新的开仓价位。")
        }
        return text;
    }
    tabRender = () => {
        let text = this.textReturn(this.state.name);
        return <div onMouseEnter={() => this.changeIconShowEnter("showStop")} onMouseLeave={() => this.changeIconShowLeave("showStop")}>
            <span style={{ fontSize: 14 }}>{this.state.name}</span>
            <Dropdown placement='bottomRight' overlay={this.menu()} trigger={['click']}>
                <a style={{ color: "#ffffff", position: 'absolute', right: "10px" }} className="ant-dropdown-link" href="#">
                    {this.state.showStop ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(text)}>
                        <Icon style={{ position: "absolute", right: "15px", cursor: "help", color: '#ffffff', opacity: '0.3' }} theme="filled" type="question-circle" />
                    </Tooltip> : ""}
                    <Icon type="down" />
                </a>
            </Dropdown>
        </div>
        // return <div>
        //     <Select size="small" defaultValue="marketStopLoss" style={{ width: 95 }} onChange={this.handleChange}>
        //         <Option value="marketStopLoss">{$('市价止损')}</Option>
        //         <Option value="marketStopTarget">{$('市价止盈')}</Option>
        //         <Option value="limitStopLoss">{$('限价止损')}</Option>
        //         <Option value="limitStopTrai">{$('限价止盈')}</Option>
        //         <Option value="trailingStop">{$('追踪止损')}</Option>
        //     </Select>
        // </div>
    }
    changeIconShowEnter = (text) => {
        this.setState({
            [text]: true
        })
    }
    changeIconShowLeave = (text) => {
        this.setState({
            [text]: false
        })
    }
    tabRenderLimit = (text, title, type) => {
        return <div onMouseEnter={() => this.changeIconShowEnter(type)} onMouseLeave={() => this.changeIconShowLeave(type)}>
            <span style={{ fontSize: 14 }}>{text}</span>
            {this.state[type] ?
                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(title)}>
                    <Icon style={{ position: "absolute", right: "-3px", cursor: "help", color: '#ffffff', opacity: '0.3' }} theme="filled" type="question-circle" />
                </Tooltip> : ""}
        </div>
    }
    render() {
        let text = this.textReturn(this.state.name);
        return (
            <div className='orderTypeSelect'>
                <label className='select_title' for="orderType">{$('委托类型')}</label>
                <div className="select_type" onMouseEnter={() => this.changeIconShowEnter("showStop")} onMouseLeave={() => this.changeIconShowLeave("showStop")}>
                    <Dropdown placement='bottomRight' overlay={this.menu()} trigger={['click']}>
                        <span style={{width: 145, display: "inline-block"}}>
                            <span style={{ fontSize: 14 }}>{this.state.name}</span>
                            <a style={{ position: 'absolute', right: "10px" }} className="ant-dropdown-link" href="#">
                                {this.state.showStop ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(text)}>
                                    <Icon style={{ position: "absolute", right: "10px", cursor: "help", color: '#ffffff', opacity: '0.3' }} theme="filled" type="question-circle" />
                                </Tooltip> : ""}
                                <Icon type="caret-down" />
                            </a>
                        </span>
                    </Dropdown>
                </div>
                {/* <select onChange={this.handleChange} className='select_orderType' id="orderType">
                    <option value="limit">{$('限价')}</option>
                    <option value="market">{$('市价')}</option>
                    <option value="marketStopLoss">{$('市价止损')}</option>
                    <option value="marketStopTarget">{$('市价止盈')}</option>
                    <option value="limitStopLoss">{$('限价止损')}</option>
                    <option value="limitStopTrai">{$('限价止盈')}</option>
                </select> */}
                {this.handleChangeShow()}
                {/* <Tabs animated={false} className="orderCommitTabs" defaultActiveKey="1" size="small">
                    <TabPane tab={this.tabRenderLimit($('限价'), $('限价委托上移显示信息'), 'showLimit')} key="1">
                        <OrderLimitPrice />
                    </TabPane>
                    <TabPane tab={this.tabRenderLimit($('市价'), $('市价委托上移显示信息'), 'showMarket')} key="2">
                        <OrderMarketPrice showMarket={this.state.showMarket} />
                    </TabPane>
                    <TabPane tab={this.tabRender()} key="3">
                        {this.handleChangeShow()}
                    </TabPane>
                </Tabs> */}
                {/* <Icon style={{cursor: "pointer",position: "absolute", right:"10px", top:"40px", fontSize: '20px', color:"#89ccdf"}} type="down-square" theme="filled" /> */}
            </div>
        )
    }
}

export default Index
