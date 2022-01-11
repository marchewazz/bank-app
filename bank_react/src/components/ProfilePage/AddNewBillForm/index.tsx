import React, { useState } from "react";

import BillsService from "../../../services/BillsService";
import AuthService from "../../../services/AuthService";
import { refreshUserData } from "../../../utilities";

function AddNewBillForm(props: any){

    var bs: BillsService = new BillsService();
    var as: AuthService = new AuthService();

    const [info, setInfo] = useState("");
    
    function addBill(event: any){
        event.preventDefault();
        const data = new FormData(event.target);
        console.log(props.option);
        
        if(props.option === "Own"){
            bs.addOwnBill({accountNumber: JSON.parse(JSON.parse(as.getUserDetails())).accountNumber, billName: data.get("billName")}).then((res: any) => {
                console.log(res);
                setInfo(res.data.message);
                if (res.data.message == "Bill created!") refreshUserData()
            })
        } else if (props.option === "Favorite"){
            //GONNA WRITE IT ONCE BACKEND FOR IT WILL BE READy
        }
    }

    return (
        <>
            <form onSubmit={addBill}>
                <input type="text" name="billName" placeholder="Pass bill name" required/>
                {props.option === "Favorite" ? (
                    <input type="text" name="billNumber" placeholder="Pass bill number" maxLength={12} pattern="(\d{12})$" required/>
                ) : (null)}
                <button>Add</button>
            </form>
            <p> { info }</p>
        </>
    )
}

export default AddNewBillForm;