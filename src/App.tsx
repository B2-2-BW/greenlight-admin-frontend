import { useState } from 'react'
import './App.css'
import EventDetail from './app/eventDetail/page'
import EventList from './app/eventList/page'

function App() {

  return (
    <>
      <div className='bg-[#FAFFFB]'>
        <EventList/>
      </div>
    </>
  )
}

export default App