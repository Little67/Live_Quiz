'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { CheckCircle2, Loader2, Eye, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getPresentationByCode, getActiveSession, saveVote, getVotesForSlide, ActiveSession, Slide, Presentation } from '@/lib/storage'

export default function VotingPage() {
    const params = useParams()
    const [activeSession, setActiveSessionState] = useState<ActiveSession | null>(null)
    const [currentSlide, setCurrentSlide] = useState<Slide | null>(null)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [voterName, setVoterName] = useState('')
    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        const name = sessionStorage.getItem('voterName')
        if (name) setVoterName(name)
    }, [])

    // 1. Resolve Presentation ID from Code
    useEffect(() => {
        const loadPresentation = async () => {
            if (params.code) {
                const pres = await getPresentationByCode(params.code as string)
                if (pres) {
                    setPresentation(pres)
                } else {
                    setError('Invalid code. Presentation not found.')
                }
            }
        }
        loadPresentation()
    }, [params.code])

    // 2. Subscribe to Session Updates
    useEffect(() => {
        if (!presentation) return

        const checkSession = async () => {
            const session = await getActiveSession(presentation.id)
            handleSessionData(session)
        }

        const handleSessionData = async (session: ActiveSession | null) => {
            if (session) {
                setActiveSessionState(session)

                // Find slide in already loaded presentation
                const slide = presentation.slides.find(s => s.id === session.slideId)

                if (slide) {
                    if (currentSlide?.id !== slide.id) {
                        // New slide, reset state
                        setCurrentSlide(slide)
                        setSelectedOption(null)

                        // Check if already voted
                        const votes = await getVotesForSlide(session.presentationId, slide.id)
                        const hasVoted = votes.some(v => v.voterName === (sessionStorage.getItem('voterName') || voterName))
                        setSubmitted(hasVoted)
                    } else if (!submitted) {
                        // Double check if voted
                        const votes = await getVotesForSlide(session.presentationId, slide.id)
                        const hasVoted = votes.some(v => v.voterName === (sessionStorage.getItem('voterName') || voterName))
                        if (hasVoted) setSubmitted(true)
                    }
                }
            } else {
                setActiveSessionState(null)
                // Don't clear current slide immediately to avoid flickering? 
                // Or maybe show "Waiting" screen.
                // setCurrentSlide(null) 
            }
        }

        checkSession()

        // Realtime Subscription
        const channel = supabase
            .channel('realtime-session')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'active_sessions',
                    filter: `presentation_id=eq.${presentation.id}`
                },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        setActiveSessionState(null)
                    } else {
                        // Payload.new has the data, but keys are snake_case. 
                        // Easier to just refetch or map it manually.
                        // Let's refetch for simplicity and consistency.
                        checkSession()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [presentation, currentSlide, submitted, voterName])

    const handleSubmit = async () => {
        if (activeSession && currentSlide && selectedOption) {
            // Strict phase check
            if (activeSession.phase !== 'voting') {
                alert('Voting is not currently open.')
                return
            }

            await saveVote({
                presentationId: activeSession.presentationId,
                slideId: currentSlide.id,
                optionId: selectedOption,
                voterName: voterName,
                timestamp: Date.now(),
                timeTaken: Date.now() - activeSession.startTime
            })
            setSubmitted(true)
        }
    }

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const name = (form.elements.namedItem('name') as HTMLInputElement).value
        if (name.trim()) {
            setVoterName(name.trim())
            sessionStorage.setItem('voterName', name.trim())
        }
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
                    <XCircle className="h-10 w-10 text-red-500" />
                    <h1 className="text-2xl font-bold">Error</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <Button variant="outline" onClick={() => window.location.href = '/join'}>Try Again</Button>
                </div>
            </div>
        )
    }

    if (!voterName) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold">Welcome!</h1>
                        <p className="text-muted-foreground">Please enter your name to join the presentation.</p>
                    </div>
                    <form onSubmit={handleNameSubmit} className="w-full space-y-4">
                        <div className="space-y-2">
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                                autoFocus
                            />
                        </div>
                        <Button type="submit" className="w-full">Join Presentation</Button>
                    </form>
                </div>
            </div>
        )
    }

    if (!activeSession || !currentSlide) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <h1 className="text-2xl font-bold">Waiting for presenter...</h1>
                    <p className="text-muted-foreground">The presentation hasn't started or is paused.</p>
                </div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold">Vote Submitted!</h1>
                    <p className="text-muted-foreground">Waiting for the next slide...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 space-y-8 pt-12">
                {activeSession.phase !== 'ready' && (
                    <h1 className="text-2xl font-bold text-center">{currentSlide.question}</h1>
                )}

                {activeSession.phase === 'finished' && !submitted ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500 py-12">
                        <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">Time's Up!</h2>
                            <p className="text-muted-foreground">You didn't answer in time.</p>
                        </div>
                    </div>
                ) : activeSession.phase === 'reading' ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500 py-12">
                        <div className="flex items-center justify-center gap-2 text-lg font-medium text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Voting starts soon...</span>
                        </div>
                    </div>
                ) : activeSession.phase === 'ready' ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500 py-12">
                        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">Get Ready!</h2>
                            <p className="text-muted-foreground">Presenter is preparing the slide...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {currentSlide.options?.map((option) => (
                                <Button
                                    key={option.id}
                                    variant={selectedOption === option.id ? "default" : "outline"}
                                    className={`w-full h-14 text-lg justify-start px-6 ${selectedOption === option.id ? 'ring-2 ring-primary ring-offset-2' : ''
                                        }`}
                                    onClick={() => setSelectedOption(option.id)}
                                >
                                    {option.text}
                                </Button>
                            ))}
                        </div>

                        <Button
                            size="lg"
                            className="w-full"
                            disabled={!selectedOption}
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                    </>
                )}
            </div>
        </div>

    )
}
