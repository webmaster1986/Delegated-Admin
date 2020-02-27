import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {
  Container,
  Nav,
  Navbar
} from 'react-bootstrap';
import badge from '../components/images/FDNY.png';
import "./nav.css"
import MobileMenu from "./MobileMenu";

class Header extends Component {
  render() {
    return (
      <div
        className='red-background header-nav'
      >
        <Container>
          <Navbar collapseOnSelect expand="lg">
            <Navbar.Brand href='/'>
              <img
                src={badge}
                alt='FDNY icon'
                style={{height: '60px'}}
              />
              <span className='nav-text align-middle pl-2'>FDNY</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="mr-auto desktop-menu">
                <ul className="nav">
                  <li>
                    <Nav.Item>
                      <Link
                        to="/"
                        className={'nav-link color-white'}
                      >
                        Applications
                      </Link>
                    </Nav.Item>
                  </li>
                  <li>
                    <Nav.Item>
                      <a className={'nav-link color-white'}>
                        Manage Access
                      </a>
                    </Nav.Item>
                    <ul className="nav-submenu">
                      <li><a>Grant Access</a>
                        <ul className="nav-submenu">
                          <li>
                            <a
                              href={"/grant-access?by=user"}
                              className={'nav-link color-white'}
                            >
                              By User
                            </a>
                          </li>
                          <li>
                            <a
                              href={"/grant-access?by=roles"}
                              className={'nav-link color-white'}
                            >
                              By Role
                            </a>
                          </li>
                        </ul>
                      </li>
                      <li><a>Revoke Access</a>
                        <ul className="nav-submenu">
                          <li>
                            <a
                              href={"/revoke-access?by=user"}
                              className={'nav-link color-white'}
                            >
                              By User
                            </a>
                          </li>
                          <li>
                            <a
                              href={"/revoke-access?by=roles"}
                              className={'nav-link color-white'}
                            >
                              By Role
                            </a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </Nav>
              <MobileMenu/>
              <div className="header-nav-right">
                <h6 className="wc-username">Welcome Bo Chen</h6>
                <a className="logout" onClick={() => {}}>Logout</a>
              </div>
            </Navbar.Collapse>
          </Navbar>
        </Container>
      </div>
    );
  }
}

export default Header;
