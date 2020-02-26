import React from "react"
import {Col, Container, Form, InputGroup, Row, Badge, Button} from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

const headerStyle = { backgroundColor: '#0d78af', color: '#ffffff' }
const columns = [
    {
        dataField: 'ref',
        text: 'REF#',
        headerStyle,
        sort: true
    },
    {
        dataField: 'boro',
        text: 'BORO',
        headerStyle,
        sort: true
    },
    {
        dataField: 'box',
        text: 'BOX',
        headerStyle,
        sort: true
    },
    {
        dataField: 'terminal',
        text: 'Terminals',
        headerStyle,
        sort: true
    },
    {
        dataField: 'monitored-premise',
        text: 'MONITORED PREMISE',
        headerStyle,
        sort: true
    },
    {
        dataField: 'comp',
        text: 'COMP',
        headerStyle,
        sort: true
    }
];

const products = [
    {
        "ref": 1245,
        "boro": "MAN",
        "box": 413,
        "terminal": "26 - Manual 27 - Value",
        "monitored-premise": "102 Gold Street",
        "comp": "HFC",
    },
    {
        "ref": 2878,
        "boro": "SI",
        "box": 363,
        "terminal": "26 - Class E",
        "monitored-premise": "6 W 20 Street",
        "comp": "HPC",
    },
    {
        "ref": 1247,
        "boro": "QNS",
        "box": 124,
        "terminal": "56 - Value",
        "monitored-premise": "65 Bleeker Street",
        "comp": "AFA",
    },
    {
        "ref": 2145,
        "boro": "BX",
        "box": 459,
        "terminal": "12 - Class E",
        "monitored-premise": "166 Montague Street",
        "comp": "AFA",
    },
]

class Terminal extends React.Component {

    render() {
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total ml-2">
                Showing { from } to { to } of { size } Results
            </span>
        );

        const options = {
            paginationSize: 4,
            pageStartIndex: 0,
            // alwaysShowAllBtns: true,
            // withFirstAndLast: false,
            // hideSizePerPage: true,
            // hidePageListOnlyOnePage: true,
            firstPageText: 'First',
            prePageText: 'Back',
            nextPageText: 'Next',
            lastPageText: 'Last',
            nextPageTitle: 'First page',
            prePageTitle: 'Pre page',
            firstPageTitle: 'Next page',
            lastPageTitle: 'Last page',
            showTotal: true,
            paginationTotalRenderer: customTotal,
            sizePerPageList: [{
                text: '5', value: 5
            }, {
                text: '10', value: 10
            }, {
                text: 'All', value: products.length
            }]
        };

        return (
            <Container className={"container-design"}>
                <h4 className="text-right">Terminal</h4>
                <hr />
                {
                    <>
                        <Row>
                            <Col md={5}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search..."
                                        aria-describedby="inputGroupPrepend"
                                        name="username"
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={5}>
                                <Form.Row>
                                    <Form.Group className="ml-2 mt-1" controlId="exampleForm.ControlSelect1">
                                        {/*<Form.Label>Borough</Form.Label>*/}
                                        <Form.Control as="select">
                                            <option>Italy</option>
                                            <option>France</option>
                                            <option>Poland</option>
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group className="ml-2 mt-1" controlId="exampleForm.ControlSelect1">
                                        {/*<Form.Label>Terminal</Form.Label>*/}
                                        <Form.Control as="select">
                                            <option>26 Class E</option>
                                            <option>56 Value</option>
                                            <option>27 Value</option>
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group className="ml-2 mt-1" controlId="exampleForm.ControlSelect1">
                                        {/*<Form.Label>Terminal</Form.Label>*/}
                                        <Form.Control as="select">
                                            <option>SFC</option>
                                            <option>HPA</option>
                                            <option>AFA</option>
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group>
                                        <Button type="button" className="btn btn-primary ml-2 mt-1">Search</Button>
                                    </Form.Group>
                                </Form.Row>
                            </Col>
                            <Col md={2}>
                                <span className="terminal-font ml-2">All filters </span><span> | </span><span className="terminal-font"> Clear <Badge variant="secondary">2</Badge></span>
                            </Col>
                        </Row>
                        <hr/>
                        <Row className="m-2">
                            <Col md={8}>
                                <h4>Terminal Assignment List</h4>
                            </Col>
                            <Col md={4}>
                                <button type="button" className="btn btn-primary float-right">New</button>
                            </Col>
                        </Row>
                        <BootstrapTable
                            bootstrap4
                            keyField="id"
                            data={ products }
                            columns={ columns }
                            striped
                            headerClasses="header-class"
                            pagination={ paginationFactory(options) }
                        />
                    </>
                }
            </Container>
        );
    }

}

export default Terminal;
