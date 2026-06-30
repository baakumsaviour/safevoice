import { ReportForm } from '@/components/feature/ReportForm'

export const metadata = {
  title: 'Submit a Report',
  description: 'Secure, anonymous incident reporting.',
}

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-canvas pb-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <header className="mb-8">
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
