import React from "react";
import {Row, Col, Form, Button, Breadcrumb} from "react-bootstrap";
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import moment from "moment"
import {Icon} from "antd";
import {ApiService} from "../../services/ApiService";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import Select from 'react-select';
import {setErrorMsg, isAlphaNum} from "../../constants/constants";


class RoleManagement extends React.Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state= {
            isLoading: false,
            rolesList: [],
            oimTargetList: [],
            rolesObject: {},
            appObject: {},
            statusButtonDisabled: false,
            isSave: false,
            isSaveStatus: false,
            selectedOption: null,
            roleNameError: "",
            duplicateRoleName: ""
        }
    }

    componentDidMount() {
        const { match } = this.props
        if(match && match.params && match.params.id){
            this.getAppDetailsAndRoles(match.params.id)
        }
    }

    getAppDetailsAndRoles = async (appCode) => {
        this.setState({
            isLoading: true
        })
        const appDetails = await this._apiService.getAppDetailByAppCode(appCode)
        const roleTarget = await this._apiService.getAppRoleTargets()

        if (!appDetails || appDetails.error || !roleTarget || roleTarget.error) {
            this.setState({
                isLoading: false
            })
            return message.error('An error has occurred. Please try again.');
        } else {
            const appObject = (appDetails && appDetails.application) || {}
            this.setState({
                isLoading: false,
                appObject,
                oimTargetList: (roleTarget && roleTarget.resultCollection) || [],
                rolesObject: {...this.state.rolesObject, roleName: appObject && appObject.appCode ? `${appObject.appCode}_` : ""}
            }, () => this.getRoles())
        }
    }

    getRoles = async () => {
        const {appObject} = this.state
        this.setState({
            isLoading: true
        })
        const rolesForApp = await this._apiService.getRolesForApp(appObject && appObject.appCode)

        if (!rolesForApp || rolesForApp.error) {
            this.setState({
                isLoading: false
            })
            return message.error('An error has occurred. Please try again.');
        } else {
            this.setState({
                isLoading: false,
                rolesList: ((rolesForApp && rolesForApp.roles) || []).map((role, index) => ({...role, id: index})) || [],
            })
        }
    }

    onChange = (event) => {
        let { appObject, rolesObject, roleNameError } = this.state
        let { name, value } = event.target
        const object = {}
        if (name === 'roleName') {
            if(!(rolesObject.roleName) && !value.includes("_")){
                value = `_${value}`
            }
            value = this.removeAppCode(value)
            if(value && !isAlphaNum(value)) return
            object.duplicateRoleName = value.toUpperCase()
            if(!value){
                roleNameError = 'Enter at least one alphabet or digit after the underscore.'
            } else {
                roleNameError = ''
            }
            value = this.appendAppCode(value, appObject.appCode).toUpperCase()
        }
        this.setState({
            rolesObject: {
                ...this.state.rolesObject,
                [name]: value
            },
            roleNameError,
            ...object
        })
    }

    removeAppCode = (role) => {
        return role.indexOf('_') > -1 ? role.substr(role.indexOf('_') + 1) : "";
    };

    appendAppCode = (role, appCode) => {
        return `${appCode}_${role}`
    }

    onAddRole = async () => {
        let { list, rolesObject, appObject, rolesList } = this.state
        if(rolesObject && Object.keys(rolesObject).length > 0){

            let isDuplicate = false
            let body = []
            const allRoles = (rolesList && rolesList.map((item) => item.roleName)) || []
            if (allRoles && allRoles.indexOf(rolesObject.roleName) !== -1) {
                const data = (rolesList && rolesList.filter(f => f.roleName === rolesObject.roleName)) || []
                data && data.forEach(g => {
                    if (rolesObject.oimTarget && rolesObject.oimTarget.indexOf(g.oimTarget) !== -1) {
                        isDuplicate = true
                    }
                })
            }
            if (isDuplicate) {
                return message.warn('The role is already added to the list');
            } else {
                rolesObject.oimTarget.forEach(item => {
                    body.push({
                        roleName: rolesObject.roleName,
                        roleDescription: rolesObject.roleDescription,
                        oimTarget: item,
                    })
                })
            }

            // list.push({...rolesObject, oimTarget: rolesObject.oimTarget || oimTargetList[0], id: list.length})
            this.setState({
                isSave: true
            })
            const data = await this._apiService.addRoleToApplication(appObject.appCode, body)
            if (!data || data.error) {
                const errMessage = setErrorMsg(data)
                this.setState({
                    isLoading: false,
                    isSave: false
                })
                return message.error(errMessage);
            } else {
                this.setState({
                    isLoading: false,
                    list,
                    rolesObject: {
                        roleName: `${appObject.appCode}_`
                    },
                    selectedOption: null,
                    isSave: false
                }, () => this.getRoles())
            }
        }
    }

    onChangeStatus = async (record) => {
        const {appObject} = this.state
        const {roleName, status, oimTarget} = record
        const type = status === "Active" ? "disable" : status === "Failed" ? "retry" : "activate"
        this.setState({
            statusButtonDisabled: true
        })
        const data = await this._apiService.rolesStatusActiveDisable({oimTarget, roleName}, appObject.appCode, type)
        if (!data || data.error) {
            const errMessage = setErrorMsg(data)
            this.setState({
                isLoading: false,
                statusButtonDisabled: false
            })
            return message.error(errMessage);

        } else {
            const { rolesList } = this.state
            const index = (rolesList || []).findIndex(role => role.roleName === roleName)
            if(index > -1) {
                rolesList[index] = {...rolesList[index], ...data.role}
            }
            this.setState({
                rolesList,
                isLoading: false,
                statusButtonDisabled: false
            })
        }
    }

    handleChange = selectedOption => {
        const data = (selectedOption && selectedOption.map(item => item.value)) || []
        this.setState({
            selectedOption,
            rolesObject: {
                ...this.state.rolesObject,
                "oimTarget": data || []
            }
        });
    }

    render() {
        const { rolesObject, appObject, rolesList, isLoading, oimTargetList, selectedOption, statusButtonDisabled, isSave, roleNameError, duplicateRoleName } = this.state;
        const { appName, appCode, appDescription, ownerGroup } = appObject || {};
        const { roleName, roleDescription, oimTarget } = rolesObject || {};
        const rolesListColumn = [
            {
                dataField:'roleName',
                text:'Role Name',
                sort: true
            },
            {
                dataField:'oimTarget',
                text:'OIM Target',
                sort: true
            },
            {
                dataField:'status',
                text:'Status',
                sort: true
            },
            {
                dataField:'id',
                text: 'Action',
                headerStyle: {width: 100},
                formatter: (cell, row) => {
                    // const buttonName = row.roleName === 'APPCODE_OWNER' ? '' :
                    //   row.status === 'Active' ? 'Disable' : row.status === 'Disabled' ? 'Activate' :
                    //     row.status === 'Failed' ? 'Retry' : ''
                    let buttonName = '';
                    let className = '';

                    if ((row.roleName || "").toLowerCase().includes("_owner")) {
                        buttonName = ''
                    } else if (row.status === 'Active') {
                        buttonName = 'Disable'
                        className = 'danger'
                    } else if (row.status === 'Disabled') {
                        buttonName = 'Activate'
                        className = 'primary'
                    } else if (row.status === 'Failed') {
                        buttonName = 'Retry'
                        className = 'warning'
                    } else {
                        buttonName = ''
                    }

                    return (
                        <div className="text-center">
                            {
                                buttonName ?
                                    <Button variant={className} className="w-80-px" size={'sm'} onClick={() => this.onChangeStatus(row)} disabled={statusButtonDisabled}>
                                        {buttonName}
                                    </Button> : null
                            }
                            {
                                row.status === "Pending" ?
                                    <Icon type="info-circle" style={{fontSize: 20}} title="Status will be updated after the external scheduler runs."/>
                                     : null
                            }
                        </div>
                    )
                }
            }
        ];

        const expandRow = {
            renderer: row => (
                <div>
                    <p className="m-0">Role Description:{"    "}{row.roleDescription}</p>
                    <p className="m-0">Creation Date:{"    "}{moment(row.creationDate).format("MM/DD/YYYY")}</p>
                </div>
            ),
            showExpandColumn: true,
            expandByColumnOnly: true,
            expandColumnRenderer: ({ expanded }) =>  <Icon className="cursor-pointer" type={expanded ? 'up' : 'down'} theme="outlined"/>,
            expandHeaderColumnRenderer: ({ isAnyExpands }) =>  <Icon className="cursor-pointer" type={isAnyExpands ? 'up' : 'down'} theme="outlined"/>
        };

        const options = {
            hidePageListOnlyOnePage: true,
            hideSizePerPage: true
        };

        return (
            <>
                <div className={'container-design'}>
                    <Row>
                        <Col md={12}>
                            <h4 className="text-left">
                                Role Management
                            </h4>
                        </Col>
                    </Row>
                    <hr/>
                    <Breadcrumb>
                        <Breadcrumb.Item href="/DelegatedAdmin/">Applications</Breadcrumb.Item>
                        <Breadcrumb.Item active>Role Management</Breadcrumb.Item>
                    </Breadcrumb>
                    { isLoading ?
                        <div className="text-center mt-5-p">
                            <Spin className='mt-50 custom-loading'/>
                        </div> :
                        <div>
                            <p className="mt-3 heading-text-color"><b>Selected Application Details</b></p>
                            <Row>
                                <Col xs={6} sm={4} md={2}>
                                    <b>Application Name: </b>
                                </Col>
                                <Col xs={6} sm={4} md={3}>
                                    <p>{appName}</p>
                                </Col>
                                <Col xs={6} sm={4} md={2} className={'marginTop-sm-1'}>
                                    <b>App Owner Group:</b>
                                </Col>
                                <Col xs={6} sm={4} md={3} className={'marginTop-sm-1'}>
                                    <p>{ownerGroup}</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6} sm={4} md={2}>
                                    <b>Application Code:</b>
                                </Col>
                                <Col xs={6} sm={4} md={3}>
                                    <p>{appCode}</p>
                                </Col>
                                <Col xs={6} sm={4} md={2} className={'marginTop-sm-1'}>
                                    <b>Application Description:</b>
                                </Col>
                                <Col xs={6} sm={4} md={3} className={'marginTop-sm-1'}>
                                    <p>{appDescription}</p>
                                </Col>
                            </Row>

                            <p className="mt-3 heading-text-color"><b>Roles</b></p>
                            <BootstrapTable
                                bootstrap4
                                striped
                                keyField='id'
                                data={rolesList || []}
                                columns={ rolesListColumn }
                                headerClasses="styled-header"
                                expandRow={expandRow}
                                pagination={ paginationFactory(options) }
                                defaultSorted={ [{dataField: 'roleName', order: 'asc'}] }
                            />
                            <Row>
                                <Col sm={12} md={12}>
                                    <Row>
                                        <Col className="pt-2" md={3}>
                                            <Form.Control
                                                type="text"
                                                placeholder="Role Name"
                                                name={'roleName'}
                                                id={"roleName"}
                                                value={roleName || ""}
                                                onChange={this.onChange}
                                            />
                                            {roleNameError ? <span className="color-red">{roleNameError}</span> : null}
                                        </Col>
                                        <Col className="pt-2" md={5}>
                                            <Form.Control
                                                type="text"
                                                placeholder="Role Description"
                                                name={'roleDescription'}
                                                value={roleDescription || ""}
                                                onChange={this.onChange}
                                            />
                                        </Col>
                                        <Col className="pt-2" md={2}>
                                            <Select
                                                isMulti
                                                isClearable
                                                isSearchable
                                                placeholder="OIM Target"
                                                value={selectedOption}
                                                onChange={this.handleChange}
                                                options={oimTargetList && oimTargetList.map(oim => ({ value: oim, label: oim }))}
                                            />
                                        </Col>
                                        <Col md={2} className={'pt-2'}>
                                            <Button type="submit" onClick={this.onAddRole} disabled={!roleName || !oimTarget || isSave || roleNameError || !roleDescription || !duplicateRoleName}>
                                                { (isSave) ? <div className="spinner-border spinner-border-sm text-dark"/> : null }
                                                {' '}Add Role
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                        }
                    </div>
                </>
        );
    }
}


export default RoleManagement;
