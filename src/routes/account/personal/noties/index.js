import React, { Component } from 'react'
import { connect } from 'dva';
import "./index.less";
import { language, Form, DatePicker, Collapse, Select, Card, Row, Col, Pagination } from 'quant-ui';
import moment from 'moment';
const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;
let $ = language.getLanguageData;
const Panel = Collapse.Panel;
const customPanelStyle = {
    borderRadius: 4,
    border: 0,
    overflow: 'hidden',
};
class Index extends Component {
    componentWillMount = () => {
        // const { dispatch } = this.props;
        // dispatch({
        //     type: "accountInfo/announcement"
        // })
    }
    callback = (key) => {
        console.log(key);
    }
    header = (value) => {
        if (value === "title") {
            return (
                <Row>
                    <Col span={16}>标题</Col>
                    <Col offset={16}>发布日期</Col>
                </Row>
            )
        } else {
            if (value) {
                return (
                    <Row>
                        <Col span={16} className={value.isRead ? "" : "fontWeight"}>{value.title}</Col>
                        <Col>{moment(value.date).format("lll")}</Col>
                    </Row>
                )
            }
        }
    }
    render() {
        let { form: { getFieldDecorator } } = this.props;
        const { announcementData } = this.props;
        return (
            <Card className="hover-shadow noties">
                <Form layout="inline">
                    <FormItem label={$("消息类型")} >
                        {getFieldDecorator('isRecheck')(
                            <Select showSearch={true} style={{ width: 200 }} optionFilterProp="children" allowClear={true} placeholder={$("全部")}>

                            </Select>
                        )}
                    </FormItem>
                    <FormItem label={$("发布日期")}>
                        {getFieldDecorator('settleDate', {
                            initialValue: [moment(new Date(), "YYYY-MM-DD"), moment(new Date(), "YYYY-MM-DD")],
                        })(
                            <RangePicker width="100%"
                                placeholder={[new Date(), new Date()]}
                            />
                        )}
                    </FormItem>
                </Form>
                <Collapse className="collapse" bordered={false}>
                    <Panel showArrow={false} disabled header={this.header("title")} key={"title"} style={customPanelStyle}>
                    </Panel>
                    {announcementData.map((value, index, array) => {
                        return (
                            <Panel showArrow={false} header={this.header(value)} key={index} style={customPanelStyle}>
                                <div dangerouslySetInnerHTML={{__html: value.content}}>
                                </div>
                            </Panel>
                        )
                    })}
                </Collapse>
                {/* <Pagination defaultCurrent={1} total={500} />, */}
            </Card>
        )
    }
}

export default connect(({ accountInfo }) => {
    const { announcementData } = accountInfo;
    return {
        announcementData
    }
})(
    Form.create()(Index)
)
