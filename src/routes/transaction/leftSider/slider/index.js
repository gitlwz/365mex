/* eslint-disable eqeqeq */
import React, { Component } from 'react'
import { connect } from 'dva';
import { Slider, InputNumber, Button, language } from 'quant-ui';
let { getLanguageData } = language;
let $ = getLanguageData;
const limitDecimals = (value) => {
    const reg = /^(\-)*(\d+)\.(\d\d).*$/;
    if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
    } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
    } else {
        return ''
    }
};
let marks = {
    0: {
        style: {
            width: '35px',
        },
        label: <strong>{$('全仓')}</strong>,
    }, 12: '1x', 24: '2x', 36: '3x', 48: '5x', 60: '10x', 72: '25x', 84: '50x', 96: '100x',
};
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            showInput: props.nextProps,
            inputValue: 0,
            currentRisk: props.currentRisk
        }
        this.changed = false;
        this.loading = false;
    }
    renderRadio = (currentRisk) => {
        switch (currentRisk) {
            case 2:
                marks = {
                    0: {
                        style: {
                            width: '35px',
                        },
                        label: <strong>{$('全仓')}</strong>,
                    }, 12: '1x', 24: '2x', 36: '3x', 48: '5x', 60: '10x', 72: '25x', 84: '50x', 96: '100x',
                }
                break;
            case 3:
                marks = {
                    0: {
                        style: {
                            width: '35px',
                        },
                        label: <strong>{$('全仓')}</strong>,
                    }, 12: '1x', 24: '2x', 36: '3x', 48: '5x', 60: '10x', 72: '25x', 84: '50x', 96: '66.6x',
                }
                break;
            case 4:
                marks = {
                    0: {
                        style: {
                            width: '35px',
                        },
                        label: <strong>{$('全仓')}</strong>,
                    }, 12: '1x', 24: '2x', 36: '3x', 48: '5x', 60: '10x', 72: '25x', 84: '35x', 96: '50x',
                }
                break;
            case 5:
                marks = {
                    0: {
                        style: {
                            width: '35px',
                        },
                        label: <strong>{$('全仓')}</strong>,
                    }, 12: '1x', 24: '2x', 36: '3x', 48: '5x', 60: '10x', 72: '25x', 84: '33.3x', 96: '40x',
                }
                break;
            case 6:
                marks = {
                    0: {
                        style: {
                            width: '35px',
                        },
                        label: <strong>{$('全仓')}</strong>,
                    }, 14: '1x', 28: '2x', 42: '3x', 56: '5x', 70: '10x', 84: '25x', 98: '33.3x',
                }
                break;
            case 7:
                marks = {
                    0: {
                        style: {
                            width: '35px',
                        },
                        label: <strong>{$('全仓')}</strong>,
                    }, 11: '1x', 22: '2x', 33: '3x', 44: '5x', 55: '10x', 66: '15x', 77: '20x', 88: '25x', 99: '28.5x',
                }
                break;
            case 8:
                marks = {
                    0: {
                        style: {
                            width: '35px',
                        },
                        label: <strong>{$('全仓')}</strong>,
                    }, 12: '1x', 24: '2x', 36: '3x', 48: '5x', 60: '10x', 72: '15x', 84: '20x', 96: '25x',
                }
                break;
            case 9:
                marks = {
                    0: {
                        style: {
                            width: '35px',
                        },
                        label: <strong>{$('全仓')}</strong>,
                    }, 11: '1x', 22: '2x', 33: '3x', 44: '4x', 55: '5x', 66: '10x', 77: '15x', 88: '20x', 99: '22.2x',
                }
                break;
            case 10:
                marks = {
                    0: {
                        style: {
                            width: '35px',
                        },
                        label: <strong>{$('全仓')}</strong>,
                    }, 12: '1x', 24: '2x', 36: '3x', 48: '4x', 60: '5x', 72: '10x', 84: '15x', 96: '20x',
                }
                break;
            case 11:
                marks = {
                    0: {
                        style: {
                            width: '35px',
                        },
                        label: <strong>{$('全仓')}</strong>,
                    }, 12: '1x', 24: '2x', 36: '3x', 48: '4x', 60: '5x', 72: '10x', 84: '15x', 96: '18.1x',
                }
                break;
            default:
                marks[96] = '100x';
                break;
        }
    }
    componentWillMount = () => {
        for (let key in marks) {
            if (key != 0 && marks[key].substring(0, marks[key].length - 1) * 1 >= this.props.value * 1) {
                if (key === this.state.value) {
                    return;
                }
                this.setState({
                    value: key
                })
                break;
            } else if (this.props.value == "0") {
                if (key == this.state.value) {
                    return;
                }
                this.setState({
                    value: 0
                })
                break;
            } else if (key >= 96) {
                this.setState({
                    value: key
                })
            }
        }
    }
    componentWillReceiveProps = (nextProps) => {
        this.renderRadio(nextProps.currentRisk);
        this.setState({
            showInput: nextProps.showInput,
            currentRisk: nextProps.currentRisk
        })
        if (!nextProps.loading && (this.props.value !== nextProps.value || !this.props.setLeverageSuccess || this.props.setRiskSuccess)) {
            for (let key in marks) {
                if (key != 0 && marks[key].substring(0, marks[key].length - 1) >= parseInt(nextProps.value * 10) / 10) {
                    if (key === this.state.value) {
                        return;
                    }
                    this.setState({
                        value: key
                    })
                    break;
                } else if (nextProps.value == "0") {
                    if (key == this.state.value) {
                        return;
                    }
                    this.setState({
                        value: 0
                    })
                    break;
                }
            }
        }
    }
    onChangeRadioUpdate = (value) => {
        const { dispatch } = this.props;
        let valueNum = "0";
        for (let key in marks) {
            if (key == value && value !== 0) {
                valueNum = marks[key].substring(0, marks[key].length - 1);
                break;
            }
        }
        dispatch({
            type: "orderList/setLeverage",
            payload: { leverage: valueNum }
        })
    }
    onChangeRadio = (value) => {
        this.setState({
            value
        })
    }
    onChange = (e) => {
        let value = e.target.value;
        this.changed = true;
        if(value > 100){
            value = 100;
        }else{
            value = limitDecimals(value);
        }
        this.setState({
            inputValue: value
        })
    }
    cancelChange = () => {
        this.changed = false;
        this.setState({
            inputValue:0
        })
        this.props.onClick()
    }
    onClick = () => {
        if (this.changed) {
            const { dispatch } = this.props;
            this.changed = false;
            this.loading = true;
            dispatch({
                type: "orderList/setLeverage",
                payload: { leverage: this.state.inputValue }
            })
        } else {
            this.changed = false;
            this.props.onClick()
        }
    }
    handleEnterKey = (e) => {
        if (e.charCode === 13) {
            this.onClick()
        }
    }
    onlyNumber = (e, key) => {
        if (key === "qty" && e.charCode === 46) {
            e.preventDefault();
            return false;
        }
        if (e.charCode === 45) {
            e.preventDefault();
            return false;
        }
    }
    showInputItem = () => {
        const { loading, value } = this.props;
        if (!loading && this.loading) {
            this.props.onClick();
            this.loading = false;
        }
        let inputValue = this.state.inputValue || value;
        return <div className='leverage' onKeyPress={(e) => this.handleEnterKey(e)}>
            <span className='leverage_label'>{$('杠杆')}</span>
            <span className='levetage_option'>
                <input
                    className='levetage_input'
                    autoFocus
                    type='number'
                    max="100"
                    min="0"
                    value={inputValue}
                    step={0.01}
                    onKeyPress={(e) => this.onlyNumber(e)}
                    onChange={this.onChange}
                />
                {/* <InputNumber
                    className='levetage_input'
                    autoFocus
                    size="small"
                    step={0.01}
                    precision={2}
                    min={0.00}
                    max={100}
                    formatter={limitDecimals}
                    parser={limitDecimals}
                    defaultValue={this.props.value}
                    onChange={this.onChange}
                /> */}
                {/* <button style={{ marginRight: 3, marginBottom: 2, cursor: "pointer" }} onClick={this.cancelChange} className={'check-icon-img close'}></button>
                <button style={{ cursor: "pointer", marginBottom: 2, }}  disabled={loading} onClick={this.onClick} className={'check-icon-img check'}></button> */}
                <Button className='levetage_button levetage_cancel' style={{width: 24}} onClick={this.cancelChange} size="small">
                    <i style={{ cursor: 'pointer' }} className={'check-icon-img close'}></i>
                </Button>
                <Button className='levetage_button levetage_ok' style={{width: 24}}  onClick={this.onClick} size="small">
                    <i style={{ cursor: 'pointer' }} className={'check-icon-img check'}></i>
                </Button>
            </span>
        </div>
    }
    render() {
        let max = 96;
        for (let key in marks) {
            if (key >= max) {
                max = Number(key);
            }
        }
        return (
            <div>
                {
                    this.state.showInput ? this.showInputItem() : <Slider
                        value={this.state.value * 1}
                        onAfterChange={this.onChangeRadioUpdate}
                        onChange={this.onChangeRadio}
                        range={false}
                        max={max}
                        included={false} style={{ color: "white" }} tipFormatter={null} marks={marks} step={null} />
                }
            </div>
        )
    }
}

export default connect(({ loading, orderList }) => {
    const { setLeverageSuccess, setRiskSuccess } = orderList;
    return {
        loading: !!loading.effects["orderList/setLeverage"],
        setLeverageSuccess,
        setRiskSuccess
    }
})(
    Index
)
