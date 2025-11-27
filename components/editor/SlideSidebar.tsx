import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Slide {
    id: string
    type: string
    title: string
}

interface SlideSidebarProps {
    slides: Slide[]
    activeSlideId: string
    onSlideSelect: (id: string) => void
    onAddSlide: () => void
    onDeleteSlide: (id: string) => void
}

export function SlideSidebar({
    slides,
    activeSlideId,
    onSlideSelect,
    onAddSlide,
    onDeleteSlide,
}: SlideSidebarProps) {
    return (
        <div className="w-64 border-r bg-muted/10 flex flex-col h-full">
            <div className="p-4 border-b">
                <Button onClick={onAddSlide} className="w-full gap-2">
                    <Plus className="h-4 w-4" /> New Slide
                </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={cn(
                                "group relative flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors",
                                activeSlideId === slide.id ? "bg-muted border-primary" : "bg-background"
                            )}
                            onClick={() => onSlideSelect(slide.id)}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="text-muted-foreground text-sm font-medium w-4">
                                    {index + 1}
                                </span>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-medium truncate">
                                        {slide.title || "Untitled Slide"}
                                    </span>
                                    <span className="text-xs text-muted-foreground capitalize">
                                        {slide.type.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteSlide(slide.id)
                                }}
                            >
                                <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
