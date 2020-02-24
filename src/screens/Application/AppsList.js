import React, { Component } from 'react';
import { Container, Button, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Spin from 'antd/lib/spin'
import message from 'antd/lib/message'
import { ApiService } from '../../services/ApiService'
import {Column} from "devextreme-react/data-grid";
import CustomGrid from "../../components/CustomGrid";


class AppsList extends Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state = {
            isLoading: false,
            applicationsList: []
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

    render() {
        const { applicationsList, isLoading } = this.state
        return(
            <Container className={'container-design'}>
                <h4 className="text-right">
                    Applications
                </h4>
                <hr/>
                <Row>
                    <Col md={8}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search..."
                                aria-describedby="inputGroupPrepend"
                                name="username"
                            />
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <div className="mb-3 text-right marginTop-sm-1">
                            <Link to={'/create-apps'}> <Button variant="primary">OnBoard New Application </Button> </Link>
                        </div>
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
                                            <Link to={`/role-manage/${record.data.appCode}`}>
                                                <Button variant={'primary'} size={'sm'}>Edit</Button>
                                            </Link>
                                        </div>
                                    )
                                }}
                            />
                        </CustomGrid>
                }

            </Container>
        )
    }
}

export default AppsList