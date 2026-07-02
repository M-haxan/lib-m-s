import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminEmail, setAdminEmail] = useState('support@librolibrary.com');

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data } = await axios.get('/api/public/contact-info');
        if (data.email) {
          setAdminEmail(data.email);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };
    fetchContactInfo();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post('/api/public/contact', formData);
      toast.success(data.message || 'Your message has been sent successfully!');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded">
            Get in Touch
          </span>
          <h1 className="mt-3 text-4xl font-bold text-slate-900 tracking-tight sm:text-5xl">
            Contact Library Admin
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500">
            Have questions about catalog items, issue policies, or account permissions? Send us a message directly.
          </p>
        </div>

        {/* Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Info Side (1 Col on LG) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Library Contact Details
              </h3>

              {/* Item */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded mt-0.5">
                  <FaEnvelope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500">Email Address</h4>
                  <p className="text-slate-800 font-medium mt-0.5">{adminEmail}</p>
                  <p className="text-xs text-slate-400">Response within 24 hours</p>
                </div>
              </div>

              {/* Item */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded mt-0.5">
                  <FaPhone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500">Phone Helpdesk</h4>
                  <p className="text-slate-800 font-medium mt-0.5">+92012345678</p>
                  <p className="text-xs text-slate-400">Mon-Fri, 9am - 5pm</p>
                </div>
              </div>

              {/* Item */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded mt-0.5">
                  <FaMapMarkerAlt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500">Library Location</h4>
                  <p className="text-slate-800 font-medium mt-0.5">123 Knowledge Way</p>
                  <p className="text-xs text-slate-400">Multan City</p>
                </div>
              </div>
            </div>

            {/* Timing Card */}
            <div className="bg-white p-6 rounded shadow-sm border border-slate-100 flex items-start space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mt-0.5">
                <FaClock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-500">Library Hours</h3>
                <div className="mt-2 space-y-1.5 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-semibold text-slate-900">8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold text-slate-900">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sunday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side (2 Cols on LG) */}
          <div className="lg:col-span-2 bg-white p-8 rounded shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-950 mb-6">Send an Inquiry</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="block w-full border border-slate-200 rounded px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-all text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="block w-full border border-slate-200 rounded px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  className="block w-full border border-slate-200 rounded px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-all text-sm"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                  Message Details
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your issue or query here..."
                  className="block w-full border border-slate-200 rounded px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-all text-sm resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center space-x-2 px-6 py-4 rounded text-sm font-bold text-white transition-all shadow-md ${
                    isSubmitting 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  <FaPaperPlane className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
