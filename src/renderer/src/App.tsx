import React from 'react'
import WebsiteGeneratorPage from './pages/GenerativeUIPage'
import { FiGithub } from 'react-icons/fi'
import { Tooltip } from 'flowbite-react'
import { FiHome, FiFeather, FiSettings } from 'react-icons/fi'
import { LuCombine } from 'react-icons/lu'
import { createHashRouter, Link, Outlet, RouterProvider, useLocation } from 'react-router-dom'
import StepFunctionsGeneratorPage from './pages/StepFunctionsGeneratorPage'

const ListItem: React.FC<{
  children: any
  selected?: boolean
  toolTipContent?: string
  href
}> = ({ children, selected, toolTipContent, href }) => {
  const bgColor = selected ? 'bg-gray-800 text-white' : 'hover:bg-gray-400 hover:bg-opacity-20'
  return (
    <Link to={href}>
      {toolTipContent ? (
        <Tooltip content={toolTipContent} placement="right" animation="duration-500">
          <li className={'p-3 cursor-pointer m-1 rounded-md ' + bgColor}>{children}</li>
        </Tooltip>
      ) : (
        <li className={'p-3 cursor-pointer m-1 rounded-md ' + bgColor}>{children}</li>
      )}
    </Link>
  )
}

const routes = [
  {
    name: 'Home',
    href: '/',
    icon: FiHome,
    position: 'top'
  },
  // {
  //   name: 'History',
  //   href: '/history',
  //   icon: FiBook,
  //   position: 'top'
  // },
  {
    name: 'Website Generator',
    href: '/generative-ui',
    icon: FiFeather,
    position: 'top'
  },
  {
    name: 'Step Functions Generator',
    href: '/step-functions-generator',
    icon: LuCombine,
    position: 'top'
  },
  {
    name: 'Setting',
    href: '/setting',
    icon: FiSettings,
    position: 'top'
  }
]

const Layout: React.FC = () => {
  const location = useLocation()

  // return <div>{children}</div>
  return (
    <div className="bg-gray-100">
      <div className="flex min-h-screen h-screen">
        <div className="bg-opacity-80 bg-white m-2 border rounded-md">
          <nav className="flex flex-col justify-between h-full">
            <ul>
              {routes.map((page, index) => {
                return (
                  <ListItem
                    key={page.name}
                    selected={location.pathname === page.href}
                    href={page.href}
                    toolTipContent={page.name + ' ⌘ ' + (index + 1)}
                  >
                    <page.icon className="text-xl" />
                  </ListItem>
                )
              })}
            </ul>
            <ul>
              <ListItem href="https://github.com/daisuke-awaji/bedrock-engineer">
                <FiGithub className="text-xl" />
              </ListItem>
            </ul>
          </nav>
        </div>

        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

const NotFoundPage = () => {
  return <div className="m-2">page not found</div>
}

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <div>Home</div>
      },
      {
        path: 'generative-ui',
        element: <WebsiteGeneratorPage />
      },
      {
        path: 'step-functions-generator',
        element: <StepFunctionsGeneratorPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
])

function App(): JSX.Element {
  return <RouterProvider router={router} />
}

export default App
