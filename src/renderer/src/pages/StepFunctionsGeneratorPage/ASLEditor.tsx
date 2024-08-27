/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Editor } from '@monaco-editor/react'
import { useRef } from 'react'

type ASLEditorProps = { value: any; setValue?: any }
export const ASLEditor: React.FC<ASLEditorProps> = ({ value, setValue }) => {
  const editorRef = useRef(null)

  function handleEditorChange(value: any, _event: any) {
    // here is the current value
    setValue(value)
  }

  function handleEditorDidMount(editor: any, _monaco: any) {
    editorRef.current = editor
  }

  function handleEditorWillMount(_monaco: any) {
    // console.log("beforeMount: the monaco instance:", monaco);
  }

  function handleEditorValidation(_markers: any) {
    // model markers
    // markers.forEach(marker => console.log('onValidate:', marker.message));
  }
  return (
    <>
      <Editor
        language="json"
        defaultValue={value}
        value={value}
        theme="light" // or "vs-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        onValidate={handleEditorValidation}
        options={{ lineNumbers: 'on' }}
      />
    </>
  )
}
