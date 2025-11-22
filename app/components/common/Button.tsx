import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'passion' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    // Base classes
    const baseClasses = 'rounded-xl font-medium transition-all duration-300 flex items-center justify-center'

    // Variant classes
    const variantClasses = {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 shadow-sm hover:shadow-romantic',
        secondary: 'bg-white text-secondary-600 border border-secondary-300 hover:bg-secondary-50 hover:border-secondary-400 focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2',
        passion: 'bg-passion-500 text-white hover:bg-passion-600 focus:ring-2 focus:ring-passion-400 focus:ring-offset-2 shadow-sm hover:shadow-passion',
        outline: 'bg-transparent text-primary-700 border border-primary-300 hover:bg-primary-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        ghost: 'bg-transparent text-primary-700 hover:bg-primary-100 focus:outline-none',
    }

    // Size classes
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    }

    // Width class
    const widthClass = fullWidth ? 'w-full' : ''

    // Disabled class
    const disabledClass = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : ''

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}

            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}

            {children}

            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    )
}

export default Button