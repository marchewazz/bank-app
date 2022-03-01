import React from "react";

import MainHeader from "./MainHeader";
import NewsContainer from "./NewsContainer";

function MainPage(){
    return (
        <div className="grid">  
            <div className="place-self-center">
                <MainHeader />
            </div>
            <div className="mx-2 mt-8
            md:mx-32
            lg:mx-64">
                <NewsContainer />
            </div>
        </div>
        
    )
}

export default MainPage;