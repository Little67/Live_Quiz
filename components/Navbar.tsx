'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
    const { user, logout } = useAuth()

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-6">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    <span>LiveQuiz</span>
                </Link>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Add search or other nav items here */}
                    </div>
                    <nav className="flex items-center gap-2">
                        {user ? (
                            <>
                                <div className="flex items-center gap-2 mr-2 text-sm font-medium">
                                    <User className="h-4 w-4" />
                                    {user.user_metadata?.name || user.email}
                                </div>
                                <Button variant="ghost" asChild>
                                    <Link href="/dashboard">Dashboard</Link>
                                </Button>
                                <Button variant="outline" onClick={logout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/signup">Sign up</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </nav>
    )
}
