import React, {useState} from "react";
import { Modal, Button } from 'antd';

const Modal = () => {
    const [visible, setVisible] = useState(false);

    const showModal = () => {
        setVisible(true)
    };

    const handleOk = e => {
        setVisible(false)
    };

    const handleCancel = e => {
        setVisible(false)
    };

    return (
        <div>
            <Button type="primary" onClick={this.showModal}>
                Open Modal
            </Button>
            <Modal
                title="Basic Modal"
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                </>
            </Modal>
        </div>
    );

}

export default Modal;
