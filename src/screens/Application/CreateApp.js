import React from "react";
import {Row, Col, Form, Button, Breadcrumb} from "react-bootstrap";
import { ApiService } from "../../services/ApiService";
import {Icon} from 'antd';
import message from "antd/lib/message";
import notification from "antd/lib/notification";
import Spin from "antd/lib/spin";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import Select from 'react-select';

const openNotificationWithIcon = (type, message) => {
    notification[type]({
        message,
    });
};

class CreateApp extends React.Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state= {
            isLoading: false,
            rolesList: [],
            ownerGroupList: [],
            oimTargetList: [],
            rolesObject: {},
            appObject: {appName: '', appCode: '', appDescription: '', ownerGroup: '', selectedOwnerGroup: ''},
            appCodeError: '',
            selectedOption: null,
            selectedOwnerGroupOption: null
        }
    }

    async componentDidMount() {
        this.setState({
            isLoading: true
        })

        const data = await this._apiService.getAppOwnerGroups()
        const roleTarget = await this._apiService.getAppRoleTargets()
        if (!data || data.error || !roleTarget || roleTarget.error) {
            this.setState({
                isLoading: false
            })
            return message.error('something is wrong! please try again');
        } else {
            this.setState({
                isLoading: false,
                ownerGroupList: (data && data.resultCollection) || [],
                oimTargetList: (roleTarget && roleTarget.resultCollection) || []
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
        const { appObject } = this.state
        const { name, value } = event.target
        let object = {}
        if(name === 'appCode' && !appObject.selectedOwnerGroup){
            object = {
                ownerGroup: `${value}_OWNER`
            }
        }
        if(name === "selectedOwnerGroup") {
          object = {
            ownerGroup: value ? "" : `${appObject.appCode}_OWNER`,
          }
        }
        this.setState({
            appObject: {
                ...this.state.appObject,
                [name]: value,
                ...object
            }
        }, async () => {
            if (name === 'appCode') {
                let object = {}
                if (value.length < 3) {
                    object.appCodeError = "Application Code should have 3 - 5 characters!"
                } else {
                    object.appCodeError = ""
                }

                if (!object.appCodeError) {
                    const appDetails =  await this._apiService.getAllApplications(value)
                    if (!appDetails || appDetails.error) {
                        object.appCodeError = "Application Code is not valid!"
                        object.appObject = { ...this.state.appObject, appCode: "" }
                    }
                    if (appDetails && appDetails.application) {
                        object.appCodeError = "Application Code is already in use!"
                        object.appObject = { ...this.state.appObject }
                    }
                }
                this.setState({...object})
            }
        })
    }

    onSelectedOwnerGroupChange = (selectedOwnerGroupOption) => {
        const { appObject } = this.state
        const object = {
            ownerGroup: selectedOwnerGroupOption ? "" : `${appObject.appCode}_OWNER`,
        }
        this.setState({
            selectedOwnerGroupOption,
            appObject: {
                ...this.state.appObject,
                "selectedOwnerGroup": (selectedOwnerGroupOption && selectedOwnerGroupOption.value) || "",
                ...object
            }
        })
    }

    onAddRole = () => {
        let { rolesList, rolesObject, oimTargetList } = this.state
        if (rolesObject && Object.keys(rolesObject).length > 0) {
            let isDuplicate = false
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
                rolesList.push({...rolesObject, oimTarget: rolesObject.oimTarget || oimTargetList[0], id: rolesList.length})
            }

            this.setState({
                rolesList,
                rolesObject: {},
                selectedOption: null
            })
        }
    }

    onOnBoardApplication = async () => {
        const { rolesList, appObject } = this.state
        const { appName, appCode, appDescription, ownerGroup, selectedOwnerGroup } = appObject || {}

        const payload = {
            application: {appCode, appName, appDescription, ownerGroup: ownerGroup || selectedOwnerGroup},
            roles: rolesList && rolesList.map(f => ({
                roleName: f.roleName,
                roleDescription: f.roleDescription,
                oimTarget: f.oimTarget
            }))
        }
        this.setState({ isLoading: true})
        const data =  await this._apiService.applicationOnBoarding(payload)
        if (!data || data.error) {
            message.error('something is wrong! please try again');
            // openNotificationWithIcon('error', "Something went Wrong!")
        } else {
            // openNotificationWithIcon('success','Application Onboarding Successfully!');
            message.success('Application Onboarding Successfully!');
            this.props.history.push("/")
        }
    }

    onRemoveRole = (index) => {
        let { rolesList } = this.state
        rolesList.splice(index, 1)
        this.setState({
            rolesList
        })
    }

    onBlur = async (event) => {
        const { name, value } = event.target

        let object = {}

        if(name === "appCode" && value.length < 3 ){
            object.appCodeError = "Application Code should have 3 - 5 characters!"
        } else {
            object.appCodeError = ""
        }

        if(!object.appCodeError){
            const appDetails =  await this._apiService.getAllApplications(value)
            if (!appDetails || appDetails.error) {
                object.appCodeError = "Application Code is not valid!"
                object.appObject = { ...this.state.appObject, appCode: "" }
            }
        }

        this.setState({...object})
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
        const { rolesObject, appObject, rolesList, ownerGroupList, appCodeError, oimTargetList, isLoading, selectedOption, selectedOwnerGroupOption } = this.state;
        const { appName, appCode, appDescription, ownerGroup, selectedOwnerGroup } = appObject || {};
        const { roleName, roleDescription, oimTarget } = rolesObject || {};
        const disabled = !appName || !appCode || (appCode && appCode.length < 2) || appCodeError || !appDescription || !(ownerGroup || selectedOwnerGroup) || !rolesList.length;
        const rolesListColumn = [
            {
                dataField:'roleName',
                text:'Role Name',
                headerStyle: {width: "20%"},
            },
            {
                dataField:'roleDescription',
                text:'Role Description',
                headerStyle: {width: "40%"},
            },
            {
                dataField:'oimTarget',
                text:'OIM Target',
                headerStyle: {width: "20%"},
            },
            {
                dataField:'id',
                text:'Action',
                headerStyle: {width: 100},
                formatter: (cell, row, rowIndex) => {
                    return (
                        <h6 className="text-primary cursor-pointer" onClick={() => this.onRemoveRole(rowIndex)}><u> Remove </u></h6>
                    )
                }
            }
        ];

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
                                Application Onboarding
                            </h4>
                        </Col>
                    </Row>
                    <hr/>
                    <Breadcrumb>
                        <Breadcrumb.Item href="/">Applications</Breadcrumb.Item>
                        <Breadcrumb.Item active>Onboard New Application</Breadcrumb.Item>
                    </Breadcrumb>
                    { isLoading ? <div className="text-center"> <Spin className='mt-50 custom-loading'/></div> :
                      <div className="1px solid black">
                          <Form>
                              <Form.Group as={Row}>
                                  <Form.Label column sm={12} md={4}>
                                      Application Name <span className="text-danger">*</span>
                                  </Form.Label>
                                  <Col sm={12} md={8}>
                                      <Form.Control
                                        type="text"
                                        name={'appName'}
                                        value={appName || ""}
                                        onChange={this.onChange}
                                      />
                                  </Col>
                              </Form.Group>
                              <Form.Group as={Row}>
                                  <Form.Label column md={4}>
                                      Application Code <span className="text-danger">*</span>
                                  </Form.Label>
                                  <Col sm={10} md={8}>
                                      <Row>
                                          <Col sm={appCode ? 11 : 12} md={appCode ? 11 : 12}>
                                              <Form.Control
                                                  type="text"
                                                  minLength={2}
                                                  maxLength={5}
                                                  placeholder="3 to 5 character code"
                                                  name={'appCode'}
                                                  value={appCode || ""}
                                                  onChange={this.onChange}
                                                  // onBlur={this.onBlur}
                                              />
                                          </Col>
                                          {
                                              appCode &&
                                                  <Col sm={1} md={1}>
                                                      {
                                                          appCodeError ?
                                                              <Icon className="text-danger m-1" style={{fontSize: 25}} type="close-circle"/> :
                                                              <Icon className="text-success m-1" style={{fontSize: 25}} type="check-circle"/>
                                                      }
                                                  </Col>
                                          }
                                      </Row>
                                      {appCodeError ? <span className="color-red">{appCodeError}</span> : null}
                                  </Col>
                              </Form.Group>
                              <Form.Group as={Row}>
                                  <Form.Label column md={4}>
                                      Application Description <span className="text-danger">*</span>
                                  </Form.Label>
                                  <Col sm={10} md={8}>
                                      <Form.Control
                                        type="text"
                                        name={'appDescription'}
                                        value={appDescription || ""}
                                        onChange={this.onChange}
                                      />
                                  </Col>
                              </Form.Group>
                              <Form.Group as={Row}>
                                  <Form.Label column md={4}>
                                      Application Owner Group <span className="text-danger">*</span>
                                  </Form.Label>
                                  <Col sm={10} md={8}>
                                      <Form.Group as={Row}>
                                          <Col md={5}>
                                              <Form.Control
                                                type="text"
                                                name={'ownerGroup'}
                                                value={appCode ? ownerGroup : ""}
                                                disabled={true}
                                                onChange={this.onChange}
                                              />
                                          </Col>
                                          <Col md={2} className="text-center">(OR)</Col>
                                          <Col md={5}>
                                              <Select
                                                isClearable
                                                isSearchable
                                                placeholder="Select an existing App owner group"
                                                value={selectedOwnerGroupOption}
                                                onChange={this.onSelectedOwnerGroupChange}
                                                options={(ownerGroupList && ownerGroupList.map(oim => ({ value: oim, label: oim }))) || []}
                                              />
                                          </Col>
                                      </Form.Group>
                                  </Col>
                              </Form.Group>
                          </Form>

                          <p>Roles <span className="text-danger">*</span></p>
                          {
                              rolesList.length ?
                                  <BootstrapTable
                                    bootstrap4
                                    striped
                                    keyField='id'
                                    data={ rolesList || [] }
                                    headerClasses="styled-header"
                                    columns={ rolesListColumn }
                                    pagination={ paginationFactory(options) }
                                  /> : null
                          }
                          <Form.Group as={Row}>
                              <Col sm={12} md={12}>
                                  <Form.Group as={Row}>
                                      <Col className="pt-2" md={3}>
                                          <Form.Control type="text" placeholder="Role Name" name={'roleName'}
                                                        value={roleName || ""} onChange={this.onRoleChange}/>
                                      </Col>
                                      <Col className="pt-2" md={5}>
                                          <Form.Control type="text" placeholder="Role Description"
                                                        name={'roleDescription'} value={roleDescription || ""}
                                                        onChange={this.onRoleChange}/>
                                      </Col>
                                      <Col className="pt-2" md={2}>
                                          <Select
                                            isClearable
                                            isSearchable
                                            placeholder="OIM Target"
                                            value={selectedOption}
                                            onChange={this.handleChange}
                                            options={(oimTargetList && oimTargetList.map(oim => ({ value: oim, label: oim }))) || []}
                                          />
                                      </Col>
                                      <Col md={2} className={'pt-2'}>
                                          <Button
                                            type="submit"
                                            onClick={this.onAddRole}
                                            disabled={!roleName || !oimTarget}
                                          >
                                              Add Role
                                          </Button>
                                      </Col>
                                  </Form.Group>
                              </Col>
                          </Form.Group>
                          <Form.Group as={Row}>
                              <Col>
                                  <button type="button" className="btn btn-danger btn-md" onClick={() => this.props.history.push('/')}>Cancel</button>&nbsp;&nbsp;
                                  {
                                      disabled ?
                                          <button type="button" className="btn btn-secondary btn-md" disabled style={{cursor: "default"}}>Submit</button> :
                                          <button type="button" className="btn btn-success btn-md" onClick={this.onOnBoardApplication}>Submit</button>
                                  }
                              </Col>
                          </Form.Group>
                      </div>
                    }
                </div>
            </>
        );
    }
}
export default CreateApp;
