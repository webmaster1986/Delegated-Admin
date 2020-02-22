import React, { Component } from 'react';
import { Container, Button, Row, Col, Form, InputGroup, Dropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Spin from 'antd/lib/spin'
import message from 'antd/lib/message'
import { ApiService } from '../../services/ApiService'
import {Column} from "devextreme-react/data-grid";
import CustomGrid from "../../components/CustomGrid";
import { Select } from 'antd';

const { Option } = Select;

class AppOwners extends Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state = {
            isLoading: false,
            onCategorySelect: false,
            applicationsList: [],
            selectBy: ""
        }
    }

    async componentDidMount() {
        this.setState({
            isLoading: true
        })

        const data =  await this._apiService.getAllApplications()
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

    onGrantAccess = (id) => {
        this.setState({
            onCategorySelect: true,
            id
        })
    }

    onCheck = (data) => {
        const {id} = this.state
        this.setState({
            selectBy: data
        })
        this.props.history.push(`/grant-access?app=${id}`)
    }

    render() {
        const { applicationsList, isLoading, onCategorySelect, id, selectBy } = this.state
        return(
            <Container className={'container-design'}>
                <h4 className="text-right">
                    Applications
                </h4>
                <hr/>
                {
                    !onCategorySelect ?
                        <>
                            <Row>
                                <Col md={12}>
                                    <InputGroup>
                                        {/*<InputGroup.Prepend>
                                <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                            </InputGroup.Prepend>*/}
                                        <Form.Control
                                            type="text"
                                            placeholder="Search..."
                                            aria-describedby="inputGroupPrepend"
                                            name="username"
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>

                            {
                                isLoading ? <div className={'text-center'}> <Spin className='mt-50 custom-loading'/> </div> :
                                    <CustomGrid
                                        refCallback={(dg) => this.dg = dg}
                                        dataSource={applicationsList}
                                        keyExpr="appCode"
                                        columnHidingEnabled={false}
                                        showBorders={true}
                                        isHideSearchPanel={true}
                                    >
                                        <Column alignment={'left'} sortOrder={'asc'} caption={'Application Code'} dataField={'appCode'}/>
                                        <Column alignment={'left'} caption={'Application Name'} dataField={'appName'}/>
                                        <Column alignment={'left'} caption={'Description'} dataField={'appDescription'}/>
                                        <Column alignment={'left'} caption={'Owner Group'} dataField={'ownerGroup'}/>
                                        <Column alignment={'left'} allowSorting={false} caption={'Action'} dataField={'appCode'}
                                                cellRender={(record) => {
                                                    return (
                                                        <div className="text-center">
                                                            <Select defaultValue="manage access">
                                                                <Option value="manage access" disabled>Manage Access</Option>
                                                                <Option value="grant access" onClick={() => this.onGrantAccess(record.data.appCode)}>Grant Access</Option>
                                                                <Option value="revoke access">
                                                                    <Link to={`/revoke-access?app=${record.data.appCode}`}>
                                                                        Revoke Access
                                                                    </Link>
                                                                </Option>
                                                            </Select>
                                                        </div>
                                                    )
                                                }}
                                        />
                                    </CustomGrid>
                            }
                        </> :
                        <>
                            <p> Select by Role or User</p>
                            <Row className="ml-5 mt-3">
                                <Col md={6}>
                                    <Form.Check
                                        type="radio"
                                        id="default-radio"
                                        label="Grant Access By Role"
                                        name="selectBy"
                                        value="byRole"
                                        onChange={() => this.onCheck("byRole")}
                                        checked={selectBy === "byRole"}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Check
                                        type="radio"
                                        id="default-radio"
                                        label="Grant Access By User"
                                        name="selectBy"
                                        value="byUser"
                                        onChange={() => this.onCheck("byUser")}
                                        checked={selectBy === "byUser"}
                                    />
                                </Col>
                            </Row>
                        </>
                }

            </Container>
        )
    }
}

export default AppOwners
