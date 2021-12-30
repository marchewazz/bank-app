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
    //POSSIBLE QUERY PARAMS
    const [querySenderAccount, setQuerySenderAccount]: any = useState("");
    const [queryReceiverBill, setQueryReceiverBill]: any = useState("");
    const [queryNote, setQueryNote]: any = useState("");
    const [queryAmount, setQueryAmount]: any = useState("");
    //FULL RECEIVER NAME
    const [receiver, setReceiver]: any = useState("");
    

    const [pending, setPending] = useState(false);
    const [info, setInfo]: any = useState("");
    const [done, setDone]: any = useState(false);
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
        //OR GET FULL BILL NAME FOR QUERY RECEIVER
        if (who === "sender"){
            bs.getBills({"accountNumber": data}).then((res: any) =>{
                console.log(res.data.bills);
                setSenderBills(res.data.bills);
                setisLogged(true);
            })
        }
        if (who === "receiver"){
            bs.getOneBill({"billNumber": data}).then((res: any) =>{
                const bill = JSON.parse(res.data.bill);
                setReceiver(`${bill.billNumber}, ${bill.billName}`);
                setQueryReceiverBill(`${bill.billNumber}`);
            })
        }
    }

    function renderBillSelect(){
        //RENDERS SELECT FOR BILLS
        var billsOptions: any[] = [];

        for (var bill of senderBills){
            console.log(bill);
            billsOptions.push(<option value={bill.billNumber} selected>{`Bill: ${bill.billNumber}, ${bill.billName}`}</option>);
        }

        return <select name="bill">{billsOptions}</select>
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
        //LOCAL VARIABLES BASED ON FORM OR STATE WITH QUERY PARAMS
        var receiver = queryReceiverBill === "" ? data.get("receiver") : queryReceiverBill;
        var note = queryNote === "" ? data.get("note") : queryNote;
        var amount = queryAmount === "" ? data.get("amount") : queryAmount;
        
        //PIN VALIDATION
        if (senderEmail !== ""){
            const userData = {
                accountEmail: senderEmail,
                accountPIN: data.get("pin")
            }
            isPINValid = validatePIN(userData, "email")
        }
        if (querySenderAccount !== ""){
            const userData = {
                accountNumber: querySenderAccount,
                accountPIN: data.get("pin")
            }
            isPINValid = validatePIN(userData, "number")
        }
        //IF PIN VALID THERE IS CALL FOR TRANSFER
        if (isPINValid){
            const transferData = {
                sender: sender,
                receiver: receiver,
                note: note,
                amount: amount
            }
            console.log(transferData);
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
        //SET STATES IF ANY QUERY PARAMS ARE PASSED
        if (paymentData.get("sender") != null) {
            setQuerySenderAccount(paymentData.get("sender"));
            getBills(paymentData.get("sender"), "sender");
        }
        if (paymentData.get("receiver") != null) {
            getBills(paymentData.get("receiver"), "receiver");
        }
        if (paymentData.get("note") != null) setQueryNote(paymentData.get("note"));
        if (paymentData.get("amount") != null) setQueryAmount(paymentData.get("amount"));
    }, [])

    return (
        <>
            <div className="border-2 border-black">
                <fieldset className="grid grid-rows-3
                md:grid-cols-3"
                disabled={tries === 0 || done}>
                    {querySenderAccount != "" ?(
                        <p>From account: {querySenderAccount}</p>
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
                                {queryReceiverBill !== "" ? (
                                    <p>To: {receiver}</p>
                                ) : (
                                    <input type="text" name="receiver" placeholder="Pass receiver" maxLength={12} pattern="(\d{12})$" required/>
                                )}
                                {queryAmount !== "" ? (
                                    <p>Note: {queryNote}</p>
                                ) : (
                                    <input type="text" name="note" placeholder="Pass note" />
                                )}
                                {queryAmount !== "" ? (
                                    <p>Amount: {queryAmount}</p>
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
        </>
    )
}

export default PaymentForm;
