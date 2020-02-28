import React, { Component } from "react";
import {Button, Col, Form, Badge, Row} from "react-bootstrap";
import Select from "react-select";
import InputMask from "react-input-mask";
import {Icon} from "antd";


class   CompanyDetailsSFC extends Component {
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
    stateOption= [{ label: "NY", value: "New York" }];
    companyStatusOption= [{ label: "Active", value: "active" },{label: "Inactive", value: "Inactive"}];
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
            companyStatus,
            comment
        } = companyDetailsObject || {};
        return (
            <>
                <Row>
                    <Col md={8}>
                        <h3 className='ml-3'>Company Details - SFC</h3>
                    </Col>
                    <Col md={2} className={"text-right mt-2"}>
                        Company Status:
                    </Col>
                    <Col md={2}>
                        <Select
                            isClearable
                            isSearchable
                            name="companyStatus"
                            value={companyStatus}
                            options={this.companyStatusOption}
                            onChange={option =>
                                this.onChange({
                                    target: { name: "companyStatus", value: option }
                                })
                            }
                        />
                    </Col>
                </Row>



                <hr/>
                <Form>
                    <Row className="mb-2">
                        <Col lg={6} md={12}>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Company Name"
                                name={"CompanyName"}
                                value={companyName || ""}
                                onChange={this.onChange}
                            />
                        </Col>
                        <Col lg={6} md={12}>
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
                        <Col lg={6} md={12}>
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Address"
                                name={"address"}
                                value={address|| ""}
                                onChange={this.onChange}
                            />
                        </Col>
                        <Col lg={6} md={12}>
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
                                            <Select
                                                isClearable
                                                isSearchable
                                                name="state"
                                                value={state}
                                                options={this.stateOption}
                                                onChange={option =>
                                                    this.onChange({
                                                        target: { name: "state", value: option }
                                                    })
                                                }
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label>Zip Code</Form.Label>
                                            <InputMask
                                                mask="99999-9999"
                                                className="form-control"
                                                placeholder="Enter Zip Code"
                                                name={"zipCode"}
                                                value={zipCode || ""}
                                                onChange={this.onChange}
                                            />
                                    </Col>
                                    </Row>
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                    <Row>
                        <Col lg={6} md={12}>
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
                                    <InputMask
                                        mask="(999)999-9999"
                                        className="form-control"
                                        placeholder="Phone Number"
                                        name={"phoneNumber1"}
                                        value={phoneNumber1|| ""}
                                        onChange={this.onChange}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={6} md={12}>
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
                                    <InputMask
                                        mask="(999)999-9999"
                                        className="form-control"
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
                        <Col md={2} style={{textAlign: "center",alignSelf: "flex-end"}}>
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
                        <Button variant="primary" onClick={this.props.toggle}>   <Icon
                            type="save"
                            style={{ fontSize: "22px", marginRight: "5px" }}
                            theme="filled"
                        />Save</Button>
                    </div>
                </Form>
            </>
        );
    }
}

export default CompanyDetailsSFC;
