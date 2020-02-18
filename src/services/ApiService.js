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

    async getAllApplications() {
        return await ApiService.getData(`v1/applications`);
        //return await ApiService.getData(`applications.json`);
    }

    async applicationOnBoarding(body) {
        return await ApiService.postMethod(`${apiEndPoint}/applications`, body);
    }

    async getAppDetailByAppCode(appCode) {
        // return await ApiService.getData(`${apiEndPoint}/applications/${appCode}`);
        return appDetails
    }

    async getRolesForApp(appCode) {
        // return await ApiService.getData(`${apiEndPoint}/applications/${appCode}/roles`);
        return appRoles
    }

}