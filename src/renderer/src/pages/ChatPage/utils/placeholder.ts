import { SettingsContextType } from '@renderer/contexts/SettingsContext'

type PlaceHolders = {
  projectPath: string
  allowedCommands: SettingsContextType['allowedCommands']
  knowledgeBases: SettingsContextType['knowledgeBases']
}

export const replacePlaceholders = (text: string, placeholders: PlaceHolders) => {
  const { projectPath, allowedCommands, knowledgeBases } = placeholders
  const yyyyMMdd = new Date().toISOString().slice(0, 10)
  return text
    .replace(/{{projectPath}}/g, projectPath)
    .replace(/{{date}}/g, yyyyMMdd)
    .replace(/{{allowedCommands}}/g, JSON.stringify(allowedCommands))
    .replace(/{{knowledgeBases}}/g, JSON.stringify(knowledgeBases))
}
