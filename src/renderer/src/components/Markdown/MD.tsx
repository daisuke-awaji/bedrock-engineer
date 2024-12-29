import Markdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import style from './styles.module.css'
import { useMemo } from 'react'

type MDProps = {
  children: string | null | undefined
}
const MD = (props: MDProps) => {
  const components: Partial<Components> = useMemo(() => {
    return {
      a: ({ node, ...props }) => (
        <a
          {...props}
          onClick={(e) => {
            e.preventDefault()
            if (props.href) {
              open(props.href)
            }
          }}
          style={{ cursor: 'pointer' }}
        />
      )
    }
  }, [])

  return (
    <Markdown
      className={style.reactMarkDown}
      remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
      components={components}
    >
      {props.children}
    </Markdown>
  )
}

export default MD
