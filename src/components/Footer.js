import React from 'react';
import {
  Row,Col
} from 'react-bootstrap';

export default class Footer extends React.Component {
    render() {
        return (
            <Row>
              <Col /* style={{paddingLeft: '40px', paddingRight: '40px'}} */>
              <hr style={{borderTop: '1px solid #808080', marginTop: '40px', marginBottom: '5px',}} /><p style={{marginBottom: '20px'}}><span>&copy;</span> 2019 Fire Department City of New York</p>
              </Col>
            </Row>
        );
      }
}