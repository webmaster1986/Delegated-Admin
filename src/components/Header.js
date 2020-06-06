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

  state = {
    hideLogout: window.location.href.toLowerCase().includes("external=true") || sessionStorage.getItem("hideLogout"),
    loginUser: "",
    headerClass: `${this.props.environment}-header`,
  }

  async componentDidMount() {
    if(window.location.href.toLowerCase().includes("external=true")) {
      sessionStorage.setItem("hideLogout", true)
    }
    this.setState({
      isLoading: true
    })
    const user = getLoginUser();
    const data =  await this._apiService.getLoginUserName(user.login)
    if (!data || data.error) {
      this.setState({
        isLoading: false
      })
      return message.error('An error has occurred. Please try again.');
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
    const {loginUser, headerClass, hideLogout} = this.state
    return (
      <div
        className={`${headerClass} header-nav`}
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
                    <Nav.Item className={headerClass}>
                      <Link
                        to="/DelegatedAdmin/"
                        className={'nav-link color-white'}
                      >
                        Applications
                      </Link>
                    </Nav.Item>
                  </li>
                  <li>
                    <Nav.Item className={headerClass}>
                      <a className={'nav-link color-white'}>
                        Manage Access
                      </a>
                    </Nav.Item>
                    <ul className={`${headerClass}-submenu`}>
                      <li><a>Grant Access</a>
                        <ul className={`${headerClass}-submenu`}>
                          <li>
                            <a
                              href={"/DelegatedAdmin/grant-access?by=user"}
                              className={'nav-link color-white'}
                            >
                              By User
                            </a>
                          </li>
                          <li>
                            <a
                              href={"/DelegatedAdmin/grant-access?by=roles"}
                              className={'nav-link color-white'}
                            >
                              By Role
                            </a>
                          </li>
                        </ul>
                      </li>
                      <li><a>Revoke Access</a>
                        <ul className={`${headerClass}-submenu`}>
                          <li>
                            <a
                              href={"/DelegatedAdmin/revoke-access?by=user"}
                              className={'nav-link color-white'}
                            >
                              By User
                            </a>
                          </li>
                          <li>
                            <a
                              href={"/DelegatedAdmin/revoke-access?by=roles"}
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
              <MobileMenu headerClass={headerClass}/>
              <div className="header-nav-right">
                <h6 className="wc-username">{loginUser ? `Welcome ${loginUser}` : ""}</h6>
                {
                  hideLogout ? null : <a className="logout" onClick={() => this.onLogout()}>Logout</a>
                }
              </div>
            </Navbar.Collapse>
          </Navbar>
        </Container>
      </div>
    );
  }
}

export default Header;
