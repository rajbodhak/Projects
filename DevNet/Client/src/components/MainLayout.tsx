// import React from 'react'

import { Outlet } from "react-router-dom"

const MainLayout = () => {
    return (
        <div>
            THis is main layout
            <div>
                <Outlet />
            </div>
        </div>
    )
}

export default MainLayout
