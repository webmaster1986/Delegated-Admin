import React from 'react';
import {
  Row,Col
} from 'react-bootstrap';

export default class Footer extends React.Component {
    render() {
        return (
            <div className="container footer">
              <hr style={{borderTop: '1px solid #808080'}} />
              <p>
                <span>&copy;</span> 2019 Fire Department City of New York
              </p>
            </div>
        );
      }
}