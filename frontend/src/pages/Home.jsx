/* eslint-disable no-unused-vars */
import React from 'react'
import Header from '../Components/Header'
import TopDoctor from '../Components/TopDoctor'
import Banner from '../Components/Banner'
import Speacilitymenu from '../Components/Speacilitymenu'

const Home = () => {
  return (
    <div>
      <Header></Header>
      <Speacilitymenu/>
      <TopDoctor/>
      <Banner/>
    </div>
  )
}

export default Home

