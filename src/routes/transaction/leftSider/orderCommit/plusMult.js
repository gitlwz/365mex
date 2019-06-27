import React, { Component } from 'react'
import { Button } from 'quant-ui';
const ButtonGroup = Button.Group;
class Index extends Component {
    render() {
        return (
            <ButtonGroup className="btn-group" size="small">
                <Button onClick={() => this.props.clickFunction(this.props.plusLeftF * 1)} className="Buttons button-color-redP">{this.props.plusLeftF}</Button>
                <Button onClick={() => this.props.clickFunction(this.props.plusLeftS * 1)} className="Buttons button-color-volcano">{this.props.plusLeftS}</Button>
                <Button onClick={() => this.props.clickFunction(this.props.multRightF * 1)} className="Buttons button-color-greenP">{this.props.multRightF}</Button>
                <Button onClick={() => this.props.clickFunction(this.props.multRightS * 1)} className="Buttons button-color-greenS">{this.props.multRightS}</Button>
            </ButtonGroup>
        )
    }
}
export default Index