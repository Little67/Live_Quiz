'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/Navbar'

export default function JoinPage() {
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const router = useRouter()

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault()
        if (code.trim() && name.trim()) {
            // Save name to session storage or pass via query param
            sessionStorage.setItem('voterName', name)
            router.push(`/join/${code}`)
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center bg-muted/30">
                <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-xl shadow-sm border">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold">Join Presentation</h1>
                        <p className="text-muted-foreground">Enter your name and the code to join</p>
                    </div>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Code (e.g. 1234)"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="text-center text-lg tracking-widest h-12"
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 text-lg" disabled={!code.trim() || !name.trim()}>
                            Join
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
