"use client"

import React from 'react'
import HeaderComponent from '../_components/dashboard/header-component'
import MainComponent from '../_components/dashboard/main-component'

const DashboardPage = () => {
  return (
    <div className="bg-slate-200 h-screen w-screen p-5">
        <HeaderComponent/>
        <MainComponent/>
    </div>
  )
}

export default DashboardPage