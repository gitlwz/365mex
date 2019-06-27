import React, { Component } from 'react'
import { language } from 'quant-ui';
import { connect } from 'dva';
import TableRow from '../table/tableRow';
let { getLanguageData } = language;
let $ = getLanguageData;
const columnsClose = [{
    title: $('合约'),
    key: "symbol",
    textAlign: "left"
}, {
    title: $('标记价格'),
    key: "markPrice",
    textAlign: "right"
}, {
    title: $('最新成交价'),
    key: "lastPrice",
    textAlign: "right"
}, {
    title: $('买价'),
    key: "bidPrice",
    textAlign: "right"
}, {
    title: $('卖价'),
    key: "askPrice",
    textAlign: "right"
}, {
    title: $('未平仓合约价值'),
    key: "openValue",
    textAlign: "right"
}, {
    title: $('合约价值'),
    key: "tickSize",
    textAlign: "right"
}, {
    title: $('到期日期'),
    key: "settle",
    textAlign: "right"
}];
class Index extends Component {
    render() {
        const { dataSource, symbolCurrent } = this.props;
        let _dataSource = dataSource.filter(item => item.state === "Open");
        return (
            <div className="product">
                <table cellSpacing="0" rules="cols">
                    <thead>
                        <tr>
                            {columnsClose.map((record, index, obj) => {
                                if (index === 0) {
                                    return <th className='underLine_show' key={"title" + record.title} style={{ textAlign: "left", paddingLeft: 5 }}>
                                        <div>
                                            <span>{record.title}</span>
                                        </div>
                                    </th>
                                } else {
                                    return <th style = {{paddingRight: 5}} key={"title" + record.title}>
                                        <div>
                                            <span>{record.title}</span>
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
