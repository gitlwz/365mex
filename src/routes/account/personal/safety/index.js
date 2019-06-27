import React, { Component } from 'react'
import { connect } from 'dva';
import "./index.less";
import UserInfo from "./userInfo";
import CapitalPsw from "./capitalPsw";
import EmailCheck from "./emailCheck";
import UserInfoCheck from "./userInfoCheck";
import TwoCheck from "./twoCheck";
import { Steps, Button, message, Icon, Card, Row, Col } from 'quant-ui';
import AddModal from "./addModal.js";
import GoogleCheck from "./googleCheck.js"
import TelephoneCheck from "./telephoneCheck"
import EmailUpdate from "./emailUpdate"
const Step = Steps.Step;

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
            applyStatus: 0,
            dataSource: {}
        };
        this.identificationType = "1";
        this.steps = [{
            title: '邮箱验证',
        }, {
            title: '身份验证',
        }, {
            title: '两步验证',
        }, {
            title: '设置资金密码',
        }];
    }
    onClickTel = (title) => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisibleTel: true,
                title: title
            }
        })
    }
    cancelGoogleCheck = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/cancelGoogleCheck",
        })
    }
    updateTelephone = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/updateTelephone",
        })
    }
    onClick = (title) => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisible: true,
                title: title
            }
        })
    }
    onClickEmail = (title) => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisibleEmail: true,
                title: title
            }
        })
    }
    renderTwoCheck = () => {
        const { dataSource } = this.state;
        return <div style={{ marginBottom: 20, lineHeight: "32px" }} className="ant-steps-item-finish">
            <Row>
                <Col span={4}>
                    <span className="ant-steps-item-icon">
                        <span className="ant-steps-icon">
                            <Icon type="check" />
                        </span>
                    </span>
                    <span style={{ fontSize: 16, color: "#1890ff" }}>两步验证通过</span>
                </Col>
                <Col span={20}>
                    <span>两步验证是使用动态密码，在设备隔离的情况下进行验证，使用将增加您账户的安全性。您可以开启以下任意一种两步验证。</span>
                </Col>
            </Row>
            {dataSource.telephone ?
                <Row className="marginBottom10">
                    <Col span={4}>
                        <span className="greenColor marginLeft40">短信验证已开启</span>
                    </Col>
                    <Col span={20}>
                        <span>{dataSource.telephone}</span>
                        <Button onClick={this.updateTelephone} type="danger" className="flR marginLeft40">关闭短信验证</Button>
                    </Col>
                </Row>
                :
                <Row className="marginBottom10">
                    <Col span={4}>
                        <span className="redColor marginLeft40">短信验证未开启</span>
                    </Col>
                    <Col span={20}>
                        <span>{dataSource.telephone}</span>
                        <Button onClick={() => this.onClickTel("开启短信验证")} className="flR marginLeft40">开启短信验证</Button>
                    </Col>
                </Row>
            }
            {dataSource.googleStatus === "1" ?
                <Row className="marginBottom10">
                    <Col span={4}>
                        <span className="greenColor marginLeft40">谷歌认证已开启</span>
                    </Col>
                    <Col span={20}>
                        <Button onClick={this.cancelGoogleCheck} type="danger" className="flR">关闭谷歌认证</Button>
                    </Col>
                </Row>
                :
                <Row className="marginBottom10">
                    <Col span={4}>
                        <span className="redColor marginLeft40">谷歌认证未开启</span>
                    </Col>
                    <Col span={20}>
                        <Button onClick={() => this.onClick("开启谷歌认证")} className="flR">开启谷歌认证</Button>
                    </Col>
                </Row>
            }
        </div>
    }
    renderTwoCheckNot = () => {
        return <Row style={{ marginBottom: 20, lineHeight: "32px" }} className="ant-steps-item-error">
            <Col span={4}>
                <span className="ant-steps-item-icon">
                    <span className="ant-steps-icon">
                        <Icon type="close" />
                    </span>
                </span>
                <span style={{ fontSize: 16, color: "#f5222d" }}>两步验证未通过</span>
            </Col>
            <Col span={20}>
                <span>两步验证是使用动态密码，在设备隔离的情况下进行验证，使用将增加您账户的安全性。您可以开启以下任意一种两步验证。</span>
            </Col>
        </Row>
    }
    renderUserInfo = () => {
        return <Row style={{ marginBottom: 20, lineHeight: "32px" }} className="ant-steps-item-finish">
            <Col span={4}>
                <span className="ant-steps-item-icon">
                    <span className="ant-steps-icon">
                        <Icon type="check" />
                    </span>
                </span>
                <span style={{ fontSize: 16, color: "#1890ff", }}>身份验证通过</span>
            </Col>
            <Col span={20}>
                <span>{this.state.dataSource.userName || ""} ，恭喜您已经通过了身份验证。</span>
            </Col>
        </Row>
    }
    renderEmailPass = () => {
        return <Row style={{ marginBottom: 20, lineHeight: "32px" }} className="ant-steps-item-finish">
            <Col span={4}>
                <span className="ant-steps-item-icon">
                    <span className="ant-steps-icon">
                        <Icon type="check" />
                    </span>
                </span>
                <span style={{ fontSize: 16, color: "#1890ff" }}>邮箱验证通过</span>
            </Col>
            <Col span={20}>
                <span>邮箱 {this.state.dataSource.email || ""} 已验证通过，请记好此邮箱，它将被用于未来的通信，包括账户恢复等。</span>
                <Button onClick={(e) => this.onClickEmail("修改邮箱")} className="flR">修改</Button>
            </Col>
        </Row>

    }
    renderEmailLoading = () => {//证件审核已提交,正在审核
        return <Row style={{ marginBottom: 20, lineHeight: "32px" }} className="ant-steps-item-wait">
            <Col span={4}>
                <span className="ant-steps-item-icon">
                    <span className="ant-steps-icon">
                        <Icon type="question" />
                    </span>
                </span>
                <span style={{ fontSize: 16, color: "rgba(0, 0, 0, 0.45)", marginRight: 14 }}>身份审核中</span>
            </Col>
            <Col span={20}>
                <span>身份验证资料已提交成功，请耐心等待平台审核。</span>
            </Col>
        </Row>

    }
    renderEmailReject = () => {//证件审核已提交,被驳回
        return <Row style={{ marginBottom: 20, lineHeight: "32px" }} className="ant-steps-item-wait">
            <Col span={4}>
                <span className="ant-steps-item-icon">
                    <span className="ant-steps-icon">
                        <Icon type="close" />
                    </span>
                </span>
                <span style={{ fontSize: 16, color: "red" }}>身份审核驳回</span>
            </Col>
            <Col span={20}>
                <span>身份验证资料已被平台审核驳回，请重新提交身份验证资料，或联系客服。</span>
            </Col>
        </Row>

    }
    getType = (identificationType) => {
        this.identificationType = identificationType;
    }
    componentWillReceiveProps = (props) => {
        const { dataSource } = props;
        if (dataSource) {
            // this.switchChange(dataSource.applyStatus);
            this.setState({
                dataSource
            })
        }

    }
    componentWillMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/findUserInfo",
        });
    }
    switchChange = (applyStatus) => {
        let current = this.state.current;
        switch (applyStatus) {
            case "0": //注册
                current = 0;
                break;
            case "1": //邮箱验证已打开
            case "2": //证件审核已提交
            case "3": //证件审核已驳回
                current = 1;
                break;
            case "4": //证件审核已通过
                current = 2;
                break;
            case "5"://两步验证已通过
                current = 3;
                break;
            case "6"://资金密码已设置
                current = 3;
                break;
            case "7"://正常
                current = 3;
                break;
            case "8"://冻结
                current = 3;
                break;
            default:
                break;
        }
        this.setState({
            current
        })
    }
    next = () => {
        const current = this.state.current + 1;
        this.setState({ current });
    }
    userInfo = (value, applyStatus) => {
        const { dispatch } = this.props;
        // eslint-disable-next-line eqeqeq
        if (applyStatus == "2") {
            value.identificationType = this.identificationType;
        }
        value.applyStatus = applyStatus;
        dispatch({
            type: "accountInfo/update",
            payload: {
                ...value
            }
        });
        // this.next();
    }
    twoCheck = () => {
        this.next();
    }
    capitalPaw = () => {
        message.success('Processing complete!')
    }
    renderItem = (current) => {
        const { dataSource } = this.props;
        let userInfoComit = '';
        if (dataSource.applyStatus === "2") {
            userInfoComit = this.renderEmailLoading();//不显示
        }
        if (dataSource.applyStatus === "3") {//显示
            userInfoComit = this.renderEmailReject();
        }
        switch (current) {
            case 0:
                if (dataSource.email) {
                    return <Card className="hover-shadow">
                        {this.renderEmailPass()}
                    </Card>;
                }
                return <EmailCheck userInfo={this.userInfo} />;
            case 1:
                return <Card className="hover-shadow">
                    {dataSource.email ? this.renderEmailPass() : ''}
                    {dataSource.applyStatus === '4' ? this.renderUserInfo() : userInfoComit}
                    {dataSource.applyStatus === "2" || dataSource.applyStatus === "4" ? '' : <UserInfoCheck getType={this.getType} userInfo={this.userInfo} />}
                </Card>;
            case 2:
                return <Card className="hover-shadow">
                    {dataSource.email ? this.renderEmailPass() : ''}
                    {dataSource.applyStatus === '4' ? this.renderUserInfo() : userInfoComit}
                    <TwoCheck twoCheck={this.userInfo} />
                </Card>
            case 3:
                return <Card className="hover-shadow">
                    {dataSource.email ? this.renderEmailPass() : ''}
                    {dataSource.applyStatus === '4' ? this.renderUserInfo() : userInfoComit}
                    {(dataSource.googleStatus === "1" || dataSource.telephone) ? this.renderTwoCheck() : this.renderTwoCheckNot()}
                    <CapitalPsw />
                </Card>
            default:
                break;
        }
    }
    currentClick = (current) => {
        this.setState({
            current
        })
    }
    checkStatus = (index, current, dataSource) => {
        let arr = [];
        let status0 = dataSource.email ? "finish" : "error";//邮箱认证
        let status1 = dataSource.applyStatus === '4' ? "finish" : "error";//身份（身份证或者护照）认证
        let status2 = (dataSource.telephone || dataSource.googleStatus === "1") ? "finish" : "error";//手机或Google验证
        let status3 = dataSource.accountPassword === '1' ? "finish" : "error";//资金密码
        arr.push(status0);
        arr.push(status1);
        arr.push(status2);
        arr.push(status3);
        if (index !== current) {
            return arr[index];
        } else {
            return '';
        }
    }
    render() {
        const { current, dataSource } = this.state;
        return (
            <div className="safety">
                <UserInfo />
                <Steps style={{ marginBottom: 20 }} current={current}>
                    {this.steps.map((item, index) => {
                        return <Step onClick={() => this.currentClick(index)} status={this.checkStatus(index, current, dataSource)} key={item.title} title={item.title} />
                    })}
                </Steps>
                <div className="steps-content">
                    {this.renderItem(current)}
                </div>
                <div className="steps-action" style={{ textAlign: "center" }}>
                </div>
                <AddModal />
                <TelephoneCheck />
                <GoogleCheck />
                <EmailUpdate />
            </div>
        )
    }
}

export default connect(({ accountInfo, loading }) => {
    const { applyStatus, dataSource } = accountInfo;
    return {
        applyStatus,
        dataSource,
        loading: !!loading.effects["accountInfo/update"]
    }
})(
    Index
)
