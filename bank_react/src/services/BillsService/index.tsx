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

    getOneBill(billData: any){
        return http.post(`${backendUrl}/bills/getonebill`, billData)
    }

    getFavoriteBills(billData: any){
        return http.post(`${backendUrl}/bills/getfavorite`, billData)
    }

    addFavoriteBill(billData: any){
        return http.post(`${backendUrl}/bills/addfavorite`, billData)
    }

    editFavoriteBillName(billData: any){
        return http.post(`${backendUrl}/bills/updatefavoritename`, billData)
    }

    deleteFavoriteBill(billData: any){
        return http.post(`${backendUrl}/bills/deletefavoritebill`, billData)

    }
}

export default BillsService;