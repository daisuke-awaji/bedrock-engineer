import { ToolName } from '@/types/tools'
import {
  FaFolderPlus,
  FaFileSignature,
  FaFileAlt,
  FaList,
  FaArrowRight,
  FaCopy,
  FaSearch,
  FaGlobe,
  FaImage,
  FaDatabase,
  FaTerminal
} from 'react-icons/fa'
import BedrockIconSrc from '../../../../assets/images/aws-icons/Arch_Amazon-Bedrock_32.svg?url'

export const toolIcons: { [key in ToolName]: React.ReactElement } = {
  createFolder: <FaFolderPlus className="text-blue-500 size-6" />,
  writeToFile: <FaFileSignature className="text-green-500 size-6" />,
  readFiles: <FaFileAlt className="text-yellow-500 size-6" />,
  listFiles: <FaList className="text-purple-500 size-6" />,
  moveFile: <FaArrowRight className="text-orange-500 size-6" />,
  copyFile: <FaCopy className="text-indigo-500 size-6" />,
  tavilySearch: <FaSearch className="text-red-500 size-6" />,
  fetchWebsite: <FaGlobe className="text-teal-500 size-6" />,
  generateImage: <FaImage className="text-pink-500 size-6" />,
  retrieve: <FaDatabase className="text-green-500 size-6" />,
  invokeBedrockAgent: <img src={BedrockIconSrc} className="size-6" alt="Amazon Bedrock" />,
  executeCommand: <FaTerminal className="text-gray-500 size-6" />
}
