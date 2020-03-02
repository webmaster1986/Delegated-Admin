import React from "react";
import {Row, Col, Form, Button, Container} from "react-bootstrap";
import { ApiService } from "../../services/ApiService";
import message from "antd/lib/message";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import Select from 'react-select';


class EditApp extends React.Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state= {
            isLoading: false,
            rolesList: [],
            rolesObject: {},
            appObject: {appName: '', appCode: '', appDescription: '', ownerGroup: ''},
            selectedOption: null,
            selectedOwnerGroupOption: null
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
        const appDetails =  await this._apiService.getAppDetailByAppCode(appCode)
        const roles =  await this._apiService.getRolesForApp(appCode)

        if (!appDetails || appDetails.error || !roles || roles.error) {
            this.setState({
                isLoading: false
            })
            return message.error('something is wrong! please try again');
        } else {
            this.setState({
                isLoading: false,
                appObject: appDetails || {},
                rolesList: (roles || []).map((role, index) => ({...role, id: index})) || []
            })
        }
    }

    onRoleChange = (event) => {
        const { name, value } = event.target
        this.setState({
            rolesObject: {
                ...this.state.rolesObject,
                [name]: value
            }
        })
    }

    onChange = (event) => {
        const { name, value } = event.target
        this.setState({
            appObject: {
                ...this.state.appObject,
                [name]: value
            }
        })
    }

    onAddRole = async () => {
        let { rolesList, rolesObject, appObject } = this.state
        if(rolesObject && Object.keys(rolesObject).length > 0){
            rolesList.push({...rolesObject, oimTarget: rolesObject.oimTarget || 'IDCS', id: rolesList.length})
            await this._apiService.addRole({ ...rolesObject }, appObject.appCode)
            this.setState({
                rolesList,
                rolesObject: {},
                selectedOption: null
            }, () => this.refreshGrid())
        }
    }

    refreshGrid = () => {
        if (this.dg && this.dg.instance) {
            this.dg.instance.refresh()
        }
    }

    onOnBoardApplication = async () => {
        const { rolesList, appObject } = this.state
        const payload = {...appObject, roles: rolesList}
        const data =  await this._apiService.applicationOnBoarding(payload)
        if (!data || data.error) {
            this.setState({
                isLoading: false
            })
            return message.error('something is wrong! please try again');
        } else {
            this.setState({
                isLoading: false,
                applicationsList: data || []
            })
        }
    }

    handleChange = selectedOption => {
        const {name, data} = selectedOption
        if (name === "oimTarget") {
            this.setState({
                selectedOption: data,
                rolesObject: {
                    ...this.state.rolesObject,
                    "oimTarget": (data && data.value) || ""
                }
            });
        }
        if (name === "ownerGroup") {
            this.setState({
                selectedOwnerGroupOption: data,
                appObject: {
                    ...this.state.appObject,
                    "ownerGroup": (data && data.value) || ""
                }
            })
        }
    }

    render() {
        const { rolesObject, appObject, rolesList, selectedOption, selectedOwnerGroupOption } = this.state;
        const { appName, appCode, appDescription, ownerGroup } = appObject || {};
        const { roleName, roleDescription } = rolesObject || {};

        const oimOptions = [
            { value: 'IDCS', label: 'IDCS' },
            { value: 'SN', label: 'SN' },
            { value: 'AD', label: 'AD' },
        ];

        const applicationOwners = [
            { value: 'jack', label: 'Jack' },
            { value: 'lucy', label: 'Lucy' },
            { value: 'tom', label: 'Tom' },
        ];

        const rolesListColumn = [
            {
                dataField:'roleName',
                text:'Role Name',
                sort: true
            },
            {
                dataField:'roleDescription',
                text:'Role Description',
                sort: true
            },
            {
                dataField:'oimTarget',
                text:'Oim Target',
                sort: true
            },
            {
                dataField:'id',
                text:'Action',
                headerStyle: {width: 100},
                formatter: () => {
                    return (
                        <h6 className="text-primary pointer-event"> <u> Remove </u></h6>
                    )
                }
            }
        ];

        const options = {
            hidePageListOnlyOnePage: true,
            hideSizePerPage: true
        };
        return (
            <Container className={'container-design'}>
                <div className="1px solid black">
                    <p className="text-warning mt-3">Enter details of the application to be onboarded</p>

                    <Form>
                        <Form.Group as={Row}>
                            <Form.Label column sm={12} md={4}>
                                Application Name
                            </Form.Label>
                            <Col sm={12} md={8}>
                                <Form.Control type="text" name={'appName'} value={appName || ""} onChange={this.onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column md={4}>
                                Application Code
                            </Form.Label>
                            <Col sm={10} md={8}>
                                <Form.Control type="text" name={'appCode'} value={appCode || ""} onChange={this.onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column md={4}>
                                Application Description
                            </Form.Label>
                            <Col sm={10} md={8}>
                                <Form.Control type="text" name={'appDescription'} value={appDescription || ""} onChange={this.onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column md={4}>
                                Application Owner Group
                            </Form.Label>
                            <Col sm={10} md={8}>
                                <Form.Group as={Row}>
                                    <Col md={5}>
                                        <Form.Control type="text" name={'ownerGroup'} value={ownerGroup || ""} onChange={this.onChange}/>
                                    </Col>
                                    <Col md={2} className="text-center">(OR)</Col>
                                    <Col md={5}>
                                        <Select
                                          isClearable
                                          isSearchable
                                          placeholder="Select a person"
                                          value={selectedOwnerGroupOption}
                                          onChange={(value) => this.handleChange({name: "ownerGroup", data: value})}
                                          options={applicationOwners || []}
                                        />
                                    </Col>
                                </Form.Group>
                            </Col>
                        </Form.Group>
                    </Form>

                    <p className="text-warning">Roles</p>

                    <BootstrapTable
                      bootstrap4
                      striped
                      keyField='id'
                      data={rolesList || [] }
                      headerClasses="styled-header"
                      columns={ rolesListColumn }
                      pagination={ paginationFactory(options) }
                    />

                    <Form.Group as={Row}>
                        <Col sm={12} md={12}>
                            <Form.Group as={Row}>
                                <Col className="pt-2" md={3}>
                                    <Form.Control type="text" placeholder="Role Name" name={'roleName'} value={roleName || ""} onChange={this.onRoleChange}/>
                                </Col>
                                <Col className="pt-2" md={3}>
                                    <Form.Control type="text" placeholder="Role Description" name={'roleDescription'} value={roleDescription || ""} onChange={this.onRoleChange}/>
                                </Col>
                                <Col className="pt-2" md={3}>
                                    <Select
                                      isClearable
                                      isSearchable
                                      placeholder="OIM Target"
                                      value={selectedOption}
                                      onChange={(value) => this.handleChange({name: "oimTarget", data: value})}
                                      options={oimOptions || []}
                                    />
                                </Col>
                                <Col md={3} className={'pt-2'}>
                                    <Button type="submit" onClick={this.onAddRole}>Add Role</Button>
                                </Col>
                            </Form.Group>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col>
                            <Button type="submit" variant={'success'} onClick={this.onOnBoardApplication}>Submit</Button>
                        </Col>
                    </Form.Group>
                </div>
            </Container>
        );
    }
}
export default EditApp;
