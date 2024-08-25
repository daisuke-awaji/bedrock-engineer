import React from 'react'
import { FiGithub } from 'react-icons/fi'
import { Tooltip } from 'flowbite-react'
import { createBrowserRouter, Link, Outlet, RouterProvider, useLocation } from 'react-router-dom'
import CmdK from './command-palette'
import { routes } from './routes'

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

const Layout: React.FC = () => {
  const location = useLocation()

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
        <CmdK />

        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

const NotFoundPage = () => {
  return <div className="m-2">page not found (to be implemented)</div>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      ...routes.map((route) => ({
        path: route.href,
        element: route.element,
        index: route.href === '/'
      })),
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
