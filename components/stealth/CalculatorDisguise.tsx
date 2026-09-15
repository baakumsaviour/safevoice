'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface CalculatorDisguiseProps {
  onUnlock: () => void
  onPanicWipe: () => void
  unlockPin?: string
}

export function CalculatorDisguise({
  onUnlock,
  onPanicWipe,
  unlockPin = '1984',
}: CalculatorDisguiseProps) {
  const [displayValue, setDisplayValue] = useState<string>('0')
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false)
  const [historyLine, setHistoryLine] = useState<string>('')

  // Covert header long-press trigger
  const [showCovertDialog, setShowCovertDialog] = useState(false)
  const [dialogPin, setDialogPin] = useState('')
  const [dialogError, setDialogError] = useState(false)
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Safe floating point calculation
  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '×':
      case '*':
        return a * b
      case '÷':
      case '/':
        if (b === 0) return NaN
        return a / b
      default:
        return b
    }
  }

  const formatResult = (val: number): string => {
    if (isNaN(val)) return 'Error'
    if (!isFinite(val)) return 'Error'
    // Trim precision artifacts like 0.30000000000000004
    const str = parseFloat(val.toPrecision(12)).toString()
    return str.length > 12 ? val.toExponential(6) : str
  }

  // Handle digit / decimal entry
  const handleDigit = useCallback((digit: string) => {
    setDisplayValue((curr) => {
      if (waitingForOperand) {
        setWaitingForOperand(false)
        return digit
      }
      if (curr === '0' || curr === 'Error') {
        return digit
      }
      if (curr.replace(/[^0-9]/g, '').length >= 12) {
        return curr // limit 12 digits
      }
      return curr + digit
    })
  }, [waitingForOperand])

  const handleDecimal = useCallback(() => {
    setDisplayValue((curr) => {
      if (waitingForOperand) {
        setWaitingForOperand(false)
        return '0.'
      }
      if (curr.includes('.')) return curr
      return curr + '.'
    })
  }, [waitingForOperand])

  const handleClear = useCallback(() => {
    setDisplayValue('0')
    setPrevValue(null)
    setOperation(null)
    setWaitingForOperand(false)
    setHistoryLine('')
  }, [])

  const handleSign = useCallback(() => {
    setDisplayValue((curr) => {
      if (curr === '0' || curr === 'Error') return curr
      return curr.startsWith('-') ? curr.slice(1) : '-' + curr
    })
  }, [])

  const handlePercent = useCallback(() => {
    setDisplayValue((curr) => {
      const val = parseFloat(curr)
      if (isNaN(val)) return '0'
      return formatResult(val / 100)
    })
  }, [])

  const handleOperator = useCallback((nextOp: string) => {
    const inputValue = parseFloat(displayValue)

    if (prevValue === null) {
      setPrevValue(inputValue)
      setHistoryLine(`${displayValue} ${nextOp}`)
    } else if (operation) {
      const current = prevValue || 0
      const newValue = calculate(current, inputValue, operation)
      setPrevValue(newValue)
      setDisplayValue(formatResult(newValue))
      setHistoryLine(`${formatResult(newValue)} ${nextOp}`)
    }

    setWaitingForOperand(true)
    setOperation(nextOp)
  }, [displayValue, operation, prevValue])

  // Handle equals / verification of secret PIN
  const handleEquals = useCallback(() => {
    // 1. Check for Panic Wipe Code (0000)
    if (displayValue === '0000') {
      onPanicWipe()
      handleClear()
      return
    }

    // 2. Check for Secret Unmask PIN (e.g. 1984)
    if (displayValue === unlockPin) {
      onUnlock()
      return
    }

    // Normal calculation
    if (!operation || prevValue === null) return

    const inputValue = parseFloat(displayValue)
    const result = calculate(prevValue, inputValue, operation)

    setHistoryLine(`${prevValue} ${operation} ${displayValue} =`)
    setDisplayValue(formatResult(result))
    setPrevValue(null)
    setOperation(null)
    setWaitingForOperand(true)
  }, [displayValue, operation, prevValue, unlockPin, onUnlock, onPanicWipe, handleClear])

  // Physical keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal dialog is open, do not hijack standard typing
      if (showCovertDialog) return

      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key)
      } else if (e.key === '.') {
        handleDecimal()
      } else if (e.key === '+' || e.key === '-') {
        handleOperator(e.key)
      } else if (e.key === '*') {
        handleOperator('×')
      } else if (e.key === '/') {
        e.preventDefault()
        handleOperator('÷')
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        handleEquals()
      } else if (e.key === 'Backspace') {
        setDisplayValue((curr) => {
          if (curr.length <= 1 || curr === 'Error') return '0'
          return curr.slice(0, -1)
        })
      } else if (e.key === 'Escape') {
        handleClear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDigit, handleDecimal, handleOperator, handleEquals, handleClear, showCovertDialog])

  // Covert title bar long-press / touch handler
  const startLongPress = () => {
    pressTimerRef.current = setTimeout(() => {
      setShowCovertDialog(true)
    }, 2500)
  }

  const cancelLongPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }

  const handleDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (dialogPin === unlockPin) {
      setShowCovertDialog(false)
      onUnlock()
    } else if (dialogPin === '0000') {
      setShowCovertDialog(false)
      onPanicWipe()
      handleClear()
    } else {
      setDialogError(true)
      setTimeout(() => setDialogError(false), 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col justify-between select-none font-mono">
      {/* Covert Header Bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onDoubleClick={() => setShowCovertDialog(true)}
          className="cursor-pointer select-none group"
          title="QuickCalc"
        >
          <span className="text-xs uppercase tracking-widest text-slate-400 group-hover:text-slate-300 font-semibold transition-colors">
            Calculator
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-500 text-xs">
          <span>DEG</span>
        </div>
      </div>

      {/* LCD Display */}
      <div className="flex-1 flex flex-col justify-end px-6 pb-4">
        <div className="h-6 text-right text-slate-400 text-sm font-sans tracking-wide truncate">
          {historyLine}
        </div>
        <div className="text-right text-4xl sm:text-6xl font-bold tracking-tight text-white overflow-x-auto whitespace-nowrap scrollbar-none">
          {displayValue}
        </div>
      </div>

      {/* Keypad Grid (Standard 4x5 Layout) */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-t-3xl border-t border-slate-800/80 p-4 sm:p-6 pb-8 sm:pb-10 grid grid-cols-4 gap-2.5 sm:gap-3 max-w-lg mx-auto w-full">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800 text-amber-400 font-semibold text-lg sm:text-xl active:scale-95 transition-all hover:bg-slate-700"
        >
          {displayValue !== '0' ? 'C' : 'AC'}
        </button>
        <button
          onClick={handleSign}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-lg sm:text-xl active:scale-95 transition-all hover:bg-slate-700"
        >
          ±
        </button>
        <button
          onClick={handlePercent}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-lg sm:text-xl active:scale-95 transition-all hover:bg-slate-700"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-600 text-white font-bold text-xl active:scale-95 transition-all hover:bg-amber-500"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleDigit('7')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl active:scale-95 transition-all hover:bg-slate-700"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl active:scale-95 transition-all hover:bg-slate-700"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl active:scale-95 transition-all hover:bg-slate-700"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('×')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-600 text-white font-bold text-xl active:scale-95 transition-all hover:bg-amber-500"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleDigit('4')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl active:scale-95 transition-all hover:bg-slate-700"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl active:scale-95 transition-all hover:bg-slate-700"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl active:scale-95 transition-all hover:bg-slate-700"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-600 text-white font-bold text-2xl active:scale-95 transition-all hover:bg-amber-500"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleDigit('1')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl active:scale-95 transition-all hover:bg-slate-700"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl active:scale-95 transition-all hover:bg-slate-700"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl active:scale-95 transition-all hover:bg-slate-700"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-600 text-white font-bold text-2xl active:scale-95 transition-all hover:bg-amber-500"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl pl-7 text-left active:scale-95 transition-all hover:bg-slate-700"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 text-white font-medium text-xl sm:text-2xl active:scale-95 transition-all hover:bg-slate-700"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="h-14 sm:h-16 rounded-2xl bg-amber-500 text-white font-bold text-2xl active:scale-95 transition-all hover:bg-amber-400"
        >
          =
        </button>
      </div>

      {/* Discreet Unlock Prompt Modal */}
      {showCovertDialog && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Access Security</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter security code to verify device authentication.
            </p>
            <form onSubmit={handleDialogSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  value={dialogPin}
                  onChange={(e) => setDialogPin(e.target.value)}
                  placeholder="Security Code"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest text-white focus:outline-none focus:border-amber-500"
                />
                {dialogError && (
                  <p className="text-red-400 text-xs mt-1.5 text-center">Invalid Security Code</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCovertDialog(false)
                    setDialogPin('')
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
