'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { stashDraft, restoreDraft, purgeDraft } from '@/lib/client/draftVault'
import { CalculatorDisguise } from './CalculatorDisguise'

interface StealthContextType {
  isCamouflaged: boolean
  activateCamouflage: () => Promise<void>
  deactivateCamouflage: () => Promise<void>
  panicWipe: () => void
  unlockPin: string
  setUnlockPin: (pin: string) => void
  alwaysCamouflageOnLaunch: boolean
  setAlwaysCamouflageOnLaunch: (val: boolean) => void
}

const StealthContext = createContext<StealthContextType | null>(null)

const DEFAULT_PIN = '1984'
const STORAGE_PIN_KEY = 'safevoice_stealth_pin'
const STORAGE_ALWAYS_KEY = 'safevoice_always_stealth'

export function StealthProvider({ children }: { children: React.ReactNode }) {
  const [isCamouflaged, setIsCamouflaged] = useState<boolean>(false)
  const [unlockPin, setUnlockPinState] = useState<string>(DEFAULT_PIN)
  const [alwaysCamouflageOnLaunch, setAlwaysCamouflageState] = useState<boolean>(false)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  // Store original tab metadata
  const originalTitleRef = useRef<string>('')
  const originalFaviconRef = useRef<string>('/icon.svg')

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem(STORAGE_PIN_KEY)
      if (savedPin && /^\d{4,8}$/.test(savedPin)) {
        setUnlockPinState(savedPin)
      }

      const savedAlways = localStorage.getItem(STORAGE_ALWAYS_KEY) === 'true'
      setAlwaysCamouflageState(savedAlways)

      // Capture initial page title and favicon
      originalTitleRef.current = document.title || 'SafeVoice Ghana'
      const iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null
      if (iconLink?.href) {
        originalFaviconRef.current = iconLink.href
      }

      // Check URL param ?stealth=true or alwaysCamouflage preference
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('stealth') === 'true' || savedAlways) {
        setIsCamouflaged(true)
        document.title = 'QuickCalc - Calculator'
        updateFavicon('/icons/calc.svg')
        window.history.replaceState(null, '', '/')
      }
    } catch {
      // Graceful fallback if storage restricted
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const updateFavicon = (href: string) => {
    try {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = href
    } catch {
      // Ignore head manipulation errors
    }
  }

  const activateCamouflage = useCallback(async () => {
    try {
      // 1. Securely stash active form inputs into ephemeral in-memory AES-GCM vault
      await stashDraft()

      // 2. Tab & metadata spoofing
      originalTitleRef.current = document.title || 'SafeVoice Ghana'
      document.title = 'QuickCalc - Calculator'
      updateFavicon('/icons/calc.svg')
      window.history.replaceState(null, '', '/')

      // 3. Switch state to camouflage
      setIsCamouflaged(true)
    } catch (err) {
      console.error('[StealthContext] Error activating camouflage:', err)
      setIsCamouflaged(true)
    }
  }, [])

  const deactivateCamouflage = useCallback(async () => {
    try {
      setIsCamouflaged(false)

      // Restore title and favicon
      document.title = originalTitleRef.current || 'SafeVoice Ghana | Crisis Support & Reporting'
      updateFavicon(originalFaviconRef.current || '/icon.svg')

      // Restore stashed draft if available
      await restoreDraft()
    } catch (err) {
      console.error('[StealthContext] Error restoring from camouflage:', err)
    }
  }, [])

  const panicWipe = useCallback(() => {
    // 1. Purge ephemeral in-memory vault
    purgeDraft()

    // 2. Clear browser session storage
    try {
      sessionStorage.clear()
    } catch {
      // Ignore
    }

    // 3. Reset title to neutral Google
    document.title = 'Google'
  }, [])

  const setUnlockPin = useCallback((pin: string) => {
    if (/^\d{4,8}$/.test(pin)) {
      setUnlockPinState(pin)
      try {
        localStorage.setItem(STORAGE_PIN_KEY, pin)
      } catch {
        // Ignore
      }
    }
  }, [])

  const setAlwaysCamouflageOnLaunch = useCallback((val: boolean) => {
    setAlwaysCamouflageState(val)
    try {
      localStorage.setItem(STORAGE_ALWAYS_KEY, val ? 'true' : 'false')
    } catch {
      // Ignore
    }
  }, [])

  // Keyboard shortcut: Press Escape twice within 1 second to trigger camouflage
  useEffect(() => {
    let escCount = 0
    let lastEscTime = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const now = Date.now()
        escCount = now - lastEscTime < 1000 ? escCount + 1 : 1
        lastEscTime = now

        if (escCount >= 2) {
          if (!isCamouflaged) {
            activateCamouflage()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCamouflaged, activateCamouflage])

  return (
    <StealthContext.Provider
      value={{
        isCamouflaged,
        activateCamouflage,
        deactivateCamouflage,
        panicWipe,
        unlockPin,
        setUnlockPin,
        alwaysCamouflageOnLaunch,
        setAlwaysCamouflageOnLaunch,
      }}
    >
      {/* Zero-DOM-Leakage: SafeVoice UI is hidden from view when camouflaged */}
      <div style={{ display: isCamouflaged ? 'none' : 'contents' }} aria-hidden={isCamouflaged}>
        {children}
      </div>

      {/* Calculator Disguise Overlay */}
      {isCamouflaged && (
        <CalculatorDisguise
          onUnlock={deactivateCamouflage}
          onPanicWipe={panicWipe}
          unlockPin={unlockPin}
        />
      )}
    </StealthContext.Provider>
  )
}

export function useStealth(): StealthContextType {
  const context = useContext(StealthContext)
  if (!context) {
    throw new Error('useStealth must be used within a StealthProvider')
  }
  return context
}
