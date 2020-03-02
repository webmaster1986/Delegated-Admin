import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom'
import { Row, Col, Container } from 'react-bootstrap';
import Spin from "antd/lib/spin";
import Cookies from "universal-cookie"
import Header from './components/Header';
import Footer from './components/Footer';
import AppsList from "./screens/Application/AppsList";
import EditApp from "./screens/Application/EditApp";
import CreateApp from "./screens/Application/CreateApp";
// import ReviewApps from "./screens/Application/ReviewApps";
import GrantAccess from "./screens/Application/GrantAccess";
import RevokeAccess from "./screens/Application/RevokeAccess";
import RoleManagement from "./screens/Application/RoleManagement";
// import LogIn from "./screens/LogIn";
import {ApiService} from "./services/ApiService";
import './App.css';
import './assets/table.css';
import 'antd/dist/antd.css';

import AppOwners from "./screens/Application/AppOwners";
import {getLoginUser} from "./services/ApiService";
const cookies = new Cookies();

class App extends Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state = {
            isLoading: true
        }
    }

  async componentDidMount() {
      const user = getLoginUser();
      const data = await this._apiService.getLoginUserRole(user.login)
      if(!data || data.error){
          this.setState({
              isLoading: false
          })
      } else {
          cookies.set('USER_ROLE', data, { path: '/' });
          this.setState({
              isLoading: false,
              userRole: data,
          })
      }
  }

  getRoutes = () => {
      if (this.state.userRole === 'SUPER_ADMIN' || this.state.userRole === 'SUPER_APP_OWNER' ) {
        return (
          <Switch>
            <Route path={'/edit-app/:id'} component={EditApp}/>
            <Route path={'/create-apps'} component={CreateApp}/>
            {/*<Route path={'/review-apps'} component={ReviewApps}/>*/}
            <Route path={'/grant-access'} component={GrantAccess}/>
            <Route path={'/revoke-access'} component={RevokeAccess}/>
            <Route path={'/role-manage/:id'} component={RoleManagement}/>
            <Route path={'/'} component={AppsList}/>
          </Switch>
        );
      }
    return (
      <Switch>
        <Route path={'/grant-access'} component={GrantAccess}/>
        <Route path={'/revoke-access'} component={RevokeAccess}/>
        <Route path={'/'} component={AppOwners} />
      </Switch>
    );
  }

    render() {
        const { isLoading, userRole } = this.state
    return (
       <div>
           { isLoading ? <div className="text-center mt-5-p"> <Spin className='mt-50 custom-loading'/> </div> :
               <>
                 <Header userRole={userRole}/>
                 <Container>
                    <Row>
                      <Col lg="12">
                         {
                           this.getRoutes()
                         }
                      </Col>
                    </Row>
                   <Footer />
                 </Container>
                </>
           }
      </div>
    );
  }
}

export default App;
