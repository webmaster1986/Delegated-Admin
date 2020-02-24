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
                        props.data && Object.keys(props.data).map((f, i) =>
                            <p key={i.toString() + i} >{`${f} = ${props.data[f]}`}</p>
                        )
                    }
                </>
            </Modal>
        </div>
    );

}

export default ViewModal;
