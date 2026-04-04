import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext'; // Nếu bạn đã tạo AuthContext

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          {/* Gọi file Router tổng ở đây */}
          <AppRouter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;