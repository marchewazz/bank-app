import axios from "axios";

import { backendUrl } from "./utilities";

export default axios.create({
    baseURL: backendUrl,
    headers: {
        "Content-type": "application/json",
    }
})