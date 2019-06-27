import React, { Component } from 'react'
import { Icon, language, Row, Col } from 'quant-ui';
import { connect } from 'dva';
import { getTickLength, showLastTickDirection } from '@/utils/utils'
let { getLanguageData } = language;
let $ = getLanguageData;
class Index extends Component {
    render() {
        const { instrumentData } = this.props;
        let instrument = instrumentData || {};
        let lastPrice = instrument.lastPrice || "";
        let icon = showLastTickDirection(instrumentData.lastTickDirection);
        return (
            <div className="instrumentDetal">
                <Row className={"headPrice " + icon}>
                    {/* <Col span={10} className='headPriceTitle'>{instrument.symbol}</Col> */}
                    {/* 暂时前端替换，最后应该是让后端更改symbol字段的 */}
                    <Col span={10} className='headPriceTitle'>{$("BTC永续合约")}</Col>
                    <Col style={{textAlign: 'left'}} offset={2} span={12}>
                        {lastPrice ? lastPrice.toFixed(getTickLength(instrument.tickSize)) : "--"}
                        <Icon type={icon} theme="outlined" />
                    </Col>
                </Row>
                <Row className='headPriceSecond'>
                    <Col span={10} className='headPriceSecondTitle'>{$('标记价格')}</Col>
                    <Col style={{textAlign: 'left'}} offset={2} span={12}>
                        {instrument.markPrice}
                    </Col>
                </Row>
            </div>
        )
    }
}
export default connect(({ instrument }) => {
    const { instrumentData } = instrument;
    return {
        instrumentData
    }
})(
    Index
)