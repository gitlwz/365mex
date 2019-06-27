import React, { Component } from 'react'
// import "./index.less";
import { Tabs, Icon, language  } from 'quant-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import ShowTabData from '@/layouts/topIndexShow';
import throttle from "lodash/throttle";
import { getTickLength } from '@/utils/utils';
import moment from 'moment';
const $ = language.getLanguageData;
const TabPane = Tabs.TabPane;
const titleArray = {
    XBT: $("比特币"),
    XBJ: "比特币/日元",
    ADA: "卡尔达诺",
    BCH: "比特币现金",
    EOS: "EOS 代币",
    ETH: "以太币",
    LTC: "莱特币",
    TRX: "波场币",
    XRP: "瑞波币",
    XBK: "比特币/韩元",
}
class Index extends Component {
    tableClick = (record) => {
        const { dispatch } = this.props;
        dispatch(routerRedux.push("/transaction/" + record.symbol))
        dispatch({
            type: "instrument/getInstrumentBySymbol",
            payload: { symbol: record.symbol }
        })
    }
    onSearch = (value) => {
        const { dataSource } = this.props;
        for (let key in dataSource) {
            if (key.indexOf(value) !== -1) { }
        }
    }
    renderTab = (index, obj) => {
        let upDown = ((obj.lastPrice - obj.prevPrice24h) * 100 / obj.prevPrice24h).toFixed(2);
        let className = "";
        let icon = <Icon color="#4aa165" type="arrow-up" />;
        if(upDown > 0){
            className = "green";
            upDown = "+" +  upDown;
        }else if (upDown < 0){
            className = "red";
            icon = <Icon color="#d16547" type="arrow-down" />;
        }
        return <div style={{ textAlign: "center" }}>
            <span className="titleName">{titleArray[index]}</span>
            <span className="titlePrice">
                <span className="titlePrice_left">{index}</span>
                <span className={"titlePrice_right " + className}>{upDown + "%"}{icon}</span>
            </span>
        </div>
    }
    renderPane = () => {
        const { dataSource, symbolCurrent } = this.props;
        let instrumentMarket = {};
        if (!!dataSource) {
            for (let value of dataSource) {
                if (value.state === "Open") {
                    if (!!instrumentMarket[value.rootSymbol] && value.rootSymbol === "XBT") {
                        instrumentMarket[value.rootSymbol].push(value);
                    } 
                    else if(value.rootSymbol === "XBT"){
                        instrumentMarket[value.rootSymbol] = [];
                        instrumentMarket[value.rootSymbol].push(value);
                    }
                }
            }
        }
        let renderPane = [];
        for (let index in instrumentMarket) {
            let tille = [];
            let obj = instrumentMarket[index];
            
            let FFWCSXObj = obj.find(item => item.typ === "FFWCSX");
            if(!FFWCSXObj){
                FFWCSXObj = obj[0];
            }
            renderPane.push(
                <TabPane tab={this.renderTab(index, FFWCSXObj)} key={index}>
                    <ul className="transaction_ul">
                        {obj.map(item => {
                            let text = $("BTC永续合约 ");
                            if (item.typ === "FFWCSX") {
                                text = $("BTC永续合约 ") + "(100x) ";
                            } else if (item.typ === "FFCCSX") {
                                text = moment(item.expiry).format("MMM Do") + " (100x) "
                            } else if (item.typ === "OCECCS") {
                                text = "UP " + moment(item.expiry).format("MMM Do") + 
                                ", " + item.optionStrikePrice + " USD ";
                            } else if (item.typ === "OPECCS") {
                                text = "DOWN " + moment(item.expiry).format("MMM Do") + 
                                ", " + item.optionStrikePrice + " USD ";
                            }
                            return <li key={item.symbol} className={symbolCurrent === item.symbol?"select": ""}>
                                <Icon type="caret-right" />
                                <a onClick={(e) => this.tableClick(item)}>
                                    <span>{text}</span>
                                    <span>{item.lastPrice.toFixed(getTickLength(item.tickSize.toString()))}</span>
                                </a>
                            </li>;
                        })}
                    </ul>
                </TabPane>
            )
        }
        return renderPane;
    }
    callback = (value) => {
    }
    render() {
        return (
            <div className="transaction_tabs">
                <ShowTabData />
                {/* <Tabs defaultActiveKey="XBT" onChange={this.callback} type="card"> */}
                    {/* {this.renderPane()} */}
                {/* </Tabs> */}
            </div>
        )
    }
}

export default connect(({ instrument, loading }) => {
    const { dataSource, symbolCurrent } = instrument;
    return {
        dataSource,
        symbolCurrent,
    }
})(
    Index
)