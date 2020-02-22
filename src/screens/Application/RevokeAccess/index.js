import React, { Component } from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap'
import {Select, Table, Transfer} from 'antd/lib'
import {ApiService, getLoginUser} from "../../../services/ApiService";
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import CustomGrid from "../../../components/CustomGrid";
import {Column} from "devextreme-react/data-grid";
import difference from "lodash/difference";

const { Option } = Select;

const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
  <Transfer {...restProps} showSelectAll={false}>
    {({
        direction,
        filteredItems,
        onItemSelectAll,
        onItemSelect,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled,
      }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns;

      const rowSelection = {
        getCheckboxProps: item => ({ disabled: listDisabled || item.disabled }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter(item => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };

      return (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          size="small"
          rowKey={'id'}
          style={{ pointerEvents: listDisabled ? 'none' : null }}
          onRow={({ key }) => ({
            onClick: () => {
              if (listDisabled) return;
              onItemSelect(key, !listSelectedKeys.includes(key));
            },
          })}
        />
      );
    }}
  </Transfer>
);

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
      step: 0,
      isLoading: false,
      revokeBy: '',
      user: getLoginUser()
    }
  }

  componentDidMount() {
    const {location} = this.props
    const {user} = this.state
    const data = (location && location.search && location.search.split("=")) || []
    this.setState({
      isLoading: true
    },async () => {
      let applicationsList =  await this._apiService.getOwnerApplications(user.login)
      let roles =  await this._apiService.getOwnerRoles(user.login)
      if (!applicationsList || applicationsList.error) {
         applicationsList = []
         message.error('something is wrong! please try again');
      }
      if (!roles || roles.error) {
        roles = []
        message.error('something is wrong! please try again');
      }
      console.log("applicationsList:-", applicationsList)
      console.log("roles:-", roles)
      this.setState({
        isLoading: false,
        applicationsList,
        allRoles: roles,
        selectedApp: data && data[1] ? [data[1]] : []
      }, () => this.getRoles())
    })
  }


  getRoles = async () => {
    const { selectedApp, allRoles, searchedRoles } = this.state
    const apps = selectedApp.map(item => item.toLowerCase())
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
    const {roles} = this.state
    const searchString = event.target.value || ""
    let searchList = []
    if (searchString) {
      searchList = roles && roles.filter(obj =>
        ["roleName", "roleDescription", "oimTarget"].some(key => {
          return (
            obj && obj[key].toLowerCase().includes(searchString.toLowerCase())
          )
        })
      )
    }
    this.setState({
      searchString,
      searchList
    })
  }

  onRevoke = () => {
    this.setState(prevState=> ({
      step: prevState.step + 1
    }))
  }

  renderStep = (step) => {
    const {revokeBy} = this.state
    switch (parseInt(step)) {
      case 0:
        return <div>{this.step1()}</div>
      case 1:
        return <div>{this.step2(revokeBy)}</div>
      case 2:
        return <div>a</div>
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
    const { isLoading, roles, size, selectedApp, searchedRoles, applicationsList, searchRoleList } = this.state;
    const data = searchedRoles.length ? searchRoleList : roles
    return (
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
        {
          isLoading ?
            <div className={'text-center'}> <Spin className='mt-50 custom-loading'/> </div> :
            <CustomGrid
              refCallback={(dg) => this.dg = dg}
              dataSource={data}
              keyExpr="roleName"
              columnHidingEnabled={false}
              showBorders={true}
              isHideSearchPanel={true}
            >
              <Column alignment={'left'} sortOrder={'asc'} caption={'Role'} dataField={'roleName'}/>
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
    )
  }

  /*step3 = () => {
    const { isLoading, targetKeys, showSearch, roles, size } = this.state;
    const columns = [
      {
        dataIndex: 'roleName',
        title: 'Login',
      },
      {
        dataIndex: 'roleDescription',
        title: 'Name',
      },
      {
        dataIndex: 'oimTarget',
        title: 'Bureou',
      },
      {
        dataIndex: 'oimTarget',
        title: 'email',
      },
    ]
    return (
      <>
        <Row className={'mb-3'}>
          <Col>
            <Form.Label >
              Users:
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
                {roles && roles.map((g, i) => <Option key={i.toString() + i} value={g.roleName}>{g.roleName}</Option>)}
              </Select>
            </InputGroup>
          </Col>
        </Row>
        {
          isLoading ?
            <div className={'text-center'}> <Spin className='mt-50 custom-loading'/> </div> :
            <TableTransfer
              dataSource={data}
              targetKeys={targetKeys}
              showSearch={showSearch}
              onChange={this.onChange}
              filterOption={(inputValue, item) =>
                item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
              }
              leftColumns={columns}
              rightColumns={columns}
              operations={['Select', 'Remove']}
            />
        }
      </>
    )
  }*/

  onStepChange = (action) => {
    this.setState(prevState => ({
      step: action === "back" ? prevState.step - 1 : prevState.step + 1
    }))
  }

  render() {
    const { step, revokeBy } = this.state;
    return(
      <Container className={'container-design'}>
        <h4 className="text-right">
          Revoke   Access
        </h4>
        <hr/>
        <div>
          {this.renderStep(step)}
        </div>
        <br/>
        <div className="text-right">
          {
            step > 0 ?
              <Button className="btn btn-default btn-sm" onClick={() => this.onStepChange('back')}>Back</Button>
              : null
          }
          &nbsp;&nbsp;
          {
            step !== 1 ?
              <Button className="btn btn-info btn-sm" onClick={this.onStepChange} disabled={!revokeBy}>Next</Button> : null
          }
        </div>
      </Container>
    )
  }
}

export default RevokeAccess
