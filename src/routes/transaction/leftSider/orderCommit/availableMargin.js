import React, { Component } from 'react'
import {  Row, Tooltip, Utils, language } from "quant-ui";
import { connect } from 'dva';
import { tooltipShow, getCurrencyType } from '@/utils/utils';
import { routerRedux } from 'dva/router';
const currency = Utils.currency;
let { getLanguageData } = language;
let $ = getLanguageData;
class Index extends Component {
    render() {
        const { dataSource, dispatch, currencyType } = this.props;
        let _dataSource = dataSource;
        if (!dataSource) {
            _dataSource = {}
        }
        let availiableMargin = (_dataSource.availableMargin * getCurrencyType().value / 100000000);
        let calculate = Math.pow(10,getCurrencyType().tick);
        return (
            <Row className="totalDataRowSecond">
                <span>
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('你建立委托的可用余额，点此查看钱包详情。'))}>
                        <span onClick={() => {
                            dispatch(routerRedux.push({
                                pathname: '/account/account-capital',
                            }));
                        }} style={{ cursor: "pointer" }}>{$('可用余额')}：</span>
                    </Tooltip>
                </span>
                <span className='totalDataRowNumber' style={{ float: "right" }} span={12}>
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('你建立委托的可用余额，点此查看钱包详情。'))}>
                        <span style={{ cursor: "help" }} className="specialSpan">{_dataSource.availableMargin === undefined ? "0.0000 XBT" :
                            currency(parseInt(availiableMargin *  calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
                        </span>
                    </Tooltip>
                </span>
            </Row>
        )
    }
}
export default connect(({ margin }) => {
    const { dataSource, currencyType } = margin;
    return {
        dataSource,
        currencyType
    }
})(
    Index
)