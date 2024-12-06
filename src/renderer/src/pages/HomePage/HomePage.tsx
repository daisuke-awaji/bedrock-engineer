import Lottie from 'lottie-react'
import robotAnimation from './Robot.json'
import { Kbd } from 'flowbite-react'
import { useTranslation } from 'react-i18next'
import useSetting from '@renderer/hooks/useSetting'
import { motion } from 'framer-motion'
import { useTour } from '@reactour/tour'

const HomePage = () => {
  const { t } = useTranslation()
  const { awsRegion, awsAccessKeyId, awsSecretAccessKey } = useSetting()
  const isInitLoad = !awsRegion || !awsAccessKeyId || !awsSecretAccessKey
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

  const { setIsOpen } = useTour()

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
      {isInitLoad && (
        <motion.button
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 1.0 }}
          className="text-sm bg-gradient-to-bl from-green-400 to-blue-700 bg-clip-text text-transparent leading-normal hover:text-blue-700"
          onClick={() => setIsOpen(true)}
        >
          Open Tour
        </motion.button>
      )}
    </div>
  )
}

export default HomePage
