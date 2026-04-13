import { useEffect, useMemo, useRef, useState } from 'react'

const words = ['JERGEN', 'ADOY', 'YODA', 'AILA MEDEL']

const tracks = [
  { title: 'Kahel Na Langit', src: '/kahelnalangit.mp3', image: '/kahelnalangit.jpg' },
  { title: 'Anything 4 U', src: '/anything4u.mp3', image: '/anything4u.jpg' },
  { title: 'ILYSB', src: '/ilysb.mp3', image: '/ilysb.jpg' },
  { title: 'Stuck', src: '/stuck.mp3', image: '/stuck.jpg' },
  { title: 'Pink Skies', src: '/pinkskies.mp3', image: '/pinkskies.jpg' }
]

export default function Menu() {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [heartPosition, setHeartPosition] = useState({ x: 82, y: 22 })
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 })
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const audioRef = useRef(null)

  const profileMedia = '/yodalove.gif'

  const hearts = useMemo(
    () => [
      { id: 1, left: '12%', top: '18%', size: 'text-xl', delay: '0s', duration: '7s', opacity: 'opacity-35' },
      { id: 2, left: '24%', top: '72%', size: 'text-lg', delay: '1.5s', duration: '8s', opacity: 'opacity-25' },
      { id: 3, left: '38%', top: '28%', size: 'text-2xl', delay: '0.8s', duration: '6.5s', opacity: 'opacity-30' },
      { id: 4, left: '58%', top: '80%', size: 'text-lg', delay: '2.2s', duration: '7.5s', opacity: 'opacity-20' },
      { id: 5, left: '72%', top: '16%', size: 'text-xl', delay: '1.2s', duration: '6.8s', opacity: 'opacity-30' },
      { id: 6, left: '88%', top: '62%', size: 'text-2xl', delay: '2.8s', duration: '8.2s', opacity: 'opacity-25' }
    ],
    []
  )

  useEffect(() => {
    const currentWord = words[wordIndex]
    const typingSpeed = isDeleting ? 70 : 140
    const pauseTime = 1200

    let timer

    if (!isDeleting && text === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && text === '') {
      setIsDeleting(false)
      setWordIndex((prev) => (prev + 1) % words.length)
    } else {
      timer = setTimeout(() => {
        setText((prev) =>
          isDeleting
            ? currentWord.slice(0, prev.length - 1)
            : currentWord.slice(0, prev.length + 1)
        )
      }, typingSpeed)
    }

    return () => clearTimeout(timer)
  }, [text, isDeleting, wordIndex])

  useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = window.innerHeight * 0.52
      setShowLetter(window.scrollY >= triggerPoint)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 100
      const mouseY = ((e.clientY + window.scrollY) / document.documentElement.scrollHeight) * 100

      setMousePosition({ x: mouseX, y: mouseY })

      setHeartPosition((prev) => {
        const dx = prev.x - mouseX
        const dy = prev.y - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 18) {
          const angle = Math.atan2(dy, dx)
          const moveDistance = 8
          const nextX = prev.x + Math.cos(angle) * moveDistance
          const nextY = prev.y + Math.sin(angle) * moveDistance

          return {
            x: Math.min(92, Math.max(8, nextX)),
            y: Math.min(88, Math.max(8, nextY))
          }
        }

        return prev
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play()
          setIsPlaying(true)
        } catch (e) {}
      }
    }

    playAudio()

    const handleFirstInteraction = () => {
      playAudio()
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('scroll', handleFirstInteraction)
      window.removeEventListener('mousemove', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction)
    window.addEventListener('scroll', handleFirstInteraction)
    window.addEventListener('mousemove', handleFirstInteraction)
    window.addEventListener('touchstart', handleFirstInteraction)

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('scroll', handleFirstInteraction)
      window.removeEventListener('mousemove', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [trackIndex])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      setTrackIndex((prev) => (prev + 1) % tracks.length)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.load()

    const playNewTrack = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch (e) {}
    }

    playNewTrack()
  }, [trackIndex])

  const playPrevious = () => {
    setTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
  }

  const playNext = () => {
    setTrackIndex((prev) => (prev + 1) % tracks.length)
  }

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch (e) {}
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#061a40] text-white">
      <style>{`
        @keyframes floatHeart {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_22%),radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%),linear-gradient(to_bottom,#0b1f4d,#061a40,#03112d)]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {hearts.map((heart) => (
          <span
            key={heart.id}
            className={`absolute select-none text-sky-300 ${heart.size} ${heart.opacity}`}
            style={{
              left: heart.left,
              top: heart.top,
              animation: `floatHeart ${heart.duration} ease-in-out ${heart.delay} infinite`
            }}
          >
            💙
          </span>
        ))}

        <span
          className="absolute select-none text-4xl opacity-90 drop-shadow-[0_0_16px_rgba(96,165,250,0.65)] transition-[left,top,transform] duration-300 ease-out"
          style={{
            left: `${heartPosition.x}%`,
            top: `${heartPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          💙
        </span>
      </div>

      <section className="relative z-10 flex min-h-[92vh] items-center justify-center px-6 pt-10">
        <div className="flex w-full max-w-4xl flex-col items-center justify-center text-center">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.45em] text-white/75 sm:text-xs">
            A message, just for you
          </p>

          <h1 className="min-h-22 text-6xl font-semibold tracking-wide text-white sm:min-h-27.5 sm:text-7xl md:text-8xl">
            {text}
            <span className="ml-1 inline-block animate-pulse text-white/90">|</span>
          </h1>

          <p className="mt-5 text-base italic text-white/85 sm:text-lg md:text-xl">
            Here for you, always.
          </p>

          <div className="mt-8 w-full max-w-2xl px-5 py-5 sm:px-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60">
                  Now Playing
                </p>
                <p className="mt-2 text-sm font-semibold text-white/90 sm:text-base">
                  {tracks[trackIndex].title}
                </p>
                <p className="mt-1 text-xs text-white/55">
                  Track {trackIndex + 1} of {tracks.length}
                </p>
              </div>

              <div className="hidden h-12 w-12 overflow-hidden rounded-full bg-white/10 shadow-[0_0_25px_rgba(96,165,250,0.25)] sm:flex">
                <img
                  src={tracks[trackIndex].image}
                  alt={tracks[trackIndex].title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#10285f]/80 px-3 py-3 sm:px-4">
              <button
                onClick={playPrevious}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 transition hover:bg-white/20"
              >
                <span className="relative flex h-4 w-4 items-center justify-center">
                  <span className="absolute left-0 h-4 w-[2px] rounded-full bg-current" />
                  <span className="ml-[3px] h-0 w-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-current" />
                  <span className="-ml-[2px] h-0 w-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-current" />
                </span>
              </button>

              <button
                onClick={togglePlayPause}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white transition hover:bg-white/25"
              >
                {isPlaying ? (
                  <span className="flex items-center gap-[3px]">
                    <span className="h-4 w-[3px] rounded-full bg-current" />
                    <span className="h-4 w-[3px] rounded-full bg-current" />
                  </span>
                ) : (
                  <span className="ml-[2px] h-0 w-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-current" />
                )}
              </button>

              <button
                onClick={playNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 transition hover:bg-white/20"
              >
                <span className="relative flex h-4 w-4 items-center justify-center">
                  <span className="h-0 w-0 border-y-[6px] border-y-transparent border-l-[7px] border-l-current" />
                  <span className="-ml-[2px] h-0 w-0 border-y-[6px] border-y-transparent border-l-[7px] border-l-current" />
                  <span className="absolute right-0 h-4 w-[2px] rounded-full bg-current" />
                </span>
              </button>

              <div className="min-w-0 flex-1">
                <audio
                  ref={audioRef}
                  controls
                  autoPlay
                  className="w-full"
                >
                  <source src={tracks[trackIndex].src} type="audio/mpeg" />
                </audio>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center text-white/70">
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">
              Please Scroll Down 🌹
            </span>
            <span className="mt-3 h-16 w-px bg-white/40" />
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-12 flex min-h-[68vh] items-start justify-center px-6 pb-24 pt-0">
        <div
          className={`relative w-full max-w-3xl transition-all duration-700 ${
            showLetter
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-10 opacity-0'
          }`}
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,182,193,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_45%)] blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-10 md:p-14">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_35%,rgba(255,192,203,0.06)_65%,rgba(255,255,255,0.03))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full">
                    <img
                      src={profileMedia}
                      alt="Profile"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <span className="h-px w-12 bg-white/25" />
                </div>

                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/65 sm:text-xs">
                  April 13, 2026
                </p>
              </div>

              <div className="mx-auto max-w-2xl">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-blue-200/80">
                  For you
                </p>

                <h2 className="mb-8 text-2xl font-semibold italic leading-tight text-white/95 sm:text-3xl">
                  My dearest Adoy,
                </h2>

                <div className="space-y-6 text-[15px] leading-8 text-white/80 sm:text-base sm:leading-9">
                  <p>
                    Hello Adoy, alam ko it's just a random day, wala namang okasyon or any special sa araw ngayon,
                    gusto ko lang na kamustahin ka at damayan ka sa kung ano man nararamdaman mo ngayon.
                    Gusto ko iparamdam sayo hindi ikaw nag iisa, gusto kong ipakita sa'yo na nandito
                    parin ako.
                  </p>

                  <p>
                    Alam ko na this past days, weeks, months, hindi ako masyadong ramdam or like naging distant.
                    Pero hindi yun dahil sayo, actually kung alam mo lang kung gaano ko ka gustong kausapin or i chat ka ng madalas,
                    pero para sakin talaga mas mahalaga yung peace of mind mo and feel ko kasi nakaka storbo talaga ko tska nahihiya ako.
                  </p>

                  <p>
                    Ngayon feel ko na something bothering you, and I just want you to know na nandito lang ako, willing to listen anytime.
                    Alam ko nasabi ko na sa'yo to ng ilang beses pero gusto ko lang ulitin, I care about you so much and I want to be there for you in any way I can.
                    Lagi akong naka suporta sayo, kahit na sa malayo. Palagi ka kayang nasa isip ko 24/7, walang mintis.
                  </p>

                  <p>
                    Gusto ko lang malaman mo na palagi kitang kinakamusta sa paraang alam kong hindi mo masyadong napapansin,
                    Ewan ko sobrang concern ko sayo, pero alam ko one day mapapansin mo yun, pag nakita mo yun masaya na ako dun promise.
                    Ewan ko basta gusto ko lang na malaman mo na kahit anong mangyare, nandito lang ako. Kahit ilang beses ko pa to ulit-ulitin sabihin sayo.
                  </p>

                  <p>
                    Basta ang wish ko is sana hindi na sobrang ma sad si adoy, na pwede nyang iiyak lahat then sana pagtapos ng pagiyak ay mawawala na yung bigat.
                    Adoy is always special to me, Hangad ko talaga na maging masaya ka, kahit na anong mangyari, kahit na hindi ako masyadong nakakapag usap sayo.
                  </p>

                  <p>
                    Kung gusto mo may paglabasan ng sama ng loob, andito lang ako ha, kung kailangan pwede mo ko murahin kung gusto mo,
                    para lang sa ikagagaan ng loob mo, basta kahit ano. Ayoko lang kasi maramdaman ko na hindi ka okay. Sana kahit na sa simpleng kamusta ko sa'yo ngayon
                    naparamdam ko na totoo ako and napagaan ko feeling mo. Palagi kang mag iingat ha Adoy ha. Thankyou always!
                  </p>
                </div>

                <div className="mt-10">
                  <div className="mb-6 h-px w-24 bg-gradient-to-r from-pink-200/50 to-transparent" />
                  <p className="text-base italic text-white/85">
                    Forever yours,
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-wide text-pink-100">
                    Jexy
                  </p>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-end gap-3">
                <span className="h-px w-10 bg-white/20" />
                <span className="text-xl text-blue-200/80">❤</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70 backdrop-blur-xl sm:text-xs">
              jrgn.yd.lmdl
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}