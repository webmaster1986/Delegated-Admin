import axios from "axios";
import Cookies from "universal-cookie"
import message from "antd/lib/message";

const getHost = () => {
    const domain = process.env.REACT_APP_ENV;
    let apiEndPoint = '/DelegatedAdmin/api'
    /*if (domain === 'dev') {
        apiEndPoint = "http://cloud.kapstonellc.com:7003/api/delegated-admin-ui/admin-services/";
    } else if (domain === 'tst') {
        apiEndPoint = 'http://cloud.kapstonellc.com:7003/api/delegated-admin-ui/admin-services/';
    } else if (domain === 'stg') {
        apiEndPoint = 'http://cloud.kapstonellc.com:7003/api/delegated-admin-ui/admin-services/';
    } else  if (domain === 'prod') {
        apiEndPoint = 'http://cloud.kapstonellc.com:7003/api/delegated-admin-ui/admin-services/';
    }else {
        apiEndPoint = "http://cloud.kapstonellc.com:7003/api/delegated-admin-ui/admin-services/";
    }*/
    return apiEndPoint
};

const apiEndPoint = process.env.NODE_ENV === 'production' ? getHost() : '/';

const axiosInstance = axios.create({
    baseURL: apiEndPoint,
});
const cookies = new Cookies();

export const getLoginUser = () => {
    return {
        "login": cookies.get('OAMUserName'),
    }
}

export const getLoginRole = () => cookies.get("USER_ROLE")

export class ApiService {

    static async getData(url, headers, cancelToken, data) {
        const config = {
            headers: {
                ...(headers || {}),
                'Content-Type': 'application/json'
            },
        };
        if (data) {
            config.data = data;
        }
        if (cancelToken && cancelToken.token) {
            config.cancelToken = cancelToken.token;
        }
        const response = await axiosInstance.get(url, config).catch((err) => {
            data = {error: 'something went wrong'};
        });
        return data || response.data;
    }

    static async postMethod(url, data, headers, cancelToken) {
        const config = {
            headers: {
                ...(headers || {})
            }
        };
        if (cancelToken && cancelToken.token) {
            config.cancelToken = cancelToken.token;
        }
        let resData = '';
        const response = await axiosInstance.post(url, data, config).catch(thrown => {
            resData = {error: 'something went wrong' , errorData: thrown};
        });
        return resData || response.data;
    }

    static async putMethod(url, data, headers, cancelToken) {
        const config = {
            headers: {
                ...(headers || {})
            }
        };
        if (cancelToken && cancelToken.token) {
            config.cancelToken = cancelToken.token;
        }
        let resData = '';
        const response = await axiosInstance.put(url, data, config).catch(thrown => {
            resData = {error: 'something went wrong' , errorData: thrown};
        });
        return resData || response.data;
    }

    static async deleteMethod(url, data, headers, cancelToken) {
        const config = {
            headers: {
                ...(headers || {})
            }
        };
        if (cancelToken && cancelToken.token) {
            config.cancelToken = cancelToken.token;
        }
        let resData = '';
        const response = await axiosInstance.delete(url, {data}).catch(thrown => {
            resData = {error: 'something went wrong' , errorData: thrown};
        })
        return resData || response.data;
    }

    async getAllApplications(appId) {
        // return await ApiService.getData(`GetAllApplications.json`);
        return await ApiService.getData(`v1/applications${appId ? `/${appId}` : ""}`);
    }

    async getAllApplicationsByOwner(appId) {
        return await ApiService.getData(`v1/users/owner-applications/${appId || ""}`);
    }

    async applicationOnBoarding(body) {
        return await ApiService.postMethod(`v1/applications`, body);
    }

    async getAppDetailByAppCode(appCode) {
        // return await ApiService.getData(`GetApplicationDetails.json`);
        return await ApiService.getData(`v1/applications/${appCode}`);
        // return appDetails
    }

    async getRolesForApp(appCode) {
        // return await ApiService.getData(`GetRolesForApplication.json`);
        return await ApiService.getData(`v1/applications/${appCode}/roles`);
        // return appRoles
    }

    async getRolesForAppByOwner(appCode) {
        return await ApiService.getData(`v1/applications/${appCode}/owner-roles`);
        // return appRoles
    }

    async addRole(body, appCode) {
        return await ApiService.postMethod(`v1/applications/${appCode}/roles`, body);
    }

    async rolesStatusActiveDisable(body, appCode, status) {
        // return await ApiService.getData(status === "activate" ? "ActiveRole.json" : "DisableRole.json");
        return await ApiService.putMethod(`v1/roles/${body.roleName}/${status}`, body);
    }

    async getRolesForUser(id) {
        // return await ApiService.getData(`GetRolesForUser.json`);
        return await ApiService.getData(`v1/users/${id}/roles`);
    }

    async getRolesForRevoke(id) {
        // return await ApiService.getData(`GetRolesForRevoke.json`);
        return await ApiService.getData(`v1/users/${id}/roles-for-revoke`);
    }

    async getAppOwnerGroups(id) {
        // return await ApiService.getData(`GetAllAppOwnerGroups.json`);
        return await ApiService.getData(`v1/owner-groups`);
    }

    async getAppRoleTargets() {
        // return await ApiService.getData(`GetOIMTargets.json`);
        return await ApiService.getData(`v1/role-targets`);
    }

    async getLoginUserRole(user_id) {
        // return await ApiService.getData(`GetUserTypes.json`);
        return await ApiService.getData(`v1/users/types`);
    }

    async getEnvironment(user_id) {
        // return await ApiService.getData(`environment.json`);
        return await ApiService.getData(`v1/environments`);
    }

    async addRoleToApplication(appId, body) {
        return await ApiService.postMethod(`v1/applications/${appId}/roles`, body);
    }

    async getOwnerApplications(userId) {
        // return await ApiService.getData(`GetOwnerApplicationsForUser.json`);
        return await ApiService.getData(`v1/users/owner-applications `);
    }

    async getApplications(userId) {
        // return await ApiService.getData(`GetAllApplications.json`);
        return await ApiService.getData(`v1/applications`);
    }

    async getOwnerRoles(userId) {
        // return await ApiService.getData(`GetOwnerRolesForUser.json`);
        return await ApiService.getData(`v1/users/owner-roles `);
    }

    async getSuperOwnerRoles(userId) {
        return await ApiService.getData(`v1/app-owner-roles`);
    }

    async getSuperAdminRoles(userId) {
        // return await ApiService.getData(`GetAllActiveRoles.json`);
        return await ApiService.getData(`v1/roles`);
    }

    async getUserDetails(userId) {
        // return await ApiService.getData(`GetUserDetails.json`);
        return await ApiService.getData(`v1/users/${userId}`);
    }

    async getAllUsers() {
        // return await ApiService.getData(`GetAllUsers.json`);
        return await ApiService.getData(`v1/users`);
    }

    async getUsersByRoles(body) {
        // return await ApiService.getData(`GetUsersForARole.json`);
        return await ApiService.getData(`v1/roles/${body.roleName}/users`);
    }

    async putUsersRoles(userId, body) {
        // return await ApiService.getData(`submitResponse.json`);
        return await ApiService.putMethod(`v1/users/roles `, body);
    }

    async putUsersRevokeRoles(userId, body) {
        // return await ApiService.getData(`submitResponse.json`);
        return await ApiService.deleteMethod(`v1/users/roles `, body);
    }

    async getRoleByRoleName(body) {
        return await ApiService.getData(`v1/applications/${body.appCode}/roles/${body.roleName}`);
    }

    async getLoginUserName(user_id) {
        // return 'DEEPA  GEORGE'
        return await ApiService.getData(`v1/users/name`);
    }

    async logout () {
        const res = await ApiService.getData(`logout.json`);
        // const res = await ApiService.postMethod(`v1/logout`);
        if (res && res.status === "SUCCESS") {
            cookies.remove('USER_ROLE', { path: '/'})
            window.location.href = "http://www.fdny.org"
        } else {
            return message.error('something is wrong! please try again');
        }
    }

}
