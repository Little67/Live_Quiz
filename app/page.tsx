import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { ArrowRight, BarChart2, Users, Zap } from 'lucide-react'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Interactive presentations, <br />
              <span className="text-primary">made easy.</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Engage your audience with real-time polls, quizzes, and word clouds.
              Get instant feedback and visualize results live.
            </p>
            <div className="space-x-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/dashboard">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/join">
                  Join a Presentation
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <BarChart2 className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Real-time Polls</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize audience opinions instantly with dynamic charts.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Users className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Audience Q&A</h3>
                  <p className="text-sm text-muted-foreground">
                    Let your audience ask questions and upvote the best ones.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Zap className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Instant Feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Gather insights and measure engagement in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
