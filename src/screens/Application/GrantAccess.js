import React, { Component } from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Table, Transfer, Select, Tag } from 'antd/lib'
import {ApiService, getLoginUser} from "../../services/ApiService";
import difference from 'lodash/difference'
import message from "antd/lib/message";
import {Button} from "antd/es";
import Review from "./GrantAccess/Review";
import Spin from "antd/lib/spin";
import RoleModal from "./RoleModal";
import UserModal from "./UserModal";

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

const mockData = [
    { id: 0, key: 0, roleName: "Role 1", roleDescription: "Description 1", oimTarget: 'SN' },
    { id: 1, key: 1, roleName: "Role 2", roleDescription: "Description 2", oimTarget: 'IDCS' },
    { id: 2, key: 2, roleName: "Role 3", roleDescription: "Description 3", oimTarget: 'AD' }
];


class GrantAccess extends Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state = {
            roleTargetKeys: [],
            userTargetKeys: [],
            showSearch: false,
            size: 'default',
            selectedApp: [],
            rolesData: [],
            searchedRoles: [],
            info: {},
            step: false,
            step1: false,
            step2: false,
            preview: false,
            visible: false,
            isLoading: true,
            isUserModal: false,
            isInfoModal: false,
            selectBy: "",
            category: "",
            user: getLoginUser()
        }
    }

    componentWillMount() {
        const {location} = this.props
        const {user} = this.state
        const data = (location && location.search && location.search.split("=")) || []
        const filterSelectedApp = (data && data[1]) ? data[1].split("&") : ""

        this.setState({
            selectedApp: (filterSelectedApp && filterSelectedApp[0]) ? [filterSelectedApp[0]] : [],
            step: true,
            isLoading: true
        }, async () => {
            let applicationsList = await this._apiService.getOwnerApplications(user.login)
            let roles =  await this._apiService.getOwnerRoles(user.login)
            let users = await this._apiService.getAllUsers()

            if (!applicationsList || applicationsList.error) {
                applicationsList = []
                message.error('something is wrong! please try again');
            }
            if (!roles || roles.error) {
                roles = []
                message.error('something is wrong! please try again');
            }
            if (!users || users.error) {
                users = []
                return message.error('something is wrong! please try again');
            }

            const usersData = (users || []).map((f, i) => ({
                id: i, key: i, ...f
            }))
            console.log("applicationsList:-", applicationsList)
            console.log("roles:-", roles)
            this.setState({
                isLoading: false,
                users: usersData,
                applicationsList,
                allRoles: roles,
            }, () => this.getRoles())
        })
    }

    getRoles = async () => {
        const { selectedApp, allRoles, searchedRoles } = this.state
        const apps = selectedApp.map(item => item.toLowerCase())
        const appRoles = allRoles.filter(item => apps.indexOf(item.appCode.toLowerCase()) !== -1)
        const filteredRoles = allRoles.filter(item => apps.indexOf(item.appCode.toLowerCase()) !== -1 && searchedRoles.indexOf(item.roleName) !== -1)
        const data = (appRoles || []).map((f, i) => ({
            id: i, key: i, ...f
        }))

        this.setState({ roles: data, searchRoleList: searchedRoles.length ? filteredRoles : [] })
    }

    onRoleTableChange = nextTargetKeys => {
        const {roles} = this.state
        if (nextTargetKeys && nextTargetKeys.length) {
            const data = []
            nextTargetKeys.forEach(f => {
                data.push(roles[f])
            })
            console.log("========Selected Roles=======>", data)
            this.setState({ roleTargetKeys: nextTargetKeys, rolesData: data });
        } else {
            this.setState({
                roleTargetKeys: [],
                rolesData: []
            });
        }
    };

    onUserTableChange = nextTargetKeys => {
        const {users} = this.state
        if (nextTargetKeys && nextTargetKeys.length) {
            const data = []
            nextTargetKeys.forEach(f => {
                data.push(users[f])
            })
            console.log("========Selected Users=======>", data)
            this.setState({ userTargetKeys: nextTargetKeys, usersData: data });
        } else {
            this.setState({ userTargetKeys: [] });
        }
    };

    triggerShowSearch = showSearch => {
        this.setState({ showSearch });
    };

    handleChange = (name, value) =>  {
        this.setState({
            [name]: value
        }, () => this.getRoles())
    }

    onSelectedUserChange = () => {
        this.setState({
            step1: false,
            step2: true
        })
    }

    onSelectedRoleChange = () => {
        this.setState({
            step1: true,
            step2: false
        })
    }

    onSearch = (event) => {
        const {users} = this.state
        const searchString = (event && event.target.value) || ""
        let searchList = []
        if (searchString) {
            searchList = users && users.filter(obj =>
                ["login", "name", "bureau", "email"].some(key => {
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

    preview = () => {
        const {usersData, category, roles} = this.state
        {
            (category === "byUser") ?
                usersData.forEach(f => {
                    f.roles = Object.assign([], roles);
                }) :
                roles.forEach(f => {
                    f.users = Object.assign([], usersData);
                })
        }

        this.setState({
            usersData,
            roles,
            preview: true,
            step1: false,
            step2: false
        })
        console.log("===========>", usersData, roles)
    }

    onTagRemove = (userId, tagId) => {
        const {usersData, roles, category} = this.state
        {
            (category === "byUser") ?
                usersData.forEach(item => {
                    if ((item.roles && item.roles.length > 1)) {
                        if (item.login === userId) {
                            const index = item.roles.findIndex(f => f.roleName === tagId)
                            // console.log(userId)
                            if (index !== -1) {
                                item.roles.splice(index, 1)
                                message.success('role successfully removed')
                            }
                        }
                    } else {
                        message.warn('minimum one role is required')
                    }
                }) :
                roles.forEach(item => {
                    if ((item.users && item.users.length > 1)) {
                        if (item.roleName === userId) {
                            const index = item.users.findIndex(f => f.login === tagId)
                            // console.log(userId)
                            if (index !== -1) {
                                item.users.splice(index, 1)
                                message.success('user successfully removed')
                            }
                        }
                    } else {
                        message.warn('minimum one user is required')
                    }
                })
        }
        this.setState({ usersData, roles })
    }

    onUserRemove = (data) => {
        const {usersData, roles, category} = this.state
        if (category === "byUser") {
            const index = usersData.findIndex(f => f.login === (data && data.login))
            usersData.splice(index, 1)
            message.success('User successfully removed')
        } else {
            const index = roles.findIndex(f => f.roleName === (data && data.roleName))
            roles.splice(index, 1)
            message.success('Role successfully removed')
        }
        this.setState({ usersData, roles })
    }

    handelModal = (e, record) => {
        const {users, roles, category} = this.state
        let data = {}
        if (category === "byUser") {
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
        const {usersData} = this.state
        if (usersData && usersData.length) {
            this.setState({
                step1: false,
                step2: true
            })
        } else {
            this.props.history.push("/app-owner")
        }
    }

    onUserBack = () => {
        const {rolesData} = this.state
        if (rolesData && rolesData.length) {
            this.setState({
                step1: true,
                step2: false
            })
        } else {
            this.props.history.push("/app-owner")
        }
    }

    onSubmit = async () => {
        const {usersData, roles, category, user} = this.state

        if (category === "byRole") {
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

    onNext = () => {
        const {selectBy} = this.state
        this.setState({
            step: false,
            category: selectBy,
            step1: selectBy === "byRole",
            step2: selectBy === "byUser"
        })
    }

    step = () => {
        const {selectBy} = this.state
        return (
            <Row>
                <Col>
                    <div key={`custom-inline-radio`} className="mb-3">
                        <Form.Check
                            custom
                            name="selectBy"
                            type='radio'
                            id={'custom-1'}
                            value='byUser'
                            checked={selectBy === 'byUser'}
                            onChange={this.onChange}
                            label='Grant Access By User'
                        />
                        <Form.Check
                            custom
                            name="selectBy"
                            type='radio'
                            id={'custom-2'}
                            value='byRole'
                            checked={selectBy === 'byRole'}
                            onChange={this.onChange}
                            label={'Grant Access By Roles'}
                        />
                        <Button className="float-right" variant={'outline-primary'} size={'sm'} onClick={this.onNext}>Next</Button>
                    </div>
                </Col>
            </Row>
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

    render() {
        const { isLoading, roleTargetKeys, userTargetKeys, showSearch, roles, size, selectedApp, applicationsList, step1, step2, users, searchRoleList,
            info, isUserModal, isInfoModal, searchString, searchList, rolesData, searchedRoles, usersData, category, preview, step } = this.state;
        const roleData = searchedRoles.length ? searchRoleList : roles
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
            },
            {
                dataIndex: 'oimTarget',
                title: 'OIM Target',
                sorter: (a, b) => {
                    const t1 = a.oimTarget.toLowerCase() || ""
                    const t2 = b.oimTarget.toLowerCase() || ""
                    if (t1 < t2) { return -1 }
                    if (t1 > t2) { return 1 }
                    return 0
                }
            },
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
            <Container className={'container-design'}>
                <h4 className="text-right">
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
                        <>
                            {
                                step ? <>{this.step()}</> : null
                            }
                            {
                                step1 ?
                                    <>
                                        <Row>
                                            <Col md={8}>
                                                {
                                                    usersData && usersData.length ? usersData.map(a => <Tag>{a.name}</Tag>) : null
                                                }
                                            </Col>
                                            <Col md={4}>
                                                <Button className="float-right" variant={'outline-success'} size={'sm'} onClick={this.onRoleBack}>Back</Button>
                                            </Col>
                                        </Row>
                                        <Row className={'mb-3'}>
                                            <Col>
                                                <Form.Label >
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

                                        <div>
                                            <TableTransfer
                                                dataSource={roleData}
                                                targetKeys={roleTargetKeys}
                                                showSearch={showSearch}
                                                onChange={this.onRoleTableChange}
                                                filterOption={(inputValue, item) =>
                                                    item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
                                                }
                                                leftColumns={roleTableColumns}
                                                rightColumns={roleTableColumns}
                                                operations={['Select', 'Remove']}
                                            />
                                        </div>
                                        <div>
                                            <Row>
                                                <Col md={10} sm={8}/>
                                                <Col className="mt-3" md={2} sm={4}>
                                                    {
                                                        category === "byUser" ?
                                                            <Button onClick={() => this.preview()} disabled={!(usersData && usersData.length)}>Review</Button> :
                                                            <Button onClick={this.onSelectedUserChange} disabled={!(rolesData && rolesData.length)}>Select Users</Button>
                                                    }
                                                </Col>
                                            </Row>
                                        </div>
                                    </>
                                    : null
                            }
                            {
                                step2 ?
                                    <>
                                        <Row>
                                            <Col md={8}>
                                                {
                                                    rolesData && rolesData.length ? rolesData.map(a => <Tag>{a.roleName}</Tag>) : null
                                                }
                                            </Col>
                                            <Col md={4}>
                                                <Button className="float-right" variant={'outline-success'} size={'sm'} onClick={this.onUserBack}>Back</Button>
                                            </Col>
                                        </Row>
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
                                                targetKeys={userTargetKeys}
                                                showSearch={showSearch}
                                                onChange={this.onUserTableChange}
                                                filterOption={(inputValue, item) =>
                                                    item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
                                                }
                                                leftColumns={TableColumns}
                                                rightColumns={TableColumns}
                                                operations={['Select', 'Remove']}
                                            />
                                        </div>
                                        <div>
                                            <Row>
                                                <Col md={10}/>
                                                <Col className="mt-3" md={2}>
                                                    {
                                                        category === "byUser" ?
                                                            <Button onClick={() => this.onSelectedRoleChange()} disabled={!(usersData && usersData.length)}>Select Roles</Button> :
                                                            <Button onClick={() => this.preview()} disabled={!(usersData && usersData.length)}>Review</Button>
                                                    }
                                                </Col>
                                            </Row>
                                        </div>
                                    </>
                                    : null
                            }

                            {
                                preview ?
                                    <Review
                                        {...this.props}
                                        category={category}
                                        data={category === "byUser" ? usersData : roles}
                                        onTagRemove={this.onTagRemove}
                                        onUserRemove={this.onUserRemove}
                                        onSubmit={this.onSubmit}
                                        toggleModal={this.toggleModal}
                                        toggleUserModal={this.toggleUserModal}
                                    /> : null
                            }
                        </>
                }
            </Container>
        )
    }
}

export default GrantAccess
