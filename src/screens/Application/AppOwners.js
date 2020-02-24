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

    onCheck = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    onNext = () => {
        const {id, selectBy} = this.state
        this.props.history.push(`/grant-access?app=${id}&showBy=${selectBy}`)
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
                                        custom
                                        name="selectBy"
                                        type='radio'
                                        id={'custom-1'}
                                        value='byRole'
                                        checked={selectBy === 'byRole'}
                                        onChange={(e) => this.onCheck(e)}
                                        label="Grant Access By Role"
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Check
                                        custom
                                        name="selectBy"
                                        type='radio'
                                        id={'custom-2'}
                                        value='byUser'
                                        checked={selectBy === 'byUser'}
                                        onChange={(e) => this.onCheck(e)}
                                        label="Grant Access By User"
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button className="float-right" variant={'outline-primary'} size={'sm'} onClick={this.onNext}>Next</Button>
                                </Col>
                            </Row>
                        </>
                }

            </Container>
        )
    }
}

export default AppOwners
