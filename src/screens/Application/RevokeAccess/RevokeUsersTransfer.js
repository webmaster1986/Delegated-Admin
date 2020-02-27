import React from "react"
import {Col, Form, InputGroup, Row, Button} from "react-bootstrap";
import {Icon, Table, Transfer} from "antd";
import difference from "lodash/difference";
import {ApiService} from "../../../services/ApiService";
import message from "antd/lib/message";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

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

const options = {
  hidePageListOnlyOnePage: true,
  hideSizePerPage: true
};

class RevokeUsersTransfer extends React.Component {
  _apiService = new ApiService();
  constructor(props){
    super(props)
    this.state = {
      targetKeys: [],
      isReview: false,
      isLoading: true,
      size: 'default',
      searchRoleText: '',
      reviewList: [],
      rolesData: []
    }
  }

  componentDidMount() {
    this.getUsers()
  }

  getUsers = async () => {
    const { revokeList, revokeBy } = this.props
    const allUsers = []
    const allRoles = []
    if(revokeBy === 'user'){
      for (const user of revokeList) {
        const roles =  await this._apiService.getRolesForUser(user.login)
        if (!roles || roles.error) {
          return message.error('something is wrong! please try again');
        } else {
          const data = (roles || []).map((role, i) => ({
            id: i, key: i, ...role
          }))
          allRoles.push(...data)
        }
      }
    }else {
      for (const role of revokeList) {
        const users =  await this._apiService.getUsersByRoles(role)
        if (!users || users.error) {
          return message.error('something is wrong! please try again');
        } else {
          const data = (users || []).map((user, i) => ({
            id: i, key: i, ...user
          }))
          allUsers.push(...data)
        }
      }
    }

    this.setState({
      isLoading: false,
      allUsers,
      users: allUsers,
      allRoles,
      roles: [...allRoles]
    })
  }

  onChange = nextTargetKeys => {
    const {users,roles} = this.state
    const {revokeBy} = this.props
    if (nextTargetKeys && nextTargetKeys.length) {
      const data = []
      nextTargetKeys.forEach(f => {
        data.push(revokeBy === 'user' ? roles[f] : users[f])
      })
      this.setState({ targetKeys: nextTargetKeys, selectedData: data });
    } else {
      this.setState({ targetKeys: [] });
    }
  };

  onSearch = (event) => {
    const {users, allUsers} = this.state
    const searchString = (event && event.target.value) || ""
    let searchList = []
    if (searchString) {
      searchList = allUsers && allUsers.filter(obj =>
        ["login", "name", "bureau", "email"].some(key => {
          return (
            obj && obj[key] && obj[key].toLowerCase().includes((searchString && searchString.toLowerCase()) || "")
          )
        })
      )
    }
    this.setState({
      searchString,
      searchList
    })
  }

  review = () => {
    const {selectedData} = this.state
    const {revokeBy} = this.props
    let reviewList = []
    if(!this.state.isReview){
      const {revokeList} = this.props
      reviewList = revokeList
      if(revokeBy === "user"){
        reviewList.forEach((user, uIndex) => {
          user.id = uIndex;
          user.roles = selectedData.map((role, i) => ({
            id: i, ...role
          }))
        })
      }else {
        reviewList.forEach((role,rIndex) => {
          role.id = rIndex;
          role.users = selectedData.map((user, i) => ({
            id: i, ...user
          }))
        })
      }
    }
    this.props.onNextStep()
    this.setState({
      isReview: !this.state.isReview,
      reviewList
    })
  }

  onRoleRemove = (rootRecord, recordId) => {
    const {reviewList} = this.state
    if(!rootRecord){
      const findIndex = reviewList.findIndex(review => review.id === recordId)
      if(findIndex === -1) return
      reviewList.splice(findIndex, 1)
    }else {
      const findIndex = reviewList.findIndex(review => review.id === rootRecord.id)
      const findSubIndex = reviewList[findIndex].roles.findIndex(role => role.id === recordId)
      if(findIndex === -1 || findSubIndex === -1) return
      reviewList[findIndex].roles.splice(findSubIndex, 1)
    }
    this.setState({
      reviewList
    })
  }

  onUserRemove = (rootRecord, recordId) => {
    const {reviewList} = this.state
    if(!rootRecord){
      const findIndex = reviewList.findIndex(review => review.id === recordId)
      if(findIndex === -1) return
      reviewList.splice(findIndex, 1)
    }else {
      const findIndex = reviewList.findIndex(review => review.id === rootRecord.id)
      const findSubIndex = reviewList[findIndex].users.findIndex(role => role.id === recordId)
      if(findIndex === -1 || findSubIndex === -1) return
      reviewList[findIndex].users.splice(findSubIndex, 1)
    }
    this.setState({
      reviewList
    })
  }

  renderExpandedRow = {
    renderer: row => {
      const {revokeBy} = this.props
      return (
        <BootstrapTable
            keyField='id'
            data={revokeBy === "user" ? row.roles : row.users}
            columns={this.renderCols(row, revokeBy === 'user' ? 'role' : 'user')}
        />
    )},
    showExpandColumn: true,
    expandByColumnOnly: true
  };

  renderCols = (rootRecord, type) => {
    const usersCol = [
      {
        dataField: 'login',
        text: 'Login',
        formatter: (cell, row) => {
          return (
              <a className="text-info" onClick={(e) => this.props.toggleUserModal(e, row)}>{cell}</a>
          )}
      },
      {
        dataField: 'name',
        text: 'Name',
      },
      {
        dataField: 'bureau',
        text: 'Bureau',
      },
      {
        dataField: 'email',
        text: 'Email',
      },
      {
        text: 'Action',
        headerStyle: {width: 100},
        formatter: (cell, row) => {
          return (
              <Icon className="text-danger" style={{fontSize: 20}} type="delete" onClick={() => this.onUserRemove(rootRecord, row.id)}/>
          )}
      }
    ]
    const rolesCol = [
      {
        dataField: 'roleName',
        text: 'Role',
        formatter: (cell, row) => {
          return (
              <a className="text-info" onClick={(e) => this.props.toggleModal(e, row)} >{cell}</a>
          )}
      },
      {
        dataField: 'roleDescription',
        text: 'Application',
      },
      {
        dataField: 'oimTarget',
        text: 'OIM Target',
      },
      {
        text: 'Action',
        headerStyle: {width: 100},
        formatter: (cell, row) => {
          return (
              <Icon className="text-danger" style={{fontSize: 20}} type="delete" onClick={() => this.onRoleRemove(rootRecord, row.id)}/>
          )}
      }
    ]
    return type === 'user' ? usersCol : rolesCol
  }

  renderReview = () => {
    const {reviewList} = this.state
    const {revokeBy} = this.props
    return (
      <div>
        <BootstrapTable
          bootstrap4
          striped
          keyField={'id'}
          data={reviewList}
          columns={this.renderCols(null, revokeBy)}
          headerClasses="styled-header"
          expandRow={this.renderExpandedRow}
          pagination={ paginationFactory(options) }
        />
        <div className="text-right mt-5">
          <button className="btn btn-danger btn-sm" onClick={() => this.props.history.push('/app-owner')}>Cancel</button>&nbsp;&nbsp;
          <button className="btn btn-outline-success btn-sm" onClick={this.onReviewSubmit} disabled={!reviewList.length}>Submit</button>
        </div>
      </div>
    )
  }

  onRoleSearch = (event) => {
    const {allRoles} = this.state
    const searchRoleText = event.target.value || ""
    let roles = []
    if (searchRoleText) {
      roles = allRoles.filter(obj =>
        ["roleName"].some(key => {
          return (
            obj && obj[key] && obj[key].toLowerCase().includes(searchRoleText.toLowerCase())
          )
        })
      )
    }
    this.setState({
      searchRoleText,
      roles: !searchRoleText ? allRoles : roles
    })
  }

  onReviewSubmit = async () => {
    const {reviewList} = this.state
    const {revokeBy} = this.props
    let userRoles = [...reviewList]

    if(revokeBy === "roles"){
      const totalUsers = []
      reviewList.forEach((role) => {
        role.users.forEach(u => {
          const isExists = totalUsers.find(user => user.login === u.login)
          if(!isExists){
            totalUsers.push(u)
          }
        })
      })
      reviewList.forEach((role) => {
        role.users.forEach(u => {
          const findIndex = totalUsers.findIndex(user => user.login === u.login)
          if(findIndex !== -1){
            const newRole = {
              roleName: role.roleName,
              roleDescription: role.roleDescription,
              oimTarget: role.oimTarget
            }
            const roles = totalUsers[findIndex] && totalUsers[findIndex].roles ? totalUsers[findIndex].roles.push(newRole) : [newRole]
            totalUsers[findIndex] = {
              ...totalUsers[findIndex],
              roles
            }
          }
        })
      })
      userRoles = totalUsers
    }
    const successResult = []
    for (const revoke of userRoles) {
      const result =  await this._apiService.putUsersRoles(revoke.login, revoke.roles || [])
      if (!result || result.error) {
        return message.error('something is wrong! please try again');
      }else {
        successResult.push(revoke)
      }
      if(successResult.length === userRoles.length){
        message.success('Revoke access submitted successfully.');
        setTimeout(() => {
          this.props.history.push('/app-owner')
        },500)
      }
    }
  }

  render() {
    const {users, isReview, searchRoleText, targetKeys, searchString, searchList, selectedData, roles} = this.state
    const {revokeList, revokeBy} = this.props
    const data = revokeBy === 'user' ? roles : searchString ? searchList : users
    const selectedRevoke = revokeList && revokeList.length && revokeList.map(role => role.roleName || role.login)

    const userColumns = [
      {
        dataIndex: 'login',
        title: 'Login',
        render: (record, data) => (
          <a className="text-info" onClick={(e) => this.props.toggleUserModal(e, data)}>{record}</a>
        )
      },
      {
        dataIndex: 'name',
        title: 'Name',
      },
      {
        dataIndex: 'bureau',
        title: 'Bureau',
      },
      {
        dataIndex: 'email',
        title: 'Email',
      }
    ];

    const roleColumns = [
      {
        dataIndex: 'roleName',
        title: 'Role',
        render: (record, data) => (
          <a className="text-info" onClick={(e) => this.props.toggleModal(e, data)}>{record}</a>
        )
      },
      {
        dataIndex: 'roleDescription',
        title: 'Application',
      },
      {
        dataIndex: 'oimTarget',
        title: 'OIM Target',
      },
    ];

    return (
      <div>
        {
          isReview ?
            <>{this.renderReview()} </> :
            <div>
              <h6>
                <b>{revokeBy === 'user' ? "User:" : "Role:" }&nbsp;</b> {selectedRevoke}
              </h6>
              <br/>
              {
                revokeBy === 'user' ?
                  <Row className={'mb-3'}>
                    <Col>
                      <Form.Label >
                        Roles:
                      </Form.Label>
                      <InputGroup className="input-prepend">
                        <InputGroup.Prepend>
                          <InputGroup.Text><i className="fa fa-search" /></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type="text"
                          placeholder="search"
                          aria-describedby="inputGroupPrepend"
                          value={searchRoleText || ""}
                          onChange={this.onRoleSearch}
                        />
                        <InputGroup.Append>
                          <Button variant="outline-secondary" onClick={() => this.onRoleSearch({ target: { value: '' } })}>clear</Button>
                        </InputGroup.Append>
                      </InputGroup>
                    </Col>
                  </Row>
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
                          // name="username"
                          onChange={this.onSearch}
                        />
                      </InputGroup>
                    </Col>
                  </Row>
              }

              <div>
                <TableTransfer
                  dataSource={data}
                  targetKeys={targetKeys}
                  showSearch
                  onChange={this.onChange}
                  filterOption={(inputValue, item) => {
                    if(revokeBy === "user"){
                      return ["roleName", "roleDescription"].some(key => {
                        return (
                          item && item[key] && item[key].toLowerCase().includes((inputValue && inputValue.toLowerCase()) || "")
                        )
                      })
                    }else {
                      return ["login", "name", "bureau", "email"].some(key => {
                        return (
                          item && item[key] && item[key].toLowerCase().includes((inputValue && inputValue.toLowerCase()) || "")
                        )
                      })
                    }
                  }}
                  leftColumns={revokeBy === 'user' ? roleColumns : userColumns}
                  rightColumns={revokeBy === 'user' ? roleColumns : userColumns}
                  operations={['Select', 'Remove']}
                />
              </div>
              <br/>
              <div className="text-right">
                <button className="btn btn-outline-success btn-sm" onClick={this.review} disabled={!(selectedData && selectedData.length)}>Review</button>
              </div>
            </div>
        }
      </div>
    );
  }
}

export default RevokeUsersTransfer;
