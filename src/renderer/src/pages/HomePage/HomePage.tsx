import Lottie from 'lottie-react'
import robotAnimation from './Robot.json'
import { Kbd } from 'flowbite-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import useSetting from '@renderer/hooks/useSetting'
import { motion } from 'framer-motion'

const HomePage = () => {
  const { t } = useTranslation()
  const { llmError: error } = useSetting()
  useEffect(() => {
    if (error) {
      if (error.message === 'Region is missing') {
        toast.error(t('set your aws credential'))
      }
    }
  }, [error])

  const textanimate = (text: string, delay?: number) =>
    text.split('').map((word, index) => {
      return (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: (delay || 0) + index * 0.01 }}
          key={index}
        >
          {word}
        </motion.span>
      )
    })

  return (
    <div className="flex flex-col gap-3 justify-center align-center items-center h-full">
      {/* https://app.lottiefiles.com/animation/aae1bb98-eced-420a-99ea-022e281fb845?channel=web&source=public-animation&panel=download */}
      <Lottie animationData={robotAnimation} className="w-[12rem]" />

      <span
        onClick={() => {
          throw new Error('error')
        }}
        className="text-gray-400 text-lg"
      >
        {textanimate(t('Welcome to Bedrock Engineer') + ' ' + '👋')}
      </span>
      <div className="flex flex-col gap-2 justify-center align-center items-center">
        <span className="text-gray-400 text-sm">
          {textanimate(t('This is AI assistant of software development tasks'), 0.5)}
        </span>
        <motion.span
          className="text-gray-400 text-xs"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 1.0 }}
        >
          {t('Start by the menu on the left or')} <Kbd className="bg-gray-200">⌘</Kbd> +{' '}
          <Kbd className="bg-gray-200">K</Kbd>.
        </motion.span>
      </div>
    </div>
  )
}

export default HomePage
