import http from "../../http-common";

import { backendUrl } from "../../utilities";

class AccountService {
    registerUser(userData: any){
        return http.post(`${backendUrl}/accounts/register`, userData)
    }
}

export default AccountService;