import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { Layout } from './components/Layout.tsx'
import { loadContent } from './content/content.ts'
import { ErrorPage } from './pages/ErrorPage.tsx'
import { BookingPage } from './pages/BookingPage.tsx'
import { CalendarPage } from './pages/CalendarPage.tsx'
import { ComparePage } from './pages/ComparePage.tsx'
import { ContactPage } from './pages/ContactPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { RoomPage } from './pages/RoomPage.tsx'
import { RoomsPage } from './pages/RoomsPage.tsx'

const router = createBrowserRouter([
  {
    id: 'root',
    element: <Layout />,
    loader: loadContent,
    // The hotel and its rooms don't change while the website is open, so they aren't loaded again on navigation
    shouldRevalidate: () => false,
    hydrateFallbackElement: <></>,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/rooms', element: <RoomsPage /> },
      { path: '/rooms/:roomId', element: <RoomPage /> },
      { path: '/compare', element: <ComparePage /> },
      { path: '/calendar', element: <CalendarPage /> },
      { path: '/booking', element: <BookingPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
