import axios from "axios";
import Cookies from "universal-cookie"
import message from "antd/lib/message";
const apiEndPoint = process.env.NODE_ENV === 'production' ? 'http://cloud.kapstonellc.com:7003/api/delegated-admin-ui/admin-services/' : '/';
const axiosInstance = axios.create({
    baseURL: apiEndPoint,
});
const cookies = new Cookies();

export const getLoginUser = () => {
    return {
        "login": cookies.get('OAMUserName'),
    }
}

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
            if (thrown.toString() === 'Cancel') {
                resData = 'cancel';
            } else {
                resData = {error: 'something went wrong'};;
            }
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
            if (thrown.toString() === 'Cancel') {
                resData = 'cancel';
            } else {
                resData = {error: 'something went wrong'};;
            }
        });
        return resData || response.data;
    }

    async getAllApplications(appId) {
        return await ApiService.getData(`v1/applications/${appId || ""}`);
        //return await ApiService.getData(`applications.json`);
    }

    async applicationOnBoarding(body) {
        return await ApiService.postMethod(`v1/applications`, body);
    }

    async getAppDetailByAppCode(appCode) {
        return await ApiService.getData(`v1/applications/${appCode}`);
        // return appDetails
    }

    async getRolesForApp(appCode) {
        return await ApiService.getData(`v1/applications/${appCode}/roles`);
        // return appRoles
    }

    async addRole(body, appCode) {
        return await ApiService.postMethod(`v1/applications/${appCode}/roles`, body);
    }

    async rolesStatusActiveDisable(body, status) {
        return await ApiService.postMethod(`v1/applications/${body.appCode}/roles/${body.roleName}/${status}`, body);
    }

    async getRolesForUser(id) {
        return await ApiService.getData(`v1/users/${id}/roles`);
    }

    async getAppOwnerGroups(id) {
        return await ApiService.getData(`v1/owner-groups`);
    }

    async getAppRoleTargets() {
        return await ApiService.getData(`v1/role-targets`);
    }

    async getLoginUserRole(user_id) {
        return await ApiService.getData(`v1/users/types/${user_id} `);
    }

    async addRoleToApplication(appId, body) {
        return await ApiService.postMethod(`v1/applications/${appId}/roles`, body);
    }

    async getOwnerApplications(userId) {
        return await ApiService.getData(`v1//users/${userId}/owner-applications `);
    }

    async getOwnerRoles(userId) {
        return await ApiService.getData(`v1/users/${userId}/owner-roles `);
    }

    async getUserDetails(userId) {
        return await ApiService.getData(`v1/users/${userId}`);
    }

    async getAllUsers() {
        return await ApiService.getData(`v1/users`);
    }

    async getUsersByRoles(body) {
        return await ApiService.getData(`v1/applications/${body.appCode}/roles/${body.roleName}/users  `);
    }

    async putUsersRoles(userId, body) {
        return await ApiService.putMethod(`v1/users/${userId}/roles `, body);
    }

    async getRoleByRoleName(body) {
        return await ApiService.getData(`v1/applications/${body.appCode}/roles/${body.roleName}`);
    }

    async getLoginUserName(user_id) {
        return await ApiService.getData(`v1/users/name`);
    }

    async logout () {
        const res = await ApiService.getData(`v1/logout`);
        cookies.remove('USER_ROLE', { path: '/'})
        window.history.pushState({}, document.title, "/logout");
        window.location.reload()
        if (!res || res.error) {
            return message.error('something is wrong! please try again');
        } else {
            window.location.pathname = "/logout"
            cookies.remove('USER_ROLE', { path: '/'})
        }
    }

}
