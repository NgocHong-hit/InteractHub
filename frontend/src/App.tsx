import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'; // 1. Import Toaster ở đây

function App() {
  return (
    <AuthProvider>
      {/* 2. Đặt Toaster ở đây để mọi component bên dưới đều có thể gọi thông báo */}
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          // Hồng có thể tùy chỉnh style cho xịn hơn ở đây
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
          },
        }}
      />
      
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <AppRouter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;