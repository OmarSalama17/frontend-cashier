import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import InventoryPage from './Components/Inventory';
import ReportsPage from './Components/ReportsPage';
import ReturnsPage from './Components/ReturnsPage';
import Home from './Components/Home';
import AdminPanel from './Components/Dashboard';
import TrackOrder from './Components/TrackOrder';

function App() {
  
  return (
    <div className='flex min-h-screen bg-gray-100'>

        <Router>
                    <aside className="w-64 bg-white shadow-md">
        <div className="p-6 font-bold text-purple-700 text-2xl">كاشير محل</div>
        <nav className="mt-8">
          <Link to="/" className="block py-3 px-6 text-gray-700 hover:bg-purple-100">الصفحه الرئيسية</Link>
          <Link to="/report" className="block py-3 px-6 text-gray-700 hover:bg-purple-100">الفواتير</Link>
          <Link to="/returns" className="block py-3 px-6 text-gray-700 hover:bg-purple-100">ارجاع منتج</Link>
          <Link to="/track-order" className="block py-3 px-6 text-gray-700 hover:bg-purple-100">تتبع الفاتورة</Link>
          <Link to="/inventory" className="block py-3 px-6 text-gray-700 hover:bg-purple-100"> الجرد</Link>
        </nav>
      </aside>
      <Routes>
        {/* <Route path="/" element={<Dashboard />} /> */}
        <Route path="/" element={<AdminPanel />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/report" element={<ReportsPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/dash" element={<AdminPanel />} />
        <Route path="/track-order" element={<TrackOrder />} />
      </Routes>
    </Router>

    </div>
  );
}

export default App;
