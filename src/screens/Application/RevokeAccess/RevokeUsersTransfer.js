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

const TableColumns = [
  {
    dataIndex: 'login',
    title: 'Login',
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
    }
  }

  componentDidMount() {
    this.getUsers()
  }

  getUsers = async () => {
    const { roles } = this.props
    const allUsers = []
    for (const role of roles) {
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
    this.setState({
      isLoading: false,
      allUsers,
      users: allUsers
    })
  }

  onChange = nextTargetKeys => {
    const {users} = this.state
    if (nextTargetKeys && nextTargetKeys.length) {
      const data = []
      nextTargetKeys.forEach(f => {
        data.push(users[f])
      })
      this.setState({ targetKeys: nextTargetKeys, usersData: data });
    } else {
      this.setState({ targetKeys: [] });
    }
  };

  triggerShowSearch = showSearch => {
    this.setState({ showSearch });
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
    const {usersData} = this.state
    const {roles} = this.props
    if(this.state.isReview){

    }
    this.setState({
      isReview: !this.state.isReview
    })
  }

  renderReview = () => {
    return (
      <div>
        <Table
          className="components-table-demo-nested"
          columns={[
            {
              dataIndex: 'login',
              title: 'Login',
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
          ]}
          expandedRowRender={(record) => (
            <Table
              columns={[
                {
                  dataIndex: 'login',
                  title: 'Login',
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
              ]}
              size="small"
              dataSource={record || []}
              pagination={false}
            />
          )}
          dataSource={[]}
        />
        <div className="text-right">
          <Button onClick={this.review}>Cancel</Button>
        </div>
        <br/>
      </div>
    )
  }

  render() {
    const {users, isReview, showSearch, targetKeys, searchString, searchList, usersData} = this.state
    const {roles} = this.props
    const data = searchString ? searchList : users

    return (
      <div>
        {
          isReview ?
            <>{this.renderReview()} </> :
            <div>
              <h6>
                <b>Roles:&nbsp;</b> {roles && roles.length && roles.map(role => role.roleName)}
              </h6>
              <br/>
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

              <div>
                <TableTransfer
                  dataSource={data}
                  targetKeys={targetKeys}
                  showSearch={showSearch}
                  onChange={this.onChange}
                  filterOption={(inputValue, item) =>
                    item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
                  }
                  leftColumns={TableColumns}
                  rightColumns={TableColumns}
                  operations={['Select', 'Remove']}
                />
              </div>
              <br/>
              <div className="text-right">
                <Button onClick={this.review} disabled={!(usersData && usersData.length)}>Review</Button>
              </div>
            </div>
        }
      </div>
    );
  }
}

export default RevokeUsersTransfer;
