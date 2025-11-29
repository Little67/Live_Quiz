import Link from 'next/link'
import { Github, Linkedin } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="w-full border-t bg-background py-6 mt-24">
            <div className="w-full max-w-[95%] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
                <div className="text-center md:text-left">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} LiveQuiz. Built with ❤️ by <Link href="https://kruti.vercel.app/" target="_blank" rel="noreferrer" className="font-medium text-foreground hover:underline">Krutibas Dwibedi</Link>
                    </p>
                </div>

                <div className="flex gap-6 items-center">
                    <Link
                        href="https://github.com/Little67"
                        target="_blank"
                        rel="noreferrer"
                        className="group flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <Github className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="sr-only">GitHub</span>
                    </Link>
                    <Link
                        href="https://linkedin.com/in/krutibas-dwibedi"
                        target="_blank"
                        rel="noreferrer"
                        className="group flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <Linkedin className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="sr-only">LinkedIn</span>
                    </Link>
                </div>
            </div>
        </footer>
    )
}
