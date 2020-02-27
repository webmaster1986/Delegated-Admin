import React from "react";
import {Modal} from 'antd';
import {Col, Form, Row} from "react-bootstrap";
import Spin from "antd/lib/spin";
import Select from "react-select";

class TerminalModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            terminalObject: {}
        };
    }
    state = {
        isLoading: false,
        coverage: ""
    };

    onChange = event => {
        const { name, value } = event.target;
        this.setState({
            terminalObject: {
                ...this.state.terminalObject,
                [name]: value
            }
        });
    };
    terminalTypeOption=[{label:'Carbon Monoxide', value:'carbonMonoxide'}];
    render(){
        const {isLoading, coverage, areaOfProtection, description, comment} = this.state;
        return (
            <Modal
                title="New Terminal"
                visible={true}
                onOk={this.props.handleModal}
                okText="Save"
                cancelText="Close"
                onCancel={this.props.handleModal}
            >
                <>
                    {
                        isLoading ? <div className={'text-center'}><Spin className='mt-50 custom-loading'/></div> :
                            <div className="ml-3 mr-3">
                                <Row>
                                    <Col style={{padding:0}}>

                                            <label>Terminal type(Required)</label>
                                            <Select isClearable isSearchable name="terminalType" value="terminalType" options={this.terminalTypeOption} />

                                    </Col>
                                    <Col>
                                        <Row>
                                            <label>Coverage(Required)</label>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Check
                                                    custom
                                                    name="selectBy"
                                                    type='radio'
                                                    id={'custom-1'}
                                                    value='byRole'
                                                    checked={coverage === 'byRole'}
                                                    onChange={this.onChange}
                                                    label="Entire Building"
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Check
                                                    custom
                                                    name="selectBy"
                                                    type='radio'
                                                    id={'custom-2'}
                                                    value='byUser'
                                                    checked={coverage === 'byUser'}
                                                    onChange={this.onChange}
                                                    label="Partial"
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <Row>
                                            <label>Area of Protection</label>
                                        </Row>
                                        <Row>
                                            <Form.Control type="text" placeholder="Back of the Building" name="areaOfProtection"  value={areaOfProtection} onChange={this.onChange} />
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <Row>
                                            <label>Description</label>
                                        </Row>
                                        <Row>
                                            <Form.Control type="text" placeholder="Please read the manual" name="description"  value={description} onChange={this.onChange} />
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <Row>
                                            <label>Comment</label>
                                        </Row>
                                        <Row>
                                            <Form.Control type="text" placeholder="Enter a comment.." name="comment"  value={comment} onChange={this.onChange}/>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                    }
                </>
            </Modal>
        )
    }
}

export default TerminalModal;
