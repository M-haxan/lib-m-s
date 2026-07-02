import React, { useState } from 'react';
import { FaQuestionCircle, FaChevronDown, FaSearch, FaUserPlus, FaBookReader, FaUndoAlt } from 'react-icons/fa';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const faqs = [
    {
      id: 1,
      category: 'registration',
      question: 'How do I register or create a new student account?',
      answer: 'You can register by clicking the "Sign Up" button in the top navigation bar. Fill in your name, email, stream, year, and a secure password. After submitting the signup form, a verification link will be sent to your email. Click on this link to verify your email, after which your request will be sent to the administrator for manual approval.',
    },
    {
      id: 2,
      category: 'registration',
      question: 'Why can\'t I log in immediately after registration?',
      answer: 'To access the system, you must first verify your email address via the verification link sent to your inbox. Once verified, your account must be approved by the Administrator. You will receive an email notification when your account has been approved, after which you can sign in.',
    },
    {
      id: 3,
      category: 'registration',
      question: 'Can I change my registered email or profile details later?',
      answer: 'Yes, you can update your name, email, stream, year, and password from the "Profile" page. Note that if you modify your email, it must be unique and not already registered by another user.',
    },
    {
      id: 4,
      category: 'issues',
      question: 'How do I borrow or request a book from the catalog?',
      answer: 'Browse the catalog via the "Catalog" page, choose the book you wish to borrow, and select the dates/duration of borrowing (maximum 10 days) on the details page. Click the "Request Issue" button. Your request will show as "Pending_Issue" in your student dashboard. Once approved by the administrator, the status updates to "Issued" and you can read the book.',
    },
    {
      id: 5,
      category: 'issues',
      question: 'What is the maximum number of books I can issue at a time?',
      answer: 'To ensure fair access to resources, students are allowed to have a maximum of 4 active books/requests (sum of "Pending_Issue", "Issued", and "Pending_Return" statuses) on their account at any given point.',
    },
    {
      id: 6,
      category: 'issues',
      question: 'What is the standard issue duration and can I renew a book?',
      answer: 'The maximum borrowing duration is 10 days, selected when requesting the book. There is no automated renewal option in the student dashboard. To extend your borrowing time, you should request return and submit a new issue request if copies are available.',
    },
    {
      id: 7,
      category: 'returns',
      question: 'How do I return a book and how is it processed?',
      answer: 'To return a book, navigate to your Student Dashboard, find your actively issued book, and click the "Request Return" button. The status of the book will update to "Pending_Return". Bring the physical book to the library desk, where the Administrator will approve the return, automatically calculate any late fines, and mark the transaction as "Returned".',
    },
    {
      id: 8,
      category: 'returns',
      question: 'Are there late return penalties or fines?',
      answer: 'Yes, if a book is returned after its due date, a fine of PKR 100 per day is automatically applied to your account. You can view your outstanding fines in the Student Dashboard and clear them at the library desk.',
    },
  ];


  const categories = [
    { id: 'all', name: 'All FAQs', icon: <FaQuestionCircle /> },
    { id: 'registration', name: 'Registration & Account', icon: <FaUserPlus /> },
    { id: 'issues', name: 'Book Issuing & Borrowing', icon: <FaBookReader /> },
    { id: 'returns', name: 'Returns & Fines', icon: <FaUndoAlt /> },
  ];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || faq.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded">
            Help Center
          </span>
          <h1 className="mt-3 text-4xl font-bold text-slate-900 tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            Find answers to common questions about student registration, borrowing rules, and library policies.
          </p>
        </div>

        {/* Search & Tabs Panel */}
        <div className="space-y-6 mb-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <FaSearch className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-all"
            />
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded text-sm font-medium transition-all ${
                  activeTab === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white border border-slate-100 rounded shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-200"
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full flex justify-between items-center px-6 py-5 text-left font-semibold text-slate-800 hover:text-blue-600 focus:outline-none"
                  >
                    <span className="pr-4 leading-relaxed">{faq.question}</span>
                    <FaChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                        isExpanded ? 'transform rotate-180 text-blue-500' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[300px] border-t border-slate-50' : 'max-h-0'
                    }`}
                  >
                    <p className="px-6 py-5 text-slate-600 leading-relaxed text-sm bg-slate-50/50">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-lg">No matches found for your search query.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
