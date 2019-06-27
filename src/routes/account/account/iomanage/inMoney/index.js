import React, { Component } from 'react'
import './index.less';
import { Card, QRCode } from 'quant-ui';
import { connect } from 'dva';
class Index extends Component {
    componentWillMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/findDepositAddress"
        })
    }
    render() {
        const { depositAddress } = this.props;
        return (
            <div className="inMoney">
                <div className="inMoney_title">你的个人多重签名比特币存款地址:</div>
                <Card className="inMoney_card"
                    bodyStyle={{
                        textAlign:"center"
                    }}>
                    <QRCode value={""} />
                    <div>{depositAddress}</div>
                </Card>
                <div className="inMoney_title">重要告示</div>
                <ul>
                    <li>请不要发送莱特币, 比特币现金, 或 Tether 到此地址！不幸地，这些网络会接受比特币多重签名地址的交易，任何发送到此地址的不支持的币将会丢失。</li>
                    <li>最低存款额为 0.0001XBT (10000 聪)。</li>
                    <li>你的比特币会在一个网络确认后到帐。</li>
                    <li>365MEX 只接受比特币存款。如果希望获得比特币，请到比特币交易所如 Bitstamp、Coinbase 或 OKCoin兑换。</li>
                    <li>所有 365MEX 的存款地址都是多重签名冷钱包地址，所有钱包均不曾被联网的机器读取。</li>
                </ul>
            </div>
        )
    }
}
export default connect(({ instrument , accountInfo}) => {
    const { instrumentData } = instrument;
    const { depositAddress } = accountInfo;
    return {
        instrumentData,
        depositAddress
    }
})(
    Index
)