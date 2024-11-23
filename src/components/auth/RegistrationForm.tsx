import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import FormInput from './FormInput';
import { registrationSchema, type RegistrationFormData } from '../../lib/validation';

interface PasswordRequirement {
  label: string;
  test: (value: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: 'At least 8 characters long',
    test: (value) => value.length >= 8
  },
  {
    label: 'Contains at least one uppercase letter',
    test: (value) => /[A-Z]/.test(value)
  },
  {
    label: 'Contains at least one lowercase letter',
    test: (value) => /[a-z]/.test(value)
  },
  {
    label: 'Contains at least one number',
    test: (value) => /\d/.test(value)
  },
  {
    label: 'Contains at least one special character',
    test: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value)
  }
];

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<RegistrationFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = registrationSchema.parse(formData);
      const { success, error } = await signUp(
        validatedData.email,
        validatedData.password,
        validatedData.username
      );

      if (!success) {
        if (error?.toLowerCase().includes('email')) {
          setErrors({ email: 'This email is already in use' });
        } else if (error?.toLowerCase().includes('username')) {
          setErrors({ username: 'This username is already taken' });
        } else {
          setErrors({ submit: error || 'Registration failed' });
        }
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setErrors({
          submit: 'An unexpected error occurred during registration'
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
        label="Username"
        name="username"
        type="text"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        icon={<User className="w-5 h-5 text-gray-400" />}
        placeholder="Choose a username"
      />

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

      <div className="space-y-4">
        <FormInput
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={<Lock className="w-5 h-5 text-gray-400" />}
          placeholder="Create a password"
          onFocus={() => setPasswordFocus(true)}
          onBlur={() => setPasswordFocus(false)}
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

        {passwordFocus && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Password Requirements:
            </h4>
            <ul className="space-y-2">
              {PASSWORD_REQUIREMENTS.map((req, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm"
                >
                  {req.test(formData.password) ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className={req.test(formData.password) ? 'text-green-700' : 'text-gray-600'}>
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <FormInput
        label="Confirm Password"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        icon={<Lock className="w-5 h-5 text-gray-400" />}
        placeholder="Confirm your password"
        endIcon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="focus:outline-none"
          >
            {showConfirmPassword ? (
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
};

export default RegistrationForm;