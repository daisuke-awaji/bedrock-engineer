import React from 'react'
import { motion } from 'framer-motion'
import LoadingDotsLottie from '../../../WebsiteGeneratorPage/LoadingDots.lottie'

type MessageRecommendation = {
  title: string
  content: string
}

type RecommendationsProps = {
  recommendations: MessageRecommendation[]
  loading: boolean
  onSelect: (content: string) => void
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  recommendations,
  loading,
  onSelect
}) => {
  if (loading) {
    return (
      <div className="flex gap-1 justify-start dark:text-white">
        <LoadingDotsLottie className="h-[2rem]" />
      </div>
    )
  }

  return (
    <div>
      {recommendations.map((recommendation, index) => (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.2 }}
          key={recommendation.title}
          className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:border-gray-600"
          onClick={() => onSelect(recommendation.content)}
        >
          {recommendation.title}
        </motion.button>
      ))}
    </div>
  )
}
