import React, { Component } from 'react';
import {Row, Col, Form, InputGroup, Button} from 'react-bootstrap'
import Select from 'react-select';
import queryString from 'query-string';
import {ApiService, getLoginUser} from "../../../services/ApiService";
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import RevokeUsersTransfer from "./RevokeUsersTransfer";
import UserModal from "../UserModal";
import RoleModal from "../RoleModal";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import {isLoggedIn} from "../GrantAccess";

class RevokeAccess extends Component {
  _apiService = new ApiService();
  constructor(props){
    super(props)
    this.state = {
      size: 'default',
      selectedApp: [],
      allRoles: [],
      searchedRoles: [],
      searchRoleList: [],
      searchedUsers: "",
      searchedUserList: [],
      step: 0,
      isLoading: false,
      revokeBy: '',
      users: [],
      revokeRole: {},
      isInfoModal: false,
      info: {},
      user: getLoginUser()
    }
  }

  componentDidMount() {
    const {location} = this.props
    const parsed = queryString.parse(location.search);
    this.setState({
      selectedApp: parsed && parsed.app ? [{ value: parsed.app, label: parsed.app }] : [],
      revokeBy: parsed.by || 'roles'
    },() => {
      const {revokeBy} = this.state
      if(revokeBy){
        this.onStepChange()
      }
    })
  }

  getRoles = async () => {
    const { selectedApp, allRoles, searchedRoles, applicationsList } = this.state
    const apps = (selectedApp && selectedApp.length) ? selectedApp.map(item => item.value.toLowerCase()) : applicationsList.map(item => item.appCode.toLowerCase())
    const appRoles = allRoles.filter(item => apps.indexOf(item.appCode.toLowerCase()) !== -1 && item.status === "Active")
    // const filteredRoles = allRoles.filter(item => apps.indexOf(item.appCode.toLowerCase()) !== -1 && searchedRoles.indexOf(item.roleName) !== -1)
    const filteredRoles = []
    if (appRoles && searchedRoles && appRoles.length && searchedRoles.length) {
      appRoles.forEach(i => {
        searchedRoles.forEach(j => {
          if (j.value === i.roleName) {
            filteredRoles.push(i)
          }
        })
      })
    }
    this.setState({
      roles: (appRoles && appRoles.map((f, i) => ({ ...f, id: i}))) || [],
      searchRoleList: (searchedRoles && searchedRoles.length) ? filteredRoles : [] })
  };


  handleChange = (name, value) =>  {
    this.setState({
      [name]: value
    }, () => this.getRoles())
  }

  onSearch = (event) => {
    const {allUsers} = this.state
    const searchedText = event.target.value || ""
    let users = []
    if (searchedText) {
      users = allUsers.filter(obj =>
        ["userLogin", "displayName", 'email'].some(key => {
          return (
            obj && obj[key] && obj[key].toLowerCase().includes(searchedText.toLowerCase())
          )
        })
      )
    }
    this.setState({
      searchedText,
      users: !searchedText ? allUsers : users
    })
  }

  onRevoke = (revokeRole) => {
    this.setState(prevState=> ({
      step: prevState.step + 1,
      revokeRole
    }))
  }

  getDataForUser = async () => {
    let data = await this._apiService.getAllUsers()
    if (!data || data.error) {
      data = []
      message.error('something is wrong! please try again');
    }
    const users = ((data && data.users) || []).map((f, i) => ({
      id: i, key: i, ...f
    }))
    this.setState({
      isLoading: false,
      users,
      allUsers: [...data.users],
    })
  }

  getDataForRole = async () => {
    const {user} = this.state

    let applicationsList = ''
    let ownerRoles = ''

    if (isLoggedIn('SUPER_ADMIN')) {
      applicationsList = await this._apiService.getApplications(user.login)
      ownerRoles = await this._apiService.getSuperAdminRoles(user.login)
    } else {
      applicationsList = await this._apiService.getOwnerApplications(user.login);
      ownerRoles = await this._apiService.getOwnerRoles(user.login);
    }

    if (!applicationsList || applicationsList.error) {
      applicationsList = []
      message.error('something is wrong! please try again');
    }
    if (!ownerRoles || ownerRoles.error) {
      ownerRoles = []
      message.error('something is wrong! please try again');
    }

    this.setState({
      isLoading: false,
      applicationsList: (applicationsList && applicationsList.applications) || [],
      allRoles: (ownerRoles && ownerRoles.userRoles) || []
    }, () => this.getRoles())
  }

  renderStep = (step) => {
    const {revokeBy, revokeRole, user} = this.state
    switch (parseInt(step)) {
      case 0:
        return <div>{this.step1()}</div>
      case 1:
        return <div>{this.step2(revokeBy)}</div>
      case 2:
      case 3:
        return (
          <RevokeUsersTransfer
            {...this.props}
            onNextStep={() => this.setState(prevState => ({
              step: prevState.step + 1
            }))}
            toggleUserModal={this.toggleUserModal}
            toggleModal={this.toggleModal}
            user={user}
            step={step}
            revokeBy={revokeBy}
            revokeList={[revokeRole]}
          />
        )
      default:
        return (
          <div>{step}</div>
        )
    }
  }

  onChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  step1 = () => {
    const {revokeBy} = this.state
    return (
      <div key={`custom-inline-radio`} className="mb-3">
        <Form.Check
          custom
          name="revokeBy"
          type='radio'
          id={'custom-1'}
          value='user'
          checked={revokeBy === 'user'}
          onChange={this.onChange}
          label='Revoke Access By User'
        />
        <Form.Check
          custom
          name="revokeBy"
          type='radio'
          id={'custom-2'}
          value='roles'
          checked={revokeBy === 'roles'}
          onChange={this.onChange}
          label={'Revoke Access By Roles'}
        />
      </div>
    )
  }

  handleAppChange = selectedOption => {
    const {name, data} = selectedOption
    this.setState({
      [name]: data
    }, () => this.getRoles())
  }

  step2 = () => {
    const { isLoading, roles, selectedApp, searchedRoles, searchedText, applicationsList, searchRoleList, revokeBy, users } = this.state;
    const data = (searchedRoles && searchedRoles.length) ? searchRoleList : roles;

    const options = {
      hidePageListOnlyOnePage: true,
      hideSizePerPage: true
    };

    const usersCol = [
      {
        dataField: 'userLogin',
        text: 'Login',
        sort: true,
        formatter: (cell, row) => {
          return (
              <a className="text-info" onClick={(e) => this.toggleUserModal(e, row)}>{cell}</a>
          )}
      },
      {
        dataField: 'displayName',
        text: 'Name',
        sort: true
      },
      /*{
        dataField: 'bureau',
        text: 'Bureau',
        sort: true
      },*/
      {
        dataField: 'id',
        text: 'Action',
        headerStyle: {width: 200},
        formatter: (cell, row) => {
          return (
              <button className="btn btn-success btn-sm" onClick={() => this.onRevoke(row)}>Revoke Access</button>
          )}
      },
    ];

    const rolesCol = [
      {
        dataField: 'roleName',
        text: 'Role',
        sort: true,
        formatter: (cell, row) => {
          return (
              <a className="text-info" onClick={(e) => this.toggleModal(e, row)}>{cell}</a>
          )}
      },
      {
        text: 'OIM targets',
        dataField: 'oimTargets',
        headerStyle: {width: "30%"},
        formatter: (record) => {
          return (
            (record || []).join(",")
          )
        }
      },
      {
        dataField: 'appCode',
        text: 'Application',
        sort: true
      },
      {
        dataField: 'id',
        text: 'Action',
        headerStyle: {width: 150},
        formatter: (cell, row) => {
          if (row.status !== "Active") return
          return (
              <button className="btn btn-success btn-sm" onClick={() => this.onRevoke(row)}>Revoke Role</button>
          )}
      }
    ]

    return (
      <>
        {
          revokeBy === 'roles' ?
            <>
              <Row className={'mb-3'}>
                <Col>
                  <Form.Label>
                    APPLICATIONS:
                  </Form.Label>
                  <Select
                    isClearable
                    isSearchable
                    isMulti
                    closeMenuOnSelect={false}
                    placeholder={<span><i className="fa fa-search" />&nbsp;search</span>}
                    value={selectedApp}
                    onChange={(value) => this.handleAppChange({name: "selectedApp", data: value})}
                    options={applicationsList && applicationsList.map(app =>
                      ({ value: app.appCode, label: app.appCode }))
                    }
                  />
                </Col>
              </Row>
              <Row className={'mb-3'}>
                <Col>
                  <Form.Label >
                    ROLES:
                  </Form.Label>
                  <Select
                    isClearable
                    isSearchable
                    isMulti
                    closeMenuOnSelect={false}
                    placeholder={<span><i className="fa fa-search" />&nbsp;search</span>}
                    value={searchedRoles}
                    onChange={(value) => this.handleAppChange({name: "searchedRoles", data: value})}
                    options={roles && roles.map(app =>
                      ({ value: app.roleName, label: app.roleName }))
                    }
                  />
                </Col>
              </Row>
            </>
            :
            <Row className={'mb-3'}>
              <Col>
                <Form.Label >
                  Users:
                </Form.Label>
                <InputGroup className="input-prepend">
                  <InputGroup.Prepend>
                    <InputGroup.Text><i className="fa fa-search" /></InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="text"
                    placeholder="search"
                    aria-describedby="inputGroupPrepend"
                    value={searchedText || ""}
                    onChange={this.onSearch}
                  />
                  <InputGroup.Append>
                    <Button variant="outline-secondary" onClick={() => this.onSearch({ target: { value: '' } })}>Clear</Button>
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Row>
        }

        {
          isLoading ?
            <div className={'text-center'}> <Spin className='mt-50 custom-loading'/> </div> :
            <>
              {
                revokeBy === "user" ?
                  <BootstrapTable
                    bootstrap4
                    striped
                    keyField='id'
                    data={users || [] }
                    headerClasses="styled-header"
                    columns={ usersCol }
                    pagination={ paginationFactory(options) }
                  />
                  :
                  <BootstrapTable
                    bootstrap4
                    striped
                    keyField='id'
                    data={data || [] }
                    headerClasses="styled-header"
                    columns={ rolesCol }
                    pagination={ paginationFactory(options) }
                  />
              }

            </>
        }
      </>
    )
  }

  onStepChange = (action) => {
    this.setState(prevState => {
      if(prevState.step+1 === 1){
        const selectedApp = (prevState.selectedApp && prevState.selectedApp.length) ? prevState.selectedApp[0] : ""
        this.props.history.push(`/DelegatedAdmin/revoke-access?by=${prevState.revokeBy}&app=${(selectedApp && selectedApp[0] && selectedApp[0].value) || ""}`)
      }
      return {
        step: action === "back" ? prevState.step - 1 : prevState.step + 1
      }
    }, () => {
      const {revokeBy} = this.state
      if (revokeBy === "user") {
        this.getDataForUser()
      } else {
        this.getDataForRole()
      }
    })
  }

  toggleModal = (event, info) => {
    event.stopPropagation();
    if(!this.state.isInfoModal && info.appCode){
      const { applicationsList} = this.state
      const app = (applicationsList && applicationsList.length) ? applicationsList.find(app => app.appCode.toLowerCase() === info.appCode.toLowerCase()) : {}
      info = {
        ...info,
        ...app,
      }
    }
    this.setState(prevState => ({
      isInfoModal: !prevState.isInfoModal,
      info
    }))
  }

  toggleUserModal = (event, info) => {
    event.stopPropagation();
    this.setState(prevState => ({
      info: info || {},
      isUserModal: !prevState.isUserModal,
    }))
  }

  render() {
    const { step, revokeBy, isInfoModal, info, isUserModal } = this.state;
    return(
      <div className={"mt-3"}>
        {
          step > 1 ?
            <a className="back-btn" onClick={() => this.onStepChange('back')}><i className="fa fa-chevron-left"/>{"  Back"}</a>
            : null
        }
        <div className="container-design">
          {
            isInfoModal ?
              <RoleModal
                role={info}
                toggleModal={this.toggleModal}
              />
              : null
          }
          {
            isUserModal ?
              <UserModal
                user={info}
                toggleModal={this.toggleUserModal}
              />
              : null
          }
          <h4 className="text-left">
            Revoke Access
          </h4>
          <hr/>
          <div>
            {this.renderStep(step)}
          </div>
          {
            step === 0 ?
              <div className="text-right mt-5">
                <button className="btn btn-info btn-sm" onClick={this.onStepChange} disabled={!revokeBy}>Next</button>
              </div>
              : null
          }
        </div>
      </div>
    )
  }
}

export default RevokeAccess
