import React, { Component } from 'react'
import { connect } from 'dva';
import "./index.less";
import { Row, Col, Card, Utils } from 'quant-ui';
import { getCurrencyType } from '@/utils/utils'
import moment from "moment";
const currency = Utils.currency;
class Index extends Component {
    renderRow = (myAdviceData) => {
        let arr = [];
        let calculateS = Math.pow(10, getCurrencyType().tick);
        for (let index = 0; index < myAdviceData.length; index++) {
            if(index === 3){
                break;
            }
            let item = myAdviceData[index];
            let text = "第一名";
            if(index === 1){
                text = "第二名";
            }
            if(index === 2){
                text = "第三名";
            }
            arr.push(
                <Row key={item.userId} span={24} className="line">
                    <Col offset={1} span={5}>
                        <span>{text}: </span>
                        <span>{item.userId}</span>
                    </Col>
                    <Col style={{ textAlign: "right" }} span={10}>
                        <span>返佣: </span>
                    </Col>
                    <Col offset={1} span={7}>
                    
                        <span>{currency(parseInt(((item.invitationValue || 0) * getCurrencyType().value / 100000000) * calculateS) / calculateS, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}</span>
                    </Col>
                </Row>
            )
        }
        return arr;
    }
    render() {
        const { myAdviceData } = this.props;
        return (
            <Card className="hover-shadow advicePage">
                <h3>{moment(new Date()).format("YYYY-MM")} 邀请榜单</h3>
                {this.renderRow(myAdviceData)}
            </Card>
        )
    }
}

export default connect(({ accountInfo, margin }) => {
    const { myAdviceData } = accountInfo
    const { currencyType } = margin;
    return {
        myAdviceData,
        currencyType
    }
})(
    Index
)
