import React from "react"
import {Col, Container, Row} from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

const headerStyle = { backgroundColor: '#0d78af', color: '#ffffff' };
const columns = [
    {
        dataField: 'code',
        text: 'CODE',
        headerStyle,
        sort: true
    },
    {
        dataField: 'aka',
        text: 'AKA',
        headerStyle,
        sort: true
    },
    {
        dataField: 'name',
        text: 'NAME',
        headerStyle,
        sort: true
    },
    {
        dataField: 'phone',
        text: 'PHONE',
        headerStyle,
        sort: true
    },
    {
        dataField: 'contact',
        text: 'CONTACT',
        headerStyle,
        sort: true
    },
    {
        dataField: 'inspDate',
        text: 'INSP.DATE',
        headerStyle,
        sort: true
    }
];

const products = [
    {
        "code": 1245,
        "aka": "MAN",
        "name": 413,
        "phone": "26 - Manual 27 - Value",
        "contact": "102 Gold Street",
        "inspDate": "HFC",
    },
    {
        "code": 2878,
        "aka": "SI",
        "name": 363,
        "phone": "26 - Class E",
        "contact": "6 W 20 Street",
        "inspDate": "HPC",
    },
    {
        "code": 1247,
        "aka": "QNS",
        "name": 124,
        "phone": "56 - Value",
        "contact": "65 Bleeker Street",
        "inspDate": "AFA",
    },
    {
        "code": 2145,
        "aka": "BX",
        "name": 459,
        "phone": "12 - Class E",
        "contact": "166 Montague Street",
        "inspDate": "AFA",
    },
];

class CentralStationList extends React.Component {

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


                {
                    <>
                        <Row className="m-2">
                            <Col md={8}>
                                <h4>Central Station List</h4>
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

export default CentralStationList;
