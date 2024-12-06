import React, { useEffect, useRef, useState } from 'react'
import { FiUpload } from 'react-icons/fi'
import { IoIosClose } from 'react-icons/io'

interface ImageUploaderProps {
  onImageUpload: (file: File) => void
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // on click esc key
  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.keyCode === 27) {
        setZoom(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [])

  return (
    <div className="flex items-center justify-center h-full gap-2">
      <button
        onClick={handleClick}
        className="rounded-lg hover:bg-gray-200 px-2 py-2 dark:text-white dark:hover:bg-gray-700"
      >
        <FiUpload className="text-xl" />
      </button>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-8 h-8 object-cover rounded cursor-pointer hover:bg-gray-200 px-1 py-1"
            onClick={() => setZoom((z) => !z)}
          />
        )}
      </div>

      {zoom && previewUrl && (
        <div
          className="fixed left-1/2 top-1/2 z-[110] -translate-x-1/2 -translate-y-1/2 w-screen h-screen p-32 bg-gray-400/50"
          onClick={() => {
            setZoom(false)
          }}
        >
          {/* close button */}
          <div className="absolute top-0 right-0 z-[111] p-4" onClick={() => setZoom(false)}>
            <IoIosClose className="text-lg flex justify-center content-center w-8 h-8 dark:hover:bg-gray-400 hover:bg-gray-200 rounded cursor-pointer" />
          </div>

          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
        </div>
      )}
    </div>
  )
}

export default ImageUploader
