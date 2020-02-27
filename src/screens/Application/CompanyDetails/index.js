import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import CompanyDetailsSFC from "./CompanyDetailsSFC";


class CompanyDetails extends Component {

    render() {
        return (
            <>
                <Container className={"container-design"}>
                    <CompanyDetailsSFC/>
                </Container>
            </>
        );
    }
}

export default CompanyDetails;
