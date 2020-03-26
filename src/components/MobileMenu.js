import React from 'react';
import { Link } from 'react-router-dom'
import {
  Nav,
  NavDropdown
} from 'react-bootstrap';

const MobileMenu = ({headerClass}) => {
  const handleClick = (path) => {
    window.location.pathname = path
  }

  return (
    <Nav className="mr-auto mobile-menu">
      <Nav.Item className={headerClass}>
        <Link
          to="/"
          className={'nav-link color-white'}
        >
          Applications
        </Link>
      </Nav.Item>
      <NavDropdown title="Manage Access" id="collasible-nav-dropdown" className={headerClass}>
        <NavDropdown.Item className={headerClass}>
          <NavDropdown title="Grant Access" id="collasible-nav-dropdown" className={headerClass}>
            <NavDropdown.Item onClick={() => handleClick("/grant-access?by=user")}>
              By User
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => handleClick("/grant-access?by=roles")}>
              By Role
            </NavDropdown.Item>
          </NavDropdown>
        </NavDropdown.Item>
        <NavDropdown.Item className={headerClass}>
          <NavDropdown title="Revoke Access" id="collasible-nav-dropdown">
            <NavDropdown.Item onClick={() => handleClick("/revoke-access?by=user")}>
              By User
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => handleClick("/revoke-access?by=roles")}>
              By Role
            </NavDropdown.Item>
          </NavDropdown>
        </NavDropdown.Item>
      </NavDropdown>
    </Nav>
  )
}

export default MobileMenu;
