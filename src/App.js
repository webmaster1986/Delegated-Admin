import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom'
import {Container} from 'react-bootstrap';
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
import { ROLES } from "./constants/constants"

const cookies = new Cookies();

class App extends Component {
    _apiService = new ApiService();

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            isAuth: true,
            environment: "prd"
        }
    }

    async componentDidMount() {
        const user = getLoginUser();
        const data = await this._apiService.getLoginUserRole(user.login)
        const envData = await this._apiService.getEnvironment()
        if (!data || data.error || !data.result) {
            this.setState({
                isLoading: false,
                isAuth: false
            })
        } else {
            cookies.set('USER_ROLE', data.result, {path: '/'});
            this.setState({
                isLoading: false,
                userRole: data.result,
                environment: envData && envData.environment
            })
        }
    }

    getRoutes = () => {
        if (this.state.userRole === ROLES.SUPER_ADMIN) {
            return (
                <Switch>
                    <Route path={'/DelegatedAdmin/edit-app/:id'} component={EditApp}/>
                    <Route path={'/DelegatedAdmin/create-apps'} component={CreateApp}/>
                    {/*<Route path={'/review-apps'} component={ReviewApps}/>*/}
                    <Route path={'/DelegatedAdmin/grant-access'} component={GrantAccess}/>
                    <Route path={'/DelegatedAdmin/revoke-access'} component={RevokeAccess}/>
                    <Route path={'/DelegatedAdmin/role-manage/:id'} component={RoleManagement}/>
                    <Route path={'/DelegatedAdmin/'} component={AppsList}/>
                </Switch>
            );
        }
        return (
            <Switch>
                <Route path={'/DelegatedAdmin/grant-access'} component={GrantAccess}/>
                <Route path={'/DelegatedAdmin/revoke-access'} component={RevokeAccess}/>
                <Route path={'/DelegatedAdmin/'} component={AppOwners}/>
            </Switch>
        );
    }

    render() {
        const {isLoading, userRole, environment, isAuth} = this.state
        if(!isAuth){
            return <h3>You don't have a permission to load this page.</h3>
        }
        return (
            <div>
                {isLoading ? <div className="text-center mt-5-p"><Spin className='mt-50 custom-loading'/></div> :
                    <>
                        <Header userRole={userRole} environment={environment}/>
                        <Container>
                            {this.getRoutes()}
                            <Footer/>
                        </Container>
                    </>
                }
            </div>
        );
    }
}

export default App;
