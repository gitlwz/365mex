import React, { Component } from 'react'
import { connect } from 'dva';
import { language, Form, Utils, Table } from 'quant-ui';
import moment from 'moment';
import Page from "../../trade/page/index.js";
import {  getCurrencyType } from '@/utils/utils';
const currency = Utils.currency;
let $ = language.getLanguageData;
let calculate = Math.pow(10,getCurrencyType().tick);
const columns = [{
    title: $('时间'),
    dataIndex: 'insertTime',
    key: 'insertTime',
    align: 'left',
    render: (record, obj, index) => {
        if(!record){
            return <span>--</span>
        }
        return <span>{moment(record).format("YYYY-MM-DD a HH:mm:ss")}</span>
    }
}, {
    title: $('类型'),
    dataIndex: 'moneyType',
    key: 'moneyType',
    align: 'right',
    render: (record) => {
        switch (record) {
            case 100:
                return <span>{$('平仓盈亏')}</span>;
            case 101:
                return <span>{$('资金费用')}</span>;
            case 102:
                return <span>{$('MAKE成交手续费')}</span>;
            case 103:
                return <span>{$('TAKE成交手续费')}</span>;
            case 104:
                return <span>{$('交易所手续费')}</span>;
            case 105:
                return <span>{$('充值')}</span>;
            case 106:
                return <span>{$('提现')}</span>;
            case 107:
                return <span>{$('提现手续费')}</span>;
            case 108:
                return <span>{$('同用户资金账号间划转')}</span>;
            case 109:
                return <span>{$('不同用户间转账')}</span>;
            case 110:
                return <span>{$('手续费转运营')}</span>;
            case 111:
                return <span>{$('推荐返佣')}</span>;
            case 112:
                return <span>{$('赠币')}</span>;
            case 113:
                return <span>{$('补偿')}</span>;
            case 114:
                return <span>{$('未实现盈亏')}</span>;
            case 115:
                return <span>{$('已实现盈亏')}</span>;
            default:
                return <span>---</span>
        }
    }
}, {
    title: $('金额'),
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    render: (record, obj, arr) => {
        return <span>
            {currency(parseInt((record * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
        </span>
    }
}
// , {
//     title: $('费用'),
//     dataIndex: 'netFee',
//     key: 'netFee',
//     align: 'right',
//     render: (record, obj, arr) => {
//         return <span>
//             {currency(parseInt((record * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
//         </span>
//     }
// }
, {
    title: $('地址'),
    dataIndex: 'address',
    key: 'address',
    align: 'right',
}, 
// {
//     title: $('状态'),
//     dataIndex: 'status',
//     key: 'status',
//     align: 'right',
//     render: (record) => {
//         switch (record) {
//             case 0:
//                 return <span>{$('完成')}</span>;
//             case 1:
//                 return <span>{$('等待')}</span>;
//             case 2:
//                 return <span>{$('撤销')}</span>;
//             default:
//                 return <span>---</span>
//         }
//     }
// }, 
{
    title: $('钱包余额'),
    dataIndex: 'walletBalance',
    key: 'walletBalance',
    align: 'right',
    render: (record, obj, arr) => {
        return <span>
            {currency(parseInt((record * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
        </span>
    }
}];
class Index extends Component {
    searchStatement = (start = 0) => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/searchStatement",
            payload:{
                count:100,
                start:start,
                reverse: true,
                currency:"XBT"
            }
        })
        this.currentPage = start / 100;
    }
    componentDidMount = () => {
        this.searchStatement();
    }
    callback = (key) => {
        console.log(key);
    }
    render() {
        const { statementData, loading, currencyType } = this.props;
        let start = 100 * this.currentPage;
        let end = statementData.length + 100 * this.currentPage;
        return (
            <div>
                <Page loading={loading} onPrePage={this.searchStatement} onNextPage={this.searchStatement} start={start} end={end} />
                <Table pagination={false} dataSource={statementData} size="small" columns={columns} />
            </div>
        )
    }
}

export default connect(({ accountInfo, loading, margin }) => {
    const { statementData } = accountInfo;
    const { currencyType } = margin;
    return {
        statementData,
        currencyType,
        loading: !!loading.effects["accountInfo/searchStatement"],
    }
})(
    Form.create()(Index)
)
