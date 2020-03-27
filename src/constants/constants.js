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