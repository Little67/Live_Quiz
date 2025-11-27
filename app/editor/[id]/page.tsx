'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { SlideSidebar } from '@/components/editor/SlideSidebar'
import { Button } from '@/components/ui/button'
import { EditorPreview } from '@/components/editor/EditorPreview'
import { SettingsSidebar } from '@/components/editor/SettingsSidebar'

import { getPresentation, savePresentation } from '@/lib/storage'

// Mock initial data
const initialSlides = [
    {
        id: '1',
        type: 'multiple_choice',
        title: 'Question 1',
        question: 'What is your favorite color?',
        options: [
            { id: 'o1', text: 'Red' },
            { id: 'o2', text: 'Blue' },
            { id: 'o3', text: 'Green' }
        ]
    },
    {
        id: '2',
        type: 'word_cloud',
        title: 'Word Cloud',
        question: 'Describe yourself in one word',
        options: []
    }
]

export default function EditorPage() {
    const params = useParams()
    const [slides, setSlides] = useState<any[]>([])
    const [activeSlideId, setActiveSlideId] = useState('')
    const [title, setTitle] = useState('Untitled Presentation')

    useEffect(() => {
        const loadPresentation = async () => {
            if (params.id) {
                const presentation = await getPresentation(params.id as string)
                if (presentation) {
                    setSlides(presentation.slides)
                    setTitle(presentation.title)
                    if (presentation.slides.length > 0) {
                        setActiveSlideId(presentation.slides[0].id)
                    }
                } else {
                    // If not found, maybe redirect or show error. 
                    // For now, let's just show empty state or redirect.
                    // alert('Presentation not found')
                    // window.location.href = '/dashboard'
                }
            }
        }
        loadPresentation()
    }, [params.id])

    const handleSave = async () => {
        if (params.id) {
            await savePresentation({
                id: params.id as string,
                title,
                updatedAt: new Date().toISOString(),
                slideCount: slides.length,
                slides
            })
            alert('Presentation saved!')
        }
    }

    const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0]

    const handleSlideSelect = (id: string) => {
        setActiveSlideId(id)
    }

    const handleAddSlide = () => {
        const newSlide = {
            id: crypto.randomUUID(),
            type: 'multiple_choice',
            title: `Slide ${slides.length + 1}`,
            question: '',
            enableReadingTimer: true,
            readingDuration: 5,
            options: []
        }
        setSlides([...slides, newSlide])
        setActiveSlideId(newSlide.id)
    }

    const handleDeleteSlide = (id: string) => {
        if (slides.length === 1) return // Prevent deleting last slide
        const newSlides = slides.filter(s => s.id !== id)
        setSlides(newSlides)
        if (activeSlideId === id) {
            setActiveSlideId(newSlides[0].id)
        }
    }

    const handleUpdateSlide = (updates: any) => {
        setSlides(slides.map(s =>
            s.id === activeSlideId ? { ...s, ...updates } : s
        ))
    }

    const handleApplyToAll = (updates: any) => {
        setSlides(slides.map(s => ({ ...s, ...updates })))
        alert('Applied to all slides!')
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <div className="border-b bg-background p-4 flex items-center justify-between">
                <div className="font-bold text-lg">{title}</div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.history.back()}>Exit</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </div>
            {!activeSlide ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading presentation...</p>
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    <SlideSidebar
                        slides={slides}
                        activeSlideId={activeSlideId}
                        onSlideSelect={handleSlideSelect}
                        onAddSlide={handleAddSlide}
                        onDeleteSlide={handleDeleteSlide}
                    />
                    <EditorPreview
                        slide={activeSlide}
                        onUpdate={handleUpdateSlide}
                    />
                    <SettingsSidebar
                        slide={activeSlide}
                        onUpdate={handleUpdateSlide}
                        onApplyToAll={handleApplyToAll}
                    />
                </div>
            )}
        </div>
    )
}
