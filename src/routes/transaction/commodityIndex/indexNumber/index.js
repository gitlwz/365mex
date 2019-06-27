import React, { Component } from 'react'
import { language, Tooltip} from 'quant-ui';
import { connect } from 'dva';
import { tooltipShow } from '@/utils/utils'
import TableRow from '../table/tableRow';
let { getLanguageData } = language;
let $ = getLanguageData;
const columnsClose = [{
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('合约代码。'), $('合约'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('合约')}</span>
    </Tooltip>,
    key: "symbol",
    textAlign: "left",
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此合约的最新成交价格。'), $('最新成交价'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('最新成交价')}</span>
    </Tooltip>,
    key: "lastPrice",
    textAlign: "right"
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('24小时前的价格最后成交价。'), $('24小时前的价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('24小时前的价格')}</span>
    </Tooltip>,
    key: "prevPrice24h",
    textAlign: "right"
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('过往24小时价格的变化百分比。'), $('最新价格变化%'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('最新价格变化%')}</span>
    </Tooltip>,
    key: "lastChangePcnt",
    textAlign: "right"
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('在合约到期时计算结算价格所使用的交易所。'), $('参考'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('参考')}</span>
    </Tooltip>,
    key: "reference",
    textAlign: "right"
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此合约用于制定结算价格所使用的代码。'), $('参考代码'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('参考代码')}</span>
    </Tooltip>,
    key: "referenceSymbol",
    textAlign: "right"
}];
class Index extends Component {
    render() {
        const { dataSource } = this.props;
        let _dataSource = dataSource.filter(item => item.state !== "Open");
        return (
            <div className="product">
                <table className="" cellSpacing="0" rules="cols">
                    <thead>
                        <tr>
                            {columnsClose.map((record, index, obj) => {
                                if (index === 0) {
                                    return <th key={record.key} style={{ textAlign: "left" }}>
                                        <div>
                                            <span className='underLine_show'>{record.title}</span>
                                        </div>
                                    </th>
                                } else {
                                    return <th key={record.key}>
                                        <div>
                                            <span className='underLine_show'>{record.title}</span>
                                        </div>
                                    </th>
                                }
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {_dataSource.map((ele, index, obj) => {
                            return (
                                <TableRow key={ele.symbol} columnsClose={columnsClose} ele={ele} />
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}
export default connect(({ instrument }) => {
    const { dataSource, symbolCurrent } = instrument;
    return {
        dataSource,
        symbolCurrent,
    }
})(
    Index
)
