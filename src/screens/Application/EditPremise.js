import React from "react";
import {Modal} from 'antd';
import {Col, Form, Row} from "react-bootstrap";
import Spin from "antd/lib/spin";

class EditPremise extends React.Component {
    state = {
        isLoading: false,
    }

    render(){
        const {isLoading} = this.state
        return (
            <Modal
                title="Edit Premise"
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
                                            <label>Monitored Name</label>
                                        </Row>
                                        <Row>
                                            <Form.Control type="text" placeholder="ROCKAWAYAVE" />
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <Row>
                                            <label>Zip Code</label>
                                        </Row>
                                        <Row>
                                            <Form.Control type="text"/>
                                        </Row>
                                    </Col>
                                    <Col/>
                                </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <Row>
                                            <label>Building Dominant Occupancy Classification</label>
                                        </Row>
                                        <Row style={{width: "50%"}}>
                                            <Form.Control as="select">
                                                <option>Factory & Industrial</option>
                                                <option>Factory</option>
                                                <option>Industrial</option>
                                            </Form.Control>
                                            {/*<Form.Row>
                                                <Form.Group className="ml-2 mt-1" controlId="exampleForm.ControlSelect1">
                                                    <Form.Label>Borough</Form.Label>
                                                    <Form.Control as="select">
                                                        <option>Factory & Industrial</option>
                                                        <option>Factory</option>
                                                        <option>Industrial</option>
                                                    </Form.Control>
                                                </Form.Group>
                                            </Form.Row>*/}
                                        </Row>
                                    </Col>
                                </Row>
                                <Row >
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

export default EditPremise;
