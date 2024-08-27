import { useEffect, useState } from 'react'

const useProject = () => {
  const [projectPath, setProjectPath] = useState<string>()

  const getProjectPath = async () => {
    const path = window.store.get('projectPath')
    if (path) {
      setProjectPath(path)
    }
  }

  const selectDirectory = async () => {
    const path = await window.file.handleFolderOpen()
    if (path) {
      setProjectPath(path)
      window.store.set('projectPath', path)
    }
  }

  useEffect(() => {
    getProjectPath()
  }, [])

  return { projectPath, setProjectPath, selectDirectory }
}

export default useProject
