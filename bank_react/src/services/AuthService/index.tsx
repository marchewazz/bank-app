import http from "../../http-common";

class AuthService {
    loginUser (data: any){
        return http.put("/accounts/login", data);
    }
    validatePIN (data: any){
        return http.post("/accounts/pin", data)
    }
}

export default AuthService;