import { ReportForm } from '@/components/feature/ReportForm'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Submit a Report',
  description: 'Secure, anonymous incident reporting.',
}

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-canvas pb-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
                  <Image src="/safevoice logo.png" alt="SafeVoice Logo" width={28} height={28} className="object-contain" />
                </div>
                <span className="body-md-strong text-ink">SafeVoice</span>
              </div>
            </Link>
            <Link href="/auth/login">
              <button className="bg-primary/10 text-primary body-sm py-2 px-6 rounded-full hover:bg-primary/20 transition-colors cursor-pointer">
                Login / Sign Up
              </button>
            </Link>
          </div>
          <h1 className="display-sm text-ink mb-2">Submit a Report</h1>
          <p className="body-md text-body">
            You are safe here. Share as much or as little as you'd like. Your information is encrypted.
          </p>
        </header>

        {/* Client-side multistep form */}
        <ReportForm />
      </div>
    </main>
  )
}
