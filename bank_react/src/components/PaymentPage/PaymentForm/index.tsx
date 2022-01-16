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

    const [senderBills, setSenderBills]: any[] = useState([]);
    const [senderEmail, setSenderEmail]: any = useState("");
    const [senderFavoriteBills, setSenderFavoriteBills]: any[] = useState([]);
    //POSSIBLE PREDEFINED PARAMS
    const [predefinedSenderAccount, setPredefinedSenderAccount]: any = useState("");
    const [predefinedReceiverBill, setPredefinedReceiverBill]: any = useState("");
    const [predefinedNote, setPredefinedNote]: any = useState("");
    const [predefinedAmount, setPredefinedAmount]: any = useState("");
    //AND VARIABLE TO MAKE SURE EVERY DATA IS EXISTING
    const [predefinedValuesValid, setPredefinedValuesValid] = useState(true);
    //FULL RECEIVER NAME
    const [receiver, setReceiver]: any = useState("");
    

    const [pending, setPending] = useState(false);
    const [info, setInfo]: any = useState("");
    const [done, setDone]: any = useState(false);
    const [passReceiverOption, setPassReceiverOption] = useState("pass");
    const [tries, setTries]: any = useState(3);

    function validateUser(event: any){
        setPending(true);
        event.preventDefault();
        const data = new FormData(event.target);

        console.log(data.get('email'));
        const userData = {
            accountEmail: data.get('email'),
            accountPassword: data.get('password'),
        }

        as.loginUser(userData).then((res: any) => {
            if (res.data.message === "Valid data!") {
                setSenderEmail(userData.accountEmail);
                getBills(JSON.parse(res.data.user)[0].accountNumber, "sender");
            }
        })
        setPending(false);
    }

    function getBills(data: string, who: string){
        //GET BILLS FOR SENDER TO CHOOSE
        //OR GET FULL BILL NAME FOR PREDEFINED RECEIVER
        if (who === "sender"){
            bs.getBills({"accountNumber": data}).then((res: any) =>{
                if (res.data.message === "no bills") {
                    setPredefinedValuesValid(false);
                } else {
                    setSenderBills(res.data.bills);
                    setisLogged(true);
                }
            })
            bs.getFavoriteBills({"accountNumber": data}).then((res: any) => {
                setSenderFavoriteBills(res.data.favoriteBills);
            })
        }
        if (who === "receiver"){
            bs.getOneBill({"billNumber": data}).then((res: any) =>{
                if (res.data.message === "no bill") {
                    setPredefinedValuesValid(false);
                } else {
                    const bill = JSON.parse(res.data.bill);
                    setReceiver(`${bill.billNumber}, ${bill.billName}`);
                    setPredefinedReceiverBill(`${bill.billNumber}`);
                }
            })
        }
    }

    function renderBillSelect(){
        //RENDERS SELECT FOR BILLS
        var billsOptions: any[] = [];
        
        for (const bill of senderBills){
            billsOptions.push(<option value={bill.billNumber} selected>{`Bill: ${bill.billNumber}, ${bill.billName}`}</option>);
        }

        return <select name="bill">{billsOptions}</select>
    }

    function renderFavoritesBillSelect(){
        //RENDERS SELECT FOR BILLS
        var billsOptions: any[] = [];
        console.log(senderFavoriteBills);
        
        for (const bill of senderFavoriteBills){
            console.log(bill);
            billsOptions.push(<option value={bill.billNumber} selected>{`Bill: ${bill.billNumber}, ${bill.billName}`}</option>);
        }

        return <select name="favoriteBill">{billsOptions}</select>
    }

    function validatePIN(userData: any, method: string): any{
        //BASED ON WHAT IS PASSED PIN IS CHECKED WITH DIFFRENT DATA
        //FOR NOW IF SENDER IS PASSED IT'S CHECKED ON NUMBER ACCOUNT
        //AND IF THERE WAS A LOGIN IT'S CHECKED WITH EMAIL
        if (method === "number"){
            return as.validatePINByAccNumber(userData).then((res: any) => {
                if (res.data.message === "Logged!") return true
                return false
            })
        } else {
            return as.validatePINByEmail(userData).then((res: any) => {
                if (res.data.message === "Logged!") return true
                return false
            })
        }
    }

    async function makeTransfer(event: any){
        setPending(true);
        event.preventDefault();

        const data = new FormData(event.target);
        var isPINValid: boolean = false;
        var sender = data.get("bill");
        //LOCAL VARIABLES BASED ON FORM OR STATE WITH PREDEFINED PARAMS
        var receiver = predefinedReceiverBill === "" ? passReceiverOption === "pass" ? data.get("receiver") : data.get("favoriteBill") : predefinedReceiverBill;
        var note = predefinedNote === "" ? data.get("note") : predefinedNote;
        var amount = predefinedAmount === "" ? data.get("amount") : predefinedAmount;
        
        //PIN VALIDATION
        if (senderEmail !== ""){
            const userData = {
                accountEmail: senderEmail,
                accountPIN: data.get("pin")
            }
            isPINValid = await validatePIN(userData, "email")
        }
        if (predefinedSenderAccount !== ""){
            const userData = {
                accountNumber: predefinedSenderAccount,
                accountPIN: data.get("pin")
            }
            isPINValid = await validatePIN(userData, "number")
        }
        //IF PIN VALID THERE IS CALL FOR TRANSFER
        if (isPINValid){
            const transferData = {
                sender: sender,
                receiver: receiver,
                note: note,
                amount: amount
            }
            ts.transferMoney(transferData).then((res: any) => {
                if (res.data.message === "Transfer done!"){
                    setDone(true);
                }
                setInfo(res.data.message);
            })
        } else {
            setTries(tries - 1);
            //MAYBE IT'S WEIRD ONE BUT IT'S WORKING
            if (tries === 1){
                setInfo("Too many tries! Try again later!");
            } else{
                setInfo("Wrong PIN!");
            }
        }
        setPending(false);
    }

    useEffect(() => {
        //SET STATES IF ANY PREDEFINED PARAMS ARE PASSED
        if (paymentData.get("sender") != null) {
            setPredefinedSenderAccount(paymentData.get("sender"));
            getBills(paymentData.get("sender"), "sender");
            if (as.isUserLogged()){
                if (JSON.parse(JSON.parse(as.getUserDetails())).accountNumber !== paymentData.get("sender")) as.logoutUser()
            }
        } else if (as.isUserLogged()){
            setPredefinedSenderAccount(JSON.parse(JSON.parse(as.getUserDetails())).accountNumber);
            getBills(JSON.parse(JSON.parse(as.getUserDetails())).accountNumber, "sender");
        }
        if (paymentData.get("receiver") != null) {
            getBills(paymentData.get("receiver"), "receiver");
        }
        if (paymentData.get("note") != null) setPredefinedNote(paymentData.get("note"));
        if (paymentData.get("amount") != null) setPredefinedAmount(paymentData.get("amount"));
    }, [])

    return (
        <>
            {predefinedValuesValid ? (
            <div className="border-2 border-black">
                <fieldset className="grid grid-rows-3
                md:grid-cols-3"
                disabled={tries === 0 || done}>
                    {predefinedSenderAccount !== "" ?(
                        <p>From account: {predefinedSenderAccount}</p>
                    ) : (
                        <fieldset disabled={isLogged}>
                            <form onSubmit={validateUser}>
                                <input type="text" name="email" placeholder="Pass email" required/>
                                <input type="password" name="password" placeholder="Pass password" required/>
                                <button disabled={pending} className="btn-style">Login</button>
                            </form>
                        </fieldset>
                    )}
                    {isLogged ? (
                        <form className="md:grid md:col-span-2 md:grid-cols-2" 
                        onSubmit={makeTransfer}>
                            <div>
                                {renderBillSelect()}
                                {predefinedReceiverBill !== "" ? (
                                    <p>To: {receiver}</p>
                                ) : (
                                    <div>
                                        <button type="button" disabled={senderFavoriteBills.length === 0} onClick={() => setPassReceiverOption("favorites")}>Select from favorites</button>
                                        <button type="button" onClick={() => setPassReceiverOption("pass")}>Pass receiver</button>
                                        {passReceiverOption === "favorites" ?(
                                            <>
                                            {renderFavoritesBillSelect()}
                                            </>
                                        ) : (
                                            <input type="text" name="receiver" placeholder="Pass receiver" maxLength={12} pattern="(\d{12})$" required/>
                                        )}
                                        
                                    </div>
                                )}
                                {predefinedAmount !== "" ? (
                                    <p>Note: {predefinedNote}</p>
                                ) : (
                                    <input type="text" name="note" placeholder="Pass note" />
                                )}
                                {predefinedAmount !== "" ? (
                                    <p>Amount: {predefinedAmount}</p>
                                ) : (
                                    <input type="text" name="amount" placeholder="Pass amount" pattern={"^[0-9]+(\.[0-9]{1,2})?$"} required />
                                )}
                                
                            </div>
                            <div>
                                <input type="password" name="pin" minLength={4} maxLength={4} placeholder="Pass PIN" required />
                                <button disabled={pending} className="btn-style">OK</button>
                            </div>
                        </form>
                    ) : (
                       null 
                    )}
                    <p>
                        { info }
                    </p>
                </fieldset>
            </div>
            ) : (
                <p>Transfer data isn't valid, check it and try again later</p>
            )}
        </>
    )
}

export default PaymentForm;
