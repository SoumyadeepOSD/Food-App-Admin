import React from 'react'
import { CircularProgress } from '@nextui-org/progress'

const LoadingComponent = () => {
  return (
    <div className="w-screen h-screen bg-slate-300 flex flex-col items-center justify-center text-black">
        <CircularProgress label="Loading..." size='lg' color='primary'/>
    </div>
  )
}

export default LoadingComponent