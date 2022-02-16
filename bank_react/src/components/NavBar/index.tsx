import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthService from "../../services/AuthService";

export default function NavBar(){

    var as: AuthService = new AuthService();
    var navigate = useNavigate();
    const [isLogged, setIsLogged] = useState(false);

    function logout(){
        as.logoutUser()
        navigate("/")
    }

    useEffect(() => {
        if (as.isUserLogged()) setIsLogged(true);
        if (!as.isUserLogged()) setIsLogged(false);
    }, [as])

    return (
        <div className="w-screen h-12 grid grid-rows-1 grid-flow-col justify-items-stretch bg-red-800 text-white
        divide-x-8 divide-white">
            <span className="grid place-items-center text-lg">
                Amazing Bank
            </span>
            <Link to="/"
            className="navbar-link">
                Home
            </Link>
            { !isLogged ? (
                <>
                    <Link to="/login"
                    className="navbar-link">
                        Login
                    </Link>
                    <Link to="/register"
                    className="navbar-link">
                        Register
                    </Link>
                </>
            ) : (
                <>
                    <Link to="/transaction"
                    className="navbar-link">
                        Make transfer
                    </Link>
                    <Link to="/profile" 
                    className="underline navbar-link">
                        Your profile
                    </Link> 
                    <button onClick={logout}
                    className="navbar-link">
                        Logout
                    </button>
                </>
            )}
        </div>
    )
}