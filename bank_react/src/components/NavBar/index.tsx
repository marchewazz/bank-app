import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AuthService from "../../services/AuthService";

export default function NavBar(){

    var as: AuthService = new AuthService();
    const [isLogged, setIsLogged] = useState(false);

    useEffect(() => {
        if (as.isUserLogged()) setIsLogged(true);
    }, [])

    return (
        <div>
            <Link to="/">Home</Link> |{" "}
            { !isLogged ? (
                <>
                    <Link to="/register">Register</Link> |{" "}
                    <Link to="/login">Login</Link>
                </>
            ) : (
                <>
                    <Link to="/profile">Hello {JSON.parse(JSON.parse(as.getUserDetails())).accountUser.firstName}! </Link> |{" "}
                    <button>Logout</button>
                </>
            )}
            
               
            
        </div>
    )
}