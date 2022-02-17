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
        <div className="grid grid-rows-2">
            <form onSubmit={addBill}
            className="grid grid-flow-row place-items-center gap-y-5">
                {props.option === "Favorite" ? (
                    <span className="text-center font-bold">Add favorite bill</span>
                ) : (
                    <span className="text-center font-bold">Add your new bill</span>
                )}
                <input className="input-text-style"
                type="text" 
                name="billName" 
                placeholder="Pass bill name" 
                required
                />
                {props.option === "Favorite" ? (
                    <input className="input-text-style"
                    type="text" 
                    name="billNumber" 
                    placeholder="Pass bill number" 
                    maxLength={12} 
                    pattern="(\d{12})$" 
                    required
                    />
                ) : (null)}
                <input className="input-text-style"
                type="password" 
                name="pin" 
                minLength={4} 
                maxLength={4} 
                placeholder="Pass PIN" 
                required 
                />
                <button className="btn-style">
                    Add
                </button>
            </form>
            <div className="grid items-center">
                <span className="place-self-center"> 
                    { info }
                </span>
                {showEditBillQuestion ? (
                    <div className="flex justify-evenly self-center">
                        <button className="btn-style">
                            YES
                        </button>
                        <button className="btn-style">
                            NO
                        </button>
                    </div>
                ) : (null)}
            </div>
            
        </div>
    )
}

export default AddNewBillForm;