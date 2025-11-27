import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreVertical, Play, Edit, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Presentation {
    id: string
    title: string
    updatedAt: string
    slideCount: number
}

interface PresentationCardProps {
    presentation: Presentation
    onDelete?: (id: string) => void
}

export function PresentationCard({ presentation, onDelete }: PresentationCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {presentation.title}
                </CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(presentation.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{presentation.slideCount} slides</div>
                <p className="text-xs text-muted-foreground">
                    Updated {presentation.updatedAt}
                </p>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                    <Link href={`/present/${presentation.id}`}>
                        <Play className="h-4 w-4" /> Present
                    </Link>
                </Button>
                <Button size="sm" className="gap-2" asChild>
                    <Link href={`/editor/${presentation.id}`}>
                        <Edit className="h-4 w-4" /> Edit
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
