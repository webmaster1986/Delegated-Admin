import React from "react";
import {Modal} from 'antd';
import {Col, Form, Row} from "react-bootstrap";
import Spin from "antd/lib/spin";

class TerminalModal extends React.Component {
    state = {
        isLoading: false,
        coverage: ""
    }

    render(){
        const {isLoading, coverage} = this.state
        return (
            <Modal
                title="New Terminal"
                visible={true}
                onOk={this.props.handleModal}
                onCancel={this.props.handleModal}
            >
                <>
                    {
                        isLoading ? <div className={'text-center'}><Spin className='mt-50 custom-loading'/></div> :
                            <div className="ml-3 mr-3">
                                <Row>
                                    <Col>
                                        <Row>
                                            <label>Terminal type(Required)</label>
                                        </Row>
                                        <Row style={{width: "100%"}}>
                                            <Form.Control as="select">
                                                <option>Carbon Monoxide</option>
                                                <option>Carbon Dioxide</option>
                                            </Form.Control>
                                        </Row>
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
                                                    // onChange={(e) => this.onCheck(e)}
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
                                                    // onChange={(e) => this.onCheck(e)}
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
                                            <Form.Control type="text" placeholder="Back of the Building" />
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <Row>
                                            <label>Description</label>
                                        </Row>
                                        <Row>
                                            <Form.Control type="text" placeholder="Please read the manual" />
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <Row>
                                            <label>Comment</label>
                                        </Row>
                                        <Row>
                                            <Form.Control type="text" placeholder="Enter a comment.." />
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
