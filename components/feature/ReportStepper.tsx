'use client'

import { Check } from 'lucide-react'

export interface StepItem {
  id: number
  label: string
  description?: string
}

interface ReportStepperProps {
  currentStep: number
  steps: StepItem[]
  onStepClick?: (stepNumber: number) => void
}

export function ReportStepper({ currentStep, steps, onStepClick }: ReportStepperProps) {
  return (
    <div className="w-full mb-8">
      {/* Mobile progress indicator */}
      <div className="block md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="caption-strong text-primary uppercase">
            Step {currentStep} of {steps.length}
          </span>
          <span className="body-sm-strong text-ink">
            {steps.find((s) => s.id === currentStep)?.label}
          </span>
        </div>
        <div className="w-full bg-canvas border border-border rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop stepper */}
      <div className="hidden md:flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isClickable = isCompleted && onStepClick

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div
                onClick={() => isClickable && onStepClick(step.id)}
                className={`flex items-center gap-3 ${
                  isClickable ? 'cursor-pointer group' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm transition-colors border-2 ${
                    isCompleted
                      ? 'bg-primary border-primary text-on-primary group-hover:opacity-90'
                      : isCurrent
                      ? 'bg-canvas border-primary text-primary font-bold shadow-sm'
                      : 'bg-canvas-soft border-border text-body'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div>
                  <p
                    className={`body-sm-strong transition-colors ${
                      isCurrent ? 'text-ink font-semibold' : isCompleted ? 'text-ink group-hover:text-primary' : 'text-body'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="caption text-body hidden lg:block">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connecting line between steps */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
