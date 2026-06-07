import { useEffect } from 'react'

interface PageSeoOptions {
  title: string
  description?: string
}

export function usePageSeo({ title, description }: PageSeoOptions) {
  useEffect(() => {
    document.title = `${title} | Doctor Hub Pakistan`

    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }
  }, [title, description])
}
