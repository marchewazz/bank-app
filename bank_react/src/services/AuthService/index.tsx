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
    getUserDetails() : any | null{
        return localStorage.getItem('userData');
      }
    
      setUserDetails(userData: any) : void {
        localStorage.setItem('userData', JSON.stringify(userData))
      }
    
      isUserLogged(): boolean {
        return this.getUserDetails() != null ? true : false;
      }
    
      setDataInLocalStorage(variableName: string, data: any) {
        localStorage.setItem(variableName, data);
      }
    
      clearStorage() {
        localStorage.clear();
      }
}

export default AuthService;