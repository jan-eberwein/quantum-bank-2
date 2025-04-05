import HeaderBox from '@/components/HeaderBox'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import React from 'react'

const Home = () => {
  const loggedIn = { firstName: 'Jan', lastName: 'Eberwein' }


  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'User'}
            subtext="Dashboard"
          />

          <TotalBalanceBox 
            balance={'10000.00'}
          />


          <p>AI-powered banking application</p>
        </header>
      </div>
    </section>

  )
}

export default Home
