import React from "react";
import { Modal } from 'antd';

const ViewModal = (props) => {
    return (
        <div>
            <Modal
                title={props && props.title}
                visible={props.visible}
                onOk={props.handelModal}
                onCancel={props.handelModal}
            >
                <>
                    {
                        props.data && Object.keys(props.data).map((key, i) =>
                          <div key={i.toString() + i} >
                            <b>{key.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()}:&nbsp;&nbsp;</b>
                            <span>{props.data[key]}</span>
                          </div>
                        )
                    }
                </>
            </Modal>
        </div>
    );

}

export default ViewModal;
