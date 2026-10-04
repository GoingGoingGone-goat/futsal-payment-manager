'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    pendingText?: string;
    className?: string;
}

export function SubmitButton({
    children,
    pendingText,
    className = '',
    disabled,
    ...props
}: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending || disabled}
            className={`${className} ${pending ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}
            {...props}
        >
            {pending ? (
                <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>{pendingText || 'Saving...'}</span>
                </span>
            ) : (
                children
            )}
        </button>
    );
}

export default SubmitButton;
