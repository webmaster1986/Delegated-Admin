import React, { Component } from "react";
import { Button, Form, Col, Row, InputGroup } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import InputMask from "react-input-mask";
import Select from "react-select";
import { Icon } from "antd";
import './Premises.css'

class Premise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      premiseObject: {}
    };
  }

  onChange = event => {
    const { name, value } = event.target;
    this.setState({
      premiseObject: {
        ...this.state.premiseObject,
        [name]: value
      }
    });
  };
  columns = [
    {
      dataField: "box",
      text: "BOX"
    },
    {
      dataField: "bin",
      text: "BIN"
    }
  ];
  boroughOptions = [{ label: "Borough", value: "Borough" }];
  monitoringCompanyOption = [
    { label: "Monitoring Company", value: "monitoringCompany" }
  ];
  occupancyClassificationOption = [
    { label: "Monitoring Company", value: "monitoringCompany" }
  ];
  render() {
    const { premiseObject } = this.state;
    const {
      borough,
      houseNo,
      street,
      zipCode,
      monitoringCompany,
      monitoredName,
      comment,
      occupancyClassification
    } = premiseObject || {};
    return (
      <>
        <h4 className="m-2">Premise</h4>
        <hr />
        <Form>
          <Row className="mb-2">
            <Col md={12} lg={8} >
              <Row>
                <Col lg={2} md={3} className="borough-padding">
                  <Form.Label>Borough</Form.Label>
                  <Select
                    isClearable
                    isSearchable
                    name="borough"
                    value={borough}
                    onChange={(option) => this.onChange({ target: { name: 'borough', value: option } })}
                    options={this.boroughOptions}
                  />
                </Col>
                <Col lg={2} md={3} className="house-no-padding">
                  <Form.Label>House No</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="House No"
                    name={"houseNo"}
                    value={houseNo || ""}
                    onChange={this.onChange}
                  />
                </Col>
                <Col lg={8} md={6} className="street-padding">
                  <Form.Label>Street</Form.Label>
                  <InputGroup style={{ display: "flex !important" }}>
                    <Form.Control
                      type="text"
                      placeholder="Enter Street"
                      name={"street"}
                      value={street || ""}
                      onChange={this.onChange}
                    />
                    <InputGroup.Append>
                      <Button variant="primary">Verify</Button>
                    </InputGroup.Append>
                  </InputGroup>
                </Col>
              </Row>
            </Col>
            <Col md={6} lg={2}>
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
            <Col md={6} lg={2} className="table-col">
              <BootstrapTable
                keyField="id"
                data={[{}]}
                columns={this.columns}
                className="mt-2"
                cellEdit={cellEditFactory({ mode: "click" })}
                // headerClasses={{marginTop: "5px"}}
                headerClasses="styled-header"
              />
            </Col>
          </Row>
          <Row className="mb-2">
            <Col lg={4} md={6}>
              <Form.Label>Monitoring Company</Form.Label>
              <Select
                isClearable
                isSearchable
                onChange={(option) => this.onChange({ target: { name: 'monitoringCompany', value: option } })}
                name="monitoringCompany"
                value={monitoringCompany}
                options={this.monitoringCompanyOption}
              />
            </Col>
            <Col lg={4} md={6}>
              <Form.Label>Monitored Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter monitored name"
                name={"monitoredName"}
                value={monitoredName || ""}
                onChange={this.onChange}
              />
            </Col>
            <Col lg={4} md={12}>
              <Form.Label>
                Building Dominant Occupancy Classification
              </Form.Label>
              <Select
                isClearable
                isSearchable
                name="occupancyClassification"
                value={occupancyClassification}
                onChange={(option) => this.onChange({ target: { name: 'occupancyClassification', value: option } })}
                options={this.occupancyClassificationOption}
              />
            </Col>
          </Row>
          <Row className="mb-2">
            <Col>
              <Form.Label>Comment(Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Write a comment..."
                name={"comment"}
                value={comment || ""}
                onChange={this.onChange}
              />
            </Col>
          </Row>
          <div className="text-right mt-5">
            <Button variant="primary" onClick={this.props.toggle}>
              <Icon
                type="save"
                style={{ fontSize: "22px", marginRight: "5px" }}
                theme="filled"
              />
              Save
            </Button>
          </div>
        </Form>
      </>
    );
  }
}

export default Premise;
