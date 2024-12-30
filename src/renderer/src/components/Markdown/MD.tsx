import Markdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import style from './styles.module.css'
import { useMemo } from 'react'
import LocalImage from '../LocalImage'

type MDProps = {
  children: string | null | undefined
}

type AnchorProps = {
  href?: string
  children?: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

type ImgProps = {
  src?: string
  alt?: string
  className?: string
}

const MD = (props: MDProps) => {
  const components: Partial<Components> = useMemo(() => {
    return {
      a: (props: AnchorProps) => (
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
      ),
      img: ({ src, alt, ...props }: ImgProps) => {
        if (src?.startsWith('/')) {
          return <LocalImage src={src} alt={alt || ''} {...props} />
        }
        return <img src={src} alt={alt} {...props} />
      }
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
