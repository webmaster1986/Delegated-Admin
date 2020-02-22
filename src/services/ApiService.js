import axios from "axios";
const apiEndPoint = process.env.NODE_ENV === 'production' ? 'http://cloud.kapstonellc.com:7003/api/delegated-admin-ui/admin-services/' : '/';
const axiosInstance = axios.create({
    baseURL: apiEndPoint,
});

const appDetails = {
    "appCode":"App1",
    "appName":"Application1",
    "appDescription":"This is the description for App1",
    "ownerGroup":"App123_Owner"
}

const appRoles = [
    {
        "roleName":"Role1",
        "roleDescription":"Description",
        "oimTarget":"OID",
        "status":"Active"
    },
    {
        "roleName":"Role3",
        "roleDescription":"Description",
        "oimTarget":"OID",
        "status":"Disabled"
    },
    {
        "roleName":"Role2",
        "roleDescription":"Description",
        "oimTarget":"IDCS",
        "status":"Active"
    },
    {
        "roleName":"Role4",
        "roleDescription":"Description",
        "oimTarget":"IDCS",
        "status":"Pending"
    }
]

export const getLoginUser = () => {
    return {
        "login": "User2 Name",
        "name": null,
        "email": "user2@fdny",
        "bureau": "Bureau1"
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
}
