'use client'

import { useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { useLocale } from './LocaleProvider'
import type { Locale } from '../i18n/config'

const languages = [
  { code: 'nl' as Locale, name: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr' as Locale, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as Locale, name: 'English', flag: '🇬🇧' }
]

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { locale: currentLocale, setLocale } = useLocale()

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  const handleLanguageChange = (langCode: Locale) => {
    setLocale(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-ada-md bg-ada-bg-secondary border border-gray-200 hover:bg-ada-bg-accent transition-colors"
        title="Change language"
      >
        <Globe size={16} className="text-ada-text-muted" />
        <span className="text-ada-sm font-medium">{currentLanguage.flag}</span>
        <span className="text-ada-sm text-ada-text-secondary hidden sm:inline">
          {currentLanguage.name}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-ada-bg-secondary border border-gray-200 rounded-ada-lg shadow-lg z-20">
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full px-4 py-2 text-left hover:bg-ada-bg-accent transition-colors flex items-center justify-between ${
                    currentLocale === language.code ? 'bg-ada-bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{language.flag}</span>
                    <span className="text-ada-sm font-medium text-ada-text-primary">
                      {language.name}
                    </span>
                  </div>
                  {currentLocale === language.code && (
                    <Check size={16} className="text-ada-success" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}