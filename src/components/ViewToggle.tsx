'use client'

import { Grid, List } from 'lucide-react'
import { useLocale } from './LocaleProvider'

export type ViewMode = 'list' | 'card'

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
}

export function ViewToggle({ currentView, onViewChange, className = '' }: ViewToggleProps) {
  const { t } = useLocale()
  
  return (
    <div className={`flex items-center bg-ada-bg-secondary border border-gray-200 rounded-ada-lg p-1 ${className}`}>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center justify-center px-3 py-2 rounded-ada-md text-ada-sm font-medium transition-all ${
          currentView === 'list'
            ? 'bg-ada-success text-white shadow-sm'
            : 'text-ada-text-secondary hover:text-ada-text-primary hover:bg-ada-bg-accent'
        }`}
        title={t('view.listView')}
      >
        <List size={16} className="mr-2" />
        {t('view.list')}
      </button>
      
      <button
        onClick={() => onViewChange('card')}
        className={`flex items-center justify-center px-3 py-2 rounded-ada-md text-ada-sm font-medium transition-all ${
          currentView === 'card'
            ? 'bg-ada-success text-white shadow-sm'
            : 'text-ada-text-secondary hover:text-ada-text-primary hover:bg-ada-bg-accent'
        }`}
        title={t('view.cardView')}
      >
        <Grid size={16} className="mr-2" />
        {t('view.cards')}
      </button>
    </div>
  )
}