import React from "react";
import {notification} from "antd";

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
    notification[failed.length ? 'error' : 'success']({
        message: failed.length ? 'Error' : 'Success',
        description: !failed.length ? `${key} submitted successfully` :
            res.manageAccessResponse.map((x, index) => {
                return(
                    <div key={index.toString()}>
                        <div><b>{x.userLogin}:</b></div>
                        <div className="word-break">Update success - {(x.successSet || []).map((y, i) => <span key={i.toString()}>{y.roleName}({y.oimTargets.join(",")}){(x.successSet || []).length -1 === i ? "" : ","}</span>)}</div>
                        <div className="word-break">Update failed - {(x.failedSet || []).map((y, i) => <span key={i.toString()}>{y.roleName}({y.oimTargets.join(",")}){(x.failedSet || []).length -1 === i ? "" : ","}</span>)}</div>
                    </div>
                )
            }) ,
        duration: 0,
        onClick: () => {},
    });
    return isError
}