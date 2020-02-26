import React, { Component } from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap'
import {Select, Table} from 'antd/lib'
import queryString from 'query-string';
import {ApiService, getLoginUser} from "../../../services/ApiService";
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
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
      selectedApp: parsed && parsed.app ? [parsed.app] : [],
      revokeBy: parsed.by || ''
    },() => {
      if(parsed.by){
        this.onStepChange()
      }
    })
  }

  getRoles = async () => {
    const { selectedApp, allRoles, searchedRoles, applicationsList } = this.state
    const apps = selectedApp.length ? selectedApp.map(item => item.toLowerCase()) : applicationsList.map(item => item.appCode.toLowerCase())
    const appRoles = allRoles.filter(item => apps.indexOf(item.appCode.toLowerCase()) !== -1)
    const filteredRoles = allRoles.filter(item => apps.indexOf(item.appCode.toLowerCase()) !== -1 && searchedRoles.indexOf(item.roleName) !== -1)
    this.setState({ roles: appRoles, searchRoleList: searchedRoles.length ? filteredRoles : [] })
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

  getDataForUser = async () => {
    let users = await this._apiService.getAllUsers()
    if (!users || users.error) {
      users = []
      message.error('something is wrong! please try again');
    }
    const usersData = (users || []).map((f, i) => ({
      id: i, key: i, ...f
    }))
    this.setState({
      isLoading: false,
      users: usersData,
      allUsers: [...users],
    })
  }

  getDataForRole = async () => {
    const {user} = this.state

    let applicationsList = await this._apiService.getOwnerApplications(user.login)
    let roles =  await this._apiService.getOwnerRoles(user.login)

    if (!applicationsList || applicationsList.error) {
      applicationsList = []
      message.error('something is wrong! please try again');
    }
    if (!roles || roles.error) {
      roles = []
      message.error('something is wrong! please try again');
    }

    this.setState({
      isLoading: false,
      applicationsList,
      allRoles: roles
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
    const data = searchedRoles.length ? searchRoleList : roles;

    const usersCol = [
      {
        dataIndex: 'login',
        title: 'Login',
        defaultSortOrder: 'ascend',
        sorter: (a, b) => a.login.localeCompare(b.login),
        sortDirections: ['descend', 'ascend'],
        render: (record, data) => (
            <a className="text-info" onClick={(e) => this.props.toggleUserModal(e, data)}>{record}</a>
        )
      },
      {
        dataIndex: 'name',
        title: 'Name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ['descend', 'ascend']
      },
      {
        dataIndex: 'bureau',
        title: 'Bureau',
        sorter: (a, b) => a.bureau.localeCompare(b.bureau),
        sortDirections: ['descend', 'ascend']
      },
      {
        dataIndex: 'email',
        title: 'Email',
        render: (record, data) => {
          return (
          <button className="btn btn-success btn-sm" onClick={() => this.onRevoke(data)}>Revoke Access</button>
          )
        }
      },

    ];
    const rolesCol = [
      {
        dataIndex: 'roleName',
        title: 'Role',
        defaultSortOrder: 'ascend',
        sorter: (a, b) => a.roleName.localeCompare(b.roleName),
        sortDirections: ['descend', 'ascend'],
        render: (record, data) => (
            <a className="text-info" onClick={(e) => this.props.toggleModal(e, data)} >{record}</a>
        )
      },
      {
        dataIndex: 'roleDescription',
        title: 'Application',
        sorter: (a, b) => a.roleDescription.localeCompare(b.roleDescription),
        sortDirections: ['descend', 'ascend']
      },
      {
        dataIndex: 'oimTarget',
        title: 'OIM Target',
        sorter: (a, b) => a.oimTarget.localeCompare(b.oimTarget),
        sortDirections: ['descend', 'ascend']
      },
      {
        dataIndex: 'appCode',
        title: 'Action',
        render: (record, data) => {
          if ( data.status !== "Active") return
          return (
              <button className="btn btn-success btn-sm" onClick={() => this.onRevoke(data)}>Revoke Role</button>
          )
        }
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
                  <InputGroup>
                    <Select
                      mode="multiple"
                      size={size}
                      placeholder={<span><i className="fa fa-search" />&nbsp;search</span>}
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
                      placeholder={<span><i className="fa fa-search" />&nbsp;search</span>}
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
                      <Table
                          rowKey={'id'}
                          columns={usersCol}
                          size={"small"}
                          dataSource={users || ''}
                          pagination={false}
                      />
                  :
                      <Table
                          rowKey={'id'}
                          columns={rolesCol}
                          size={"small"}
                          dataSource={data || ''}
                          pagination={false}
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
        const selectedApp = prevState.selectedApp.length ? prevState.selectedApp[0] : ""
        this.props.history.push(`/revoke-access?by=${prevState.revokeBy}&app=${selectedApp}`)
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
      <Container className={"mt-5"}>
        {
          step > 1 && step !== 3  ?
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

          <div className="text-right mt-5">
            {
              step === 0 ?
                <button className="btn btn-info btn-sm" onClick={this.onStepChange} disabled={!revokeBy}>Next</button> : null
            }
          </div>
        </div>
      </Container>
    )
  }
}

export default RevokeAccess
