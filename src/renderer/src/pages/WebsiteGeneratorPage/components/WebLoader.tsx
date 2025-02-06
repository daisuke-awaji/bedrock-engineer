import LazyVisibleMessage from '../LazyVisibleMessage'
import LoadingWebsiteLottie from '../LoadingWebsite.lottie'

export const WebLoader = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-2">
      <LoadingWebsiteLottie className="w-[8rem]" />
      <span className="text-sm text-gray-400">Searching websites...</span>
      <span className="text-xs text-gray-400">
        <LazyVisibleMessage message="Searching for related source code" />
      </span>
    </div>
  )
}
