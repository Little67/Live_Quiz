import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, X, AlignLeft, AlignCenter, AlignRight, Type, Palette } from 'lucide-react'

interface Slide {
    id: string
    type: string
    question: string
    fontSize?: number
    duration?: number
    enableReadingTimer?: boolean
    readingDuration?: number
    maxPoints?: number
    textAlign?: 'left' | 'center' | 'right'
    textColor?: string
    backgroundColor?: string
    options?: { id: string; text: string; isCorrect?: boolean }[]
}

interface SettingsSidebarProps {
    slide: Slide
    onUpdate: (updates: Partial<Slide>) => void
    onApplyToAll?: (updates: Partial<Slide>) => void
}

export function SettingsSidebar({ slide, onUpdate, onApplyToAll }: SettingsSidebarProps) {
    const handleOptionChange = (id: string, text: string) => {
        const newOptions = slide.options?.map(opt =>
            opt.id === id ? { ...opt, text } : opt
        ) || []
        onUpdate({ options: newOptions })
    }

    const addOption = () => {
        const newOption = { id: Math.random().toString(), text: '' }
        onUpdate({ options: [...(slide.options || []), newOption] })
    }

    const removeOption = (id: string) => {
        const newOptions = slide.options?.filter(opt => opt.id !== id) || []
        onUpdate({ options: newOptions })
    }

    return (
        <div className="w-80 border-l bg-background flex flex-col h-full">
            <Tabs defaultValue="content" className="w-full h-full flex flex-col">
                <div className="p-4 border-b">
                    <TabsList className="w-full">
                        <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
                        <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="content" className="flex-1 overflow-auto p-4 space-y-6">
                    <div className="space-y-2">
                        <Label>Slide Type</Label>
                        <Select
                            value={slide.type}
                            onValueChange={(value) => onUpdate({ type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="word_cloud">Word Cloud</SelectItem>
                                <SelectItem value="heading">Heading</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Question</Label>
                        <Input
                            value={slide.question}
                            onChange={(e) => onUpdate({ question: e.target.value })}
                            placeholder="What would you like to ask?"
                        />
                    </div>

                    {slide.type === 'multiple_choice' && (
                        <div className="space-y-4">
                            <Label>Options</Label>
                            <div className="space-y-2">
                                {slide.options?.map((option) => (
                                    <div key={option.id} className="flex gap-2 items-center">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={option.text}
                                                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                                    placeholder="Option text"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeOption(option.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={`correct-${option.id}`}
                                                    checked={option.isCorrect}
                                                    onChange={(e) => {
                                                        const newOptions = slide.options?.map(opt =>
                                                            opt.id === option.id ? { ...opt, isCorrect: e.target.checked } : opt
                                                        ) || []
                                                        onUpdate({ options: newOptions })
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor={`correct-${option.id}`} className="text-xs text-muted-foreground font-normal">
                                                    Correct Answer
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={addOption} className="w-full gap-2">
                                <Plus className="h-4 w-4" /> Add Option
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="design" className="p-4 space-y-6 overflow-auto">
                    <div className="space-y-2">
                        <Label>Text Alignment</Label>
                        <div className="flex bg-muted rounded-md p-1">
                            <Button
                                variant={slide.textAlign === 'left' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="flex-1"
                                onClick={() => onUpdate({ textAlign: 'left' })}
                            >
                                <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={slide.textAlign === 'center' || !slide.textAlign ? 'secondary' : 'ghost'}
                                size="sm"
                                className="flex-1"
                                onClick={() => onUpdate({ textAlign: 'center' })}
                            >
                                <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={slide.textAlign === 'right' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="flex-1"
                                onClick={() => onUpdate({ textAlign: 'right' })}
                            >
                                <AlignRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Colors</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Type className="h-3 w-3" /> Text Color
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={slide.textColor || '#000000'}
                                        onChange={(e) => onUpdate({ textColor: e.target.value })}
                                        className="w-10 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={slide.textColor || '#000000'}
                                        onChange={(e) => onUpdate({ textColor: e.target.value })}
                                        className="flex-1 font-mono text-xs"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Palette className="h-3 w-3" /> Background
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={slide.backgroundColor || '#ffffff'}
                                        onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                                        className="w-10 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={slide.backgroundColor || '#ffffff'}
                                        onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                                        className="flex-1 font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Font Size (px)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                value={slide.fontSize || 36}
                                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 36 })}
                                min={12}
                                max={120}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Duration (seconds)</Label>
                        <Input
                            type="number"
                            value={slide.duration || 15}
                            onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || 15 })}
                            min={5}
                            max={300}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Max Points</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={slide.maxPoints || 1000}
                                onChange={(e) => onUpdate({ maxPoints: parseInt(e.target.value) || 1000 })}
                                min={0}
                                max={10000}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onApplyToAll && onApplyToAll({ maxPoints: slide.maxPoints || 1000 })}
                                title="Apply to all slides"
                            >
                                Apply All
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="reading-timer"
                                checked={slide.enableReadingTimer || false}
                                onChange={(e) => onUpdate({ enableReadingTimer: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="reading-timer">Enable Reading Timer</Label>
                        </div>

                        {slide.enableReadingTimer && (
                            <div className="space-y-2 pl-6">
                                <Label>Reading Duration (seconds)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={slide.readingDuration || 5}
                                        onChange={(e) => onUpdate({ readingDuration: parseInt(e.target.value) || 5 })}
                                        min={3}
                                        max={60}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onApplyToAll && onApplyToAll({
                                            enableReadingTimer: true,
                                            readingDuration: slide.readingDuration || 5
                                        })}
                                        title="Apply to all slides"
                                    >
                                        Apply All
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
