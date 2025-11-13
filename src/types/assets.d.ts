declare module '@/assets/*.gif' {
  const aliasedGifPath: string
  export default aliasedGifPath
}

declare module '@/assets/*.gif?url' {
  const aliasedGifUrlPath: string
  export default aliasedGifUrlPath
}

declare module '@/assets/*.mp3' {
  const aliasedMp3Path: string
  export default aliasedMp3Path
}

declare module '@/assets/*.mp3?url' {
  const aliasedMp3UrlPath: string
  export default aliasedMp3UrlPath
}

declare module '@/assets/*.mp4' {
  const aliasedMp4Path: string
  export default aliasedMp4Path
}

declare module '@/assets/*.mp4?url' {
  const aliasedMp4UrlPath: string
  export default aliasedMp4UrlPath
}

declare module '*.mp4' {
  const mp4Path: string
  export default mp4Path
}

declare module '*.mp4?url' {
  const mp4UrlPath: string
  export default mp4UrlPath
}

declare module '@/assets/race_animation.mp4' {
  const raceAnimationSrc: string
  export default raceAnimationSrc
}


