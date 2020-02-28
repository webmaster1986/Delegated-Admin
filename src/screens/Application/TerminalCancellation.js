import React from "react";
import { Modal } from "antd";
import Spin from "antd/lib/spin";
import {Form} from "react-bootstrap";

class TerminalCancellation extends React.Component {
    state = {
        isLoading: false,
        coverage: ""
    };
    onChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };
    render() {
        const { isLoading} = this.state;
        return (
            <Modal
                title="Terminal Cancellation - 123"
                visible={true}
                onOk={this.props.handleModal}
                okText="Cancel Terminal"
                cancelText="Close"
                onCancel={this.props.handleModal}
            >
                <>
                    {isLoading ? (
                        <div className={"text-center"}>
                            <Spin className="mt-50 custom-loading" />
                        </div>
                    ) : (
                        <div className="ml-3 mr-3">
                            <Form.Label><b>Please provide a reason for the terminal cancellation.</b></Form.Label>
                            <Form.Control as="textarea" rows="3" />

                        </div>
                    )}
                </>
            </Modal>
        );
    }
}

export default TerminalCancellation;
