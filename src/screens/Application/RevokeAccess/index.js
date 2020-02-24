import React, { Component } from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap'
import {Select, Table, Transfer} from 'antd/lib'
import {ApiService, getLoginUser} from "../../../services/ApiService";
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import CustomGrid from "../../../components/CustomGrid";
import {Column} from "devextreme-react/data-grid";
import RevokeUsersTransfer from "./RevokeUsersTransfer";
import UserModal from "../UserModal";
import RoleModal from "../RoleModal";

const { Option } = Select;

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
      isLoading: true,
      revokeBy: 'role',
      users: [],
      revokeRole: {},
      isInfoModal: false,
      info: {},
      user: getLoginUser()
    }
  }

  componentDidMount() {
    this.getData()
  }

  getData = () => {
    const {location} = this.props
    const {user} = this.state
    const data = (location && location.pathname && location.pathname.split("/")) || []
    const that = this
    Promise.all([
      this._apiService.getOwnerApplications(user.login),
      this._apiService.getOwnerRoles(user.login),
      this._apiService.getAllUsers()
    ]).then((results) => {
      console.log(results);
      let applicationsList = results[0]
      let roles = results[1]
      let users = results[2]
      if (!applicationsList || applicationsList.error) {
        applicationsList = {}
        message.error('something is wrong! please try again');
      }
      if (!roles || roles.error) {
        roles = []
        message.error('something is wrong! please try again');
      }
      if (!users || users.error) {
        users = []
        message.error('something is wrong! please try again');
      }
      that.setState({
        isLoading: false,
        applicationsList,
        allRoles: roles,
        users,
        allUsers: [...users],
        selectedApp: data && data[2] ? [data[2]] : []
      }, () => that.getRoles())
    });
  }

  getRoles = async () => {
    const { selectedApp, allRoles, searchedRoles, applicationsList } = this.state
    const apps = selectedApp.length ? selectedApp.map(item => item.toLowerCase()) : applicationsList.map(item => item.appCode.toLowerCase())
    const appRoles = allRoles.filter(item => apps.indexOf(item.appCode.toLowerCase()) !== -1)
    const filteredRoles = allRoles.filter(item => apps.indexOf(item.appCode.toLowerCase()) !== -1 && searchedRoles.indexOf(item.roleName) !== -1)
    this.setState({ roles: appRoles, searchRoleList: searchedRoles.length ? filteredRoles : [] })
  }

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
        ["login", "name", "bureau", 'email'].some(key => {
          return (
            obj && obj[key].toLowerCase().includes(searchedText.toLowerCase())
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

  renderStep = (step) => {
    const {revokeBy, revokeRole, user} = this.state
    switch (parseInt(step)) {
      case 0:
        return <div>{this.step1()}</div>
      case 1:
        return <div>{this.step2(revokeBy)}</div>
      case 2:
        return (
          <RevokeUsersTransfer
            {...this.props}
            toggleUserModal={this.toggleUserModal}
            toggleModal={this.toggleModal}
            user={user}
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

  step2 = () => {
    const { isLoading, roles, size, selectedApp, searchedRoles, searchedText, applicationsList, searchRoleList, revokeBy, users } = this.state;
    const data = searchedRoles.length ? searchRoleList : roles
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
                  <InputGroup>
                    <Select
                      mode="multiple"
                      size={size}
                      placeholder="Please select"
                      defaultValue={selectedApp}
                      value={selectedApp}
                      onChange={(value) => this.handleChange('selectedApp', value)}
                      style={{ width: '100%' }}
                    >
                      {
                        applicationsList && applicationsList.map((g, i) => (
                          <Option key={i.toString() + i} value={g.appCode}>{g.appCode}</Option>
                        ))
                      }
                    </Select>
                  </InputGroup>
                </Col>
              </Row>
              <Row className={'mb-3'}>
                <Col>
                  <Form.Label >
                    ROLES:
                  </Form.Label>
                  <InputGroup>
                    <Select
                      mode="multiple"
                      size={size}
                      placeholder="Please select"
                      defaultValue={searchedRoles}
                      onChange={(value) => this.handleChange('searchedRoles',value)}
                      style={{ width: '100%' }}
                    >
                      {roles && roles.map((g, i) =>  <Option key={i.toString() + i} value={g.roleName}>{g.roleName}</Option>)}
                    </Select>
                  </InputGroup>
                </Col>
              </Row>
            </>
            :
            <Row className={'mb-3'}>
              <Col>
                <Form.Label >
                  Users:
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    aria-describedby="inputGroupPrepend"
                    // name="username"
                    value={searchedText || ""}
                    onChange={this.onSearch}
                  />
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
                  <CustomGrid
                    refCallback={(dg) => this.dg = dg}
                    dataSource={users}
                    keyExpr="login"
                    columnHidingEnabled={false}
                    showBorders={true}
                    isHideSearchPanel={true}
                  >
                    <Column alignment={'left'} sortOrder={'asc'} caption={'Login'} dataField={'login'}
                            cellRender={(record) => {
                              return (
                                <a className="text-info" onClick={(e) => this.toggleUserModal(e, record.data)}>{record.data.login}</a>
                              )
                            }}
                    />
                    <Column alignment={'left'} caption={'Name'} dataField={'name'}/>
                    <Column alignment={'left'} caption={'Bureau'} dataField={'bureau'}/>
                    <Column alignment={'left'} allowSorting={false} caption={'Email'} dataField={'email'}
                      cellRender={(record) => {
                        return (
                          <button className="btn btn-success btn-sm" onClick={() => this.onRevoke(record.data)}>Revoke Access</button>
                        )
                      }}
                    />
                  </CustomGrid>
                  :
                  <CustomGrid
                    refCallback={(dg) => this.dg = dg}
                    dataSource={data}
                    keyExpr="roleName"
                    columnHidingEnabled={false}
                    showBorders={true}
                    isHideSearchPanel={true}
                  >
                    <Column alignment={'left'} sortOrder={'asc'} caption={'Role'} dataField={'roleName'}
                            cellRender={(record) => {
                              return (
                                <a className="text-info" onClick={(e) => this.toggleModal(e, record.data)}>{record.data.roleName}</a>
                              )
                            }}
                    />
                    <Column alignment={'left'} caption={'Application'} dataField={'roleDescription'}/>
                    <Column alignment={'left'} caption={'OIM Target'} dataField={'oimTarget'}/>
                    <Column alignment={'left'} allowSorting={false} caption={'status'} dataField={'appCode'}
                            cellRender={(record) => {
                              if(record.data.status !== "Active") return
                              return (
                                <button className="btn btn-success btn-sm" onClick={() => this.onRevoke(record.data)}>Revoke Role</button>
                              )
                            }}
                    />
                  </CustomGrid>
              }

            </>
        }
      </>
    )
  }

  onStepChange = (action) => {
    this.setState(prevState => ({
      step: action === "back" ? prevState.step - 1 : prevState.step + 1
    }))
  }

  toggleModal = (event, info) => {
    event.preventDefault();
    if(!this.state.isInfoModal && info.appCode){
      const { applicationsList} = this.state
      const app = applicationsList.length ? applicationsList.find(app => app.appCode.toLowerCase() === info.appCode.toLowerCase()) : {}
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
    event.preventDefault();
    this.setState(prevState => ({
      info: info || {},
      isUserModal: !prevState.isUserModal,
    }))
  }

  render() {
    const { step, revokeBy, isInfoModal, info, isUserModal } = this.state;
    return(
      <Container className={'container-design'}>
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
        <h4 className="text-right">
          Revoke Access
        </h4>
        <hr/>
        <div>
          {this.renderStep(step)}
        </div>
        <br/>
        <div className="text-right">
          {
            step > 0 && step !== 2 ?
              <Button className="btn-sm" onClick={() => this.onStepChange('back')}>Back</Button>
              : null
          }
          &nbsp;&nbsp;
          {
            step === 0 ?
              <Button className="btn btn-info btn-sm" onClick={this.onStepChange} disabled={!revokeBy}>Next</Button> : null
          }
        </div>
      </Container>
    )
  }
}

export default RevokeAccess
