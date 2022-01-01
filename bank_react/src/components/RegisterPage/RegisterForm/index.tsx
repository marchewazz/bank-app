import React, { useState } from "react";

import AccountService from "../../../services/AccountsService";

export default function RegisterForm(){

    const [info, setInfo] = useState("");
    const [showLoginButton, setShowLoginButton] = useState(false);

    var as = new AccountService();

    function registerUser(event: any){
        event.preventDefault();
        setShowLoginButton(false);
        const data = new FormData(event.target);

        const wrongPIN: any[] = ["1234", "4321", "2137"];

        const userData = {
            accountEmail: data.get('email'),
            accountName: {
                firstName: data.get('firstName'),
                lastName: data.get('lastName')
            },
            accountPass: data.get('password'),
            accountPIN: data.get('pin')
        }
        if(wrongPIN.includes(userData.accountPIN)){
            setInfo("Too easy PIN!");
        } else if(userData.accountPass !== data.get('repeatedPassword')){
            setInfo("Passwords don't match!");
        } else if (/\d/.test(`${userData.accountName.firstName} ${userData.accountName.lastName}`)){
            setInfo("How is it to have digit in name?");
        } else {
            console.log(userData);
        
            as.registerUser(userData).then((res: any) => {
                setInfo(res.data.message);
                if(res.data.message === "Added!") setShowLoginButton(true)
                if(res.data.message === "We've got already account!") setShowLoginButton(true)
            })
        }
    }
    return(
        <>
            <form onSubmit={registerUser}>
                <input type="text" name="firstName" placeholder="Pass first name" required />
                <input type="text" name="lastName" placeholder="Pass last name" required />
                <input type="email" name="email" placeholder="Pass email" required />
                <input type="password" name="password" placeholder="Pass password" minLength={8} maxLength={25} required />
                <input type="password" name="repeatedPassword" placeholder="Repeat password" minLength={8} maxLength={25} required />
                <input type="password" name="pin" placeholder="Pass PIN" minLength={4} maxLength={4} required />
                <div>
                <p> { info } </p>
                {showLoginButton ? (
                    <button>Login</button>
                ) : (
                    null
                )}
                </div>
                <button>GO</button>
            </form>
            
        </>
        
    )
}