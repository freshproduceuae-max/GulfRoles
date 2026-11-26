'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';

interface WizardData {
  title: string;
  company_name: string;
  location: string;
  region: string;
  job_type: string;
  description: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
}

interface JobPostingWizardProps {
  employerId: string;
}

const REGIONS = ['UAE', 'Saudi', 'India', 'Australia', 'USA'];
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
const CURRENCIES = ['USD', 'AED', 'SAR', 'INR', 'AUD'];

export default function JobPostingWizard({ employerId: _employerId }: JobPostingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string>('');
  const [publishStatus, setPublishStatus] = useState<string>('');

  const [formData, setFormData] = useState<WizardData>({
    title: '',
    company_name: '',
    location: '',
    region: 'UAE',
    job_type: 'full-time',
    description: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      if (!formData.title.trim()) {
        setError('Job title is required');
        return false;
      }
      if (formData.title.length < 3) {
        setError('Job title must be at least 3 characters');
        return false;
      }
      if (!formData.company_name.trim()) {
        setError('Company name is required');
        return false;
      }
      if (!formData.location.trim()) {
        setError('Location is required');
        return false;
      }
      if (!formData.region) {
        setError('Region is required');
        return false;
      }
      if (!formData.job_type) {
        setError('Job type is required');
        return false;
      }
    } else if (stepNum === 2) {
      if (!formData.description.trim()) {
        setError('Job description is required');
        return false;
      }
      if (formData.description.length < 20) {
        setError('Description must be at least 20 characters');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev === 3 ? 3 : (prev + 1) as 1 | 2 | 3));
    }
  };

  const handlePrevious = () => {
    setStep((prev) => (prev === 1 ? 1 : (prev - 1) as 1 | 2 | 3));
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateStep(2)) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const jobData = {
        title: formData.title,
        company_name: formData.company_name,
        location: formData.location,
        region: formData.region,
        job_type: formData.job_type,
        description: formData.description,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        source: 'direct',
        employer_verified: true,
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create job. Please try again.');
        setStep(2);
        return;
      }

      setCreatedJobId(data.job_id);
      setPublishStatus(typeof data.status === 'string' ? data.status : '');
      setSuccess(true);
      setStep(3);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Job submission error:', err);
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Basic Info
  if (step === 1) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Step 1 of 3: Job Basics</h2>
              <p className="text-blue-100 text-sm mt-1">
                Tell us about the job position
              </p>
            </div>
            <div className="text-3xl font-bold opacity-20">1</div>
          </div>
        </div>

        <form className="px-6 py-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              id="job-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              id="company-name"
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="e.g., Tech Corp"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="job-location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                id="job-location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Dubai"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="job-region" className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                id="job-region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="job-type" className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              id="job-type"
              name="job_type"
              value={formData.job_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            >
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              disabled
              className="px-6 py-2 text-gray-400 font-medium disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: Description & Salary
  if (step === 2) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Step 2 of 3: Job Details
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Describe the role and salary
              </p>
            </div>
            <div className="text-3xl font-bold opacity-20">2</div>
          </div>
        </div>

        <form className="px-6 py-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              id="job-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length} characters
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Salary
              </label>
              <input
                type="number"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleInputChange}
                placeholder="50000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Salary
              </label>
              <input
                type="number"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleInputChange}
                placeholder="100000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="salary_currency"
                value={formData.salary_currency}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 3: Review & Publish
  if (step === 3) {
    if (success) {
      return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold">Job Posted Successfully!</h2>
          </div>
          <div className="px-6 py-8 text-center">
            <svg
              className="mx-auto h-16 w-16 text-green-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-gray-700 text-lg mb-6">
              {publishStatus === 'published'
                ? 'Your job is published. Candidates can apply on JobBrowser.'
                : 'Your job was saved and is waiting for review before candidates can apply.'}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">
                <strong>Job Title:</strong> {formData.title}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Job ID:</strong>{' '}
                <code className="bg-gray-200 px-2 py-1 rounded">
                  {createdJobId}
                </code>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/employer/inbox/${createdJobId}`}
                className="flex-1 px-6 py-2 bg-primary-500 text-white font-medium rounded-lg text-center"
              >
                View applicants
              </Link>
              <Link
                href="/employer/jobs"
                className="flex-1 px-6 py-2 border border-gray-300 text-gray-900 font-medium rounded-lg text-center"
              >
                Your jobs
              </Link>
              {publishStatus === 'published' ? (
                <Link
                  href={`/jobs/${createdJobId}`}
                  className="flex-1 px-6 py-2 border border-gray-300 text-gray-900 font-medium rounded-lg text-center"
                >
                  View public job
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Step 3 of 3: Review</h2>
              <p className="text-blue-100 text-sm mt-1">
                Review and publish your job
              </p>
            </div>
            <div className="text-3xl font-bold opacity-20">3</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase">
                Job Title
              </p>
              <p className="text-lg font-bold text-gray-900">{formData.title}</p>
            </div>
            <hr />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Company
                </p>
                <p className="text-gray-900">{formData.company_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Location
                </p>
                <p className="text-gray-900">{formData.location}</p>
              </div>
            </div>
            <hr />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Region
                </p>
                <p className="text-gray-900">{formData.region}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Job Type
                </p>
                <p className="text-gray-900 capitalize">{formData.job_type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Salary
                </p>
                <p className="text-gray-900">
                  {formData.salary_min || '—'} -{' '}
                  {formData.salary_max || '—'} {formData.salary_currency}
                </p>
              </div>
            </div>
            <hr />
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase">
                Description
              </p>
              <p className="text-gray-900 mt-2 whitespace-pre-wrap text-sm">
                {formData.description}
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isLoading}
              className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                'Publish Job'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }
}
