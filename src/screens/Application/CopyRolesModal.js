import React from "react";
import {Modal, Button, Popconfirm, Tooltip, Icon} from 'antd';
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import {ApiService} from "../../services/ApiService";
import paginationFactory from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import {Form, InputGroup, Row, Col} from "react-bootstrap";
import _ from "lodash";
import { TableTransfer } from "../../components/TableTransfer"

class CopyRolesModal extends React.Component {
  _apiService = new ApiService();
  state = {
    isLoading: true,
    rolesList: [],
    usersList: [],
    roleTargetKeys: [],
    rolesData: [],
    search: "",
    step: 1
  }

  async componentDidMount() {
    const that = this
    const users = await this._apiService.getAllUsers()
    if (!users || users.error) {
      message.error('An error has occurred. Please try again.');
    }
    that.setState({
      usersList: (users && users.users) || [],
      isLoading: false,
      step: 1
    })
  }

  getRolesByUser = async (userInfo) => {
    const rolesList = []
    const roles = await this._apiService.getRolesForRevoke(userInfo.userLogin)
    if (!roles || roles.error) {
      return message.error('An error has occurred. Please try again.');
    } else {
      const data = (roles.userRoles || []).map((role, i) => ({
        id: i, key: i, ...role, oimTargets: (role.oimTargets || []).map(x => ({name: x, isRemoved: false}))
      }))
      rolesList.push(...data)
    }
    this.setState({
      rolesList,
      step: 2
    })
  }

  onUserTableChange = nextTargetKeys => {
    const { rolesList, roleTargetKeys } = this.state
    if(roleTargetKeys && roleTargetKeys.length){
      const keys = roleTargetKeys.filter(x => !((nextTargetKeys || []).some(y => x === y)))
      rolesList.forEach(key => {
        if((keys || []).includes(key.id)){
          key.oimTargets = key.oimTargets.map(x => ({...x, isRemoved: false}))
        }
      })
    }
    if (nextTargetKeys && nextTargetKeys.length) {
      const data = []
      nextTargetKeys.forEach(f => {
        data.push(rolesList[f])
      })
      this.setState({ roleTargetKeys: nextTargetKeys, rolesData: data });
    } else {
      this.setState({ roleTargetKeys: [], rolesData: [] });
    }
  };

  onSave = () => {
    this.props.onRoleUsers(this.state.rolesData)
  }

  getFilteredList = () => {
    const { usersList, search } = this.state

    if(!search){
      return usersList || []
    }

    const filterList = _.cloneDeep(usersList)

    const searchList = (filterList || []).filter(obj =>
      ["displayName", "userLogin"].some(key => {
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

  onRemoveTarget = (key, childIndex, show) => {
    if(show){
      return message.error("At least one target should be selected");
    }
    const { rolesList } = this.state
    const index = rolesList.findIndex(x => x.key === key)
    if(index > -1) {
      rolesList[index].oimTargets[childIndex].isRemoved = true
    }
    this.setState({
      rolesList
    })
  }

  onUndoTargets = (key, childId) => {
    let { rolesList } = this.state
    const index = rolesList.findIndex(x => x.key === key)
    if(index > -1){
      rolesList[index].oimTargets[childId].isRemoved = false
    }
    this.setState({
      rolesList
    })
  }

  render(){
    const {isLoading, step, rolesList, roleTargetKeys, search} = this.state
    const options = {
      hidePageListOnlyOnePage: true,
      hideSizePerPage: true
    };
    const columnsByRole = [
      {
        text: 'Login',
        dataField: 'userLogin',
        formatter: (cell, data) => {
          return (
              <div className="link-text"><u onClick={() => this.getRolesByUser(data)}>{cell}</u></div>
          )
        }
      },
      {
        text: 'Name',
        dataField: 'displayName',
        headerStyle: {width: "30%"}
      },
      {text: 'Bureau', dataField: 'bureau', headerStyle: {width: "20%"}},
    ];
    const TableColumns = (flag) => [
      {
        dataIndex: 'roleName',
        title: <div>Role Name</div>,
        sorter: (a, b) => {
          const t1 = (a && a.roleName && a.roleName.toLowerCase()) || ""
          const t2 = (b && b.roleName && b.roleName.toLowerCase()) || ""
          if (t1 < t2) { return -1 }
          if (t1 > t2) { return 1 }
          return 0
        },
        render: (record, data) => <div className="link-text" onClick={(e) => this.props.toggleModal(e, data)}><u>{record}</u></div>
      },
      {
        // dataIndex: 'oimTargets',
        title: 'OIM targets',
        render: (record) => (
          (record.oimTargets || []).map((role, i) => {
            const length = (record.oimTargets || []).length
            const isRemove = role.isRemoved
            const isRemoveLength = (record.oimTargets || []).filter(x => x.isRemoved)
            const isDisabled = length -1 === isRemoveLength.length
            return(
              <span className="static-tag" key={i.toString()}>
                <span className={isRemove ? "text-line-through" : ""}>{role.name}</span>
                <Popconfirm
                    title={"This role is linked to multiple targets. Are you sure you want to assign the role partially?"}
                    disabled={!flag || isRemove || isDisabled}
                    okText={'Yes'}
                    cancelText={'No'}
                    onConfirm={() => this.onRemoveTarget(record.key, i, isDisabled)}
                >
                { flag ?
                    <Tooltip title={isRemove ? "Undo" : "Remove"}>
                      <Icon
                          type={isRemove ? "undo" : "close"}
                          className="tag-close-icon"
                          onClick={isRemove ? () => this.onUndoTargets(record.key, i) : isDisabled ? () => this.onRemoveTarget(record.key, i, isDisabled) : () => {}}
                      />
                    </Tooltip> : null
                }
                </Popconfirm>
              </span>
            )
          })
        )
      },
      {
        dataIndex: 'appCode',
        title: 'Application',
        sorter: (a, b) => {
          const t1 = a.appCode.toLowerCase() || ""
          const t2 = b.appCode.toLowerCase() || ""
          if (t1 < t2) { return -1 }
          if (t1 > t2) { return 1 }
          return 0
        }
      }
    ];
    return (
      <Modal
        title="Copy Roles"
        visible={true}
        width={"60%"}
        onOk={this.onSave}
        onCancel={this.props.onCloseModal}
        footer={
          <div>
            <Button onClick={this.props.onCloseModal}>Cancel</Button>
            <Button className="ant-btn-primary" disabled={!roleTargetKeys.length} onClick={this.onSave}>Add Selected Roles</Button>
          </div>
        }
      >
        <>
          {
            isLoading ? <div className={'text-center'}><Spin className='mt-50 custom-loading'/></div> :
              <div>
                { step === 2 ?
                  <>
                    <a className="back-btn" onClick={() => this.setState({step: 1, roleTargetKeys: [], rolesData: []})}>
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
                        keyField={'userLogin'}
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
                        dataSource={rolesList}
                        targetKeys={roleTargetKeys}
                        showSearch={false}
                        onChange={this.onUserTableChange}
                        leftColumns={TableColumns(false)}
                        rightColumns={TableColumns(true)}
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

export default CopyRolesModal;
