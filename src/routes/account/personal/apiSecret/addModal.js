import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, MoveModal, Card, Input, Select, Checkbox } from "quant-ui";
const FormItem = Form.Item;
const Option = Select.Option;
const plainOptions = [
    { label: '阅读', value: '1' },
    { label: '委托', value: '2' }
];
class AddModal extends Component {
    state = {
        count: 0,
    };
    //modal取消事件
    onCancel = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisibleApi: false,
            }
        })
    }
    //modal确定事件
    onOk = () => {
        const { dispatch, form: { validateFields } } = this.props;
        validateFields((error, values) => {
            if (!!error) return;
            dispatch({
                type: "accountInfo/apiKeyPost",
                payload: {
                    ...values,
                }
            })
        })
    }
    render() {
        const { loading, addVisibleApi, form: { getFieldDecorator } } = this.props;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 24 },
                md: { span: 24 },
                lg: { span: 10 },
                xl: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 24 },
                md: { span: 24 },
                lg: { span: 14 },
                xl: { span: 16 },
            },
        };
        return (
            <MoveModal
                visible={addVisibleApi}
                title={"API密钥设置"}
                onCancel={this.onCancel}
                onOk={this.onOk}
                maskClosable={false}
                okText="提交"
                confirmLoading={loading}
                width="50%"
                className="api-set-modal"
            >
                <Card className="hover-shadow" style={{ width: '100%' }} headStyle={{ height: 20 }}>
                    <Form>
                        <FormItem label={"名称:"} {...formItemLayout}>
                            {getFieldDecorator('keyName', {
                                rules: [
                                    {   required: true, 
                                        validator(rule, value, callback) {
                                            if (value.indexOf(" ") !== -1) {
                                                callback({message:'请勿输入空格!'})
                                            } else if(value == '') {
                                                callback({message: '请输入姓名'})//必须写
                                            } else {
                                                callback()
                                            }
                                        }

                                    }
                                ],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label={"CIDR:"} {...formItemLayout}>
                            {getFieldDecorator('cidr', {
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <div className="checkbox-item-wrapper">
                        <FormItem label={"权限:"} {...formItemLayout} className="checkbox_item">
                            {getFieldDecorator('keyRight', {
                                initialValue: ['1'],
                                rules: [{ required: true, message: '请选择权限' }],
                            })(
                                // <Select style={{ width: 120 }} >
                                //     <Option value="1">阅读</Option>
                                //     <Option value="2">委托</Option>
                                //     {/* <Option value="3">取消委托</Option> */}
                                //     {/* <Option value="4">提现</Option> */}
                                // </Select>
                                <Checkbox.Group options={plainOptions} />
                            )}
                        </FormItem>
                        </div>
                        
                    </Form>
                </Card>
            </MoveModal>
        )
    }
}
export default connect(({ accountInfo, loading }) => {
    const { addVisibleApi, title } = accountInfo
    return {
        addVisibleApi,
        title,
        loading: !!loading.effects['accountInfo/apiKeyPost']
    }
})(
    Form.create()(AddModal)
)
