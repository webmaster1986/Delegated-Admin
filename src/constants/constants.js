import React from "react";
import {notification, message, Icon} from "antd";

export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    APP_OWNER: 'APP_OWNER',
    SUPER_APP_OWNER: 'SUPER_OWNER',
}

export const isAlphaNum = (value) => {
    const regex = new RegExp("^[a-zA-Z0-9\s]+$")
    return regex.test(value)
}

export const checkAlphaNum = (value) => {
    return (/\d/.test(value) && /[a-zA-Z]/.test(value))
}

export const showNotification = (res, key) => {

    let success = []
    let failed = []
    let isError = false

    res.manageAccessResponse.forEach(manage => {
        if(manage.successSet && manage.successSet.length){
            success = success.length ? success.concat(manage.successSet) : manage.successSet
        }
        if(manage.failedSet && manage.failedSet.length){
            failed = failed.length ? failed.concat(manage.failedSet) : manage.failedSet
        }
    })
    if(failed.length) {
        isError = true
    }
    message[failed.length ? 'error' : 'success']({
        message: failed.length ? 'Status' : 'Success',
        content: !failed.length ? `${key} submitted successfully` :
            <div onClick={() => message.destroy()}>
                <div className="close-message">
                    <h6><b>{failed.length ? 'Status' : 'Success'}</b></h6>
                    <Icon type={'close'} onClick={() => message.destroy()}/>
                </div>
                {
                    res.manageAccessResponse.map((x, index) => {
                        return(
                            <div key={index.toString()}>
                                <div><b>{x.userLogin}:</b></div>
                                {(x.successSet || []).length ? <div className="word-break">Update success - {(x.successSet || []).map((y, i) => <span key={i.toString()}>{y.roleName}({y.oimTargets.join(",")}){(x.successSet || []).length -1 === i ? "" : ","}</span>)}</div> : null }
                                {(x.failedSet || []).length ? <div className="word-break">Update failed - {(x.failedSet || []).map((y, i) => <span key={i.toString()}>{y.roleName}({y.oimTargets.join(",")}){(x.failedSet || []).length -1 === i ? "" : ","}</span>)}</div> : null }
                            </div>
                        )
                    })
                }
            </div>,
        duration: failed.length ? 0 : 3,
    });
    return isError
}

export const setErrorMsg = (data) => {
    let errMessage = "something is wrong! please try again"
    if(data && data.errorData && data.errorData.response && data.errorData.response.data && data.errorData.response.data.message) {
        errMessage = data.errorData.response.data.message
    }
    return errMessage
}