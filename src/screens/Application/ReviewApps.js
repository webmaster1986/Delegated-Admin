import React, { Component } from 'react';
import { Container, Button, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Column } from 'devextreme-react/data-grid'
import CustomGrid from "../../components/CustomGrid"

const products = [
    {
        appCode: 1,
        appName: 'First App',
        description: 'First App Description',
        ownerGroup: 'asdasda',
    },{
        appCode: 2,
        appName: 'Second App',
        description: 'Second App Description',
        ownerGroup: 'asdasda',
    },{
        appCode: 3,
        appName: 'Third App',
        description: 'Third App Description',
        ownerGroup: 'asdasda',
    },{
        appCode: 4,
        appName: 'Fourth App',
        description: 'Fourth App Description',
        ownerGroup: 'asdasda',
    }
];

const columns = [
    {
        title: 'Application Code',
        dataIndex: 'appCode',
        sorter: (a, b) => a.appCode - b.appCode
    },
    {
        title: 'Application Name',
        dataIndex: 'appName',
        sorter: (a, b) => a.appName - b.appName
    },
    {
        title: 'Description',
        dataIndex: 'description',
        sorter: (a, b) => a.description - b.description
    },
    {
        title: 'Owner Group',
        dataIndex: 'ownerGroup',
        sorter: (a, b) => a.ownerGroup - b.ownerGroup
    },
    {
        title: 'Action',
        key: 'action',
        width: 200,
        render: () =>
            <div className="text-center">
                <Button variant={'outline-success'} size={'sm'}>Approve</Button>&nbsp;&nbsp;
                <Button variant={'outline-danger'} size={'sm'}>Revoke</Button>
            </div>,
    },
];

class ReviewApps extends Component {
    constructor(props){
        super(props)
        this.state = {}
    }

    render() {
        return(
            <Container className={'container-design'}>
                <h4 className="text-right">
                    Applications
                </h4>
                <hr/>
                <Row className={'mb-3'}>
                    <Col>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                type="text"
                                placeholder="Search..."
                                aria-describedby="inputGroupPrepend"
                                name="username"
                            />
                        </InputGroup>
                    </Col>
                </Row>

                {/*<Table size={'small'} rowKey={'appCode'} bordered columns={columns} dataSource={products} scroll={{x: 768}}/>*/}

                <CustomGrid
                    refCallback={(dg) => this.dg = dg}
                    dataSource={products}
                    // columnAutoWidth={false}
                    keyExpr="appCode"
                    columnHidingEnabled={false}
                    showBorders={true}
                    // title="Bids"
                >
                    <Column alignment={'left'} caption={'Application Code'} dataField={'appCode'} />
                    <Column alignment={'left'} caption={'Application Name'} dataField={'appName'} />
                    <Column alignment={'left'} caption={'Description'} dataField={'description'} />
                    <Column alignment={'left'} caption={'Owner Group'} dataField={'ownerGroup'} />
                    <Column alignment={'left'} allowSorting={false} caption={'Action'} dataField={'appCode'} cellRender={(record) => {
                        return(
                            <div>
                                <Button variant={'outline-success'} size={'sm'}>Approve</Button>&nbsp;&nbsp;
                                <Button variant={'outline-danger'} size={'sm'}>Revoke</Button>
                            </div>
                        )
                    }} />
                </CustomGrid>

            </Container>
        )
    }
}

export default ReviewApps