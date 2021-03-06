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
import message from "antd/lib/message";
import {ApiService, getLoginUser} from "../services/ApiService";

class Header extends Component {
  _apiService = new ApiService();

  state = { loginUser: "" }

  async componentDidMount() {
    this.setState({
      isLoading: true
    })
    const user = getLoginUser();
    const data =  await this._apiService.getLoginUserName(user.login)
    if (!data || data.error) {
      this.setState({
        isLoading: false
      })
      return message.error('something is wrong! please try again');
    } else {
      this.setState({
        isLoading: false,
        loginUser: (data && data.result) || ""
      })
    }
  }

  onLogout = async () => {
    await this._apiService.logout()
  }

  render() {
    const {loginUser} = this.state
    return (
      <div
        className='red-background header-nav'
      >
        <Container>
          <Navbar collapseOnSelect expand="lg">
            <Navbar.Brand href='http://www.fdny.org' target="_blank">
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
                <h6 className="wc-username">{loginUser ? `Welcome ${loginUser}` : ""}</h6>
                <a className="logout" onClick={() => this.onLogout()}>Logout</a>
              </div>
            </Navbar.Collapse>
          </Navbar>
        </Container>
      </div>
    );
  }
}

export default Header;
