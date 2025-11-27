'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Maximize2, Share2, Play, Pause, RotateCcw, Trash2, QrCode } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, CartesianGrid } from 'recharts'
import { supabase } from '@/lib/supabase'
import { getPresentation, setActiveSession, getVotesForSlide, getVotesForPresentation, Vote, resetPresentationVotes, getActiveSession } from '@/lib/storage'
import QRCode from 'react-qr-code'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899']

export default function PresenterPage() {
    const params = useParams()
    const [presentation, setPresentation] = useState<any>(null)
    const [phase, setPhase] = useState<'ready' | 'reading' | 'voting' | 'finished'>('ready')
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [votes, setVotes] = useState<Vote[]>([])
    const [allVotes, setAllVotes] = useState<Vote[]>([])
    const [showLeaderboard, setShowLeaderboard] = useState(false)
    const [joinUrl, setJoinUrl] = useState('')
    const [domain, setDomain] = useState('')
    const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now())

    useEffect(() => {
        setDomain(window.location.host)
    }, [])

    useEffect(() => {
        const loadPresentation = async () => {
            if (params.id) {
                const data = await getPresentation(params.id as string)
                if (data) {
                    setPresentation(data)

                    // Check for existing active session
                    const activeSession = await import('@/lib/storage').then(m => m.getActiveSession(data.id))

                    if (activeSession) {
                        // Restore state
                        const slideIndex = data.slides.findIndex((s: any) => s.id === activeSession.slideId)
                        if (slideIndex !== -1) {
                            setCurrentSlideIndex(slideIndex)
                            setPhase(activeSession.phase || 'ready')
                            setSessionStartTime(activeSession.startTime)

                            const currentSlide = data.slides[slideIndex]

                            if (activeSession.phase === 'reading' || activeSession.phase === 'voting') {
                                const elapsed = Math.floor((Date.now() - activeSession.startTime) / 1000)
                                const duration = activeSession.phase === 'reading'
                                    ? (currentSlide.readingDuration || 5)
                                    : (currentSlide.duration || 15)
                                const remaining = Math.max(0, duration - elapsed)

                                setTimeLeft(remaining)
                                setIsTimerRunning(remaining > 0)
                            } else if (activeSession.phase === 'finished') {
                                setTimeLeft(0)
                                setIsTimerRunning(false)
                            } else {
                                // Ready
                                setTimeLeft(currentSlide.enableReadingTimer ? (currentSlide.readingDuration || 5) : (currentSlide.duration || 15))
                                setIsTimerRunning(false)
                            }
                        }
                    } else if (data.slides.length > 0) {
                        // Default start
                        const firstSlide = data.slides[0]
                        setPhase('ready')
                        setTimeLeft(firstSlide.enableReadingTimer ? (firstSlide.readingDuration || 5) : (firstSlide.duration || 15))
                        setIsTimerRunning(false)
                        setSessionStartTime(Date.now())
                    }
                }
            }
        }
        loadPresentation()
        setJoinUrl(`${window.location.origin}/join`)
    }, [params.id])

    // Timer logic & Phase transitions
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0 && isTimerRunning) {
            // Timer finished, handle transitions
            const currentSlide = presentation?.slides[currentSlideIndex]
            if (phase === 'reading') {
                // Reading finished -> Start Voting
                setPhase('voting')
                const duration = currentSlide?.duration || 15
                setTimeLeft(duration)
                setSessionStartTime(Date.now()) // Reset start time for new phase
            } else if (phase === 'voting') {
                // Voting finished
                setPhase('finished')
                setIsTimerRunning(false)
                setSessionStartTime(Date.now())
            }
        }
        return () => clearInterval(interval)
    }, [isTimerRunning, timeLeft, phase, presentation, currentSlideIndex])

    // Active Session & Vote Listening
    useEffect(() => {
        if (!presentation || !presentation.slides[currentSlideIndex]) return

        const currentSlide = presentation.slides[currentSlideIndex]

        // Broadcast active session
        const updateSession = async () => {
            await setActiveSession({
                presentationId: presentation.id,
                slideId: currentSlide.id,
                startTime: sessionStartTime,
                phase: phase
            })
        }
        updateSession()

        // Fetch initial votes
        const fetchVotes = async () => {
            const slideVotes = await getVotesForSlide(presentation.id, currentSlide.id)
            setVotes(slideVotes)
            const all = await getVotesForPresentation(presentation.id)
            setAllVotes(all)
        }
        fetchVotes()

        // Subscribe to new votes
        const channel = supabase
            .channel('realtime-votes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'votes',
                    filter: `presentation_id=eq.${presentation.id}`
                },
                () => {
                    // Refetch votes on new insert
                    fetchVotes()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [presentation, currentSlideIndex, phase, sessionStartTime])

    const handleNext = () => {
        if (presentation && currentSlideIndex < presentation.slides.length - 1) {
            const nextIndex = currentSlideIndex + 1
            setCurrentSlideIndex(nextIndex)

            const nextSlide = presentation.slides[nextIndex]
            if (nextSlide.enableReadingTimer) {
                setPhase('reading')
                setTimeLeft(nextSlide.readingDuration || 5)
            } else {
                setPhase('voting')
                setTimeLeft(nextSlide.duration || 15)
            }
            setIsTimerRunning(true)
            setSessionStartTime(Date.now())
        }
    }

    const handlePrev = () => {
        if (currentSlideIndex > 0) {
            const prevIndex = currentSlideIndex - 1
            setCurrentSlideIndex(prevIndex)
            setPhase('ready') // Reset to ready when going back? Or maybe just pause? Let's say ready.
            const prevSlide = presentation.slides[prevIndex]
            setTimeLeft(prevSlide.enableReadingTimer ? (prevSlide.readingDuration || 5) : (prevSlide.duration || 15))
            setIsTimerRunning(false)
            setSessionStartTime(Date.now())
        }
    }

    const toggleTimer = () => {
        if (phase === 'ready') {
            // Start from ready
            const currentSlide = presentation.slides[currentSlideIndex]
            if (currentSlide.enableReadingTimer) {
                setPhase('reading')
                setTimeLeft(currentSlide.readingDuration || 5)
            } else {
                setPhase('voting')
                setTimeLeft(currentSlide.duration || 15)
            }
            setIsTimerRunning(true)
            setSessionStartTime(Date.now())
        } else {
            setIsTimerRunning(!isTimerRunning)
            // If pausing/resuming, we might need to adjust startTime to account for pause duration
            // But for simplicity, let's just update startTime to now - (duration - timeLeft)
            // so that the elapsed time matches the current timeLeft.
            if (!isTimerRunning) {
                // Resuming
                const currentSlide = presentation.slides[currentSlideIndex]
                const duration = phase === 'reading' ? (currentSlide.readingDuration || 5) : (currentSlide.duration || 15)
                const elapsed = duration - timeLeft
                setSessionStartTime(Date.now() - elapsed * 1000)
            }
        }
    }

    const resetTimer = () => {
        if (presentation) {
            setPhase('ready')
            const currentSlide = presentation.slides[currentSlideIndex]
            setTimeLeft(currentSlide.enableReadingTimer ? (currentSlide.readingDuration || 5) : (currentSlide.duration || 15))
            setIsTimerRunning(false)
            setSessionStartTime(Date.now())
        }
    }

    // Auto-start timer on slide change useEffect is removed as per instructions.

    // handleShare function is removed as per instructions.

    const handleShare = async () => {
        const url = `${window.location.origin}/join/${presentation.id.slice(0, 4)}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Join ${presentation.title}`,
                    text: `Join my presentation "${presentation.title}" using code ${presentation.id.slice(0, 4)}`,
                    url: url
                })
            } catch (err) {
                console.error('Error sharing:', err)
            }
        } else {
            navigator.clipboard.writeText(url)
            alert('Join link copied to clipboard!')
        }
    }

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
    }

    const handleReset = async () => {
        if (confirm('Are you sure you want to reset all results for this presentation? This cannot be undone.')) {
            await resetPresentationVotes(presentation.id)
            setVotes([])
            setAllVotes([])
            alert('Results reset!')
        }
    }

    if (!presentation) return <div className="flex items-center justify-center h-screen">Loading...</div>

    const currentSlide = presentation.slides[currentSlideIndex]

    // Calculate results
    const results = currentSlide.options?.map((opt: any) => ({
        name: opt.text,
        votes: votes.filter(v => v.optionId === opt.id).length,
        isCorrect: opt.isCorrect
    })) || []

    // ... (existing code)

    // Calculate Leaderboard
    const leaderboard = allVotes.reduce((acc: any[], vote) => {
        // Find if voter already exists
        const existingVoter = acc.find(v => v.name === vote.voterName)

        // Check if answer is correct
        const slide = presentation.slides.find((s: any) => s.id === vote.slideId)
        const option = slide?.options?.find((o: any) => o.id === vote.optionId)
        const isCorrect = option?.isCorrect

        let score = 0
        if (isCorrect) {
            // Base score for correct answer
            const maxPoints = slide?.maxPoints || 1000
            const baseScore = Math.round(maxPoints * 0.6) // 60% base
            const maxBonus = maxPoints - baseScore // 40% bonus

            // Time bonus
            // If timeTaken is missing (old votes), assume max time (0 bonus)
            const duration = (slide?.duration || 15) * 1000
            const timeTaken = vote.timeTaken || duration

            // Formula: Base + Bonus * (1 - timeTaken / duration)
            // Ensure timeTaken doesn't exceed duration for calculation
            const effectiveTime = Math.min(timeTaken, duration)
            const timeBonus = maxBonus * (1 - effectiveTime / duration)

            score = Math.round(baseScore + timeBonus)
        }

        if (existingVoter) {
            existingVoter.score += score
        } else {
            acc.push({ name: vote.voterName, score })
        }
        return acc
    }, []).sort((a, b) => b.score - a.score)

    return (
        <div className="h-screen flex flex-col bg-background relative">
            {/* Header */}
            <div className="h-14 border-b flex items-center justify-between px-4">
                <span className="font-bold truncate max-w-[200px]">{presentation.title}</span>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <div className={`text-2xl font-mono font-bold ${timeLeft < 5 ? 'text-red-500' : ''}`}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {phase === 'reading' ? 'Reading Time' : phase === 'voting' ? 'Voting Time' : 'Finished'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={toggleTimer}>
                            {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={resetTimer}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="h-6 w-px bg-border mx-2" />

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <QrCode className="h-4 w-4" /> QR Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Join Presentation</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center p-6 space-y-4">
                                <div className="bg-white p-4 rounded-lg">
                                    <QRCode value={`${joinUrl}/${presentation.id.slice(0, 4)}`} size={200} />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm text-muted-foreground">Scan to join or visit</p>
                                    <p className="font-bold text-lg">{domain}/join</p>
                                    <p className="text-sm text-muted-foreground">Code: <span className="font-bold text-foreground">{presentation.id.slice(0, 4)}</span></p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleReset}>
                        <Trash2 className="h-4 w-4 mr-2" /> Reset
                    </Button>
                    <div className="h-6 w-px bg-border mx-2" />
                    <Button variant={showLeaderboard ? "default" : "outline"} size="sm" onClick={() => setShowLeaderboard(!showLeaderboard)}>
                        Leaderboard
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                        <Share2 className="h-4 w-4" /> Share
                    </Button>
                    <Button size="sm" className="gap-2" onClick={handleFullscreen}>
                        <Maximize2 className="h-4 w-4" /> Fullscreen
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden relative">
                {showLeaderboard ? (
                    <div className="w-full max-w-2xl bg-card border rounded-xl shadow-lg p-6 animate-in fade-in zoom-in duration-300">
                        <h2 className="text-3xl font-bold text-center mb-8">Leaderboard</h2>
                        <div className="space-y-4">
                            {leaderboard.map((entry, index) => (
                                <div key={entry.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                                            index === 1 ? 'bg-gray-400 text-white' :
                                                index === 2 ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-lg">{entry.name}</span>
                                    </div>
                                    <span className="font-mono font-bold text-xl">{entry.score} pts</span>
                                </div>
                            ))}
                            {leaderboard.length === 0 && (
                                <p className="text-center text-muted-foreground">No scores yet.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center break-words max-w-4xl">
                            {currentSlide.question}
                        </h1>

                        <div className="w-full max-w-5xl h-[500px]">
                            {phase === 'reading' ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-xl animate-pulse">
                                    Reading time...
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={results} margin={{ top: 60, right: 20, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 16, fontWeight: 600, fill: '#666' }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Bar dataKey="votes" radius={[8, 8, 0, 0]} animationDuration={1000}>
                                            {results.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                            <LabelList
                                                dataKey="votes"
                                                position="top"
                                                content={(props: any) => {
                                                    const { x, y, width, value, index, height } = props
                                                    const result = results[index]
                                                    return (
                                                        <g>
                                                            {result?.isCorrect !== undefined && (
                                                                <text x={x + width / 2} y={y - 15} textAnchor="middle" fontSize={24}>
                                                                    {result.isCorrect ? '✅' : '❌'}
                                                                </text>
                                                            )}
                                                            {value > 0 && (
                                                                <text x={x + width / 2} y={y + 25} fill="#fff" textAnchor="middle" fontSize={20} fontWeight="bold">
                                                                    {value}
                                                                </text>
                                                            )}
                                                        </g>
                                                    )
                                                }}
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Footer Controls */}
            <div className="h-16 border-t flex items-center justify-between px-4 bg-muted/10">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentSlideIndex === 0}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <span className="text-sm font-medium">Slide {currentSlideIndex + 1} / {presentation.slides.length}</span>
                    <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentSlideIndex === presentation.slides.length - 1}>
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Join at <strong>{domain}</strong> use code <strong>{presentation.id.slice(0, 4)}</strong></span>
                </div>
            </div>
        </div>
    )
}
