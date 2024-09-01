import Lottie, { LottieComponentProps } from 'lottie-react'
import data from '../../assets/lottie/loading-database.json'

// ignore type animationData from LottieComponentProps
type LoadingDataBaseLottieProps = Omit<LottieComponentProps, 'animationData'>

const LoadingDataBaseLottie = (props?: LoadingDataBaseLottieProps) => {
  return <Lottie {...props} animationData={data} />
}

export default LoadingDataBaseLottie
