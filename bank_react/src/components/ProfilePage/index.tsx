import React, { useEffect, useState } from "react";

import ProfileData from "./ProfileData";

import AuthService from "../../services/AuthService";
import { useNavigate } from "react-router-dom";

export default function ProfilePage(){

    const [isAuth, setIsAuth] = useState(false);
    const [info, setInfo] = useState("");
    const [tries, setTries] = useState(3);

    var navigate = useNavigate();

    var as: AuthService = new AuthService();

    function validatePIN(event: any){
        event.preventDefault();
        const data = new FormData(event.target);
        const userData = {
            accountEmail: JSON.parse(JSON.parse(as.getUserDetails())).accountEmail,
            accountPIN: data.get("pin")
        }
        as.validatePINByEmail(userData).then((res: any) => {
            if (res.data.message === "Logged!") {
                setIsAuth(true);
            } else {
                setTries(tries - 1); 
                if (tries - 1 != 0) setInfo(`Wrong PIN! Tries: ${tries - 1}`);
                else setInfo(`Wrong PIN! Tries: ${tries - 1}, try again later!`);
            }
        })
       
    }

    useEffect(() => {
        if (!as.isUserLogged()) navigate("/")
    }, [])

    return (
        <div className="mt-2">
            { !isAuth ? (
                <fieldset disabled={tries === 0}
                className="grid place-items-center">
                    <form onSubmit={validatePIN}
                    className="grid grid-flow-row gap-y-5">
                        <input className="input-text-style"
                        type="password" 
                        name="pin" 
                        minLength={4} 
                        maxLength={4} 
                        placeholder="Pass PIN" 
                        required />
                        <p className="text-center"> 
                            { info }
                        </p>
                        <button className="btn-style">
                            OK
                        </button>
                        
                    </form>
                </fieldset>
            ) : (
                <ProfileData />
            )}
        </div>
    )
}