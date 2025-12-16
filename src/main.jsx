import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ZeropageMD from './ZeropageMD.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ZeropageMD />
    </StrictMode>,
)
