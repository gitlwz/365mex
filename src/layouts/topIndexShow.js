import React, { Component } from 'react'
import { Utils, language, Icon } from 'quant-ui';
// import moment from "moment";
import { connect } from 'dva';
let { getLanguageData } = language;
let $ = getLanguageData;
var moment = require('moment-timezone');
const currency = Utils.currency;
let timer = null;
class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            time: moment().format("HH:mm:ss"),
            fiexdClass: "absolute",
        }
    }
    componentWillUnmount = () => {
        try {
            if (timer) {
                clearInterval(timer)
            }
        } catch (error) {

        }
    }
    componentDidMount = () => {
        timer = setInterval(() => {
            let hour = (moment().hours() - moment().utc().hours());
            if (hour > 0) {
                hour = "+" + hour;
            }
            this.setState({
                time: moment().format("HH:mm:ss") + " (GMT" + hour + ")"
            })
        }, 1000);
    }
    changeFiexd = () => {
        let fiexdClass = this.state.fiexdClass === 'fixed' ? 'absolute' : 'fixed';
        this.setState({
            fiexdClass
        })
    }
    checkDownOrUp = (value) => {
        const { symbolCurrent, positionHavaListData } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        if (!positionHold) {
            positionHold = {};
        }
        let className = "";
        try {
            if (value > 0) {
                if (positionHold.currentQty > 0) {//多仓
                    className = "arrow-down";
                } else if (positionHold.currentQty < 0) {//空仓
                    className = "arrow-up";
                } else {
                    className = "arrow-down";
                }
            } else if (value < 0) {
                if (positionHold.currentQty > 0) {//多仓
                    className = "arrow-down";
                } else if (positionHold.currentQty < 0) {//空仓
                    className = "arrow-up";
                } else {
                    className = "arrow-up";
                }
            }

        } catch (error) {

        }
        return className;
    }
    render() {
        const { instrumentData, dataSource } = this.props;
        let calculateS = Math.pow(10, 2);
        let _instrumentData = {};
        let _indexInstrument = {};
        let indexInstrument = dataSource.filter((item) => item.symbol === '.365XBT')[0];
        if (indexInstrument && indexInstrument.lastPrice) {
            _indexInstrument = indexInstrument;
        }
        if (instrumentData && instrumentData.lastPrice) {
            _instrumentData = instrumentData
        }
        let fundingTimestamp = moment.tz(moment((_instrumentData.fundingTimestamp || moment()) + 1000) - moment(), "Africa/Abidjan").format('HH:mm:ss')
        let indexClassName = '';
        let lastChangePcnt = (parseInt((_instrumentData.lastChangePcnt || 0) * 100 * calculateS) / calculateS);
        let lastChangePcntIndex = (parseInt((_indexInstrument.lastChangePcnt || 0) * 100 * calculateS) / calculateS);
        let fundingRate = (parseInt((_instrumentData.fundingRate || 0) * 100 * 10000) / 10000);
        let plusTick = "";
        let plusTickIndex = "";
        if (lastChangePcnt > 0) {
            indexClassName = 'green';
            plusTick = " +"
        } else if (lastChangePcnt < 0) {
            indexClassName = 'red';
            lastChangePcnt = -lastChangePcnt;
            plusTick = " -"
        } else {
            plusTick = " +"
        }
        let indexClassName365 = '';
        if (lastChangePcntIndex > 0) {
            indexClassName365 = 'green';
            plusTickIndex = " +"
        } else if (lastChangePcntIndex < 0) {
            indexClassName365 = 'red';
            plusTickIndex = " -"
            lastChangePcntIndex = -lastChangePcntIndex;
        } else {
            plusTickIndex = " +"
        }
        return (
            <div className='topInfomation'>
                <div
                    style={{ position: this.state.fiexdClass }}
                    className='titleFixed'>
                    <div className='flexLayout'>
                        <span style={{ cursor: 'pointer', padding: "0 5px", borderRight: '1px solid #000' }} onClick={this.changeFiexd}>
                            {this.state.fiexdClass === 'absolute' ? <i style={{ marginRight: 1 }} className={'all-icon-img fix'}></i> : <i style={{ marginRight: 1 }} className={'close-icon-img'}></i>}
                        </span>
                        <div className='flexLayoutItem' style={{minWidth: 215}}>
                            <span style={{ paddingLeft: 3, fontWeight: 'bold' }}>XBTUSD</span>
                            <span>{"(" + $('BTC永续合约') + ")  "}</span>
                            <span >{(_instrumentData.lastPrice || 0).toFixed(1) + " "}</span>
                            <span className={indexClassName}>{plusTick + lastChangePcnt.toFixed(2) + "%"}</span>
                        </div>
                        <div className='flexLayoutItem'>
                            <i style={{ marginRight: 1 }} className={'all-icon-img earthMark'}></i>
                            <span style={{ fontWeight: 'bold' }}>
                                {" " + $('标记价格') + " "}
                            </span>
                            <span >{parseFloat(_instrumentData.markPrice || 0).toFixed(3).slice(0, -1) + " " || '--'}</span>
                        </div>
                        <div className='flexLayoutItem' style={{minWidth: 217}}>
                            <i style={{ marginRight: 1 }} className={'all-icon-img earth'}></i>
                            <span style={{ paddingLeft: 3, fontWeight: 'bold' }}>.365XBT</span>
                            {"(" + $('指数价格') + ")  "}
                            <span >{parseFloat(_instrumentData.indicativeSettlePrice || 0).toFixed(3).slice(0, -1) + " " || '-- '}</span>
                            <span className={indexClassName365}>{plusTickIndex + lastChangePcntIndex.toFixed(2) + "%" || '0.0000%'}</span>
                        </div>
                        {/* <div className='flexLayoutItem' style={{ minWidth: 170 }}>

                        </div> */}
                        <div className='flexLayoutItem'>
                            <i style={{ marginRight: 1 }} className={'all-icon-img vol'}></i>
                            <span style={{ paddingLeft: 3, fontWeight: 'bold' }}>{$('24小时交易量') + " "}</span>
                            <span>{_instrumentData.volume24h ? currency(_instrumentData.volume24h, { separator: ',', precision: 0 }).format() : "0"}</span>
                        </div>
                        <div className='flexLayoutItemLast' style={{minWidth: 309}}>
                            <span style={{ minWidth: 170, height: 22,display: 'inline-block', paddingRight: 10, borderRight: '1px solid #000' }}>
                                <i style={{ marginRight: 1 }} className={'all-icon-img fun'}></i>
                                <span style={{ paddingLeft: 3, fontWeight: 'bold' }}>{$('资金费率')}</span>
                                <span style={{ fontWeight: 'bold' }}>{" " + fundingTimestamp + " @ "}</span>
                                <span className={this.checkDownOrUp(_instrumentData.fundingRate)}>{fundingRate.toFixed(4) + "%" || '0.0000'}</span>
                            </span>
                            <span style={{ padding: '0px 6px 0 10px', minWidth: 102, display: 'inline-block' }}>{this.state.time}</span>
                        </div>
                        {/* <div className='flexLayoutItemLast' style={{ cursor: 'pointer' }}>
                            {refsText ?
                                refsText.renderMenu()
                                : <span>
                                    <span style={{ marginRight: 5 }}>{$('定制面板')}</span>
                                    <Icon type="appstore" theme="filled" />
                                </span>
                            }
                        </div> */}
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(({ instrument, orderList }) => {
    const { instrumentData, dataSource, symbolCurrent } = instrument;
    const { positionHavaListData } = orderList;
    return {
                    symbolCurrent,
                instrumentData,
                dataSource,
                positionHavaListData
            }
        })(
            Index
)