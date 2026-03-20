import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import TrademarkList from './pages/Trademarks/TrademarkList'
import TrademarkDetail from './pages/Trademarks/TrademarkDetail'
import DeadlineDashboard from './pages/Deadlines/DeadlineDashboard'
import DocumentList from './pages/Documents/DocumentList'
import RenewalDashboard from './pages/Renewals/RenewalDashboard'
import WorldMapDashboard from './pages/Map/WorldMapDashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/trademarks" replace />} />
        <Route path="/trademarks" element={<TrademarkList />} />
        <Route path="/trademarks/:id" element={<TrademarkDetail />} />
        <Route path="/deadlines" element={<DeadlineDashboard />} />
        <Route path="/documents" element={<DocumentList />} />
        <Route path="/renewals" element={<RenewalDashboard />} />
        <Route path="/map" element={<WorldMapDashboard />} />
        <Route path="*" element={<Navigate to="/trademarks" replace />} />
      </Route>
    </Routes>
  )
}
