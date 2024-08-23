import { motion } from 'framer-motion'

const Loader = () => {
  return (
    <motion.div
      className="h-8 w-8 bg-gray-800"
      animate={{
        scale: [1, 2, 2, 1, 1],
        rotate: [0, 0, 180, 180, 0],
        borderRadius: ['20%', '20%', '50%', '50%', '20%']
      }}
      transition={{
        duration: 1,
        ease: 'easeInOut',
        times: [0, 0.2, 0.5, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 1
      }}
    />
  )
}

export default Loader
