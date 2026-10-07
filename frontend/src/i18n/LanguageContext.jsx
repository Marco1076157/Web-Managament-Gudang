import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import id from './translations/id.json'
import en from './translations/en.json'

const translations = { id, en }

const LanguageContext = createContext({
  language: 'id',
  setLanguage: () => {},
  t: (key) => key,
})

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('app_language') || 'id'
    } catch (e) {
      return 'id'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('app_language', language)
    } catch (e) {}
  }, [language])

  const t = useMemo(() => {
    return (key) => {
      const keys = key.split('.')
      let value = translations[language]
      for (let i = 0; i < keys.length; i++) {
        if (value && typeof value === 'object' && keys[i] in value) {
          value = value[keys[i]]
        } else {
          return key
        }
      }
      return typeof value === 'string' ? value : key
    }
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)