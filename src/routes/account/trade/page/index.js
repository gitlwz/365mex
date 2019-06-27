import React, { Component } from 'react'
import { language, Row, Col } from 'quant-ui';
import { connect } from 'dva';
let $ = language.getLanguageData;
let page = null;
class Index extends Component {
    onPrePage = () => {
        if (this.props.start >= 100) {
            this.props.onPrePage(true, this.props.start - 100);
        } else {
            this.props.onPrePage(true, 0);
        }
    }
    onNextPage = () => {
        if (this.props.end != 0 && (this.props.end % 100 == 0)) {
            this.props.onNextPage(true, this.props.start + 100);
        }
    }
    render() {
        const { loading } = this.props;
        return (
            <Row style={{margin:'10px 0'}}>
                <Col span={8}>
                    {this.props.start === 0 ? '' : <a onClick={this.onPrePage}>{$('前一页')}</a>}
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                    {loading ?
                        <span>
                            {$('载入中')}
                        </span> :
                        <span>
                            <span>{$('正在显示资料')}</span>
                            <span>{" " + this.props.start + " - " + this.props.end}</span>
                        </span>}
                </Col>
                <Col style={{ textAlign: 'right' }} span={8}>
                    {(this.props.end != 0 && this.props.end % 100 == 0) ? <a onClick={this.onNextPage}>{$('下一页')}</a> : ""}
                </Col>
            </Row>
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