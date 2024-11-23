import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import FormInput from './FormInput';
import { loginSchema, type LoginFormData } from '../../lib/validation';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = loginSchema.parse(formData);
      const { success, error } = await signIn(validatedData.email, validatedData.password);
      
      if (!success) {
        if (error?.toLowerCase().includes('invalid_credentials')) {
          setErrors({
            submit: 'The email or password you entered is incorrect'
          });
        } else if (error?.toLowerCase().includes('too_many_attempts')) {
          setErrors({
            submit: 'Too many login attempts. Please try again later'
          });
        } else if (error?.toLowerCase().includes('network')) {
          setErrors({
            submit: 'Unable to connect to the server. Please check your internet connection'
          });
        } else {
          setErrors({
            submit: error || 'An error occurred while signing in. Please try again'
          });
        }
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setErrors({
          submit: 'An unexpected error occurred. Please try again later'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name] || errors.submit) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        delete updated.submit;
        return updated;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        icon={<Mail className="w-5 h-5 text-gray-400" />}
        placeholder="Enter your email"
      />

      <FormInput
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        icon={<Lock className="w-5 h-5 text-gray-400" />}
        placeholder="Enter your password"
        endIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        }
      />

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{errors.submit}</span>
        </div>
      )}

      <div className="flex items-center justify-end">
        <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
          Forgot your password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};

export default LoginForm;