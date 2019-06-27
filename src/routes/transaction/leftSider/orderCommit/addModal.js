import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, Checkbox, Icon, Button, Row, Col, Utils, Modal, Divider, language } from "quant-ui";
import SliderBar from "../slider";
import SliderShow from "../positionHold/sliderShow";
import { tooltipShow, getCurrencyType, translationParameters, toLowPrice, getTickLength } from '@/utils/utils';
import { Formula } from '@/utils/formula';
const FormulaFuc = new Formula();//计算公式
let { getLanguageData } = language;
let $ = getLanguageData;
let page = null;
let isScoll = true;
const currency = Utils.currency;
const confirm = Modal.confirm;
const styleMask = {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    top: "3%"
}
class AddModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            value: 1,
            showInput: false
        }
        this.dataSource = [{
            name: $("委托价值"),
            data: "---"
        }, {
            name: translationParameters([3], $('成本 @')),
            data: "---"
        }, {
            name: $("可用余额"),
            data: "---"
        }, {
            name: $("成交后的仓位大小"),
            data: "---"
        }, {
            name: $("标记价格"),
            data: "---"
        }, {
            name: $("预期强平价格"),
            data: "---"
        }, {
            name: $("标记价格/预期强平价格差异"),
            data: "--- (---)",
        }];
        page = this;
        this.setIntervalClear = null;
    }
    onClick = () => {
        this.setState({
            showInput: !this.state.showInput
        })
    }
    //modal取消事件
    onCancel = () => {
        const { dispatch, } = this.props;
        isScoll = true;
        let abisible = this.returnAbisible(this.props.ordTypeTitle);
        let addVisible = {};
        addVisible[abisible] = false;
        dispatch({
            type: "orderCommit/save",
            payload: {
                addVisible: addVisible
            }
        })
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        let abisible = this.returnAbisible(this.props.ordTypeTitle);
        let addVisible = {};
        if (nextProps.addVisible[abisible] || this.props.addVisible[abisible]) {
            return true;
        }
        return false;
        // if(nextProps.dataSource && nextProps.dataSource.marginLeverage === this.props.dataSource.marginLeverage){
        //     return false;
        // }
        // return true
    }
    //modal确定事件
    onOk = () => {
        isScoll = true;
        const { dispatch, commitData, instrumentData } = this.props;
        let _commitData = {};
        if (commitData) {
            _commitData = commitData;
        }
        let abisible = this.returnAbisible(this.props.ordTypeTitle);
        let addVisible = {};
        let bestPrice = instrumentData.bestPrice || 0;
        let orderMarkPrice = instrumentData.orderMarkPrice || 0;
        addVisible[abisible] = false;
        dispatch({
            type: "orderCommit/save",
            payload: {
                addVisible: addVisible
            }
        })
        let price = _commitData.price;
        if (!_commitData.price) {
            price = instrumentData.askPrice;
        }
        if(_commitData.ordType === 'Limit'){
            if (_commitData.type === "Buy" && instrumentData.impactAskPrice) {
                if (price >= instrumentData.impactAskPrice * (1 + bestPrice)) {//委托价格超过最佳竞买价X
                    this.showConfirm(1);
                    return;
                }
                if (price >= instrumentData.markPrice * (1 + orderMarkPrice)) {//没委托价格大于等于最佳竞卖价格 并且现价 - 标记价格 大于等于 100
                    this.showConfirm(2);
                    return;
                }
            } else if (_commitData.type === "Sell" && instrumentData.impactBidPrice) {
                if (price <= instrumentData.impactBidPrice * (1 - bestPrice)) {
                    this.showConfirm(1);
                    return;
                }
                if (price <= instrumentData.markPrice * (1 - orderMarkPrice)) {//下单价格小于等于最佳竞买价格*(1-Z)
                    this.showConfirm(2);
                    return;
                }
            }
        }
        if (this.props.closeFlag && _commitData.ordType !== 'Limit') {
            const { positionHavaListData, symbolCurrent } = this.props;
            let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
            if (positionHold.currentQty > 0) {
                if (_commitData.type === "Buy") {
                    this.showConfirm(3, positionHold.currentQty, _commitData.orderQty);
                    return;
                } else {
                    if (positionHold.currentQty - _commitData.orderQty * 1 < 0) {
                        this.showConfirm(3, positionHold.currentQty, -_commitData.orderQty * 1);
                        return;
                    }
                }
            } else if (positionHold.currentQty < 0) {
                if (_commitData.type === "Sell") {
                    this.showConfirm(3, positionHold.currentQty, _commitData.orderQty * 1);
                    return;
                } else {
                    if (positionHold.currentQty + _commitData.orderQty * 1 > 0) {
                        this.showConfirm(3, positionHold.currentQty, -_commitData.orderQty * 1);
                        return;
                    }
                }
            } else {
                this.showConfirm(3, 0, _commitData.orderQty * 1);
                return;
            }
        }
        this.props.orderCommit();
    }
    renderShowStop = (currentQty, orderQty) => {
        let value = 0;
        if (currentQty * 1 > 0) {
            value = currentQty * 1 + orderQty * 1;
        } else {
            value = currentQty * 1 - orderQty * 1;
        }
        return <div style={{ textAlign: "center" }}>
            {translationParameters([currentQty, value], $('止损委托选中触发后平仓且满足二次弹框条件'))}<br /><br />
            {/* {$('该止损委托被执行后，会将你的仓位从 ') + currentQty + $(' 增加至 ') + value + $(' 张合约。然后，你选中了"触发后平仓"选项，该选项的目的在于平仓。如果你继续，该止损委托可能在被触发后立刻被取消。')}<br /><br /> */}
            {$('请点击确认此操作')}
        </div>
    }
    showConfirm = (type, currentQty, orderQty) => {
        if (type === 1 || type === 2) {//
            confirm({
                title: <strong style={{ textAlign: "center" }}>{$('警告')}: {$('可能会立刻深度成交')}</strong>,
                content: this.renderShowDanger(type),
                okType: 'danger',
                okText: $('成交委托'),
                cancelText: $('取消'),
                className: "quickModal",
                onOk() {
                    page.props.orderCommit();
                },
                onCancel() {
                },
            });
        } else {
            confirm({
                title: <strong style={{ textAlign: "center" }}>{$('警告')}: {$('止损委托不一定会被触发')}</strong>,
                content: this.renderShowStop(currentQty, orderQty),
                okType: 'danger',
                okText: $('提交止损委托'),
                cancelText: $('取消'),
                className: "quickModal",
                onOk() {
                    page.props.orderCommit();
                },
                onCancel() {
                },
            });
        }
    }
    footer = (title) => {
        return <div className="commit_footer">
            <Button onClick={this.onCancel} className="commit_footer_cancel">{$('取消')}</Button>
            <Button onClick={this.onOk} type="primary" className="commit_footer_ok">{$(title)}</Button>
        </div>
    }
    onChangeCheckBox = (e) => {
        this.props.checkFlagChange(!e.target.checked);
    }
    returnAbisible = (ordTypeTitle) => {
        let abisible = "addVisibleLimit";
        if (ordTypeTitle == "市价") {
            abisible = "addVisibleMarket"
        } else if (ordTypeTitle == "市价止盈") {
            abisible = "addVisibleMarketTarget";
        } else if (ordTypeTitle == "市价止损") {
            abisible = "addVisibleMarketStop";
        } else if (ordTypeTitle == "追踪止损") {
            abisible = "addVisibleMarketTrai";
        } else if (ordTypeTitle == "限价止损") {
            abisible = "addVisibleLimitStop";
        } else if (ordTypeTitle == "限价止盈") {
            abisible = "addVisibleLimitTrai";
        }
        return abisible;
    }
    componentWillReceiveProps = (props) => {

    }
    orderValueCul = (commitData, positionHold) => {
        const { multiplier, dataSource, instrumentData, tickSize } = this.props;
        let calculate = Math.pow(10, getCurrencyType().tick);
        let price = commitData.price;
        let availableMargin = dataSource.availableMargin || 0;
        if (this.props.ordTypeTitleFlag.indexOf("Market") !== -1) {
            price = instrumentData.lastPrice;
        }
        if (price !== undefined && price != 0) {
            let orderValue = Math.round((1 * 1 / price) * Math.abs(multiplier)) * commitData.orderQty;
            this.dataSource[0].data = currency(parseInt((orderValue * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
        }
        if (dataSource) {
            this.dataSource[2].data = currency(parseInt((availableMargin * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
        }
        if (instrumentData && instrumentData.markPrice) {
            this.dataSource[4].data = toLowPrice(instrumentData.markPrice).toFixed(getTickLength(tickSize.toString()));
            if (this.dataSource[5].data !== '---') {
                this.dataSource[6].data = Math.abs(this.dataSource[4].data * 1 - this.dataSource[5].data * 1);
                this.dataSource[6].data = ((this.dataSource[6].data / this.dataSource[4].data) * 100).toFixed(2) + "%(" + this.dataSource[6].data.toFixed(getTickLength(tickSize.toString())) + ")";
            } else {
                this.dataSource[6].data = "--- (---)";
            }
        }
        let leverage = positionHold.crossMargin ? 0 : positionHold.leverage;
        let value = leverage === undefined ? "0.00" : (positionHold.crossMargin && positionHold.initMarginReq ? (1 / positionHold.initMarginReq).toFixed(2) : leverage.toFixed(2))
        this.dataSource[1].name = translationParameters([value], $('成本 @'));
    }
    renderShowDanger = (type) => {
        const { commitData, instrumentData } = this.props;
        let impactPrice = instrumentData.impactAskPrice;//最佳竞卖价
        let askBidPrice = commitData.price;
        if (!askBidPrice) {
            if (commitData.type === "Sell") {
                askBidPrice = instrumentData.bidPrice
            } else if (commitData.type === "Buy") {
                askBidPrice = instrumentData.askPrice
            }
        }
        if (commitData.type === "Sell") {
            impactPrice = instrumentData.impactBidPrice;//最佳竞买价
        }
        if (type === 2) {
            impactPrice = instrumentData.markPrice;
        }
        let mulValue = Math.abs(askBidPrice - impactPrice).toFixed(2);
        let percent = ((mulValue / impactPrice) * 100).toFixed(2)
        let side = commitData.type === "Buy" ? $("竞卖") : $("竞买");
        let anoSide = commitData.type === "Buy" ? $("竞买") : $("竞卖");
        return <div className="quickModal_content">
            <Divider />
            <div className="quickModal_content2">
                <div>{$('该委托的价格深入对手市场, 将会导致委托立刻被成交')}</div>

                <div>{translationParameters([commitData.price || $("市价"), commitData.orderQty, anoSide], $('深入对手市场提示信息一'))}</div>
                {type === 1 ?
                    <div>{translationParameters([side, impactPrice, mulValue, percent, $('高于')], $('深入对手市场提示信息二'))}</div>
                    :
                    <div>{translationParameters([instrumentData.markPrice, mulValue, percent], $('深入对手市场提示信息三'))}</div>}
                <div>{$('请点击确认此操作')}</div>
            </div>
        </div>
    }
    getLiquidationPrice = (_commitData) => {
        const { instrumentData, positionHavaListData, symbolCurrent, dataSource, tickSize, ordTypeTitle } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        let liqPrice = _commitData.price;
        let orderQty = _commitData.orderQty;
        if (positionHold) {
            if (_commitData.type === "Buy") {
                this.dataSource[3].data = positionHold.currentQty * 1 + _commitData.orderQty * 1;
            } else if (_commitData.type === "Sell") {
                this.dataSource[3].data = positionHold.currentQty * 1 - _commitData.orderQty * 1;
            }
        }
        if (instrumentData.symbol && positionHold) {
            if (_commitData.type === "Sell") {
                orderQty = -orderQty * 1;
                if (_commitData.ordType === "Market" || ordTypeTitle === "市价止损" || ordTypeTitle === "市价止盈") {
                    liqPrice = instrumentData.bidPrice;
                }
            } else {
                if (_commitData.ordType === "Market" || ordTypeTitle === "市价止损" || ordTypeTitle === "市价止盈") {
                    liqPrice = instrumentData.askPrice;
                }
            }
            this.dataSource[5].data = FormulaFuc.getLiquidationPrice(instrumentData, positionHold, dataSource, orderQty * 1, liqPrice * 1, positionHold.leverage);
            if (this.dataSource[5].data && this.dataSource[3].data !== 0) {
                this.dataSource[5].data = this.dataSource[5].data.toFixed(getTickLength(tickSize.toString()))
            } else {
                this.dataSource[5].data = '---';
            }
            // this.dataSource[5].data.toFixed(getTickLength(tickSize.toString()))
        }
    }
    getMarginRequirement = (_commitData, buy, sell, margin) => {
        const { instrumentData, positionHavaListData, symbolCurrent, ordTypeTitle } = this.props;
        let calculate = Math.pow(10, getCurrencyType().tick);
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        let price = _commitData.price;
        let orderQty = _commitData.orderQty;
        if (instrumentData.symbol && positionHold) {
            if (buy) {
                if (_commitData.ordType === "Market" || ordTypeTitle === "市价止损" || ordTypeTitle === "市价止盈") {
                    price = instrumentData.askPrice;
                }
            } else {
                if (_commitData.ordType === "Market" || ordTypeTitle === "市价止损" || ordTypeTitle === "市价止盈") {
                    price = instrumentData.bidPrice;
                }
            }
            this.dataSource[1].data = FormulaFuc.getMarginRequirement(instrumentData, positionHold, buy ? orderQty * 1 : -orderQty * 1, price, margin);
            this.dataSource[1].data = currency(parseInt((this.dataSource[1].data * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key;
        } else {
            this.dataSource[1].data = 0 + " " + getCurrencyType().key;
        }
    }
    render() {
        page = this;
        const { riskLimit, timeInForce, loading, addVisible, title, positionHavaListData, symbolCurrent, commitData, ordTypeTitle, currencyType, dataSource } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent)
        let currentRisk = !!riskLimit ? riskLimit : 20000000000;
        if (!positionHold) {
            positionHold = {
                currentQty: 0
            };
        } else {
            currentRisk = positionHold.riskLimit;
        }
        let titleSide = "买入";
        let showFlag = false;
        let touchText = "";
        let upOrlow = "以上";
        let touchPrice = "标记";
        let ordType = "限价";
        let className = "green";
        let buySell = true;;//买卖方向
        let abisible = this.returnAbisible(ordTypeTitle);
        let _commitData = {};
        if (commitData) {
            _commitData = commitData;
            if (commitData.type === "Sell") {
                titleSide = "卖出";
                className = "red";
                buySell = false;
            }
            if (commitData.ordType === "Market") {
                ordType = "市价";
            }
        }
        this.getLiquidationPrice(_commitData);
        this.orderValueCul(_commitData, positionHold);
        this.getMarginRequirement(_commitData, buySell, !buySell, dataSource);
        let leverage = positionHold.crossMargin ? 0 : positionHold.leverage;
        if(leverage !== 0){
            try {
                leverage = leverage.toFixed(2);
            } catch (error) {
                
            }
        }
        if (ordTypeTitle === "市价止损" || ordTypeTitle === "市价止盈") {
            ordType = "市价";
        }
        if (ordTypeTitle === "限价止损" || ordTypeTitle === "市价止损") {
            showFlag = true;
            if (commitData.type === "Sell") {
                upOrlow = "以下"
            }
            if (timeInForce === "标记") {
                touchPrice = "标记价格";
            } else if (timeInForce === "最新成交") {
                touchPrice = "最新成交价";
            } else {
                touchPrice = "指数价格";
            }
            touchText = translationParameters([$(touchPrice), _commitData.stopPx, $(upOrlow)], $('触发价格: xx @ xx 及 xx'));
        } else if (ordTypeTitle === "限价止盈" || ordTypeTitle === "市价止盈") {
            showFlag = true;
            if (commitData.type === "Buy") {
                upOrlow = "以下"
            }
            if (timeInForce === "标记") {
                touchPrice = "标记价格";
            } else if (timeInForce === "最新成交") {
                touchPrice = "最新成交价";
            } else {
                touchPrice = "指数价格";
            }
            touchText = translationParameters([$(touchPrice), _commitData.stopPx, $(upOrlow)], $('触发价格: xx @ xx 及 xx'));
        }
        var div = document.getElementsByClassName('ant-modal-wrap');
        if (addVisible[abisible]) {
            setTimeout(() => {
                if (div.length > 0 && isScoll) {
                    isScoll = false;
                    for (let value of div) {
                        value.scrollTop = value.scrollHeight;
                    }
                }
            }, 0);
        }
        let classNameMarkAndLiq = '';//lv
        let showAddorMuilt = true;
        try {
            if(this.dataSource[3].data > 0){
                showAddorMuilt = this.dataSource[4].data - this.dataSource[5].data > 0? true:false;
            }else if(this.dataSource[3].data < 0){
                showAddorMuilt = this.dataSource[5].data - this.dataSource[4].data > 0? true:false;
            }
            let arr = this.dataSource[6].data.split('%');
            if(this.dataSource[4].data !== '---' && this.dataSource[5].data !== '---'){
                if(this.dataSource[4].data * 1 < this.dataSource[5].data * 1){
                    if(arr.length > 0){
                        let markAndLiqValue = arr[0] * 1;
                        if(0 < markAndLiqValue && markAndLiqValue <= 25){
                            classNameMarkAndLiq = 'arrow-down';
                        }else if(25 < markAndLiqValue && markAndLiqValue <= 75){
                            classNameMarkAndLiq = 'arrow-yellow';
                        }else{
                            classNameMarkAndLiq = 'arrow-up';
                        }
                    }
                }else{
                    classNameMarkAndLiq = 'arrow-down';
                }
            }
        } catch (error) {
            
        }
        return (
            <Modal
                id='moveModal_commit_alter'
                className="moveModal_commit"
                visible={addVisible[abisible]}
                destroyOnClose={true}
                title={title}
                onCancel={this.onCancel}
                maskStyle={styleMask}
                onOk={this.onOk}
                maskClosable={false}
                footer={this.footer(titleSide)}
                confirmLoading={loading}
                width="30%"
            >
                <div className={"title_first " + className}>{$(titleSide) + " " + $(ordTypeTitle)}</div>
                <div className="title_second">
                    <span className={className}>{$(titleSide)}</span>
                    {translationParameters([_commitData.price || $(ordType), _commitData.orderQty, symbolCurrent], $('在 xx 价格 x 张 x 合约'))}
                    <br />
                    <span>{touchText}</span>
                </div>
                <div className="modal_position">
                    <div className="modal_position_title">{$('持有仓位')}：{symbolCurrent}</div>
                    {/* <div className="positionLeverage">
                        <span className="initialLeverageIcon"></span>
                        <div className="indicatorGraph">
                            <div style={{ left: leverage * 2.15 || 0 + "%" }} className="lineIndicator">
                                <span className="valueLabel">
                                    {leverage === undefined ? "0.00" :
                                        (positionHold.crossMargin && dataSource.marginLeverage ? dataSource.marginLeverage.toFixed(2) : leverage.toFixed(2)) + " x"}
                                </span>
                            </div>
                        </div>
                        <span style={{ display: "none" }} className="indicatorLabel">杠杆</span>
                        <span className="maintLeverageIcon"><Icon type="warning" theme="filled" /></span>
                    </div> */}
                    <SliderShow length={100} leftLength={-70} />
                    <Row>
                        <Col span={22}>
                            <SliderBar currentRisk={currentRisk / 10000000000} onClick={this.onClick} showInput={this.state.showInput} value={leverage} />
                        </Col>
                        <Col span={2}>
                            {/* <Icon style={{ cursor: "pointer" }} onClick={this.onClick} type="form" theme="outlined" /> */}
                            <i style={{ marginRight: 1, cursor: "pointer" }} onClick={this.onClick} className={'all-icon-img write'}></i>
                        </Col>
                    </Row>
                    {positionHold.currentQty === 0 ?
                        (positionHold.crossMargin ? <div>
                            {translationParameters([$('全仓保证金')], $('开仓时保证金提示信息'))}<br />
                            {$('这会使用你账户内所有资金去支持仓位。')}
                        </div> :
                            <div>
                                {translationParameters([$('逐仓保证金')], $('开仓时保证金提示信息'))}<br />
                                {translationParameters([leverage], $('逐仓将会使用你预先选定的杠杆和保证金设置'))}<br />
                                {$('这能够控制你的亏损，但你需要多加留意强平价格。')}
                            </div>) : ""}
                </div>
                <div className="moveModal_commit_table">
                    {<table cellSpacing="0" rules="cols">
                        <tbody>
                            {this.dataSource.map((ele, index, arr) => {
                                return (
                                    <tr key={ele.name} >
                                        <td key={ele.name} className="moveModal_commit_table_borderR">
                                            <div>{ele.name}</div>
                                        </td>
                                        <td style={{ width: "50%" }}>
                                            {index === 6 ?
                                                <div className={classNameMarkAndLiq}>
                                                    {!showAddorMuilt?"-" + ele.data:ele.data}
                                                </div> :
                                                <div>{ele.data}</div>
                                            }
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>}
                </div>
                {showFlag ? <div className="backUp">
                    {this.props.closeFlag ?
                        <p>
                            {tooltipShow(translationParameters([symbolCurrent], $('触发后平仓备注信息')))}
                        </p>
                        :
                        <p>
                            {tooltipShow($('不选触发后平仓备注信息'))}
                        </p>
                    }

                </div> : ""}
                <div style={{ textAlign: "right" }}>
                    <Checkbox style={{ fontSize: 12 }}
                        onChange={this.onChangeCheckBox}>
                        <span className='not_show'>
                        {$('不要再显示')}
                        </span>
                    </Checkbox>
                </div>
            </Modal>
        )
    }
}
export default connect(({ orderCommit, orderList, instrument, loading, margin }) => {
    const { addVisible, title, commitData } = orderCommit
    const { positionHavaListData } = orderList;
    const { symbolCurrent, multiplier, instrumentData, tickSize } = instrument;
    const { dataSource, riskLimit, currencyType } = margin;
    return {
        addVisible,
        title,
        positionHavaListData,
        symbolCurrent,
        multiplier,
        currencyType,
        commitData,
        dataSource,
        instrumentData,
        riskLimit,
        tickSize,
        loading: !!loading.effects['orderCommit/save']
    }
})(
    Form.create()(AddModal)
)
