'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Locale } from '../i18n/config'

// Import translation files
import enMessages from '../messages/en.json'
import frMessages from '../messages/fr.json'
import nlMessages from '../messages/nl.json'

const messages = {
  en: enMessages,
  fr: frMessages,
  nl: nlMessages
}

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    // Get locale from cookie on mount
    const cookies = document.cookie.split(';')
    const localeCookie = cookies.find(c => c.trim().startsWith('locale='))
    const savedLocale = localeCookie?.split('=')[1] as Locale
    
    if (savedLocale && ['en', 'fr', 'nl'].includes(savedLocale)) {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    // Save to cookie
    document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = messages[locale]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      // Fallback to English if key not found
      let fallback: any = messages.en
      for (const k of keys) {
        fallback = fallback?.[k]
      }
      value = typeof fallback === 'string' ? fallback : key
    }
    
    // Replace parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match
      })
    }
    
    return value
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}