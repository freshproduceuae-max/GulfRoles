'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}

export default function ApplyModal({ jobId, jobTitle, onClose }: ApplyModalProps) {
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    cover_letter: '',
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, DOC, DOCX, and TXT files are allowed');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setError(null);
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.applicant_name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.applicant_email.trim()) {
        throw new Error('Email is required');
      }
      if (!formData.applicant_email.includes('@')) {
        throw new Error('Valid email is required');
      }
      if (!resumeFile) {
        throw new Error('Resume file is required');
      }

      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('job_id', jobId);
      formDataToSend.append('applicant_name', formData.applicant_name);
      formDataToSend.append('applicant_email', formData.applicant_email);
      if (formData.applicant_phone) {
        formDataToSend.append('applicant_phone', formData.applicant_phone);
      }
      if (formData.cover_letter) {
        formDataToSend.append('cover_letter', formData.cover_letter);
      }
      formDataToSend.append('resume', resumeFile);

      // Submit application
      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Application Submitted">
        <div className="py-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Application Submitted!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your application has been successfully submitted. The employer will review it shortly.
          </p>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Apply for ${jobTitle}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-100">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Full Name *
          </label>
          <Input
            type="text"
            name="applicant_name"
            value={formData.applicant_name}
            onChange={handleInputChange}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Email Address *
          </label>
          <Input
            type="email"
            name="applicant_email"
            value={formData.applicant_email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Phone Number
          </label>
          <Input
            type="tel"
            name="applicant_phone"
            value={formData.applicant_phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Resume (PDF, DOC, DOCX, or TXT) *
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              id="resume-input"
              required
            />
            <label
              htmlFor="resume-input"
              className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
            >
              <div className="text-center">
                <svg className="w-6 h-6 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Max 5MB</p>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Cover Letter (Optional)
          </label>
          <textarea
            name="cover_letter"
            value={formData.cover_letter}
            onChange={handleInputChange}
            placeholder="Tell us why you're a great fit for this role..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            className="flex-1"
          >
            Submit Application
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
