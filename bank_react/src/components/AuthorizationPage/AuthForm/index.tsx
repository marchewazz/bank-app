import React, { useState } from "react";

import PINForm from "../../PINForm";

import AuthService from "../../../services/AuthService";

function AuthForm(){

    var as : AuthService = new AuthService();
    
    const [email, setEmail] = useState("");
    const [isLogged, setIsLoaded] = useState(false);

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
                setIsLoaded(true);
            }
        })
    }
    return(
        <>
            <fieldset disabled={isLogged}>
                <form onSubmit={validateUser}>
                    <input type="text" name="email" required/>
                    <input type="password" name="password" required/>
                    <button>Login</button>
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