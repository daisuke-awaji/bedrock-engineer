import Lottie from 'lottie-react'
import robotAnimation from './Robot.json'
import { Kbd } from 'flowbite-react'

const HomePage = () => {
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
        Welcome to Bedrock Engineer 👋
      </span>
      <div className="flex flex-col gap-2 justify-center align-center items-center">
        <span className="text-gray-400 text-sm">
          This is AI assistant of software development tasks
        </span>
        <span className="text-gray-400 text-xs">
          Start by the menu on the left or <Kbd className="bg-gray-200">⌘</Kbd> +{' '}
          <Kbd className="bg-gray-200">K</Kbd>.
        </span>
      </div>
    </div>
  )
}

export default HomePage
