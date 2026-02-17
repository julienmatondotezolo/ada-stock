export const locales = ['en', 'fr', 'nl'] as const
export type Locale = (typeof locales)[number]

// Simple function to get locale from cookie or default
export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'nl'
  
  const cookies = document.cookie.split(';')
  const localeCookie = cookies.find(c => c.trim().startsWith('locale='))
  const locale = localeCookie?.split('=')[1]
  
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale
  }
  
  return 'nl' // Default to Dutch for L'Osteria
}