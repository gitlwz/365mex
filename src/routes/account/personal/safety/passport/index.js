import React, { Component } from 'react'
import { connect } from 'dva';
import { Button, Row, language, Select, Form, Input, Modal, Upload, Icon, message } from 'quant-ui';
import "./index.less";
import idFirst from "../../../../../assets/idFirst.jpg";
import idSecond from "../../../../../assets/idSecond.jpg";
import idHold from "../../../../../assets/idHold.jpg";
import { getCountry } from '@/utils/countryCode';
let { getLanguageData } = language;
let $ = getLanguageData;
const Option = Select.Option;
const FormItem = Form.Item;
function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}
class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            count: 0,
            visible: false,
            help: '',
            previewVisible: {
                front: false,
                back: false,
                self: false,
            },
            previewImage: {
                front: '',
                back: '',
                self: '',
            },
            fileList: [],
            fileUrlList: [],
            disabled: false,
            dataSource: {}
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
        const { previewImage } = this.state;
        if (dataSource.identificationType === "2") {
            let fileList = [];
            let obj1 = { uid: '1', name: 'xxx.png', status: 'done', url: 'http://www.baidu.com/xxx.png', }
            let obj2 = { uid: '2', name: 'xxx.png', status: 'done', url: 'http://www.baidu.com/xxx.png', }
            let obj3 = { uid: '3', name: 'xxx.png', status: 'done', url: 'http://www.baidu.com/xxx.png', }
            if (dataSource.idFrontPhoto) {
                obj1.name = 'front.png';
                obj1.url = dataSource.idFrontPhoto;
                previewImage.front = dataSource.idFrontPhoto;
                fileList[0] = obj1;
            }
            if (dataSource.idBackPhoto) {
                obj2.name = 'back.png';
                obj2.url = dataSource.idFrontPhoto;
                previewImage.back = dataSource.idBackPhoto;
                fileList[1] = obj2;
            }
            if (dataSource.selfCardPhoto) {
                obj3.name = 'self.png';
                obj3.url = dataSource.selfCardPhoto;
                previewImage.self = dataSource.selfCardPhoto;
                fileList[2] = obj3;
            }
            this.setState({
                dataSource: dataSource,
                fileUrlList:fileList
            })
        }
    }
    componentWillReceiveProps = (props) => {
        if (props.dataSource) {
            if (props.dataSource.identificationType === "2") {
                this.setState({
                    dataSource: props.dataSource
                })
            }
        }
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
    handleChange = ({ fileList }, name) => {
        let item = fileList[fileList.length - 1];
        let fileUrlList = this.state.fileUrlList;
        let index = 0;
        if (name === "back") {
            index = 1;
        } else if (name === "self") {
            index = 2;
        }
        if (item) {
            if (item.status === "done") {
                getBase64(item.originFileObj, imageUrl => {
                    let previewImage = this.state.previewImage;
                    previewImage[name] = imageUrl;
                    this.setState({
                        previewImage
                    })
                });
                let previewVisible = this.state.previewVisible;
                previewVisible[name] = false;
                this.setState({
                    disabled: false,
                    previewVisible
                })
                if (item.response.code == 0) {
                    if (item.response.result != 1) {
                        message.success($('证件图片上传成功'));
                        fileUrlList[index] = item.response.result;
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
                let previewVisible = this.state.previewVisible;
                previewVisible[name] = true;
                this.setState({
                    disabled: true,
                    previewVisible
                })
            } else if (item.status === "error") {
                let previewVisible = this.state.previewVisible;
                previewVisible[name] = false;
                this.setState({
                    disabled: false
                })
                message.error($('证件图片上传失败!!!'));
            }
        }
    }
    render() {
        const { form, submitting } = this.props;
        const { getFieldDecorator } = form;
        const { fileList, previewVisible, previewImage, dataSource } = this.state;
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
                    <FormItem label={"证件号码"} {...formItemLayout}>
                        {getFieldDecorator('identificationId', {
                            initialValue: dataSource.identificationId,
                            rules: [
                                {
                                    required: true,
                                    validator(rule, value, callback) {
                                        if (value.indexOf(" ") !== -1) {
                                            callback({message:'请勿输入空格!'})
                                        } else if(value == '') {
                                            callback({message: '请输入证件号码!'})//必须写
                                        } else {
                                            callback()
                                        }
                                    }
                                }
                            ],
                        })(<Input size="default" placeholder="证件号码" />)}
                    </FormItem>
                    <FormItem label={"客户名称"} {...formItemLayout}>
                        {getFieldDecorator('userName', {
                            initialValue: dataSource.userName,
                            rules: [
                                {
                                    required: true,
                                    validator(rule, value, callback) {
                                        if (value.indexOf(" ") !== -1) {
                                            callback({message:'请勿输入空格!'})
                                        } else if(value == '') {
                                            callback({message: '请输入客户名称!'})//必须写
                                        } else {
                                            callback()
                                        }
                                    }
                                }
                            ],
                        })(<Input size="default" placeholder="客户名称" />)}
                    </FormItem>
                    <FormItem label={"证件照片"}
                        extra={
                            <div>
                                <div>请确保护照封面显示完整，清晰可见。</div>
                                <div>请在光线明亮的环境拍摄，确保证件信息清晰完整，无水印或损坏。</div>
                                <div>请按照图例姿势，将证件内页打开，置于胸前，正视相机，请确保相机高度与面部保持平行。</div>
                            </div>
                        }
                        {...formItemLayout} wrapperCol={{ span: 20 }} >
                        {getFieldDecorator('IDPicture', {
                            rules: [
                                {
                                    required: fileList.length === 0,
                                    message: '请上传证件',
                                }
                            ],
                        })(
                            <span>
                                <div style={{ color: "red" }}>提示：请准确填写以下内容，提交后无法更改。</div>
                                <Upload
                                    className="upload"
                                    style={{
                                        background: `url(${idFirst})`,
                                    }}
                                    showUploadList={false}
                                    {...this.uploaderProps}
                                    listType="picture-card"
                                    disabled={this.state.disabled}
                                    onPreview={this.handlePreview}
                                    onChange={(e) => this.handleChange(e, "front")}
                                >
                                    {previewImage.front !== "" ?
                                        <img style={{ width: '100%' }} src={previewImage.front} alt="avatar" />
                                        : <div>
                                            <Icon style={{ fontSize: 26 }} type={previewVisible.front ? 'loading' : 'plus'} />
                                            <div className="ant-upload-text">
                                                {"上传护照封面"}
                                            </div>
                                        </div>}
                                </Upload>
                                <Upload
                                    className="upload"
                                    style={{
                                        background: `url(${idSecond})`,
                                    }}
                                    {...this.uploaderProps}
                                    showUploadList={false}
                                    listType="picture-card"
                                    disabled={this.state.disabled}
                                    onPreview={this.handlePreview}
                                    onChange={(e) => this.handleChange(e, "back")}
                                >
                                    {previewImage.back !== "" ?
                                        <img style={{ width: '100%' }} src={previewImage.back} alt="avatar" /> :
                                        <div>
                                            <Icon style={{ fontSize: 26 }} type={previewVisible.back ? 'loading' : 'plus'} />
                                            <div className="ant-upload-text">
                                                {"上传护照个人信息页"}
                                            </div>
                                        </div>}
                                </Upload>
                                <Upload
                                    className="upload"
                                    style={{
                                        background: `url(${idHold})`,
                                    }}
                                    showUploadList={false}
                                    {...this.uploaderProps}
                                    listType="picture-card"
                                    disabled={this.state.disabled}
                                    onPreview={this.handlePreview}
                                    onChange={(e) => this.handleChange(e, "self")}
                                >
                                    {previewImage.self !== "" ? <img style={{ width: '100%' }} src={previewImage.self} alt="avatar" /> :
                                        <div>
                                            <Icon style={{ fontSize: 26 }} type={previewVisible.self ? 'loading' : 'plus'} />
                                            <div className="ant-upload-text">
                                                {"上传手持护照照片"}
                                            </div>
                                        </div>}
                                </Upload>
                            </span>
                        )}
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
