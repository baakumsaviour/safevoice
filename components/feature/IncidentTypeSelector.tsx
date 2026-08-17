'use client'

import { ShieldAlert, Home, HeartHandshake, Users, MessageSquareWarning, HelpCircle } from 'lucide-react'

export interface IncidentType {
  value: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export const INCIDENT_TYPES: IncidentType[] = [
  {
    value: 'domestic_violence',
    label: 'Domestic Violence',
    description: 'Abuse or intimidation by a partner, spouse, or family member within the home.',
    icon: Home,
  },
  {
    value: 'child_abuse',
    label: 'Child Abuse',
    description: 'Physical, emotional, or sexual harm, or neglect involving a minor or child.',
    icon: HeartHandshake,
  },
  {
    value: 'gbv',
    label: 'Gender-Based Violence (GBV)',
    description: 'Harm directed at an individual based on gender, sexual assault, or coercion.',
    icon: Users,
  },
  {
    value: 'harassment',
    label: 'Harassment & Stalking',
    description: 'Persistent unwanted attention, stalking, cyberbullying, or verbal intimidation.',
    icon: MessageSquareWarning,
  },
  {
    value: 'general_abuse',
    label: 'General Abuse',
    description: 'Physical violence, exploitation, discrimination, or other harmful incidents.',
    icon: ShieldAlert,
  },
  {
    value: 'other',
    label: 'Other Concern',
    description: 'Any other safety or well-being concern not listed above. You are in control.',
    icon: HelpCircle,
  },
]

interface IncidentTypeSelectorProps {
  selectedType: string
  onSelect: (value: string) => void
}

export function IncidentTypeSelector({ selectedType, onSelect }: IncidentTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="body-lg-strong text-ink mb-1">What type of incident would you like to report?</h3>
        <p className="body-sm text-body">
          Select the option that best matches what happened. If you are unsure, you can choose "General Abuse" or "Other Concern".
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INCIDENT_TYPES.map((type) => {
          const Icon = type.icon
          const isSelected = selectedType === type.value

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onSelect(type.value)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 cursor-pointer relative ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-canvas hover:border-ink/30 hover:bg-canvas-soft'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-primary text-on-primary' : 'bg-canvas-soft text-ink border border-border'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`body-md-strong ${isSelected ? 'text-primary' : 'text-ink'}`}>
                    {type.label}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="body-sm text-body line-clamp-2 leading-relaxed">
                  {type.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
