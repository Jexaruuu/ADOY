import { useEffect, useMemo, useState } from 'react'
import Menu from '../Menu/menu'

const PASSCODE = '922143'

export default function Passcode() {
  const [entered, setEntered] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (entered.length !== 6) return

    if (entered === PASSCODE) {
      const timer = setTimeout(() => {
        setUnlocked(true)
        setEntered('')
      }, 180)
      return () => clearTimeout(timer)
    }

    setError(true)
    setShake(true)

    const resetTimer = setTimeout(() => {
      setEntered('')
      setError(false)
      setShake(false)
    }, 650)

    return () => clearTimeout(resetTimer)
  }, [entered])

  const formattedTime = useMemo(() => {
    return time.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  }, [time])

  const formattedDate = useMemo(() => {
    return time.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }, [time])

  const handleDigit = (digit) => {
    if (entered.length >= 6) return
    setEntered((prev) => prev + digit)
  }

  const handleDelete = () => {
    setEntered((prev) => prev.slice(0, -1))
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete']

  if (unlocked) {
    return <Menu />
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.18),transparent_30%),linear-gradient(to_bottom,#111827,#000000)]" />
      <div className="absolute inset-0 backdrop-blur-2xl" />

      <div className="relative z-10 flex min-h-screen w-full max-w-sm flex-col px-8 py-10">
        <div className="text-center">
          <p className="text-6xl font-semibold tracking-tight">{formattedTime}</p>
          <p className="mt-2 text-sm font-medium text-white/75">{formattedDate}</p>
        </div>

        <div className="mt-28 flex flex-col items-center">
          <h1 className="text-[28px] font-medium tracking-tight">Enter Passcode</h1>
          <p className={`mt-2 text-sm ${error ? 'text-red-400' : 'text-white/60'}`}>
            {error ? 'Incorrect Passcode' : 'Enter your passcode'}
          </p>

          <div className={`mt-8 flex items-center justify-center gap-4 ${shake ? 'animate-[shake_0.35s_ease-in-out]' : ''}`}>
            {Array.from({ length: 6 }).map((_, index) => {
              const filled = index < entered.length
              return (
                <div
                  key={index}
                  className={`h-4 w-4 rounded-full border transition-all duration-150 ${
                    filled
                      ? error
                        ? 'border-red-400 bg-red-400'
                        : 'border-white bg-white'
                      : error
                        ? 'border-red-400/70 bg-transparent'
                        : 'border-white/60 bg-transparent'
                  }`}
                />
              )
            })}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-x-7 gap-y-5">
            {keys.map((value, index) => {
              if (value === '') {
                return <div key={index} className="h-18.5 w-18.5" />
              }

              if (value === 'delete') {
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={handleDelete}
                    className="flex h-18.5 w-18.5 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white/90 backdrop-blur-md transition active:scale-95 active:bg-white/20"
                  >
                    Delete
                  </button>
                )
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDigit(value)}
                  className="flex h-18.5 w-18.5 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition active:scale-95 active:bg-white/20"
                >
                  <span className="text-[30px] font-normal leading-none">{value}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}