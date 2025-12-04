import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://live-quiz-app.vercel.app'),
  title: {
    default: "LiveQuiz - Interactive Presentations & Real-time Polls",
    template: "%s | LiveQuiz"
  },
  description: "Engage your audience with real-time polls, quizzes, and word clouds. The best free alternative to Mentimeter for interactive presentations.",
  applicationName: "LiveQuiz",
  authors: [{ name: "Krutibas Dwibedi", url: "https://github.com/Little67" }],
  keywords: ["interactive presentation", "live poll", "quiz maker", "word cloud", "audience engagement", "real-time voting", "mentimeter alternative"],
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "LiveQuiz - Interactive Presentations & Real-time Polls",
    description: "Engage your audience with real-time polls, quizzes, and word clouds. Get instant feedback and visualize results live.",
    siteName: "LiveQuiz",
    images: [
      {
        url: "/og-image.png", // We might need to create this later, but good to have the slot
        width: 1200,
        height: 630,
        alt: "LiveQuiz Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LiveQuiz - Interactive Presentations & Real-time Polls",
    description: "Engage your audience with real-time polls, quizzes, and word clouds.",
    creator: "@krutibas", // Placeholder, can be updated if user has a handle
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
