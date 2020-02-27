import React from "react";
import {Modal} from 'antd';
import Spin from "antd/lib/spin";

class InvalidAddressModel extends React.Component {
    state = {
        isLoading: false,
        coverage: ""
    };
    onChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        })
    };
    render(){
        const {isLoading} = this.state;
        return (
            <Modal
                title="New Terminal"
                visible={true}
                onOk={this.props.handleModal}
                okText="Save"
                cancelText="Close"
                onCancel={this.props.handleModal}
            >
                <>
                    {
                        isLoading ? <div className={'text-center'}><Spin className='mt-50 custom-loading'/></div> :
                            <div className="ml-3 mr-3">
                                1234 MetroTech Center, Brooklyn, NY 11201 does not exist. Did you mean...
                            </div>
                    }
                </>
            </Modal>
        )
    }
}

export default InvalidAddressModel;
