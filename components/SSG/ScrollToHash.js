'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLoadingContext } from '@/components/Loading/ClientWrapper' // Context を使う
import { Suspense } from 'react'

function ScrollToHashContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { shouldTriggerAnimation } = useLoadingContext()

  useEffect(() => {
    if (!shouldTriggerAnimation) return // アニメーション完了待ち

    const hash = window.location.hash
    if (hash) {
      const id = hash.substring(1)
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [pathname, searchParams, shouldTriggerAnimation])

  return null
}

export default function ScrollToHash() {
  return (
    <Suspense fallback={null}>
      <ScrollToHashContent />
    </Suspense>
  )
}
