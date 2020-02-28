import React from "react";
import { Modal } from "antd";
import { Col, Form, Row } from "react-bootstrap";
import Spin from "antd/lib/spin";
import Select from "react-select";
import InputMask from "react-input-mask";

class EditPremise extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editPremiseObject: {}
    };
  }
  state = {
    isLoading: false
  };
  onChange = event => {
    const { name, value } = event.target;
    this.setState({
      editPremiseObject: {
        ...this.state.editPremiseObject,
        [name]: value
      }
    });
  };
  occupancyClassificationOption = [
    { label: "Factory & Industrial", value: "carbonMonoxide" }
  ];
  render() {
    const { isLoading, editPremiseObject } = this.state;
    const {
      monitoredName,
      zipCode,
      occupancyClassification,
       comment
    } = editPremiseObject;
    return (
      <Modal
        title="Edit Premise"
        visible={true}
        onOk={this.props.handleModal}
        okText="Save"
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
              <Row>
                <Col>
                  <Row>
                    <label>Monitored Name</label>
                  </Row>
                  <Row>
                    <Form.Control
                      type="text"
                      name="monitoredName"
                      value={monitoredName}
                      onChange={this.onChange}
                      placeholder="ROCKAWAYAVE"
                    />
                  </Row>
                </Col>
              </Row>
              <Row className="mt-2">
                <Col style={{ padding: 0 }}>
                  <Form.Label>Zip Code</Form.Label>
                  <InputMask
                    mask="99999-9999"
                    className="form-control"
                    placeholder="Enter Zip Code"
                    name="zipCode"
                    value={zipCode}
                    onChange={this.onChange}
                  />
                </Col>
                <Col />
              </Row>
              <Row className="mt-2">
                <Col style={{ padding: 0 }}>
                  <label>Building Dominant Occupancy Classification</label>
                  <Select
                    isClearable
                    isSearchable
                    name="occupancyClassification"
                    value={occupancyClassification}
                    options={this.occupancyClassificationOption}
                    onChange={option =>
                        this.onChange({
                            target: { name: "occupancyClassification", value: option }
                        })
                    }
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <Row>
                    <label>Comment</label>
                  </Row>
                  <Row>
                    <Form.Control type="text" onChange={this.onChange} name="comment" value={comment} placeholder="Enter a comment.." />
                  </Row>
                </Col>
              </Row>
            </div>
          )}
        </>
      </Modal>
    );
  }
}

export default EditPremise;
