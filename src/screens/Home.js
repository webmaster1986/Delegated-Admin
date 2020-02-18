import React, { Component } from 'react';
import DatePicker1 from '../components/DatePickerComponent';
import { Container,Row, Col } from 'reactstrap';
export default class Home extends Component {
  render() {
    return (
      <div>
        <Container>
        <Row><Col lg={12}>&nbsp;&nbsp;</Col></Row>
          <Row>
          <Col lg={6}>
        <DatePicker1 />
        </Col>
        </Row>
        </Container>
      </div>
    )
  }
}
