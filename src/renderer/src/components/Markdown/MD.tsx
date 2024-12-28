import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import style from './styles.module.css'

type MDProps = {
  children: string | null | undefined
}
const MD = (props: MDProps) => {
  return (
    <Markdown className={style.reactMarkDown} remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
      {props.children}
    </Markdown>
  )
}

export default MD
