import { Card } from '@/components/ui/card'

interface Slide {
    id: string
    type: string
    question: string
    fontSize?: number
    textAlign?: 'left' | 'center' | 'right'
    textColor?: string
    backgroundColor?: string
    options?: { id: string; text: string; isCorrect?: boolean }[]
}

interface EditorPreviewProps {
    slide: Slide
    onUpdate: (updates: Partial<Slide>) => void
}

export function EditorPreview({ slide, onUpdate }: EditorPreviewProps) {
    const handleOptionChange = (id: string, text: string) => {
        const newOptions = slide.options?.map(opt =>
            opt.id === id ? { ...opt, text } : opt
        ) || []
        onUpdate({ options: newOptions })
    }

    return (
        <div className="flex-1 bg-muted/30 p-8 flex items-center justify-center overflow-auto">
            <div
                className="w-full max-w-4xl aspect-video rounded-xl shadow-sm border flex flex-col p-8 transition-colors"
                style={{
                    backgroundColor: slide.backgroundColor || '#ffffff',
                    color: slide.textColor || '#000000'
                }}
            >
                <div className="h-full flex flex-col">
                    <input
                        className="font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/50 rounded px-2 w-full mb-8"
                        style={{
                            fontSize: `${slide.fontSize || 36}px`,
                            textAlign: slide.textAlign || 'center'
                        }}
                        value={slide.question || ""}
                        onChange={(e) => onUpdate({ question: e.target.value })}
                        placeholder="Your Question Here"
                    />

                    {slide.type === 'multiple_choice' && (
                        <div className="grid gap-4 max-w-2xl mx-auto w-full mt-auto mb-auto">
                            {slide.options?.map((option) => (
                                <div
                                    key={option.id}
                                    className="p-4 rounded-lg border-2 border-current/20 bg-current/5 text-left font-medium flex items-center gap-2"
                                >
                                    <input
                                        className="bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/50 rounded px-1 w-full"
                                        value={option.text || ""}
                                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                        placeholder="Option"
                                    />
                                    {option.isCorrect && (
                                        <span className="ml-2 text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full shrink-0 font-bold">
                                            Correct
                                        </span>
                                    )}
                                </div>
                            ))}
                            {(!slide.options || slide.options.length === 0) && (
                                <div className="text-center opacity-50 italic">
                                    Add options in the sidebar
                                </div>
                            )}
                        </div>
                    )}

                    {slide.type === 'word_cloud' && (
                        <div className="flex-1 flex flex-wrap items-center justify-center gap-4 opacity-50">
                            <span className="text-2xl">Word Cloud</span>
                            <span className="text-xl">Visualization</span>
                            <span className="text-3xl">Preview</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
