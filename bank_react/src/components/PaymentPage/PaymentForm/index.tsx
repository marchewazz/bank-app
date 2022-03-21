import React, { useEffect, useState } from "react";

import { useQuery, bankCurrency } from "../../../utilities";

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

    async function validatePredefinedSender(event: any){
        setPending(true);
        event.preventDefault();
        const data = new FormData(event.target);

        console.log(data.get('pin'));
        const userData = {
            accountNumber: predefinedSenderAccount,
            accountPIN: data.get("pin")
        }
        console.log(userData);
        const isPINValid = await validatePIN(userData, "number");
        if (isPINValid) {
            getBills(predefinedSenderAccount, "sender");
            setInfo("");
            setTries(3);
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
            if (as.isUserLogged()){
                if (JSON.parse(JSON.parse(as.getUserDetails())).accountNumber !== paymentData.get("sender")) as.logoutUser()
            }
        } else if (as.isUserLogged()){
            setisLogged(true);
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
        <div className="grid auto-rows-auto">
            {predefinedValuesValid ? (
            <div className="grid border-2 border-gray-400 rounded-lg mx-5
            md:mx-24
            lg:mx-72">
                <fieldset className="grid auto-rows-auto justify-self-center py-10"
                disabled={tries === 0 || done}>
                    {predefinedSenderAccount !== "" ?(
                        <div className="grid justify-items-center">
                            <p>From account: {predefinedSenderAccount}</p>
                            {!isLogged ? (
                                <form onSubmit={validatePredefinedSender}>
                                    <input className="input-text-style" type="password" name="pin" minLength={4} maxLength={4} placeholder="Pass PIN" required />
                                    <button disabled={pending} className="btn-style">OK</button>
                                </form>
                            ) : (null)}
                        </div>
                    ) : (
                        <fieldset disabled={isLogged}>
                            <form onSubmit={validateUser}>
                                <input className="input-text-style" type="text" name="email" placeholder="Pass email" required/>
                                <input className="input-text-style" type="password" name="password" placeholder="Pass password" required/>
                                <button disabled={pending} className="btn-style">Login</button>
                            </form>
                        </fieldset>
                    )}
                    {isLogged ? (
                        <form 
                        onSubmit={makeTransfer}>
                            <div className="grid grid-rows-3 gap-y-4">
                                <div className="grid place-items-center">
                                {renderBillSelect()}
                                </div>
                                <div className="grid auto-rows-auto">
                                    {predefinedReceiverBill !== "" ? (
                                        <p>To: {receiver}</p>
                                    ) : (
                                        <div className="grid grid-rows-3 gap-y-3 place-items-stretch">
                                            <span className="grid place-items-stretch">
                                                <input className="peer hidden"
                                                type="radio" 
                                                name="receiverOption" 
                                                id="favorites" 
                                                onClick={() => setPassReceiverOption("favorites")}
                                                disabled={senderFavoriteBills.length === 0}
                                                />
                                                <label htmlFor="favorites"
                                                className="transaction-btn-style">
                                                    Select from favorites
                                                </label>
                                            </span>

                                            <span className="grid place-items-stretch">
                                                <input className="peer hidden"
                                                type="radio" 
                                                name="receiverOption" 
                                                id="pass"
                                                onClick={() => setPassReceiverOption("pass")}
                                                defaultChecked={true}
                                                />
                                                <label htmlFor="pass"
                                                className="transaction-btn-style">
                                                    Pass receiver
                                                </label>
                                            </span>
                                            {passReceiverOption === "favorites" ?(
                                                <>
                                                {renderFavoritesBillSelect()}
                                                </>
                                            ) : (
                                                <input className="input-text-style" type="text" name="receiver" placeholder="Pass receiver" maxLength={12} pattern="(\d{12})$" required/>
                                            )}

                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-rows-2 text-center gap-y-4">
                                    {predefinedNote !== "" ? (
                                        <span>Note: {predefinedNote}</span>
                                    ) : (
                                        <input className="input-text-style" type="text" name="note" placeholder="Pass note" />
                                    )}
                                    {predefinedAmount !== "" ? (
                                        <span>Amount: {predefinedAmount + bankCurrency}</span>
                                    ) : (
                                        <span className="grid grid-flow-col">
                                            <input className="input-text-style" type="text" name="amount" placeholder="Pass amount" pattern={"^[0-9]+(\.[0-9]{1,2})?$"} required />
                                            <span className="place-self-center">{bankCurrency}</span>
                                        </span>
                                    )}
                                    
                                </div>
                            </div>
                            <div>
                                <input className="input-text-style" type="password" name="pin" minLength={4} maxLength={4} placeholder="Pass PIN" required />
                                <button disabled={pending || done} className="btn-style">OK</button>
                            </div>
                        </form>
                    ) : (
                       null 
                    )}
                    <p className={"px-10 py-4 text-center " + (info === "" ? "" : "border-2 " + (info === "Transfer done!" ? "success-info" : "error-info"))}>
                        { info }
                    </p>
                </fieldset>
            </div>
            ) : (
                <p>Transfer data isn't valid, check it and try again later</p>
            )}
        </div>   
    )
}

export default PaymentForm;
