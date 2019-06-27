import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, MoveModal, Card, Input, Radio, Icon, QRCode } from "quant-ui";
import "./index.less";
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
class GoogleCheck extends Component {
    state = {
        count: 0,
    };
    //modal取消事件
    onCancel = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisible: false
            }
        })
    }
    //modal确定事件
    onOk = () => {
        const { dispatch, form: { validateFields } } = this.props;
        validateFields((error, values) => {
            if (!!error) return;
                dispatch({
                    type: "accountInfo/update",
                    payload: {  
                        ...values,
                        googleStatus:"1",
                    }
                })
        })
    }
    onGetCaptcha = () => {  //获取验证码
        let count = 59;
        this.setState({ count });
        this.interval = setInterval(() => {
            count -= 1;
            this.setState({ count });
            if (count === 0) {
                clearInterval(this.interval);
            }
        }, 1000);
    };
    render() {
        const { loading, addVisible, title, form: { getFieldDecorator }, dataSource } = this.props;
        const { count } = this.state;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
            style: {
                textAlign: "center"
            }
        };
        const formItemLayout2 = {
            style: {
                textAlign: "center"
            }
        };
        return (
            <MoveModal
                visible={addVisible}
                title={title}
                onCancel={this.onCancel}
                onOk={this.onOk}
                maskClosable={false}
                okText="提交"
                confirmLoading={loading}
                width="30%"
            >
                <Card className="hover-shadow" style={{ width: '100%' }} headStyle={{ height: 20 }}>
                    <Form>
                        <div className="titleDiv">
                            <h4>第一步</h4>
                            <p>若您已卸载谷歌验证器，请<a target="_Blank" href='https://support.google.com/accounts/answer/1066447?hl=en'>点击这里</a>重新获取安装。</p>
                        </div>
                        <div className="titleDiv">
                            <h4>第二步</h4>
                            <p>若已完成验证则直接跳到下一步。否则打开谷歌验证器APP扫描以下二维码，或添加密文进行手工验证。</p>
                            <p className="redColor">注意：若重复进行认证，则之前的认证就会失效。</p>
                        </div>
                        <FormItem {...formItemLayout2}>
                            {getFieldDecorator('checkCode', {
                                initialValue: dataSource.secret,
                                rules: [{message: '请输入密文' }],
                            })(
                                <div>
                                    <QRCode value={"otpauth://totp/userId@localhost?secret=" + dataSource.secret}/>
                                    <Input readOnly value={dataSource.secret} addonBefore="密文" addonAfter={<Icon type="setting" />}/>
                                </div>
                            )}
                        </FormItem>
                        <div className="titleDiv">
                            <h4>第三步</h4>
                            <p>填入手机谷歌验证器上生成的动态密码以重新开启两步验证。</p>
                        </div>
                        <FormItem label={"谷歌验证码"} {...formItemLayout}>
                            {getFieldDecorator('verifyCode', {
                                rules: [{ required: true, message: '请输入谷歌动态密码' }],
                            })(
                                <div>
                                    <Input style={{ width: 200, marginRight: 10 }} />
                                </div>
                            )}
                        </FormItem>
                    </Form>
                </Card>
            </MoveModal>
        )
    }
}
export default connect(({ accountInfo, loading }) => {
    const { addVisible, title, dataSource } = accountInfo
    return {
        addVisible,
        dataSource,
        title,
        loading: !!loading.effects['accountInfo/update']
    }
})(
    Form.create()(GoogleCheck)
)
