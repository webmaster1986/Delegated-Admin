import React, { Component } from "react";
import { Button, Form, Col, Row, InputGroup } from "react-bootstrap";

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
                  <Form.Control
                    as="select"
                    placeholder="Borough"
                    name={"borough"}
                    value={borough || ""}
                    onChange={this.onChange}
                  >
                    <option>Borough</option>
                    <option>...</option>
                  </Form.Control>
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
              <Form.Control
                type="text"
                placeholder="Enter Zip Code"
                name={"zipCode"}
                value={zipCode || ""}
                onChange={this.onChange}
              />
            </Col>
            <Col md={2}>
              <table border="1" style={{width: "100%"}}>
                <thead>
                <tr>
                    <th>Box</th>
                    <th>BIN</th>
                </tr>
                </thead>
                <tbody>
                  <tr>
                    <td> </td>
                    <td> </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={4}>
              <Form.Label>Monitoring Company</Form.Label>
              <Form.Control
                as="select"
                placeholder="Monitoring Company"
                name={"monitoringCompany"}
                value={monitoringCompany || ""}
                onChange={this.onChange}
              >
                <option>Select monitoring company</option>
                <option>...</option>
              </Form.Control>
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
              <Form.Control
                as="select"
                name={"occupancyClassification"}
                placeholder="Select Occupancy Classification"
                value={occupancyClassification || ""}
                onChange={this.onChange}
              >
                <option>Occupancy Classification</option>
                <option>Occupancy Classification</option>
              </Form.Control>
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
            <Button variant="primary" onClick={this.props.toggle}>Save</Button>
          </div>
        </Form>
      </>
    );
  }
}

export default Premise;
