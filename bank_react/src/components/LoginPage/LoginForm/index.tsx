import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthService from "../../../services/AuthService";

export default function LoginForm(){
    
    var as : AuthService = new AuthService();
    
    const [email, setEmail] = useState("");
    const [info, setInfo] = useState("");
    const [isLogged, setIsLogged] = useState(false);
    const [tries, setTries] = useState(3);

    var navigate = useNavigate();

    function validateUser(event: any){
        event.preventDefault();
        const data = new FormData(event.target);
        console.log(data.get('email'));
        const userData = {
            accountEmail: data.get('email'),
            accountPassword: data.get('password'),
        }
        console.log(userData);
        as.loginUser(userData).then((res: any) => {
            if(res.data.message === "Valid data!"){
                if (userData.accountEmail !== null) setEmail(`${userData.accountEmail}`);
                setIsLogged(true);
                setInfo("");
            } else setInfo("Check your data!");
        })
    }

    function validatePIN(event: any){
        event.preventDefault();
        const data = new FormData(event.target);
        const userData = {
            accountEmail: email,
            accountPIN: data.get("pin")
        }
        as.validatePINByEmail(userData).then((res: any) => {
            if (res.data.message === "Logged!") {
                as.setUserDetails(res.data.user);
                navigate("/");
            } else {
                setTries(tries - 1); 
                if (tries - 1 != 0) setInfo(`Wrong PIN! Tries: ${tries - 1}`);
                else setInfo(`Wrong PIN! Tries: ${tries - 1}, try again later!`);
            }
        })
    }

    useEffect(() => {
        if(as.isUserLogged()) navigate("/")
    }, [])

    return (
        <>  
            <fieldset disabled={tries === 0}>
                <fieldset disabled={isLogged}>
                    <form onSubmit={validateUser}>
                        <input type="text" name="email" placeholder="Pass email" required/>
                        <input type="password" name="password" placeholder="Pass password" required/>
                        <button className="btn-style">Login</button>
                    </form>
                </fieldset>
                <p> { info }</p>
                {isLogged ?(
                    <form onSubmit={validatePIN}>
                        <input type="password" name="pin" minLength={4} maxLength={4} placeholder="Pass PIN" required />
                        <button className="btn-style">OK</button>
                    </form>
                ) : (
                    <div></div>
                )}
            </fieldset>
        </>
    )
}