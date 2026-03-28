import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
    error?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
    value,
    onChange,
    length = 6,
    disabled = false,
    error = false,
}) => {
    const inputRefs = useRef<HTMLInputElement[]>([]);

    // Initialize refs array
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, length);
    }, [length]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newVal = e.target.value.replace(/[^0-9]/g, '');
        if (!newVal) return;

        const currentOtp = value.split('');
        // Only take the last character if multiple characters are entered
        currentOtp[index] = newVal.substring(newVal.length - 1);
        const updatedOtp = currentOtp.join('');
        onChange(updatedOtp);

        // Focus next input
        if (index < length - 1 && newVal) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!value[index] && index > 0) {
                // Focus previous input if current is empty
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current value
                const currentOtp = value.split('');
                currentOtp[index] = '';
                onChange(currentOtp.join(''));
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').substring(0, length);
        if (pastedData) {
            onChange(pastedData);
            // Focus the last filled input or the first empty one
            const focusIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <div className="flex justify-between gap-2 md:gap-4 max-w-sm mx-auto">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { if (el) inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className={`w-full aspect-square text-center text-2xl font-bold bg-white border-2 rounded-xl transition-all outline-none
            ${disabled ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed' :
                            error ? 'border-red-500 bg-red-50 text-red-600 focus:ring-4 focus:ring-red-100' :
                                value[index] ? 'border-[#0065bd] text-slate-800 bg-blue-50/50 ring-2 ring-blue-100' :
                                    'border-slate-200 text-slate-600 hover:border-slate-300 focus:border-[#0065bd] focus:ring-4 focus:ring-blue-100'
                        }`}
                    placeholder="-"
                />
            ))}
        </div>
    );
};
