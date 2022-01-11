import React, { useEffect, useState } from "react";

import AddNewBillForm from "../AddNewBillForm";

import AuthService from "../../../services/AuthService";
import BillsService from "../../../services/BillsService";
import TransactionsService from "../../../services/TransactionsService";
import { refreshUserData } from "../../../utilities";

export default function ProfileData(){
    
    const [tab, setTab] = useState("Data");
    const [billsTab, setBillsTab] = useState("Own");
    const [userData, setUserData]: any = useState("");
    const [accountHistory, setAccountHistory]: any = useState([]);
    const [userBills, setUserBills]: any = useState([]);
    
    const [favoriteUserBills, setFavoriteUserBills]: any = useState([]);

    var as: AuthService = new AuthService();
    var ts: TransactionsService = new TransactionsService();
    var bs: BillsService = new BillsService()

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

    function generateOwnBills(){
        var bills: any[] = [];
        
        for (const bill of userBills){
            console.log(bill.billNumber);
            bills.push(<div>
                <p>Number: {bill.billNumber}</p>
                <p>Name: {bill.billName}</p>
                <p>Balance: {bill.billBalance}</p>
                <div>
                    <button>
                        <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor">
                            <path stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button onClick={() => deleteOwnBill({billNumber: bill.billNumber, accountNumber: userData.accountNumber})}>
                        <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor">
                            <path stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>)
        }
        return <>{bills}</>
    }

    function generateFavoriteBills(){
        var bills: any[] = [];
        
        if (favoriteUserBills.length == 0) bills.push(<p>You don't have any favorite bills</p>)
        else {
            for (var bill of favoriteUserBills){
                bills.push(<div>
                    <p>Number: {bill.billNumber}</p>
                    <p>Name: {bill.billName}</p>
                    <div>
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" 
                            className="h-6 w-6" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor">
                                <path stroke-linecap="round" 
                                stroke-linejoin="round" 
                                stroke-width="2" 
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        <button>
                        <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor">
                            <path stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        </button>
                    </div>
                </div>)
            }
        }
        return <>{bills}</>
    }

    function deleteOwnBill(billData: any){
        console.log(billData);
        bs.deleteOwnBill(billData).then((res: any) => {
            console.log(res);
        })
        refreshUserData();
        setUserBills(JSON.parse(JSON.parse(as.getUserDetails())).bills);
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
            setFavoriteUserBills(JSON.parse(JSON.parse(as.getUserDetails())).favoriteBills)
        }
    }, [tab])

    useEffect(() => {
        refreshUserData();
        setUserBills(JSON.parse(JSON.parse(as.getUserDetails())).bills);
        setFavoriteUserBills(JSON.parse(JSON.parse(as.getUserDetails())).favoriteBills)
    }, [tab, billsTab])

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
                    <div className="flex justify-evenly">
                        <div onClick={() => setBillsTab("Own")}>My bills</div>
                        <div onClick={() => setBillsTab("Favorite")}>Favorite</div>
                        {billsTab == "Favorite" ? (<div onClick={() => setBillsTab("AddFavorite")}>Add favorite bill</div>) : (<div onClick={() => setBillsTab("AddOwn")}>Add new bill</div>)}
                    </div>
                    {billsTab === "Own" ? (
                        <>
                            {generateOwnBills()}
                        </>
                        
                    ) : billsTab == "Favorite" ? (
                        <>
                            {generateFavoriteBills()}
                        </>
                    ) : billsTab === "AddOwn" ? (
                        <AddNewBillForm option="Own"/>
                    ) : billsTab === "AddFavorite" ? (
                        <AddNewBillForm option="Favorite"/>
                    )
                    : (null)}
                </div>
            ) : (null)}
        </div>
    )
}