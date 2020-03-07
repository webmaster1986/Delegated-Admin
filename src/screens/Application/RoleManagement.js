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
            selectedOption: null
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
        const rolesForApp = await this._apiService.getRolesForApp(appCode)
        const roleTarget = await this._apiService.getAppRoleTargets()

        if (!appDetails || appDetails.error || !rolesForApp || rolesForApp.error || !roleTarget || roleTarget.error) {
            this.setState({
                isLoading: false
            })
            return message.error('something is wrong! please try again');
        } else {
            this.setState({
                isLoading: false,
                appObject: (appDetails && appDetails.application) || {},
                rolesList: ((rolesForApp && rolesForApp.roles) || []).map((role, index) => ({...role, id: index})) || [],
                oimTargetList: (roleTarget && roleTarget.resultCollection) || []
            })
        }
    }

    onChange = (event) => {
        const { name, value } = event.target
        this.setState({
            rolesObject: {
                ...this.state.rolesObject,
                [name]: value
            }
        })
    }

    onAddRole = async () => {
        let { list, rolesObject, oimTargetList, appObject, rolesList } = this.state
        if(rolesObject && Object.keys(rolesObject).length > 0){

            let isDuplicate = false
            let body = []
            const allRoles = (rolesList && rolesList.map((item) => item.roleName.toLowerCase())) || []
            if (allRoles && allRoles.indexOf(rolesObject.roleName.toLowerCase()) !== -1) {
                const data = (rolesList && rolesList.filter(f => f.roleName.toLowerCase() === rolesObject.roleName.toLowerCase())) || []
                data && data.forEach(g => {
                    if ((g.oimTarget) === (rolesObject.oimTarget)) {
                        isDuplicate = true
                    }
                })
            }
            if (isDuplicate) {
                return message.warn('Combination of Role Name & OIM Target must be unique');
            } else {
                body = [{roleName: rolesObject.roleName, oimTarget: rolesObject.oimTarget || oimTargetList[0]}]
            }

            // list.push({...rolesObject, oimTarget: rolesObject.oimTarget || oimTargetList[0], id: list.length})
            this.setState({
                isSave: true
            })
            const data = await this._apiService.addRoleToApplication(appObject.appCode, body)
            if (!data || data.error) {
                this.setState({
                    isLoading: false,
                    isSave: false
                })
                return message.error('something is wrong! please try again');
            } else {
                const roles = [...rolesList, ...body]
                this.setState({
                    isLoading: false,
                    list,
                    rolesList: (roles || []).map((role, index) => ({...role, id: index})) || [],
                    rolesObject: {},
                    selectedOption: null,
                    isSave: false
                })
            }
        }
    }

    onChangeStatus = async (record) => {
        const {appObject} = this.state
        const {roleName, status, oimTarget} = record
        const type = status === "Active" ? "disable" : "activate"
        this.setState({
            statusButtonDisabled: true
        })
        const data = await this._apiService.rolesStatusActiveDisable({oimTarget, roleName}, appObject.appCode, type)
        if (!data || data.error) {
            this.setState({
                isLoading: false,
                statusButtonDisabled: false
            })
            return message.error('something is wrong! please try again');
        } else {
            const rolesForApp =  await this._apiService.getRolesForApp(appObject.appCode)
            if (!rolesForApp || rolesForApp.error) {
                this.setState({
                    isLoading: false,
                    statusButtonDisabled: false
                })
                return message.error('something is wrong! please try again');
            } else {
                this.setState({
                    isLoading: false,
                    statusButtonDisabled: false,
                    rolesList: ((rolesForApp && rolesForApp.roles) || []).map((role, index) => ({...role, id: index})) || []
                })
            }
        }
    }

    handleChange = selectedOption => {
        this.setState({
            selectedOption,
            rolesObject: {
                ...this.state.rolesObject,
                "oimTarget": (selectedOption && selectedOption.value) || ""
            }
        });
    }

    render() {
        const { rolesObject, appObject, rolesList, isLoading, oimTargetList, selectedOption, statusButtonDisabled, isSave } = this.state;
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
                text:'Oim Target',
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
                    const buttonName = row.status === 'Active' ? 'Disable' : row.status === 'Disabled' ? 'Activate' : ''
                    return (
                        <div className="text-center">
                            {
                                buttonName ?
                                    <Button variant={row.status === 'Disabled' ? 'primary' : 'danger'} size={'sm'} onClick={() => this.onChangeStatus(row)} disabled={statusButtonDisabled}>
                                        {buttonName}
                                    </Button> : null
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
                        <Breadcrumb.Item href="/">Applications</Breadcrumb.Item>
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
                                                value={roleName || ""}
                                                onChange={this.onChange}
                                            />
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
                                                isClearable
                                                isSearchable
                                                placeholder="OIM Target"
                                                value={selectedOption}
                                                onChange={this.handleChange}
                                                options={oimTargetList && oimTargetList.map(oim => ({ value: oim, label: oim }))}
                                            />
                                        </Col>
                                        <Col md={2} className={'pt-2'}>
                                            <Button type="submit" onClick={this.onAddRole} disabled={!roleName || !oimTarget || isSave}>
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
