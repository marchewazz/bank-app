import React from "react";
import { useLocation } from "react-router-dom";

import AuthService from "./services/AuthService";

export var backendUrl = "http://127.0.0.1:8000";

export function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

export function refreshUserData(){
    var as: AuthService = new AuthService();
    if(as.isUserLogged()){
        as.refreshUserData().then((res: any) => {
            console.log(JSON.parse(res.data.user));
            as.setUserDetails(res.data.user);
        })
    }
}
