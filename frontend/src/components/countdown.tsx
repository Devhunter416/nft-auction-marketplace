import { useState, useEffect } from 'react'

const Countdown = ({ timestamp }: {timestamp: number}) => {
  const [timeLeft, setTimeLeft] = useState(timestamp - Date.now()/1000)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(timestamp - Date.now()/1000)
    }, 1000)

    return () => clearInterval(interval)
  }, [timestamp])

  const days = Math.floor(timeLeft / ( 60 * 60 * 24))
  const hours = Math.floor(
    (timeLeft % ( 60 * 60 * 24)) / (  60 * 60),
  )
  const minutes = Math.floor((timeLeft % ( 60 * 60)) / ( 60))
  const seconds = Math.floor((timeLeft % ( 60)))

  return Date.now()/1000 > timestamp ? (
    '00:00:00'
  ) : (
    <div className='text-2xl flex justify-center'>
      <div className='badge'>{days}d</div> <div className='badge'>{hours}h </div> <div className='badge'> {minutes}m </div><div className='badge'>{seconds}s</div>
    </div>
  )
}

export default Countdown