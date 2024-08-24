import Lottie from 'lottie-react'
import robotAnimation from './Robot.json'

const HomePage = () => {
  return (
    <div className="flex flex-col gap-2 justify-center align-center items-center h-full">
      {/* https://app.lottiefiles.com/animation/aae1bb98-eced-420a-99ea-022e281fb845?channel=web&source=public-animation&panel=download */}
      <Lottie animationData={robotAnimation} className="w-[12rem]" />

      <span className="text-gray-400">Welcome to Butler 👋</span>
      <span className="text-gray-400">This is AI assistant of software development tasks</span>
    </div>
  )
}

export default HomePage
