import React from "react";
import { Modal } from "antd";
import Spin from "antd/lib/spin";
import {Form} from "react-bootstrap";

class InvalidAddressModel extends React.Component {
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
    const { isLoading, invalidAddress } = this.state;
    return (
      <Modal
        title="Invalid Address"
        visible={true}
        onOk={this.props.handleModal}
        okText="Select"
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
              <div className="mb-2">
                1234 MetroTech Center, Brooklyn, NY 11201 does not exist. Did
                you mean...
              </div>
              <div className="mb-2">
                <b>Possible Matches:</b>
              </div>
              <Form.Check
                custom
                name="invalidAddress"
                type="radio"
                id={"custom-1"}
                value="1"
                checked={invalidAddress === "1"}
                onChange={this.onChange}
                label="12 MetroTech Center, Brooklyn NY 11201. Box Number 12345, BIN 1234567"
              />
              <Form.Check
                custom
                name="invalidAddress"
                type="radio"
                id={"custom-2"}
                value="2"
                checked={invalidAddress === "2"}
                onChange={this.onChange}
                label="2 MetroTech Center, Brooklyn NY 11201. Box Number 12345, BIN 1234567."
              />
              <Form.Check
                custom
                name="invalidAddress"
                type="radio"
                id={"custom-3"}
                value="3"
                checked={invalidAddress === "3"}
                onChange={this.onChange}
                label="4 MetroTech Center, Brooklyn NY 11201. Box Number 12345, BIN 1234567."
              />
            </div>
          )}
        </>
      </Modal>
    );
  }
}

export default InvalidAddressModel;
