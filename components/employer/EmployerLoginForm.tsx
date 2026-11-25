'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface FormData {
  company_email: string;
  company_name: string;
}

export default function EmployerLoginForm() {
  const [formData, setFormData] = useState<FormData>({
    company_email: '',
    company_name: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [verifyLink, setVerifyLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/employer-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process request. Please try again.');
        return;
      }

      setSuccess(data.message || 'Check your email for a verification link');
      setVerifyLink(typeof data.dev_verification_link === 'string' ? data.dev_verification_link : '');
      setFormData({ company_email: '', company_name: '' });
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <h1 className="text-3xl font-bold text-white">JobBrowser</h1>
          <p className="text-blue-100 mt-2">Post Your Jobs</p>
        </div>

        {/* Form */}
        <div className="px-6 py-8">
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 font-medium mb-2">Success!</p>
              <p className="text-green-700 text-sm">{success}</p>
              {verifyLink ? (
                <a className="mt-3 inline-block text-sm font-medium text-blue-700 underline" href={verifyLink}>
                  Open verification link
                </a>
              ) : null}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name Field */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  placeholder="e.g., Tech Corp"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email
                </label>
                <input
                  type="email"
                  id="company_email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  placeholder="jobs@techcorp.com"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Link...
                  </>
                ) : (
                  'Send Verification Link'
                )}
              </button>
            </form>
          )}

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold mb-2">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Enter your company details</li>
                <li>Check your email for a verification link</li>
                <li>Click the link to access the job posting wizard</li>
                <li>Fill in job details in 3 simple steps</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          © 2026 JobBrowser. All rights reserved.
        </p>
      </div>
    </div>
  );
}
