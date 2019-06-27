import React, { Component } from 'react'
import { connect } from 'dva';
import {  Row, Radio, Col } from 'quant-ui';
import "./index.less";
import Identity from './Identity';
import Passport from './passport';
// import Compony from './compony';
class Index extends Component {
    constructor(props){
        super(props)
        this.state = {
            value:props.dataSource.identificationType || "1",
        }
    }
    componentWillReceiveProps = (props) => {
        if(props.dataSource){
            this.props.getType(props.dataSource.identificationType || "1"); 
            this.setState({
                value:props.dataSource.identificationType || "1",
            })
        }
    }
    onChange = (e) => {
        this.props.getType(e.target.value); 
        this.setState({
            value:e.target.value
        })
    }
    render() {
        return (
            <div className="userInfo">
                <div className="titleLine">
                    <h4>身份验证</h4>
                </div>
                <div className="line">
                    <p>注意: 为了更好地保护您的资产安全，请完成以下身份验证。身份验证资料经审核通过后不可更改。</p>
                </div>
                <Row style={{marginBottom:20}}>
                    <Col style={{textAlign:"right"}} span={3}>
                        证件类型：
                    </Col>
                    <Col span={20}>
                        <Radio.Group value={this.state.value} onChange={this.onChange}>
                            <Radio value="1">身份证</Radio>
                            <Radio value="2">护照</Radio>
                            {/* <Radio value="4">组织机构证件</Radio> */}
                        </Radio.Group>
                    </Col>
                </Row>
                {this.state.value === "1"?<Identity userInfo={this.props.userInfo} />:
                this.state.value === "2"?<Passport userInfo={this.props.userInfo}/>:""
                // <Compony userInfo={this.props.userInfo}/>
                }
            </div>
        )
    }
}

export default connect(({ accountInfo, loading }) => {
    const { dataSource } = accountInfo;
    return {
        dataSource
    }
})(Index)
