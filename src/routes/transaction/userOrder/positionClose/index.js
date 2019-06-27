import React, { Component } from 'react'
import { Table, language, Tooltip, Utils } from 'quant-ui';
import "./index.less";
import { tooltipShow, getCurrencyType } from '@/utils/utils'
import { connect } from 'dva';
const currency = Utils.currency;
let { getLanguageData } = language;
let $ = getLanguageData;
let page = null;
const columnsClose = [{
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('此仓位的合约代码'), $('合约'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('合约')}</span>
    </Tooltip>,
    dataIndex: 'symbol',
    align: 'left',
    className: 'textAlignLeft',
    sorter: (a, b) => a.symbol - b.symbol,
    render: (record, obj, index) => {
        const { symbolCurrent } = page.props;
        return (
            <span className={symbolCurrent === record ? "select" : "unselect"}>{record}</span>
        )
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('上一个已平仓位的盈亏。'), $('已实现盈亏'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('已实现盈亏')}</span>
    </Tooltip>,
    dataIndex: 'prevRealisedPnl',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => a.prevRealisedPnl - b.prevRealisedPnl,
    render: (record, obj, index) => {
        let calculate = Math.pow(10, getCurrencyType().tick);
        let className = "colorGreen";
        if (record < 0) {
            className = "colorRed"
        }
        return (
            <span className={className}>{currency(parseInt((record * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}</span>
        )
    }
}];
class Index extends Component {
    constructor(props) {
        super(props);
        page = this;
    }
    render() {
        // eslint-disable-next-line no-unused-vars
        const { positionHavaListData, orderHeight, currencyType } = this.props;
        let _positionHavaListData = positionHavaListData.filter(item => item.prevRealisedPnl !== 0)
        let inti = 160;
        let height = window.localStorage.getItem("user_order_height") * 1;
        if (height > 6) {
            inti = 160 + (height * 1 - 6) * 42;
        }
        return (
            <div className="positionClose">
                <Table
                pagination={false}
                scroll={{ x: 850 }}
                    rowKey={(record) => {
                        return record.symbol + record.markPrice
                    }}
                    columns={columnsClose} dataSource={_positionHavaListData} size="small"
                />
            </div>
        )
    }
}

export default connect(({ orderList, instrument, margin }) => {
    const { positionHavaListData, orderHeight } = orderList;
    const { symbolCurrent } = instrument;
    const { currencyType } = margin;
    return {
        positionHavaListData,
        symbolCurrent,
        currencyType
    }
})(
    Index
)

