import React, { useEffect, useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";

import AddNewBillForm from "../AddNewBillForm";

import AuthService from "../../../services/AuthService";
import BillsService from "../../../services/BillsService";
import TransactionsService from "../../../services/TransactionsService";
import { refreshUserData } from "../../../utilities";

export default function ProfileData(){
    
    const [tab, setTab]: any = useState("Data");
    const [billsTab, setBillsTab]: any = useState("Own");
    const [userData, setUserData]: any = useState("");
    const [accountHistory, setAccountHistory]: any = useState([]);
    const [userBills, setUserBills]: any = useState([]);
    
    const [favoriteUserBills, setFavoriteUserBills]: any = useState([]);

    const [deleteInfo, setDeleteInfo]: any = useState("");

    var as: AuthService = new AuthService();
    var ts: TransactionsService = new TransactionsService();
    var bs: BillsService = new BillsService();

    var navigate = useNavigate();

    const [, forceUpdate] = useReducer(x => x + 1, 0)

    function generateData(){
        return <>   
                    <p className="text-center font-bold">
                        Your data!
                    </p>
                    <p>
                        Email: {userData.accountEmail}
                    </p>
                    <p>
                        Number: {userData.accountNumber}
                    </p>
                </>
    }

    function generateHistory(){
        var history: any[] = [];

        for (var transaction of accountHistory){
            history.push(<div>
                <p>
                    Date: {new Date(transaction.date.$date).toUTCString()}
                </p>
                <p>
                    From: {transaction.sender.bill}
                </p>
                <p>
                    To: {transaction.receiver.bill}
                </p>
                <p>
                    Note: {transaction.note}
                </p>
                <p>
                    Amount: {transaction.amount}
                </p>
            </div>)
        }
        
        return <>
            <p className="text-center font-bold">
                Your history!
            </p>
            {history}
        </>
    }

    function generateOwnBills(){
        var bills: any[] = [];
        
        for (const bill of userBills){
            console.log(bill.billNumber);
            bills.push(<div>
                <p>Number: {bill.billNumber}</p>
                <p>Name: {bill.billName}</p>
                <p>Balance: {bill.billBalance}</p>
                <div className="grid grid-flow-col place-items-center">
                    <button className="btn-style">
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
                    <button onClick={() => deleteOwnBill({billNumber: bill.billNumber, accountNumber: userData.accountNumber})}
                    className="btn-style">
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
        return <>
            <p className="text-center font-bold">
                Your bills!
            </p>
            {bills}
        </>
    }

    function generateFavoriteBills(){
        var bills: any[] = [];
        
        if (favoriteUserBills.length === 0) bills.push(<p>You don't have any favorite bills</p>)
        else {
            for (var bill of favoriteUserBills){
                bills.push(<div>
                    <p>Number: {bill.billNumber}</p>
                    <p>Name: {bill.billName}</p>
                    <div className="grid place-items-center grid-flow-col">
                        <button className="btn-style">
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
                        <button className="btn-style"
                        onClick={() => deleteFavoriteBill({billNumber: bill.billNumber, accountNumber: userData.accountNumber})}>
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
                        <button onClick={() => navigate(`/transaction?receiver=${bill.billNumber}`)}
                        className="btn-style">
                            Make transfer
                        </button>
                    </div>
                </div>)
            }
        }
        return <>
            <p className="text-center font-bold">
                Your favorite bills!
            </p>
            {bills}
        </>
    }

    function deleteOwnBill(billData: any){
        console.log(billData);
        bs.deleteOwnBill(billData).then((res: any) => {
            setDeleteInfo(res.data.message);
            if(res.data.message === "Bill deleted!") {
                refreshUserData()?.then(() => {
                    setUserBills(JSON.parse(JSON.parse(as.getUserDetails())).bills);
                    forceUpdate()
                    setTimeout(() => {
                        setDeleteInfo("");
                    }, 5000); 
                })
            }
        })
    }

    function deleteFavoriteBill(billData: any){
        bs.deleteFavoriteBill(billData).then((res: any) => {
            console.log(res);
            if(res.data.message === "deleted") {
                refreshUserData()?.then(() => {
                    setFavoriteUserBills(JSON.parse(JSON.parse(as.getUserDetails())).favoriteBills);  
                    forceUpdate()
                });
                setDeleteInfo("Deleted!") 
                setTimeout(() => {
                    setDeleteInfo("")
                }, 4000);
            }
        })
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
        setDeleteInfo("");
        refreshUserData();
        setUserBills(JSON.parse(JSON.parse(as.getUserDetails())).bills);
        setFavoriteUserBills(JSON.parse(JSON.parse(as.getUserDetails())).favoriteBills)
    }, [tab, billsTab])

    return (
        <div>
            <div className="w-screen h-12 grid grid-rows-1 grid-flow-col justify-items-stretch
            divide-x-8 divide-white">
                <span className="grid place-items-stretch">
                    <input className="peer hidden"
                    type="radio" 
                    name="tab" 
                    id="data" 
                    onClick={() => setTab("Data")} 
                    defaultChecked={true}
                    />
                    <label htmlFor="data"
                    className="profile-nav-style">
                        Data
                    </label>
                </span>
                <span className="grid place-items-stretch">
                    <input className="peer hidden"
                    type="radio" 
                    name="tab" 
                    id="history"
                    onClick={() => setTab("History")} 
                    />
                    <label htmlFor="history"
                    className="profile-nav-style">
                        History
                    </label>
                </span>
                <span className="grid place-items-stretch">
                    <input className="peer hidden"
                    type="radio" 
                    name="tab" 
                    id="bills"
                    onClick={() => setTab("Bills")} 
                    />
                    <label htmlFor="bills"
                    className="profile-nav-style">
                        Bills
                    </label>
                </span>
            </div>
            { tab === "Data" ? (
                <div className="profile-data-tab-style">
                    {generateData()}
                </div>
            ) : tab === "History" ? (
                <div>
                    <div className="profile-data-tab-style">
                        {generateHistory()}
                    </div>
                </div>
            ) : tab === "Bills" ? (
                <div>
                    <div className="w-screen h-12 grid grid-rows-1 grid-flow-col justify-items-stretch mt-2
                    divide-x-8 divide-white">
                        <span className="grid place-items-stretch">
                            <input className="peer hidden"
                            type="radio"
                            name="billsTab"
                            id="own" 
                            onClick={() => setBillsTab("Own")}
                            defaultChecked={true}
                            />
                            <label htmlFor="own"
                            className="profile-nav-style">
                                My bills
                            </label>
                        </span>
                        <span className="grid place-items-stretch">
                            <input className="peer hidden"
                            type="radio"
                            name="billsTab"
                            id="favorite" 
                            onClick={() => setBillsTab("Favorite")}
                            />
                            <label htmlFor="favorite"
                            className="profile-nav-style">
                                Favorite bills
                            </label>
                        </span>
                        {billsTab === "Favorite" ? (
                            <button onClick={() => setBillsTab("AddFavorite")}
                            className="profile-nav-style">
                                Add favorite bill
                            </button>
                            ) : 
                        billsTab === "Own" ? (
                            <button onClick={() => setBillsTab("AddOwn")}
                            className="profile-nav-style">
                                Add new bill
                            </button>
                            ) : (null)}
                    </div>
                    {billsTab === "Own" ? (
                        <>
                            <div>
                                <p> { deleteInfo }</p>
                                <div className="profile-data-tab-style">
                                    {generateOwnBills()}
                                </div>
                            </div>
                        </>
                        
                    ) : billsTab === "Favorite" ? (
                        <>
                            <div>
                                <p> { deleteInfo }</p>
                                <div className="profile-data-tab-style">
                                    {generateFavoriteBills()}
                                </div>
                            </div>
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