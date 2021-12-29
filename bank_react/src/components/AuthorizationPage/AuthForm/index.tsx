import React, { useState } from "react";

import PINForm from "../../PINForm";

import AuthService from "../../../services/AuthService";

function AuthForm(){

    var as : AuthService = new AuthService();
    
    const [email, setEmail] = useState("");
    const [isLogged, setIsLogged] = useState(false);

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
                if (userData.accountEmail != null) setEmail(`${userData.accountEmail}`);
                setIsLogged(true);
            }
        })
    }
    return(
        <>
            <fieldset disabled={isLogged}>
                <form onSubmit={validateUser}>
                    <input type="text" name="email" placeholder="Pass email" required/>
                    <input type="password" name="password" placeholder="Pass password" required/>
                    <button className="btn-style">Login</button>
                </form>
            </fieldset>
            {isLogged ?(
                <PINForm email={email} />
            ) : (
                <div></div>
            )}
            
        </>
    )
}

export default AuthForm;