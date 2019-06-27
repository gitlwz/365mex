/* eslint-disable eqeqeq */
import React, { Component } from 'react'
import { connect } from 'dva';
import { Button, Row, message, Select, Form, Input, Modal, Upload, Icon, language } from 'quant-ui';
import "./index.less";
import idFirst from "../../../../../assets/idFirst.jpg";
import idSecond from "../../../../../assets/idSecond.jpg";
import idHold from "../../../../../assets/idHold.jpg";
import { getCountry } from '@/utils/countryCode';
const Option = Select.Option;
let { getLanguageData } = language;
let $ = getLanguageData;
const FormItem = Form.Item;
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            visible: false,
            help: '',
            previewVisible: false,
            previewImage: '',
            fileList: [],
            dataSource: {},
            disabled: false,
        };
        this.uploaderProps = {
            action: "/api/v1/user/uploader/picture",
            headers: {
                'x-auth-token': window.localStorage.getItem("XAuthToken")
            },
            multiple: true,
        };
    }
    componentWillMount = () => {
        const { dataSource } = this.props;
        if (dataSource.identificationType === "3") {
            let fileList = [];
            let obj1 = { uid: '1', name: 'xxx.png', status: 'done', url: 'http://www.baidu.com/xxx.png', }
            let obj2 = { uid: '2', name: 'xxx.png', status: 'done', url: 'http://www.baidu.com/xxx.png', }
            let obj3 = { uid: '3', name: 'xxx.png', status: 'done', url: 'http://www.baidu.com/xxx.png', }
            if (dataSource.idFrontPhoto) {
                obj1.name = 'front.png';
                obj1.url = dataSource.idFrontPhoto;
                fileList[0] = obj1;
            }
            if (dataSource.idBackPhoto) {
                obj2.name = 'back.png';
                obj2.url = dataSource.idFrontPhoto;
                fileList[1] = obj2;
            }
            if (dataSource.selfCardPhoto) {
                obj3.name = 'self.png';
                obj3.url = dataSource.selfCardPhoto;
                fileList[2] = obj3;
            }
            this.setState({
                dataSource: dataSource,
                fileList
            })
        }
    }
    componentWillReceiveProps = (props) => {
        if (props.dataSource) {
            if (props.dataSource.identificationType === "3") {
                this.setState({
                    dataSource: props.dataSource
                })
            }
        }
    }
    handleSubmit = e => {
        e.preventDefault();
        const { form: { validateFields }, userInfo } = this.props;
        validateFields({ force: true }, (err, values) => {
            if (!err) {
                console.log(this.state.fileUrlList)
                if (this.state.fileUrlList && this.state.fileUrlList.length === 3) {
                    values.idFrontPhoto = this.state.fileUrlList[0].fileKey;
                    values.idBackPhoto = this.state.fileUrlList[1].fileKey;
                    values.selfCardPhoto = this.state.fileUrlList[2].fileKey;
                    userInfo(values, "2");//证件审核提交   
                } else {
                    message.error("证件上传数量不足, 请继续上传")
                }
            }
        });
    };
    handleCancel = () => this.setState({ previewVisible: false })

    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }

    handleChange = ({ fileList }) => {

        let item = fileList[fileList.length - 1];
        let fileUrlList = this.state.fileUrlList;
        if (fileList.length < this.state.fileList.length) {
            fileUrlList.pop();
            this.setState({
                fileUrlList,
                fileList
            })
            return;
        }
        if (item) {
            if (item.status === "done") {
                this.setState({
                    disabled: false
                })
                if (item.response.code == 0) {
                    if (item.response.result != 1) {
                        message.success($('证件图片上传成功'));
                        fileUrlList.push(item.response.result);
                        this.setState({
                            fileUrlList
                        })
                    } else {
                        message.error($('证件图片上传失败!!!'));
                    }
                } else {
                    message.error($('证件图片上传失败!!!'));
                }
            } else if (item.status === "uploading") {
                this.setState({
                    disabled: true
                })
            } else if (item.status === "error") {
                this.setState({
                    disabled: false
                })
                message.error($('证件图片上传失败!!!'));
            }
        }
        this.setState({
            fileList
        })
    }
    render() {
        const { form, submitting, dataSource } = this.props;
        const { getFieldDecorator } = form;
        const { fileList, previewVisible, previewImage } = this.state;
        // let imgSrcBac = idFirst;
        let length = fileList.length;
        // if (length === 1) {
        //     imgSrcBac = idSecond;
        // }
        // if (length === 2) {
        //     imgSrcBac = idHold;
        // }
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">
                    {length === 0 ? "上传机构营业执照" :
                        length === 1 ? "上传法人证件正面" : "上传法人证件反面"}
                </div>
            </div>
        );
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 10 },
        };
        const buttonItemLayout = {
            wrapperCol: { span: 10, offset: 3 },
        };
        return (
            <Row>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem label={"国家"} {...formItemLayout}>
                        {getFieldDecorator('countryCode', {
                            initialValue: dataSource.countryCode,
                            rules: [
                                {
                                    required: true,
                                    message: '请选择国家',
                                }
                            ],
                        })(<Select
                            showSearch
                            onChange={this.changeCountry}
                            placeholder="请选择国家地区"
                            optionFilterProp="children"
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                            {getCountry().map((item) => {
                                return <Option key={item.en + "pass"} value={item.phone_code.substring(1, item.phone_code.length)}>{item.cn}</Option>
                            })}
                        </Select>)}
                    </FormItem>
                    <FormItem label={"机构证件号码"} {...formItemLayout}>
                        {getFieldDecorator('identificationId', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入机构证件号码',
                                }
                            ],
                        })(<Input size="default" placeholder="机构证件号码" />)}
                    </FormItem>
                    <FormItem label={"机构全称"} {...formItemLayout}>
                        {getFieldDecorator('name', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入机构全称',
                                }
                            ],
                        })(<Input size="default" placeholder="机构全称" />)}
                    </FormItem>
                    <FormItem label={"机构地址"} {...formItemLayout}>
                        {getFieldDecorator('address', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入机构地址',
                                }
                            ],
                        })(<Input size="default" placeholder="机构地址" />)}
                    </FormItem>
                    <FormItem label={"法人姓名"} {...formItemLayout}>
                        {getFieldDecorator('address', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入法人姓名',
                                }
                            ],
                        })(<Input size="default" placeholder="法人姓名" />)}
                    </FormItem>
                    {/* <FormItem label={"性别"} {...formItemLayout}>
                        {getFieldDecorator('sex', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择性别',
                                }
                            ],
                        })(<Radio.Group>
                            <Radio value="man">男</Radio>
                            <Radio value="woman">女</Radio>
                        </Radio.Group>)}
                    </FormItem> */}
                    <FormItem label={"法人证件类型"} {...formItemLayout}>
                        {getFieldDecorator('country', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择法人证件类型',
                                }
                            ],
                        })(<Select defaultValue="identity" style={{ width: 120 }}>
                            <Option value="identity">身份证（中国大陆）</Option>
                            <Option value="passport">护照</Option>
                        </Select>)}
                    </FormItem>
                    <FormItem label={"法人证件号码"} {...formItemLayout}>
                        {getFieldDecorator('address', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入证件号码',
                                }
                            ],
                        })(<Input size="default" placeholder="证件号码" />)}
                    </FormItem>
                    <FormItem label={"证件照片"}
                        extra="请在光线明亮的环境拍摄，确保证件信息清晰完整，无水印或损坏。" {...formItemLayout} wrapperCol={{ span: 20 }} >
                        {getFieldDecorator('IDPicture', {
                            rules: [
                                {
                                    required: fileList.length === 0,
                                    message: '请上传证件',
                                }
                            ],
                        })(
                            <span><Upload
                                className="upload"
                                action="//jsonplaceholder.typicode.com/posts/"
                                listType="picture-card"
                                fileList={fileList}
                                onPreview={this.handlePreview}
                                onChange={this.handleChange}
                            >
                                {fileList.length >= 3 ? null : uploadButton}
                            </Upload>
                                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                </Modal></span>)}
                    </FormItem>
                    <FormItem {...buttonItemLayout}>
                        <Button
                            size="default"
                            loading={submitting}
                            className={"register-submit"}
                            type="primary"
                            htmlType="submit"
                        >
                            提交身份验证
                        </Button>
                    </FormItem>
                </Form>
            </Row>
        )
    }
}

export default connect(({ accountInfo, loading }) => {
    const { dataSource } = accountInfo;
    return {
        dataSource
    }
})(Form.create()(Index))
