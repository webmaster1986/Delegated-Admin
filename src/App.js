import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom'
import { Row, Col, Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import AppsList from "./screens/Application/AppsList";
import EditApp from "./screens/Application/EditApp";
import CreateApp from "./screens/Application/CreateApp";
import ReviewApps from "./screens/Application/ReviewApps";
import GrantAccess from "./screens/Application/GrantAccess";
import RoleManagement from "./screens/Application/RoleManagement";
import LogIn from "./screens/LogIn";
import './App.css';

class App extends Component {
  render() {
    return (
       <div>
         <Header />
         <Container>
            <Row>
              <Col lg="12">
                  <Switch>
                    <Route path={'/login'} component={LogIn}/>
                    <Route path={'/edit-app/:id'} component={EditApp}/>
                    <Route path={'/create-apps'} component={CreateApp}/>
                    <Route path={'/review-apps'} component={ReviewApps}/>
                    <Route path={'/grant-access'} component={GrantAccess}/>
                    <Route path={'/role-manage'} component={RoleManagement}/>
                    <Route path={'/'} component={AppsList}/>
                  </Switch>
              </Col>
            </Row>
           <Footer />
         </Container>
      </div>
    );
  }
}

export default App;
