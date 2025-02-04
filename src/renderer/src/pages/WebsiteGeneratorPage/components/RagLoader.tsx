import LazyVisibleMessage from '../LazyVisibleMessage'
import LoadingDataBaseLottie from '../LoadingDataBase.lottie'

export const RagLoader = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-2">
      <LoadingDataBaseLottie className="w-[6rem]" />
      <span className="text-sm text-gray-400">Connecting datasource...</span>
      <span className="text-xs text-gray-400">
        <LazyVisibleMessage message="Searching for related source code" />
      </span>
    </div>
  )
}
