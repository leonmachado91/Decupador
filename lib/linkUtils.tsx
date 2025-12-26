import React from "react"
import { shortenUrl } from "./urlUtils"
import { InteractiveLink } from "@/components/ui/interactive-link"

export const linkify = (text: string): React.ReactNode[] => {
  if (typeof text !== "string") {
    return [text]
  }
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi
  const matches = [...text.matchAll(urlRegex)]

  if (matches.length === 0) {
    return [text]
  }

  const result: React.ReactNode[] = []
  let lastIndex = 0

  matches.forEach((match, i) => {
    const url = match[0]
    const index = match.index!

    if (index > lastIndex) {
      result.push(text.substring(lastIndex, index))
    }

    result.push(
      <InteractiveLink key={i} href={url} title={url}>
        {shortenUrl(url)}
      </InteractiveLink>
    )

    lastIndex = index + url.length
  })

  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex))
  }

  return result
}
