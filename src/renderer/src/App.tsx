import React from 'react'
import { FiGithub } from 'react-icons/fi'
import { Tooltip } from 'flowbite-react'
import { createHashRouter, Link, Outlet, RouterProvider, useLocation } from 'react-router-dom'
import CmdK from './command-palette'
import { routes } from './routes'
import HomePage from './pages/HomePage/HomePage'
import { Toaster } from 'react-hot-toast'
import ErrorPage from './pages/ErrorPage/ErrorPage'
import { SettingsProvider } from './contexts/SettingsContext'
import { StepType, TourProvider } from '@reactour/tour'
import { useTranslation } from 'react-i18next'

const ListItem: React.FC<{
  children: any
  selected?: boolean
  toolTipContent?: string
  href
}> = ({ children, selected, toolTipContent, href }) => {
  const bgColor = selected ? 'bg-gray-800 text-white' : 'hover:bg-gray-400 hover:bg-opacity-20'
  return (
    <Link to={href} className={href === '/setting' ? 'react-tour-first-step' : ''}>
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
    <div className="bg-gray-100 dark:bg-gray-900">
      <div className="flex min-h-screen h-screen">
        <div className="bg-opacity-80 bg-white dark:bg-gray-900 m-2 border rounded-md dark:border-gray-400">
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
                    <page.icon className="text-xl dark:text-white" />
                  </ListItem>
                )
              })}
            </ul>
            <ul>
              <div onClick={() => open('https://github.com/daisuke-awaji/bedrock-engineer')}>
                <ListItem href="#">
                  <FiGithub className="text-xl dark:text-white" />
                </ListItem>
              </div>
            </ul>
          </nav>
        </div>
        <CmdK />

        <div className="flex-1 p-4 bg-gray-100 overflow-x-auto dark:bg-gray-900">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      ...routes.map((route) => ({
        path: route.href,
        element: route.element,
        index: route.href === '/'
      })),
      {
        path: '*',
        element: <HomePage />
      }
    ]
  }
])

const styles: any = {
  maskWrapper: (base) => ({
    ...base
  }),
  maskArea: (base) => ({
    ...base,
    rx: 8
  }),
  popover: (base) => ({
    ...base,
    '--reactour-accent': '#ef5a3d',
    borderRadius: 8
  }),
  badge: (base) => ({ ...base, color: 'gray', backgroundColor: 'white' })
}

function App(): JSX.Element {
  const { t } = useTranslation()

  const steps: StepType[] = [
    {
      selector: '.react-tour-first-step',
      content: t('set your aws credential'),
      position: 'right'
    }
  ]

  return (
    <TourProvider steps={steps} styles={styles}>
      <SettingsProvider>
        <div>
          <Toaster position="top-right" />
          <RouterProvider router={router} />
        </div>
      </SettingsProvider>
    </TourProvider>
  )
}

export default App
