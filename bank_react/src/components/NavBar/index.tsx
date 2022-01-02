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
        <div>
            <Link to="/">Home</Link> |{" "}
            { !isLogged ? (
                <>
                    <Link to="/register">Register</Link> |{" "}
                    <Link to="/login">Login</Link>
                </>
            ) : (
                <>
                    <Link to="/profile" className="underline">Hello!</Link> |{" "}
                    <button onClick={logout}>Logout</button>
                </>
            )}
        </div>
    )
}