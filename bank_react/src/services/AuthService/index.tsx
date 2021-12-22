import http from "../../http-common";

class AuthService {
    loginUser (data: any){
        return http.put("/accounts/login", data);
    }
    validatePINByEmail (data: any){
        return http.post("/accounts/pinemail", data)
    }
    validatePINByAccNumber (data: any){
        return http.post("/accounts/pinnumber", data)
    }
}

export default AuthService;