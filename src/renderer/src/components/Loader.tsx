export const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-2">
      <div className="animate-spin h-8 w-8 bg-blue-300 rounded-xl"></div>
      <span className="text-sm text-gray-400">loading...</span>
    </div>
  )
}
