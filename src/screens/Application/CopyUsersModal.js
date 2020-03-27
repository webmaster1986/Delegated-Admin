import React from "react";
import {Icon, Modal, Table, Transfer, Button} from 'antd';
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import {ApiService} from "../../services/ApiService";
import paginationFactory from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import difference from "lodash/difference";
import {Form, InputGroup, Row, Col} from "react-bootstrap";
import _ from "lodash";

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

class CopyUsersModal extends React.Component {
  _apiService = new ApiService();
  state = {
    isLoading: true,
    rolesList: [],
    usersList: [],
    users: [],
    userTargetKeys: [],
    usersData: [],
    search: "",
    step: 1
  }

  async componentDidMount() {
    const that = this
    const roles = await this._apiService.getSuperAdminRoles()
    if (!roles || roles.error) {
      message.error('something is wrong! please try again');
    }
    that.setState({
      rolesList: (roles && roles.userRoles) || [],
      isLoading: false,
      step: 1
    })
  }

  getUsersByRole = async (roleInfo) => {
    const data = await this._apiService.getUsersByRoles(roleInfo)
    const users = ((data && data.users) || []).map((f, i) => ({
      id: f.userLogin, key: f.userLogin, ...f
    }))
    this.setState({
      usersList: users || [],
      step: 2
    })
  }

  onUserTableChange = nextTargetKeys => {
    const {usersList} = this.state
    if (nextTargetKeys && nextTargetKeys.length) {
      const data = []
      nextTargetKeys.forEach(f => {
        const index = usersList.findIndex(x => x.id)
        data.push(usersList[index])
      })
      this.setState({ userTargetKeys: nextTargetKeys, usersData: data });
    } else {
      this.setState({ userTargetKeys: [], usersData: [] });
    }
  };

  onSave = () => {
    this.props.onCopyUsers(this.state.userTargetKeys)
  }

  getFilteredList = () => {
    const { rolesList, search } = this.state

    if(!search){
      return rolesList || []
    }

    const filterList = _.cloneDeep(rolesList)

    const searchList = (filterList || []).filter(obj =>
      ["roleName"].some(key => {
        return (
          obj && obj[key] && obj[key].toLowerCase().includes(search.toLowerCase())
        )
      })
    )
    return searchList || []
  }

  onChange = (e) => {
    this.setState({
      search: e.target.value
    }, () => this.getFilteredList())
  }

  render(){
    const {isLoading, rolesList, step, usersList, userTargetKeys, search} = this.state
    const options = {
      hidePageListOnlyOnePage: true,
      hideSizePerPage: true
    };
    const columnsByRole = [
      {
        text: 'Role Name',
        dataField: 'roleName',
        formatter: (cell, data) => {
          return (
              <div className="link-text"><u onClick={() => this.getUsersByRole(data)}>{cell}</u></div>
          )
        }
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
      {text: 'App Code', dataField: 'appCode', headerStyle: {width: "20%"}},
    ];
    const TableColumns = [
      {
        dataIndex: 'userLogin',
        title: 'Login',
        sorter: (a, b) => {
          const t1 = (a && a.userLogin && a.userLogin.toLowerCase()) || ""
          const t2 = (b && b.userLogin && b.userLogin.toLowerCase()) || ""
          if (t1 < t2) { return -1 }
          if (t1 > t2) { return 1 }
          return 0
        },
        render: (record, data) => <div className="link-text" onClick={(e) => this.props.toggleUserModal(e, data)}><u>{record}</u></div>
      },
      {
        dataIndex: 'displayName',
        title: 'Name',
        sorter: (a, b) => {
          const t1 = (a && a.displayName && a.displayName.toLowerCase()) || ""
          const t2 = (b && b.displayName && b.displayName.toLowerCase()) || ""
          if (t1 < t2) { return -1 }
          if (t1 > t2) { return 1 }
          return 0
        }
      },
      {
        dataIndex: 'bureau',
        title: 'Bureau',
        sorter: (a, b) => {
          const t1 = (a && a.bureau && a.bureau.toLowerCase()) || ""
          const t2 = (b && b.bureau && b.bureau.toLowerCase()) || ""
          if (t1 < t2) { return -1 }
          if (t1 > t2) { return 1 }
          return 0
        }
      },
      /*{
          dataIndex: 'email',
          title: 'Email',
          sorter: (a, b) => {
              const t1 = (a && a.email && a.email.toLowerCase()) || ""
              const t2 = (b && b.email && b.email.toLowerCase()) || ""
              if (t1 < t2) { return -1 }
              if (t1 > t2) { return 1 }
              return 0
          }
      }*/
    ];
    return (
      <Modal
        title="Copy Users"
        visible={true}
        width={"50%"}
        onOk={this.onSave}
        onCancel={this.props.onCloseModal}
        footer={
          <div>
            <Button onClick={this.props.onCloseModal}>Cancel</Button>
            <Button className="ant-btn-primary" disabled={!userTargetKeys.length} onClick={this.onSave}>Add Selected Users</Button>
          </div>
        }
      >
        <>
          {
            isLoading ? <div className={'text-center'}><Spin className='mt-50 custom-loading'/></div> :
              <div>
                { step === 2 ?
                  <>
                    <a className="back-btn" onClick={() => this.setState({step: 1, userTargetKeys: [], usersData: []})}>
                      <i className="fa fa-chevron-left"/>{"  Back"}
                    </a>
                    <br/>
                    <br/>
                  </> : null
                }
                { step === 1 ?
                  <div>

                    <Row>
                      <Col>
                        <InputGroup className="input-prepend">
                          <InputGroup.Prepend>
                            <InputGroup.Text><i className="fa fa-search" /></InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            type="text"
                            placeholder="search"
                            aria-describedby="inputGroupPrepend"
                            value={search || ""}
                            onChange={this.onChange}
                          />
                        </InputGroup>
                      </Col>
                    </Row>
                    <br/>

                    <BootstrapTable
                        bootstrap4
                        striped
                        keyField={'roleName'}
                        data={this.getFilteredList() || []}
                        headerClasses="styled-header"
                        columns={columnsByRole}
                        pagination={paginationFactory(options)}
                    />

                  </div> : null
                }

                {
                  step === 2 ?
                    <div>
                      <TableTransfer
                        dataSource={usersList}
                        targetKeys={userTargetKeys}
                        showSearch={false}
                        onChange={this.onUserTableChange}
                        filterOption={(inputValue, item) => {
                          return ["userLogin", "displayName", "bureau", "email"].some(key => {
                            return (
                                item && item[key] && item[key].toLowerCase().includes((inputValue && inputValue.toLowerCase()) || "")
                            )
                          })
                        }}
                        leftColumns={TableColumns}
                        rightColumns={TableColumns}
                        operations={['Select', 'Remove']}
                      />
                    </div> : null
                }
              </div>
          }
        </>
      </Modal>
    )
  }
}

export default CopyUsersModal;
