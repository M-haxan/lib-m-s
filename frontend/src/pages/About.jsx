import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaUsers, FaClock, FaBookmark, FaGraduationCap, FaShieldAlt } from 'react-icons/fa';

export default function About() {
  const [dbStats, setDbStats] = useState({
    totalBooks: null,
    activeStudents: null,
    activeBorrows: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/public/stats');
        setDbStats(data);
      } catch (error) {
        console.error('Error fetching public stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { id: 1, label: 'Total Books', value: loading ? '...' : (dbStats.totalBooks !== null ? dbStats.totalBooks.toLocaleString() : '0'), icon: <FaBook className="w-6 h-6 text-blue-600" /> },
    { id: 2, label: 'Active Students', value: loading ? '...' : (dbStats.activeStudents !== null ? dbStats.activeStudents.toLocaleString() : '0'), icon: <FaUsers className="w-6 h-6 text-emerald-600" /> },
    { id: 3, label: 'Daily Borrows', value: loading ? '...' : (dbStats.activeBorrows !== null ? dbStats.activeBorrows.toLocaleString() : '0'), icon: <FaBookmark className="w-6 h-6 text-violet-600" /> },
    { id: 4, label: 'Study Hours', value: '24/7 Access', icon: <FaClock className="w-6 h-6 text-amber-600" /> },
  ];

  const features = [
    {
      title: 'Vast Digital Catalog',
      description: 'Access thousands of physical books, academic journals, and digital publications across multiple disciplines.',
      icon: <FaGraduationCap className="text-2xl text-blue-600" />,
    },
    {
      title: 'Seamless Account Management',
      description: 'Students and administrators get specialized dashboards to manage profile, track loan history, and view active holds.',
      icon: <FaUsers className="text-2xl text-emerald-600" />,
    },
    {
      title: 'Fair & Secure Lending',
      description: 'Automated lending rules ensure fair distribution, while secure checks prevent authorization leaks.',
      icon: <FaShieldAlt className="text-2xl text-rose-600" />,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded">
            About Libro Library
          </span>
          <h1 className="mt-3 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Empowering Minds, Connecting Communities
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500">
            it is a modern library management system designed to make knowledge discovery accessible, organized, and frictionless.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white p-6 rounded shadow-sm border border-slate-100 flex items-center space-x-4">
              <div className="p-3 bg-slate-50 rounded">
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Two-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Mission & Philosophy</h2>
            <p className="text-slate-600 leading-relaxed">
              We believe that libraries are the cornerstone of academic growth and intellectual curiosity. Our system streamlines administrative processes so that librarians can focus on curation, and students can access reading materials with minimal hurdles.
            </p>
            <p className="text-slate-600 leading-relaxed">
              By combining robust database cataloging with a clean, user-focused web interface, we close the gap between request submission and book collection.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded p-8 shadow-xl relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-xl"></div>
            
            <h3 className="text-2xl font-bold mb-4 relative z-10">Library Operating Philosophy</h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start space-x-3">
                <span className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 mt-0.5 font-bold text-sm">✓</span>
                <span>Open Access to verified members.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 mt-0.5 font-bold text-sm">✓</span>
                <span>Transparency in transaction history and fines.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 mt-0.5 font-bold text-sm">✓</span>
                <span>User privacy and data encryption standard.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded shadow-sm border border-slate-100 p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Key Features</h2>
            <p className="text-slate-500 mt-2">What makes Libro Library the preferred choice for institutions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="space-y-3">
                <div className="inline-block p-3 bg-slate-50 rounded-xl">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
