import Lottie, { LottieComponentProps } from 'lottie-react'
import data from '../../assets/lottie/loading-dots.json'

// ignore type animationData from LottieComponentProps
type LoadingDotsLottieProps = Omit<LottieComponentProps, 'animationData'>

const LoadingDotsLottie = (props?: LoadingDotsLottieProps) => {
  return <Lottie {...props} animationData={data} />
}

export default LoadingDotsLottie
