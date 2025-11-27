'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PresentationCard } from '@/components/PresentationCard'
import { Plus } from 'lucide-react'
import { NewPresentationButton } from '@/components/dashboard/NewPresentationButton'
import { useEffect, useState } from 'react'
import { getPresentations, deletePresentation } from '@/lib/storage'

// Mock data for now
const presentations = [
    { id: '1', title: 'Weekly Standup', updatedAt: '2 hours ago', slideCount: 5 },
    { id: '2', title: 'Q4 Roadmap', updatedAt: '1 day ago', slideCount: 12 },
    { id: '3', title: 'Team Quiz', updatedAt: '3 days ago', slideCount: 8 },
]

export default function DashboardPage() {
    const [presentations, setPresentations] = useState<any[]>([])

    const loadPresentations = async () => {
        const data = await getPresentations()
        setPresentations(data)
    }

    useEffect(() => {
        loadPresentations()
        // We can add Supabase realtime subscription here later for auto-updates
        // For now, we rely on manual refresh or action-triggered refresh
    }, [])

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this presentation?')) {
            await deletePresentation(id)
            loadPresentations()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Presentations</h1>
                <NewPresentationButton />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {presentations.map((presentation) => (
                    <PresentationCard
                        key={presentation.id}
                        presentation={presentation}
                        onDelete={handleDelete}
                    />
                ))}
                {presentations.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No presentations yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    )
}
