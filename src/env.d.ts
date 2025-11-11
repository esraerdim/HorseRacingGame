/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '@/assets/*.gif' {
  const src: string
  export default src
}

declare module '*.gif?url' {
  const src: string
  export default src
}

declare module '@/assets/*.gif?url' {
  const src: string
  export default src
}

