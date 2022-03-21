import React, { useState } from "react";
import { Link } from "react-router-dom";

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
                if(res.data.message === "Registered!") setShowLoginButton(true)
                if(res.data.message === "You've got already account!") setShowLoginButton(true)
            })
        }
    }
    return(
        <div className="border-gray-400 border-2 p-10 mt-10 rounded-lg">
            <form onSubmit={registerUser}
            className="grid gap-y-5 auto-rows-auto grid-flow-row mx-24"
            >                    
                <input className="input-text-style"
                type="text" 
                name="firstName" 
                placeholder="Pass first name" 
                required 
                />
                <input className="input-text-style"
                type="text" 
                name="lastName" 
                placeholder="Pass last name" 
                required 
                />
                <input className="input-text-style"
                type="email" 
                name="email" 
                placeholder="Pass email" 
                required 
                />
                <input className="input-text-style"
                type="password" 
                name="password" 
                placeholder="Pass password" 
                minLength={8} maxLength={25} 
                required 
                />
                <input className="input-text-style"
                type="password" 
                name="repeatedPassword" 
                placeholder="Repeat password" 
                minLength={8} maxLength={25} 
                required 
                />
                <input className="input-text-style"
                type="password" 
                name="pin" 
                placeholder="Pass PIN" 
                minLength={4} 
                maxLength={4} 
                required 
                />
                <div className="grid grid-rows-2 place-items-center">
                    <span className={"m-8 px-8 py-4 " + (info === "" ? "" : "border-2 " + (info === "Registered!" ? "success-info" : "error-info"))}> 
                        { info } 
                    </span>
                    {showLoginButton ? (
                        <Link to="/login">
                            <button className="btn-style mx-36">
                                Login
                            </button>
                        </Link>
                    ) : (
                        <button className="btn-style mx-36">
                            Register
                        </button>
                    )}
                </div>
            </form>
        </div>
        
    )
}