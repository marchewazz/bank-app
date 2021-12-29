import React from "react";

import AuthService from "../../services/AuthService";

function PINForm(props: any){

    var as : AuthService = new AuthService();

    function validatePIN(event: any){
        event.preventDefault();
        const data = new FormData(event.target);
        const userData = {
            accountEmail: props.email,
            accountPIN: data.get("pin")
        }
        as.validatePINByEmail(userData).then((res: any) => {
            if(res.data.message === "Logged!") {
                window.location.href = `http://localhost:4200/confirmedauth/?accountnumber=${JSON.parse(res.data.user).accountNumber}`;
            }
        })
    }
    return(
        <form onSubmit={validatePIN}>
            <input type="password" name="pin" minLength={4} maxLength={4} placeholder="Pass PIN" required />
            <button className="btn-style">OK</button>
        </form>
    )
}

export default PINForm;