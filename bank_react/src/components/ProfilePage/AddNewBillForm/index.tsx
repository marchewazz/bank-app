import React, { useState } from "react";

import BillsService from "../../../services/BillsService";
import AuthService from "../../../services/AuthService";
import { refreshUserData } from "../../../utilities";

function AddNewBillForm(props: any){

    var bs: BillsService = new BillsService();
    var as: AuthService = new AuthService();

    const [info, setInfo] = useState("");
    const [showEditBillQuestion, setShowEditBillQuestion] = useState(false);

    function validatePIN(userData: any): any{
        return as.validatePINByAccNumber(userData).then((res: any) => {
            if (res.data.message === "Logged!") return true
            return false
        })
    }

    async function addBill(event: any){
        event.preventDefault();
        setInfo("");
        setShowEditBillQuestion(false);
        const data = new FormData(event.target);
        console.log(props.option);
        const isPINValid = await validatePIN({accountNumber: JSON.parse(JSON.parse(as.getUserDetails())).accountNumber, accountPIN: data.get("pin")});

        if (isPINValid){
            if(props.option === "Own"){
                bs.addOwnBill({accountNumber: JSON.parse(JSON.parse(as.getUserDetails())).accountNumber, billName: data.get("billName")}).then((res: any) => {
                    console.log(res);
                    setInfo(res.data.message);
                    if (res.data.message === "Bill created!") refreshUserData()
                })
            } else if (props.option === "Favorite"){
                bs.addFavoriteBill({accountNumber: JSON.parse(JSON.parse(as.getUserDetails())).accountNumber, billName: data.get("billName"), billNumber: data.get("billNumber")}).then((res: any) => {
                    if (res.data.message === "already exists"){
                        setInfo("You have bill with this number in your favorites, do you want to update its name?");
                        setShowEditBillQuestion(true);
                    } else {
                        setInfo(res.data.message);
                    }
                })
            }
        } else {
            setInfo("Wrong PIN!")
        }
        
    }

    return (
        <>
            {props.option === "Own" ? (
                <p>Add your new bill</p>
            ) : (
                <p>Add favorite bill</p>
            )}
            <form onSubmit={addBill}>
                <input type="text" name="billName" placeholder="Pass bill name" required/>
                {props.option === "Favorite" ? (
                    <input type="text" name="billNumber" placeholder="Pass bill number" maxLength={12} pattern="(\d{12})$" required/>
                ) : (null)}
                <input type="password" name="pin" minLength={4} maxLength={4} placeholder="Pass PIN" required />
                <button>Add</button>
            </form>
            <p> { info }</p>
            {showEditBillQuestion ? (
                <div>
                    <button>YES</button>
                    <button>NO</button>
                </div>
            ) : (null)}
        </>
    )
}

export default AddNewBillForm;