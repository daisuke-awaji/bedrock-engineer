/* eslint-disable react/prop-types */
const RobotIcon: React.FC<{ className?: string }> = ({ className }) => {
  return <img src={'./chatbot.png'} alt="robot" className={className + ' ' + 'object-contain'} />
}

export default RobotIcon
