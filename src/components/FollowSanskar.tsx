import { useState } from 'react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { FiExternalLink, FiPhone, FiMail, FiHelpCircle } from 'react-icons/fi';

export default function FollowSanskar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Follow on GitHub', url: 'https://github.com/Sanskar-in', icon: <FaGithub size={20} />, color: 'bg-gray-800 hover:bg-gray-700' },
    { name: 'Follow on X', url: 'https://www.x.com/Sanskar1729', icon: <FaTwitter size={20} />, color: 'bg-black hover:bg-gray-900' },
    { name: 'Connect on LinkedIn', url: 'https://www.linkedin.com/in/sanskar-yadav-in/', icon: <FaLinkedin size={20} />, color: 'bg-blue-700 hover:bg-blue-800' },
    { name: 'Buy E-books on Gumroad', url: 'https://ramsandesh.gumroad.com/', icon: <FiExternalLink size={20} />, color: 'bg-pink-500 hover:bg-pink-600' },
    { name: 'Call Sanskar', url: 'tel:+919795753292', icon: <FiPhone size={20} />, color: 'bg-green-500 hover:bg-green-600' },
    { name: 'Contact by Gmail', url: 'mailto:sanskaryadavfrom2012to2026@gmail.com', icon: <FiMail size={20} />, color: 'bg-red-500 hover:bg-red-600' },
    { name: 'Contact Support', url: 'mailto:supportramsandesh@gmail.com', icon: <FiHelpCircle size={20} />, color: 'bg-indigo-500 hover:bg-indigo-600' },
    { name: 'Contact on Outlook', url: 'mailto:sanskaryadavfromghosimau2026-27@outlook.com', icon: <FiMail size={20} />, color: 'bg-blue-500 hover:bg-blue-600' },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md shadow-md hover:from-blue-600 hover:to-indigo-700 transition font-medium"
      >
        Follow Sanskar
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect with Sanskar</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Creator of Sanskar PDF Editor</p>
            </div>
            
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-3 w-full p-3 text-white rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${link.color}`}
                >
                  <span>{link.icon}</span>
                  <span className="font-semibold">{link.name}</span>
                </a>
              ))}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-800 text-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition font-medium w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
