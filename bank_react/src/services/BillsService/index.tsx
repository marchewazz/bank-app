import http from "../../http-common";

import { backendUrl } from "../../utilities";

class BillsService{

    addOwnBill(billData: any){
        return http.post(`${backendUrl}/bills/addown`, billData)
    }

    deleteOwnBill(billData: any){
        return http.post(`${backendUrl}/bills/deleteown`, billData)
    }

    getBills(accountData: any){
        return http.post(`${backendUrl}/bills/getall`, accountData)
    }

    getFavoriteBills(billData: any){
        return http.post(`${backendUrl}/bills/getfavorite`, billData)
    }

    getOneBill(billData: any){
        return http.post(`${backendUrl}/bills/getonebill`, billData)
    }

    addFavoriteBill(billData: any){
        return http.post(`${backendUrl}/bills/addfavorite`, billData)
    }
}

export default BillsService;