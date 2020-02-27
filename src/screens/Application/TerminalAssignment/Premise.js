import React, { Component } from "react";
import { Button, Form, Col, Row, InputGroup } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import InputMask from "react-input-mask";
import Select from "react-select";
import { Icon } from "antd";
const styles = {
  col: {
    paddingLeft: 0,
    paddingRight: 0
  }
};

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
            <Col md={8}>
              <Row>
                <Col md={2} style={{ paddingRight: 0 }}>
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
                <Col md={2} style={styles.col}>
                  <Form.Label>House No</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="House No"
                    name={"houseNo"}
                    value={houseNo || ""}
                    onChange={this.onChange}
                  />
                </Col>
                <Col md={8} style={styles.col}>
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
            <Col md={2}>
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
            <Col md={2}>
              <BootstrapTable
                keyField="id"
                data={[{}]}
                columns={this.columns}
                cellEdit={cellEditFactory({ mode: "click" })}
              />
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={4}>
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
            <Col md={4}>
              <Form.Label>Monitored Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter monitored name"
                name={"monitoredName"}
                value={monitoredName || ""}
                onChange={this.onChange}
              />
            </Col>
            <Col md={4}>
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
