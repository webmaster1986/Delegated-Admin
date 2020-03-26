import React, { Component } from 'react';
import {Row, Col, Form, InputGroup, Button} from 'react-bootstrap'
import queryString from "query-string";
import Cookies from "universal-cookie"
import Spin from "antd/lib/spin";
import _ from "lodash"
import Select from 'react-select';
import { Table, Transfer, Popconfirm, Icon, notification } from 'antd/lib'
import difference from 'lodash/difference'
import message from "antd/lib/message";
import {ApiService, getLoginUser} from "../../../services/ApiService";
import Review from "./Review";
import RoleModal from "../RoleModal";
import UserModal from "../UserModal";
import { ROLES } from "../../../constants/constants"

const cookies = new Cookies();
const role = cookies.get('USER_ROLE');

export const isLoggedIn = (key) => {
    const state = {
        SUPER_ADMIN: ROLES.SUPER_ADMIN === role,
        SUPER_APP_OWNER: ROLES.SUPER_APP_OWNER === role,
        APP_OWNER: ROLES.APP_OWNER === role,
    };
    return state[key] || false;
}

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
            isSave: false,
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
            selectBy: parsed.by || 'roles'
        },() => {
            const {selectBy} = this.state
            if (selectBy) {
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
                ["userLogin", "displayName", "name", "bureau", "email"].some(key => {
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
            const findIndex = usersData.findIndex(user => user.userLogin === rootId)
            const findSubIndex = usersData[findIndex].roles.findIndex(role => role.roleName === subId)
            if(findIndex === -1 || findSubIndex === -1) return
            usersData[findIndex].roles.splice(findSubIndex, 1)
        } else {
            const findIndex = rolesData.findIndex(role => role.roleName === rootId)
            const findSubIndex = rolesData[findIndex].users.findIndex(role => role.userLogin === subId)
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
        this.setState({ isSave: true })
        let payload = []
        if (category === "roles") {
            const totalUsers = []
            roles.forEach((role) => {
                (role.users || []).forEach(u => {
                    const isExists = totalUsers.find(user => user.userLogin === u.userLogin)
                    const newRole = {
                        roleName: role.roleName,
                        roleDescription: role.roleDescription,
                        oimTargets: role.oimTargets
                    }
                    if(!isExists){
                        u = {
                            ...u,
                            roles: [newRole]
                        }
                        totalUsers.push(u)
                    } else {
                        const index = totalUsers.findIndex(user => user.userLogin === u.userLogin)
                        totalUsers[index] = {
                            ...totalUsers[index],
                            roles: [...totalUsers[index].roles, newRole]
                        }
                    }
                })
            })

            totalUsers.forEach(user => {
                payload.push({
                    userLogin: user.userLogin,
                    roles: (user.roles || []).map(f => ({roleName: f.roleName, oimTargetss: f.oimTargets || []}))
                })
            })
        } else {
            usersData.forEach(user => {
                payload.push({
                    userLogin: user.userLogin,
                    roles: (user.roles || []).map(f => ({roleName: f.roleName, oimTargetss: f.oimTargets || []}))
                })
            })
        }
        const res = await this._apiService.putUsersRoles(user.login, payload)
        if (!res || res.error) {
            this.setState({
                isLoading: false,
                isSave: false
            })
            return message.error('something is wrong! please try again');
        } else {

            let success = []
            let failed = []
            let message = ""
            let isError = false

            res.manageAccessResponse.forEach(manage => {
                if(manage.successSet && manage.successSet.length){
                    success = success.length ? success.concat(manage.successSet) : manage.successSet
                }
                if(manage.failedSet && manage.failedSet.length){
                    failed = failed.length ? failed.concat(manage.failedSet) : manage.failedSet
                }
            })
            if(failed.length){
                message = `${failed.map(x => x.roleName).join(",")} has been fail to update`
                isError = true
            } else {
                message = `${success.map(x => x.roleName).join(",")} has been successfully updated`
            }
            notification[failed.length ? 'error' : 'success']({
                message: failed.length ? 'Error' : 'Success',
                description: message,
                duration: 0,
                onClick: () => {},
            });

            // res.manageAccessResponse.forEach(alr => {
            //     if (alr.successSet && alr.successSet.length) {
            //         message.success(`
            //             RoleName:${(alr.successSet[0] && alr.successSet[0].roleName) || ""}
            //                 ${(alr.successSet[0] && alr.successSet[0].oimTargetss) ? `& OIM target: ${(alr.successSet[0] && alr.successSet[0].oimTargetss)}` : ""} has been successfully updated`);
            //     } else {
            //         message.error(`
            //             RoleName:${(alr.failedSet[0] && alr.failedSet[0].roleName) || ""}
            //                 ${(alr.failedSet[0] && alr.failedSet[0].oimTargetss) ? `& OIM target: ${(alr.failedSet[0] && alr.failedSet[0].oimTargetss)}` : ""} has been fail to update`);
            //     }
            // })
            // message.success('Grant Access Submitted Successfully');

            if(isError) {
                return this.setState({ isSave: false })
            } else {
                setTimeout(() => {
                    this.props.history.push('/DelegatedAdmin/app-owner')
                },1000)
            }
        }
    }

    onChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        })
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

        let applicationsList = '';
        let ownerRoles = '';

        if (isLoggedIn('SUPER_ADMIN')) {
            applicationsList = await this._apiService.getApplications(user.login)
            ownerRoles = await this._apiService.getSuperAdminRoles(user.login)
        } /*else if(isLoggedIn('SUPER_APP_OWNER')) {
            applicationsList = await this._apiService.getApplications(user.login)
            ownerRoles = await this._apiService.getSuperOwnerRoles(user.login)
        }*/ else {
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

    onNext = () => {
        const {selectBy, selectedApp} = this.state
        this.props.history.push(`/DelegatedAdmin/grant-access?by=${selectBy}&app=${(selectedApp && selectedApp[0] && selectedApp[0].value) || ""}`)
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
        event.stopPropagation();
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
        event.stopPropagation();
        this.setState(prevState => ({
            info: info || {},
            isUserModal: !prevState.isUserModal,
        }))
    }

    onRemove = (id) => {
        const {roleTargetKeys, userTargetKeys, category, usersData, rolesData} = this.state
        const users = _.cloneDeep(usersData)
        if (category === "roles") {
            const index = rolesData.findIndex(f => f.id === id)
            rolesData.splice(index, 1)
            roleTargetKeys.splice(index, 1)
        } else {
            const index = users.findIndex(f => f.id === id)
            users.splice(index, 1)
            userTargetKeys.splice(index, 1)
        }
        this.setState({
            usersData: users,
            rolesData, userTargetKeys, roleTargetKeys
        })
    }

    handleAppChange = selectedOption => {
        const {name, data} = selectedOption
        this.setState({
            [name]: data
        }, () => this.getRoles())
    }

    onRemoveTarget = (key, childIndex, length) => {
        if(length === 1){
            return message.error("At least one target should be selected");
        }
        const { rolesData } = this.state
        const index = rolesData.findIndex(x => x.key === key)
        rolesData[index].oimTargets.splice(childIndex, 1)
        this.setState({
            rolesData
        })
    }

    render() {
        const { isLoading, roleTargetKeys, userTargetKeys, roles, selectedApp, applicationsList, step1, step2, users, searchRoleList,
            info, isUserModal, isInfoModal, searchString, searchList, rolesData, searchedRoles, usersData, category, preview, step, selectBy, showAlert } = this.state;
        const roleData = (searchedRoles && searchedRoles.length) ? searchRoleList : roles
        const data = searchString ? searchList : users

        const roleTableColumns = (flag) => [
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
                render: (record, data) => <div className="link-text" onClick={(e) => this.toggleModal(e, data)}><u>{record}</u></div>
            },
            {
                // dataIndex: 'oimTargets',
                title: 'OIM targets',
                render: (record) => (
                    (record.oimTargets || []).map((role, i) => {
                        const length = (record.oimTargets || []).length
                        return(
                            <span className="static-tag" key={i.toString()}>
                                {role}
                                <Popconfirm
                                    title={"This role is linked to multiple targets. Are you sure you want to assign the role partially?"}
                                    disabled={!flag || length === 1}
                                    okText={'Yes'}
                                    cancelText={'No'}
                                    onConfirm={() => this.onRemoveTarget(record.key, i, length)}
                                >
                                { flag ?
                                    <Icon
                                        type="close"
                                        className="tag-close-icon"
                                        onClick={length === 1 ? () => this.onRemoveTarget(record.key, i, length) : () => {}}
                                    /> :
                                    null
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
                render: (record, data) => <div className="link-text" onClick={(e) => this.toggleUserModal(e, data)}><u>{record}</u></div>
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
                                                                    usersData.map((user, i) => {
                                                                        return (
                                                                            <button className="btn btn-sm btn-outline m-1 border" key={i.toString() + i} style={{cursor: "default"}}>
                                                                                <span className="link-text"><u onClick={(e) => this.toggleUserModal(e, user)}>{user.displayName || user.userLogin}</u></span>&nbsp;&nbsp;
                                                                                <i onClick={() => this.onRemove(user.id)} className="fa fa-close cursor-pointer"/>
                                                                            </button>
                                                                            /*<Tag key={i.toString() + i} closable onClose={() => this.onRemove(user.id)}>{user.displayName || user.userLogin}</Tag>*/
                                                                        )
                                                                    }) : null
                                                            }
                                                        </Col>
                                                        {/*<Col>
                                                            <div className="mb-1">
                                                               <b>Selected Users:</b>
                                                            </div>
                                                            {
                                                                usersData.map((user, i) => <Tag key={i.toString()} closable onClose={() => this.onRemove(user.id)}>{user.displayName || user.userLogin}</Tag>)
                                                            }
                                                        </Col>*/}
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
                                                    showSearch={false}
                                                    onChange={this.onRoleTableChange}
                                                    filterOption={(inputValue, item) => {
                                                        return ["roleName", "roleDescription"].some(key => {
                                                            return (
                                                              item && item[key] && item[key].toLowerCase().includes((inputValue && inputValue.toLowerCase()) || "")
                                                            )
                                                        })
                                                    }}
                                                    leftColumns={roleTableColumns(false)}
                                                    rightColumns={roleTableColumns(true)}
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
                                                                    rolesData.map((role, i) => {
                                                                        return (
                                                                            <button className="btn btn-sm btn-outline m-1 border" key={i.toString() + i} style={{cursor: "default"}}>
                                                                                <span className="link-text"><u onClick={(e) => this.toggleModal(e, role)}>{role.roleName}</u></span>&nbsp;&nbsp;
                                                                                <i onClick={() => this.onRemove(role.id)} className="fa fa-close cursor-pointer"/>
                                                                            </button>
                                                                        )
                                                                    }) : null
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
                                                            <Button variant="outline-secondary" onClick={() => this.onSearch({ target: { value: '' } })}>Clear</Button>
                                                        </InputGroup.Append>
                                                    </InputGroup>
                                                </Col>
                                            </Row>

                                            <div>
                                                <TableTransfer
                                                    dataSource={data}
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
                                            isSave={this.state.isSave}
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
