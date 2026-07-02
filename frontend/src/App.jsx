import {BrowserRouter, Routes, Route, Outlet} from 'react-router-dom'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import BookDetails from './pages/BookDetails'
import { Toaster } from 'react-hot-toast';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import ManageBooks from './pages/admin/ManageBooks';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Transactions from './pages/admin/Transactions';
import ManageUsers from './pages/admin/ManageUsers';
import Analytics from './pages/admin/Analytics';
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';

function App() {
  return (
   <BrowserRouter>
   <Toaster position="top-center" />
   <div className="flex flex-col min-h-screen">
     <Navbar />
     
     <main className="flex-1 flex flex-col">
       <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/catalog' element={<Catalog />} />
        <Route path='/book/:id' element={<BookDetails />} />
        <Route path='/signin' element= {<Signin/>}/>
        <Route path='/signup' element= {<Signup/>}/>
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path='/verify-email/:token' element={<VerifyEmail />} />
        <Route path='/about' element={<About />} />
        <Route path='/faq' element={<FAQ />} />
        <Route path='/contact' element={<Contact />} />
        
        <Route element={<PrivateRoute />}>
           <Route path='/student-dashboard' element={<StudentDashboard />} />
           <Route path='/profile' element={<Profile />} />
        </Route>
        
        <Route element={<AdminRoute />}>
          <Route path='/admin-dashboard' element={<AdminDashboard />}>
             <Route index element={<Analytics />} />
             <Route path='manage-books' element={<ManageBooks />} />
             <Route path='transactions' element={<Transactions />} />
             <Route path='manage-users' element={<ManageUsers />} />
          </Route>
        </Route>
       </Routes>
     </main>

     <Footer />
   </div>
   </BrowserRouter>
  )
}

export default App
