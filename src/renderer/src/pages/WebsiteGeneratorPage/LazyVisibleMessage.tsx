import { useAnimation, motion } from 'framer-motion'
import { useEffect } from 'react'

type LazyVisibleMessageProps = {
  message: string
}
/**
 * Lazy visible message component
 * @param props
 * @constructor
 */
const LazyVisibleMessage = ({ message }: LazyVisibleMessageProps) => {
  const controls = useAnimation()
  const startAnimation = { opacity: 0, scale: 1 }
  const endAnimation = { opacity: 1, scale: 1 }
  const transition = { duration: 1 }

  useEffect(() => {
    const timer = setTimeout(() => {
      controls.start(endAnimation)
    }, 3000)

    return () => clearTimeout(timer)
  }, [controls])

  return (
    <motion.div initial={startAnimation} animate={controls} transition={transition}>
      {message}
    </motion.div>
  )
}

export default LazyVisibleMessage
