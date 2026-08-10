export {}

declare global {
  interface Window {
    api: {
      songs: {
        getAll: () => Promise<any[]>

        create: (song: {
          name: string
          artist?: string
          genre?: string
          musical_key?: string
          tempo?: number | string
          yamaha_style?: string
          registration?: number | string
          notes?: string
        }) => Promise<number>
      }
    }
  }
}