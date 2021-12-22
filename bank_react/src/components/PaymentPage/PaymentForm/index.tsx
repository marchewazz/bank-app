import React, { useEffect, useState } from "react";
import { useQuery } from "../../../utilities";

import BillsService from "../../../services/BillsService";
import AuthService from "../../../services/AuthService";
import TransactionsService from "../../../services/TransactionsService";

function PaymentForm(){

    const paymentData: any = useQuery();
    var bs: BillsService = new BillsService();
    var as : AuthService = new AuthService();
    var ts : TransactionsService = new TransactionsService();

    const [isLogged, setisLogged]: any = useState(false);
    const [bills, setBills]: any[] = useState([])

    function validateUser(){

    }

    function getBills(){
        if (paymentData.get("sender")){
            bs.getBills({"accountNumber": paymentData.get("sender"),}).then((res: any) =>{
                console.log(res.data.bills);
                setBills(res.data.bills);
                setisLogged(true);
            })
        }
    }

    function renderBillSelect(){

        var billsOptions: any[] = [];

        for (var bill of bills){
            console.log(bill);
            billsOptions.push(<option value={bill.billNumber}>{`Bill: ${bill.billNumber}, ${bill.billName}`}</option>);
        }

        return <select name="bill">{billsOptions}</select>
    }

    function validatePIN(event: any){
        event.preventDefault();
        const data = new FormData(event.target);

        const userData = {
            accountNumber: paymentData.get("sender"),
            accountPIN: data.get("pin")
        }

        as.validatePINByAccNumber(userData).then((res: any) =>{
            if (res.data.message === "Logged!"){
                const transferData = {
                    sender: event.target.bill.value,
                    receiver: paymentData.get("receiver"),
                    note: paymentData.get("note"),
                    amount: Number(paymentData.get("amount"))
                }
                ts.transferMoney(transferData).then((res: any) => {
                    console.log(res);
                })
            }
        })
    }

    useEffect(() => {
        getBills();
    }, [])

    return (
        <>
            {paymentData.get("sender") !== "" ?(
                <p>From account: {paymentData.get("sender")}</p>
            ) : (
                <fieldset disabled={isLogged}>
                    <form onSubmit={validateUser}>
                        <input type="text" name="email" required/>
                        <input type="password" name="password" required/>
                        <button>Login</button>
                    </form>
                </fieldset>
            )}

            {isLogged ? (
                <form onSubmit={validatePIN}>
                    {renderBillSelect()}
                    <p>Note: {paymentData.get("note")}</p>
                    <p>Amount: {paymentData.get("amount")}</p>
                    <input type="password" name="pin" minLength={4} maxLength={4} required />
                    <button>OK</button>
                </form>
            ) : (
               null 
            )}
        </>
    )
}

export default PaymentForm;
