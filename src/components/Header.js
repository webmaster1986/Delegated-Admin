import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {
  Container,
  Nav,
  Navbar,
} from 'react-bootstrap';
import badge from '../components/images/FDNY.png';

class Header extends Component {
  render() {
    return (
      <div
        className='red-background'
      >
        <Container>
          <Navbar>
            <Navbar.Brand href='/'>
              <img
                src={badge}
                alt='FDNY icon'
                style={{height: '60px'}}
              />
              <span className='nav-text align-middle pl-2'>FDNY</span>
            </Navbar.Brand>

            {
              (this.props.userRole === 'SUPER_ADMIN' || this.props.userRole === 'SUPER_APP_OWNER') ?
                  <Nav>
                    <Nav.Item>
                      <Link
                          to="/review-apps"
                          className={'nav-link color-white'}
                      >
                        Review
                      </Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Link
                          to="/grant-access"
                          className={'nav-link color-white'}
                      >
                        Access
                      </Link>
                    </Nav.Item>
                  </Nav> :
                  <Nav>
                    <Nav.Item>
                      <Link
                          to="/"
                          className={'nav-link color-white'}
                      >
                        Applications
                      </Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Link
                          to="/grant-access"
                          className={'nav-link color-white'}
                      >
                        Grant
                      </Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Link
                          to="/revoke-access"
                          className={'nav-link color-white'}
                      >
                        Revoke
                      </Link>
                    </Nav.Item>
                  </Nav>
            }

          </Navbar>
        </Container>
      </div>
    );
  }
}

export default Header;
