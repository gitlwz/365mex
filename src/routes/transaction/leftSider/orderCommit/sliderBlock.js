import React, { Component } from 'react'

export default class SliderBlock extends Component {
    constructor(props) {
        super(props)
        
    }
    
    render() {
        return (
            <div className="slideBlock">
                <div className="slideBlock_left"></div>
                <div className="slideBlock_right"></div>
            </div>
        )
    }
}
