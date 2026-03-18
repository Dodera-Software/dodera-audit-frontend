import { defineStore } from 'pinia'

interface Project {
  id: string
  name: string
  url: string
  site_type: string
  conversion_goal: string
  target_audience_description: string | null
  created_at: string
}

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [] as Project[],
    current: null as Project | null,
    loading: false,
  }),

  actions: {
    setProjects(projects: Project[]) {
      this.projects = projects
    },

    setCurrent(project: Project | null) {
      this.current = project
    },
  },
})
