import React from 'react'

const Navbar = () => {
  return (
    <div className='sm:max-w-screen-xl mx-auto'>
      <div className='bg-zinc-500 flex items-center justify-between p-4'>
        <div className='left'>
          <h1 className='font-bold font-sans text-3xl'>Logo</h1>
        </div>
        <div className='center'>
          <ul className='hidden gap-4 sm:flex'>
            <li className='text-white font-semibold hover:scale-105 cursor-pointer transition-transform duration-300 ease-in-out'>Home</li>
            <li className='text-white font-semibold hover:scale-105 cursor-pointer transition-transform duration-300 ease-in-out'>About</li>
            <li className='text-white font-semibold hover:scale-105 cursor-pointer transition-transform duration-300 ease-in-out'>Contact</li>
          </ul>
        </div>
        <div className='center '>
          <button className='px-4 py-2 bg-black text-white font-medium rounded-2xl hover:bg-zinc-800 hover:scale-105 transition-transform duration-300 ease-in-out'>Login</button>
        </div>
      </div>
    </div>
  )
}

export default Navbar