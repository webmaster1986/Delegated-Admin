import React, { Component } from "react";
import {Button, Col, Form, Badge, Row} from "react-bootstrap";


class CompanyDetailsSFC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            companyDetailsObject: {}
        };
    }
    onChange = event => {
        const { name, value } = event.target;
        this.setState({
            companyDetailsObject: {
                ...this.state.companyDetailsObject,
                [name]: value
            }
        });
    };

    render() {
        const { companyDetailsObject } = this.state;
        const {
            companyName,
            aka,
            inspectionDate,
            emailAddress,
            address,
            city,
            state,
            zipCode,
            contact1,
            phoneNumber1,
            contact2,
            phoneNumber2,
            comment
        } = companyDetailsObject || {};
        return (
            <>
                <h3 className='ml-3'>Company Details - SFC</h3>
                <hr/>
                <Form>
                    <Row className="mb-2">
                        <Col md={6}>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Company Name"
                                name={"CompanyName"}
                                value={companyName || ""}
                                onChange={this.onChange}
                            />
                        </Col>
                        <Col md={6}>
                            <Row>
                                <Col md={6}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Label>AKA</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter AKA"
                                                name={"aka"}
                                                value={aka || ""}
                                                onChange={this.onChange}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label>Inspection Date</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Inspection Date"
                                                name={"inspectionDate"}
                                                value={inspectionDate || ""}
                                                onChange={this.onChange}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Email Address"
                                        name={"emailAddress"}
                                        value={emailAddress || ""}
                                        onChange={this.onChange}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col md={6}>
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Address"
                                name={"address"}
                                value={address|| ""}
                                onChange={this.onChange}
                            />
                        </Col>
                        <Col md={6}>
                            <Row>
                                <Col md={6}>
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter City"
                                        name={"city"}
                                        value={city|| ""}
                                        onChange={this.onChange}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Label>
                                                State
                                            </Form.Label>
                                            <Form.Control
                                                as="select"
                                                name={"state"}
                                                placeholder="Select state"
                                                value={state || ""}
                                                onChange={this.onChange}
                                            >
                                                <option>NY</option>
                                            </Form.Control>
                                        </Col>
                                        <Col md={6}>
                                        <Form.Label>ZipCode</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Zip Code"
                                            name={"zipCode"}
                                            value={zipCode|| ""}
                                            onChange={this.onChange}
                                        />
                                    </Col>
                                    </Row>
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Row>
                                <Col md={6}>
                                    <Form.Label>Contact 1</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Contact Person Name"
                                        name={"contact1"}
                                        value={contact1|| ""}
                                        onChange={this.onChange}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Phone Number"
                                        name={"phoneNumber1"}
                                        value={phoneNumber1|| ""}
                                        onChange={this.onChange}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col md={6}>
                            <Row>
                                <Col md={6}>
                                    <Form.Label>Contact 2</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Contact Person Name"
                                        name={"contact2"}
                                        value={contact2|| ""}
                                        onChange={this.onChange}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Phone Number"
                                        name={"phoneNumber2"}
                                        value={phoneNumber2|| ""}
                                        onChange={this.onChange}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={2}>
                            <h6>
                                Comment <Badge variant="secondary">3</Badge>
                            </h6>
                        </Col>
                        <Col md={10}>
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Write a Comment"
                                name={"comment"}
                                value={comment|| ""}
                                onChange={this.onChange}
                            />
                        </Col>
                    </Row>
                    <div className="text-right mt-5">
                        <Button variant="primary" onClick={this.props.toggle}>Save</Button>
                    </div>
                </Form>
            </>
        );
    }
}

export default CompanyDetailsSFC;
