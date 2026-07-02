import { Link } from 'react-router-dom';
import { FaArrowRight, FaBookOpen, FaUserGraduate, FaGlobe } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAFA]  text-slate-900  flex flex-col justify-center animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
          <div className="inline-block px-4 py-2 rounded bg-blue-100  text-blue-700  font-semibold text-sm tracking-wide">
             Library Management
          </div>
          
          <h1 className="text-3xl text-[#0F172B] md:text-6xl font-abold tracking-tight leading-tight">
            Discover Your Next <span className=" text-[#0F172B]">Great Read</span> Today.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0">
            Access thousands of books, journals, and digital resources. Manage your borrowings, track your academic progress, and stay updated with the latest arrivals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link 
              to="/catalog" 
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500  text-white rounded font-bold text-lg shadow-xl shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto justify-center"
            >
              Browse Catalog <FaArrowRight />
            </Link>
          </div>
        </div>

        <div className="lg:w-1/2 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded transform scale-105 -z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Library Books" 
            className="rounded shadow-2xl object-cover aspect-video sm:aspect-[4/3] w-full"
          />
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-white  py-20 mt-auto  rounded">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="text-center space-y-4 bg-slate-100 p-6 rounded">
            <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center rounded-2xl text-2xl">
              <FaBookOpen />
            </div>
            <h3 className="text-xl font-bold">Vast Collection</h3>
            <p className="text-slate-500 dark:text-slate-400">Explore over 10,000+ books spanning multiple genres and disciplines.</p>
          </div>
          <div className="text-center space-y-4 bg-slate-100 p-6 rounded">
            <div className="w-16 h-16 mx-auto bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center rounded-2xl text-2xl">
              <FaUserGraduate />
            </div>
            <h3 className="text-xl font-bold">Student Portal</h3>
            <p className="text-slate-500 dark:text-slate-400">Manage your borrowed books, track fines, and request renewals easily.</p>
          </div>
          <div className="text-center space-y-4 bg-slate-100 p-6 rounded">
            <div className="w-16 h-16 mx-auto bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center rounded-2xl text-2xl">
              <FaGlobe />
            </div>
            <h3 className="text-xl font-bold">Digital Access</h3>
            <p className="text-slate-500 dark:text-slate-400">Access our online catalog from anywhere, anytime on any device.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
