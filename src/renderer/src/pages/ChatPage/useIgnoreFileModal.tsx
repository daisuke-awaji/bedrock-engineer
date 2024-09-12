import useModal from '@renderer/hooks/useModal'
import { useEffect, useState } from 'react'

const useIgnoreFileModal = () => {
  const { Modal, openModal } = useModal()

  const ModalWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <Modal header="Ignore Files">
        <p className="text-gray-700 text-sm pb-2">
          The files and folders listed below will not be read by various tools. Enter each file and
          folder on a new line.
        </p>
        {children}
      </Modal>
    )
  }

  const IgnoreFileModal = () => {
    const [ignoreFiles, setStateIgnoreFiles] = useState<string>()

    useEffect(() => {
      const config = window.store.get('agentChatConfig')
      if (config?.ignoreFiles) {
        console.log(config?.ignoreFiles)
        setStateIgnoreFiles(config.ignoreFiles.join('\n'))
      }
    }, [])

    const setIgnoreFiles = (str: string) => {
      setStateIgnoreFiles(str)
      const arr = str.split('\n').filter((item) => item.trim() !== '')
      const config = window.store.get('agentChatConfig')
      window.store.set('agentChatConfig', {
        ...config,
        ignoreFiles: arr
      })
    }

    return (
      <ModalWrapper>
        <textarea
          className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2`}
          placeholder={`.git\n.vscode\nor other files...`}
          value={ignoreFiles}
          onChange={(e) => setIgnoreFiles(e.target.value)}
          required
          rows={10}
        />
      </ModalWrapper>
    )
  }

  return { IgnoreFileModal, openModal }
}

export default useIgnoreFileModal
