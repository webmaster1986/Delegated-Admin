import React from "react"
import {Col, Form, InputGroup, Row} from "react-bootstrap";
import {Table, Transfer} from "antd";
import {Button} from "antd/es";
import difference from "lodash/difference";
import {ApiService} from "../../../services/ApiService";
import message from "antd/lib/message";

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

class RevokeUsersTransfer extends React.Component {
  _apiService = new ApiService();
  constructor(props){
    super(props)
    this.state = {
      targetKeys: [],
      showSearch: false,
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

  renderExpandedRow = (rootRecord) => {
    const {revokeBy} = this.props
    return (
      <Table
        rowKey={'id'}
        columns={this.renderCols(rootRecord, revokeBy === 'user' ? 'role' : 'user')}
        size="small"
        dataSource={revokeBy === "user" ? rootRecord.roles : rootRecord.users}
        pagination={false}
      />
    )
  }

  renderCols = (rootRecord, type) => {
    const usersCol = [
      {
        dataIndex: 'login',
        title: 'Login',
        render: (record) => (
          <a className="text-info" onClick={() => {}}>{record}</a>
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
      },
      {
        dataIndex: 'id',
        title: 'Action',
        render: (record, data) => (
          <button className="btn btn-outline-danger btn-sm" onClick={() => this.onUserRemove(rootRecord, data.id)}>Remove</button>
        )
      }
    ]
    const rolesCol = [
      {
        dataIndex: 'roleName',
        title: 'Role',
        render: (record) => (
          <a className="text-info" onClick={() => {}}>{record}</a>
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
      {
        dataIndex: 'appCode',
        title: 'Action',
        render: (record, data) => (
          <button className="btn btn-outline-danger btn-sm" onClick={() => this.onRoleRemove(rootRecord, data.id)}>Remove</button>
        )
      }
    ]
    return type === 'user' ? usersCol : rolesCol
  }

  renderReview = () => {
    const {reviewList} = this.state
    const {revokeBy} = this.props
    return (
      <div>
        <Table
          rowKey={'id'}
          className="components-table-demo-nested"
          columns={this.renderCols(null, revokeBy)}
          defaultExpandAllRows={true}
          expandedRowRender={this.renderExpandedRow}
          dataSource={reviewList}
        />
        <div className="text-right">
          <button className="btn btn-danger btn-sm" onClick={() => this.props.history.push('/app-owner')}>Cancel</button>&nbsp;&nbsp;
          <button className="btn btn-outline-success btn-sm" onClick={this.onReviewSubmit} disabled={!reviewList.length}>Submit</button>
        </div>
        <br/>
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
            obj && obj[key].toLowerCase().includes(searchRoleText.toLowerCase())
          )
        })
      )
    }
    this.setState({
      searchRoleText,
      roles: !searchRoleText ? allRoles : roles
    })
  }

  onReviewSubmit = () => {
    const {reviewList} = this.state
    const {revokeBy} = this.props
    // if(revokeBy === 'user'){
    //   for (const revoke of revokeList) {
    //     const users =  await this._apiService.getUsersByRoles(role)
    //     if (!users || users.error) {
    //       return message.error('something is wrong! please try again');
    //     } else {
    //       const data = (users || []).map((user, i) => ({
    //         id: i, key: i, ...user
    //       }))
    //       allUsers.push(...data)
    //     }
    //   }
    // }else {
    //   for (const revoke of revokeList) {
    //     const users =  await this._apiService.getUsersByRoles(role)
    //     if (!users || users.error) {
    //       return message.error('something is wrong! please try again');
    //     } else {
    //       const data = (users || []).map((user, i) => ({
    //         id: i, key: i, ...user
    //       }))
    //       allUsers.push(...data)
    //     }
    //   }
    // }
    console.log(reviewList)
  }

  render() {
    const {users, isReview, showSearch, searchRoleText, targetKeys, searchString, searchList, selectedData, roles} = this.state
    const {revokeList, revokeBy} = this.props
    const data = revokeBy === 'user' ? roles : searchString ? searchList : users
    const selectedRevoke = revokeList && revokeList.length && revokeList.map(role => role.roleName || role.login)

    const userColumns = [
      {
        dataIndex: 'login',
        title: 'Login',
        render: (record) => (
          <a className="text-info" onClick={() => {}}>{record}</a>
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
        render: (record) => (
          <a className="text-info" onClick={() => {}}>{record}</a>
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
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Search..."
                          aria-describedby="inputGroupPrepend"
                          value={searchRoleText || ""}
                          onChange={this.onRoleSearch}
                        />
                      </InputGroup>
                    </Col>
                  </Row>
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
                  showSearch={showSearch}
                  onChange={this.onChange}
                  filterOption={(inputValue, item) =>
                    item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
                  }
                  leftColumns={revokeBy === 'user' ? roleColumns : userColumns}
                  rightColumns={revokeBy === 'user' ? roleColumns : userColumns}
                  operations={['Select', 'Remove']}
                />
              </div>
              <br/>
              <div className="text-right">
                <Button onClick={this.review} disabled={!(selectedData && selectedData.length)}>Review</Button>
              </div>
            </div>
        }
      </div>
    );
  }
}

export default RevokeUsersTransfer;
