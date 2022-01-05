import React, { useEffect, useState } from "react";

import AuthService from "../../../services/AuthService";
import BillsService from "../../../services/BillsService";
import TransactionsService from "../../../services/TransactionsService";

export default function ProfileData(){
    
    const [tab, setTab] = useState("");
    const [userData, setUserData]: any = useState("");
    const [accountHistory, setAccountHistory]: any = useState([]);
    const [userBills, setUserBills]: any = useState([]);

    var as: AuthService = new AuthService();
    var bs: BillsService = new BillsService();
    var ts: TransactionsService = new TransactionsService();

    function generateData(){
        return <>   
                    <p>Email: {userData.accountEmail}</p>
                    <p>Number: {userData.accountNumber}</p>
                </>
    }

    function generateHistory(){
        var history: any[] = [];

        for (var transaction of accountHistory){
            history.push(<div>
                <p>Date: {new Date(transaction.date.$date).toUTCString()}</p>
                <p>From: {transaction.sender.bill}</p>
                <p>To: {transaction.receiver.bill}</p>
                <p>Note: {transaction.note}</p>
                <p>Amount: {transaction.amount}</p>
            </div>)
        }
        
        return <>{history}</>
    }

    function generateBills(){
        var bills: any[] = [];
        
        for (var bill of userBills){
            bills.push(<div>
                <p>Number: {bill.billNumber}</p>
                <p>Name: {bill.billName}</p>
                <p>Balance: {bill.billBalance}</p>
            </div>)
        }
        return <>{bills}</>
    }

    useEffect(() => {
        if(tab === "Data"){
            setUserData(JSON.parse(JSON.parse(as.getUserDetails())));
        } else if (tab === "History"){
            ts.getHistoryByAccountNumber({accountNumber: JSON.parse(JSON.parse(as.getUserDetails())).accountNumber}).then((res: any) => {
                setAccountHistory(JSON.parse(res.data.transactions))
            })
        } else if (tab === "Bills"){
            setUserBills(JSON.parse(JSON.parse(as.getUserDetails())).bills)
        }
    }, [tab])

    useEffect(() => {
        setTab("Data");
    }, [])

    return (
        <div>
            <div className="flex justify-evenly">
                <div onClick={() => setTab("Data")}>Data</div>
                <div onClick={() => setTab("History")}>History</div>
                <div onClick={() => setTab("Bills")}>Bills</div>
            </div>
            { tab === "Data" ? (
                <div>
                    {generateData()}
                </div>
            ) : tab === "History" ? (
                <div>
                    {generateHistory()}
                </div>
            ) : tab === "Bills" ? (
                <div>
                    {generateBills()}
                </div>
            ) : (null)}
        </div>
    )
}