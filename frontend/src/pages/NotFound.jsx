import React from "react";
import {Link} from "react-router-dom";
 
const NotFound=()=>{
    return(
        <section className="notfound">
            <div className="content">
                <h1>404 Not Found</h1>
                <p>visited page not found.</p>
                <Link to={"/"} className="btn">Back to home</Link>
            </div>
        </section>     
    )
}
export default NotFound
