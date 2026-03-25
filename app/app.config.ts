export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      error: 'red',
      neutral: 'zinc',
    },
    button: {
      slots: {
        base: 'hover:cursor-pointer',
      }
    }
  },
})
