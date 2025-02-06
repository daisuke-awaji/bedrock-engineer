import Lottie, { LottieComponentProps } from 'lottie-react'
import data from '../../assets/lottie/loading-website.json'

// ignore type animationData from LottieComponentProps
type LoadingWebsiteLottieProps = Omit<LottieComponentProps, 'animationData'>

const LoadingWebsiteLottie = (props?: LoadingWebsiteLottieProps) => {
  return <Lottie {...props} animationData={data} />
}

export default LoadingWebsiteLottie
