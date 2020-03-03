import React, { Component } from 'react';
import {Row, Col, Form, InputGroup, Button} from 'react-bootstrap'
import queryString from "query-string";
import Spin from "antd/lib/spin";
import { Table, Transfer, Tag } from 'antd/lib'
import difference from 'lodash/difference'
import message from "antd/lib/message";
import {ApiService, getLoginUser} from "../../../services/ApiService";
import Review from "./Review";
import RoleModal from "../RoleModal";
import UserModal from "../UserModal";
import Select from 'react-select';


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

class Index extends Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state = {
            roleTargetKeys: [],
            userTargetKeys: [],
            size: 'default',
            selectedApp: [],
            rolesData: [],
            searchedRoles: [],
            info: {},
            step: true,
            step1: false,
            step2: false,
            preview: false,
            visible: false,
            isLoading: false,
            isUserModal: false,
            isInfoModal: false,
            selectBy: "",
            category: "",
            user: getLoginUser()
        }
    }

    componentDidMount() {
        const {location} = this.props
        const parsed = queryString.parse(location.search);
        this.setState({
            selectedApp: parsed && parsed.app ? [{ value: parsed.app, label: parsed.app }] : [],
            selectBy: parsed.by || ''
        },() => {
            if(parsed.by){
                this.onNext()
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

        const data = (appRoles || []).map((f, i) => ({
            id: i, key: i, ...f
        }))

        this.setState({
            roles: data,
            searchRoleList: (searchedRoles && searchedRoles.length) ? ((filteredRoles || []).map((f, i) => ({ id: i, key: i, ...f }))) : []
        })
    }

    onRoleTableChange = nextTargetKeys => {
        const {roles, searchedRoles} = this.state
        if (nextTargetKeys && nextTargetKeys.length) {
            const data = []
            nextTargetKeys.forEach(f => {
                if (searchedRoles && searchedRoles.length) {
                    const val = (searchedRoles[f] && searchedRoles[f].value) || ""
                    data.push(roles.find(g => g.roleName === val))
                } else {
                    data.push(roles[f])
                }
            })
            this.setState({ roleTargetKeys: nextTargetKeys, rolesData: data });
        } else {
            this.setState({ roleTargetKeys: [], rolesData: [] });
        }
    };

    onUserTableChange = nextTargetKeys => {
        const {users} = this.state
        if (nextTargetKeys && nextTargetKeys.length) {
            const data = []
            nextTargetKeys.forEach(f => {
                data.push(users[f])
            })
            this.setState({ userTargetKeys: nextTargetKeys, usersData: data });
        } else {
            this.setState({ userTargetKeys: [], usersData: [] });
        }
    };

    handleChange = (name, value) =>  {
        this.setState({
            [name]: value
        }, () => this.getRoles())
    }

    onSelectedUserChange = () => {
        this.setState({
            step1: false,
            step2: true,
            isLoading: true,
        }, () => this.getDataForUser())
    }

    onSelectedRoleChange = () => {
        this.setState({
            step1: true,
            step2: false,
            isLoading: true,
        }, () => this.getDataForRole())
    }

    onSearch = (event) => {
        const {users} = this.state
        const searchString = event.target.value || ""
        let searchList = []
        if (searchString) {
            searchList = users && users.filter(obj =>
                ["login", "name", "bureau", "email"].some(key => {
                    return (
                        obj && obj[key] && obj[key].toLowerCase().includes(searchString.toLowerCase())
                    )
                })
            )
        }
        this.setState({
            searchString,
            searchList
        })
    }

    preview = () => {
        const {usersData, category, rolesData} = this.state
        if(category === "user") {
            usersData.forEach(f => {
                f.roles = Object.assign([], rolesData);
            })
        }else {
            rolesData.forEach(f => {
                f.users = Object.assign([], usersData);
            })
        }

        this.setState({
            usersData,
            rolesData,
            preview: true,
            step1: false,
            step2: false
        })
    }

    onTagRemove = (rootId, subId) => {
        const {usersData, rolesData, category} = this.state
        if (category === "user") {
            const findIndex = usersData.findIndex(user => user.login === rootId)
            const findSubIndex = usersData[findIndex].roles.findIndex(role => role.roleName === subId)
            if(findIndex === -1 || findSubIndex === -1) return
            usersData[findIndex].roles.splice(findSubIndex, 1)
        } else {
            const findIndex = rolesData.findIndex(role => role.roleName === rootId)
            const findSubIndex = rolesData[findIndex].users.findIndex(role => role.login === subId)
            if(findIndex === -1 || findSubIndex === -1) return
            rolesData[findIndex].users.splice(findSubIndex, 1)
        }
        this.setState({ usersData, rolesData })
    }

    onUserRemove = (data) => {
        const {usersData, rolesData, category} = this.state
        if (category === "user") {
            const index = usersData.findIndex(f => f.login === (data && data.login))
            usersData.splice(index, 1)
            message.success('User successfully removed')
        } else {
            const index = rolesData.findIndex(f => f.roleName === (data && data.roleName))
            rolesData.splice(index, 1)
            message.success('Role successfully removed')
        }
        this.setState({ usersData, rolesData })
    }

    handelModal = (e, record) => {
        const {users, roles, category} = this.state
        let data = {}
        if (category === "user") {
            data = users.find(g => g.login === record)
        } else {
            data = roles.find(g => g.roleName === record)
        }
        e.preventDefault()
        this.setState({
            visible: !this.state.visible,
            modalData: data
        })
    }

    onRoleBack = () => {
        const {category} = this.state
        if (category === "user") {
            this.setState({
                step1: false,
                step2: true
            })
        } else {
            this.setState({
                step: true,
                step1: false,
                step2: false
            })
        }
    }

    onUserBack = () => {
        const {category} = this.state
        if (category === "roles") {
            this.setState({
                step1: true,
                step2: false
            })
        } else {
            this.setState({
                step: true,
                step1: false,
                step2: false
            })
        }
    }

    onPreviewBack = () => {
        const {category} = this.state
        if (category === "user") {
            this.setState({
                step1: true,
                preview: false
            })
        } else {
            this.setState({
                step2: true,
                preview: false
            })
        }
    }

    onSubmit = async () => {
        const {usersData, roles, category, user} = this.state

        if (category === "roles") {
            const payload = roles && roles.map(g => ({
                roleName: g.roleName,
                roleDescription: g.roleDescription,
                oimTarget: g.oimTarget
            }))
            const res = await this._apiService.putUsersRoles(user.login, payload)
            if (!res || res.error) {
                this.setState({
                    isLoading: false
                })
                return message.error('something is wrong! please try again');
            } else {
                message.success('Grant Access Submitted Successfully');
                setTimeout(() => {
                    this.props.history.push('/app-owner')
                },500)
            }
        } else {
            const result = []
            for (const num of usersData) {
                const payload = num.roles && num.roles.map(g => ({
                    roleName: g.roleName,
                    roleDescription: g.roleDescription,
                    oimTarget: g.oimTarget
                }))
                const res = await this._apiService.putUsersRoles(user.login, payload)
                if (!res || res.error) {
                    return message.error('something is wrong! please try again');
                } else {
                    result.push(res)
                }
            }
            if (result && usersData && (result.length === usersData.length)) {
                message.success('Grant Access Submitted Successfully');
                setTimeout(() => {
                    this.props.history.push('/app-owner')
                },500)
            }
        }
    }

    onChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        })
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

    onNext = () => {
        const {selectBy, selectedApp} = this.state
        this.props.history.push(`/grant-access?by=${selectBy}&app=${(selectedApp && selectedApp[0] && selectedApp[0].value) || ""}`)
        this.setState({
            step: false,
            category: selectBy,
            step1: selectBy === "roles",
            step2: selectBy === "user",
            isLoading: true,
        }, () => {
            const {step2} = this.state
            if (step2) {
                this.getDataForUser()
            } else {
                this.getDataForRole()
            }
        })
    }

    step = () => {
        const {selectBy} = this.state
        return (
            <div key={`custom-inline-radio`}>
                <Form.Check
                    custom
                    name="selectBy"
                    type='radio'
                    id={'custom-1'}
                    value='user'
                    checked={selectBy === 'user'}
                    onChange={this.onChange}
                    label='Grant Access By User'
                />
                <Form.Check
                    custom
                    name="selectBy"
                    type='radio'
                    id={'custom-2'}
                    value='roles'
                    checked={selectBy === 'roles'}
                    onChange={this.onChange}
                    label={'Grant Access By Roles'}
                />

                <div className="text-right mt-5">
                    <button className="btn btn-info btn-sm btn btn-primary" onClick={this.onNext}>Next</button>
                </div>
            </div>
        )
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

    onRemove = (index) => {
        const {roleTargetKeys, userTargetKeys, category, usersData, rolesData} = this.state
        if (category === "roles") {
            roleTargetKeys.splice(index, 1)
            rolesData.splice(index, 1)
        } else {
            userTargetKeys.splice(index, 1)
            usersData.splice(index, 1)
        }
        this.setState({
            usersData, rolesData
        })
    }

    handleAppChange = selectedOption => {
        const {name, data} = selectedOption
        this.setState({
            [name]: data
        }, () => this.getRoles())
    }

    render() {
        const { isLoading, roleTargetKeys, userTargetKeys, roles, selectedApp, applicationsList, step1, step2, users, searchRoleList,
            info, isUserModal, isInfoModal, searchString, searchList, rolesData, searchedRoles, usersData, category, preview, step, selectBy } = this.state;
        const roleData = (searchedRoles && searchedRoles.length) ? searchRoleList : roles
        const data = searchString ? searchList : users

        const roleTableColumns = [
            {
                dataIndex: 'roleName',
                title: <div>Title</div>,
                sorter: (a, b) => {
                    const t1 = a.roleName.toLowerCase() || ""
                    const t2 = b.roleName.toLowerCase() || ""
                    if (t1 < t2) { return -1 }
                    if (t1 > t2) { return 1 }
                    return 0
                },
                render: (record, data) => <div className="link-text" onClick={(e) => this.toggleModal(e, data)}><u>{record}</u></div>
            },
            {
                dataIndex: 'roleDescription',
                title: 'Application',
                sorter: (a, b) => {
                    const t1 = a.roleDescription.toLowerCase() || ""
                    const t2 = b.roleDescription.toLowerCase() || ""
                    if (t1 < t2) { return -1 }
                    if (t1 > t2) { return 1 }
                    return 0
                }
            }
        ];

        const TableColumns = [
            {
                dataIndex: 'login',
                title: 'Login',
                sorter: (a, b) => {
                    const t1 = a.login.toLowerCase() || ""
                    const t2 = b.login.toLowerCase() || ""
                    if (t1 < t2) { return -1 }
                    if (t1 > t2) { return 1 }
                    return 0
                },
                render: (record, data) => <div className="link-text" onClick={(e) => this.toggleUserModal(e, data)}><u>{record}</u></div>
            },
            {
                dataIndex: 'name',
                title: 'Name',
                sorter: (a, b) => {
                    const t1 = a.name.toLowerCase() || ""
                    const t2 = b.name.toLowerCase() || ""
                    if (t1 < t2) { return -1 }
                    if (t1 > t2) { return 1 }
                    return 0
                }
            },
            {
                dataIndex: 'bureau',
                title: 'Bureau',
                sorter: (a, b) => {
                    const t1 = a.bureau.toLowerCase() || ""
                    const t2 = b.bureau.toLowerCase() || ""
                    if (t1 < t2) { return -1 }
                    if (t1 > t2) { return 1 }
                    return 0
                }
            },
            {
                dataIndex: 'email',
                title: 'Email',
                sorter: (a, b) => {
                    const t1 = a.email.toLowerCase() || ""
                    const t2 = b.email.toLowerCase() || ""
                    if (t1 < t2) { return -1 }
                    if (t1 > t2) { return 1 }
                    return 0
                }
            }
        ];

        return(
            <div className={"mt-3"}>
                {
                    (selectBy === "roles" && step2) || (selectBy === "user" && step1) || preview ?
                      <a className="back-btn" onClick={preview ? this.onPreviewBack : step1 ? this.onRoleBack : this.onUserBack}>
                          <i className="fa fa-chevron-left"/>{"  Back"}
                      </a>
                      : null
                }
                <div className={'container-design'}>
                    <h4 className="text-left">
                        Grant Access
                    </h4>
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
                    <hr/>
                    {
                        isLoading ? <div className={'text-center'}> <Spin className='mt-50 custom-loading'/> </div> :
                            <div>
                                {
                                    step ? <div>{this.step()}</div> : null
                                }
                                {
                                    step1 ?
                                        <>
                                            {
                                                selectBy === "user" ?
                                                  <Row>
                                                      <Col>
                                                          <div className="mb-1">
                                                              <b>Selected Users:</b>
                                                          </div>
                                                          {
                                                              (usersData && usersData.length) ?
                                                                usersData.map((user, i) => <Tag key={i.toString() + i} closable onClose={() => this.onRemove(i)}>{user.name || user.login}</Tag>) : null
                                                          }
                                                      </Col>
                                                  </Row> : null
                                            }
                                            <Row className={'mb-3 mt-3'}>
                                                <Col>
                                                    <Form.Label >
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

                                            <div>
                                                <TableTransfer
                                                    dataSource={roleData}
                                                    targetKeys={roleTargetKeys}
                                                    showSearch
                                                    onChange={this.onRoleTableChange}
                                                    filterOption={(inputValue, item) => {
                                                        return ["roleName", "roleDescription"].some(key => {
                                                            return (
                                                              item && item[key] && item[key].toLowerCase().includes((inputValue && inputValue.toLowerCase()) || "")
                                                            )
                                                        })
                                                    }}
                                                    leftColumns={roleTableColumns}
                                                    rightColumns={roleTableColumns}
                                                    operations={['Select', 'Remove']}
                                                />
                                            </div>
                                            <div className="text-right mt-5">
                                                {
                                                    category === "user" ?
                                                        <button className="btn btn-success btn-sm" onClick={() => this.preview()} disabled={!(rolesData && rolesData.length && usersData && usersData.length)}>Review</button> :
                                                        <button className="btn btn-success btn-sm" onClick={this.onSelectedUserChange} disabled={!(rolesData && rolesData.length)}>Select Users</button>
                                                }
                                            </div>
                                        </>
                                        : null
                                }
                                {
                                    step2 ?
                                        <>
                                            {
                                                selectBy === "roles" ?
                                                  <Row>
                                                      <Col>
                                                          <div className="mb-1">
                                                              <b>Selected Roles:</b>
                                                          </div>
                                                          {
                                                              (rolesData && rolesData.length) ?
                                                                rolesData.map((role, i) => <Tag key={i.toString() + i} closable onClose={() => this.onRemove(i)}>{role.roleName}</Tag>) : null
                                                          }
                                                      </Col>
                                                  </Row> : null
                                            }
                                            <Row className={'mb-3 mt-2'}>
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
                                                            value={searchString || ""}
                                                            onChange={this.onSearch}
                                                        />
                                                        <InputGroup.Append>
                                                            <Button variant="outline-secondary" onClick={() => this.onSearch({ target: { value: '' } })}>clear</Button>
                                                        </InputGroup.Append>
                                                    </InputGroup>
                                                </Col>
                                            </Row>

                                            <div>
                                                <TableTransfer
                                                    dataSource={data}
                                                    targetKeys={userTargetKeys}
                                                    showSearch
                                                    onChange={this.onUserTableChange}
                                                    filterOption={(inputValue, item) => {
                                                        return ["login", "name", "bureau", "email"].some(key => {
                                                            return (
                                                              item && item[key] && item[key].toLowerCase().includes((inputValue && inputValue.toLowerCase()) || "")
                                                            )
                                                        })
                                                    }}
                                                    leftColumns={TableColumns}
                                                    rightColumns={TableColumns}
                                                    operations={['Select', 'Remove']}
                                                />
                                            </div>
                                            <br/>
                                            <div className="text-right">
                                                {
                                                    category === "user" ?
                                                        <button className="btn btn-success btn-sm" onClick={() => this.onSelectedRoleChange()} disabled={!(usersData && usersData.length)}>Select Roles</button> :
                                                        <button className="btn btn-success btn-sm" onClick={() => this.preview()} disabled={!(rolesData && rolesData.length && usersData && usersData.length)}>Review</button>
                                                }
                                            </div>
                                        </>
                                        : null
                                }

                                {
                                    preview ?
                                        <Review
                                            {...this.props}
                                            category={category}
                                            data={category === "user" ? usersData : rolesData}
                                            onTagRemove={this.onTagRemove}
                                            onUserRemove={this.onUserRemove}
                                            onSubmit={this.onSubmit}
                                            toggleModal={this.toggleModal}
                                            toggleUserModal={this.toggleUserModal}
                                        /> : null
                                }
                            </div>
                    }
                </div>
            </div>
        )
    }
}

export default Index
