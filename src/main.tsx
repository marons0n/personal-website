import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

posthog.init(
  import.meta.env.VITE_POSTHOG_KEY || '<ph_project_api_key>',
  {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
  }
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)
