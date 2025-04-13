import React, { useState } from "react";
import { firebaseAuthService } from "../../lib/FirebaseAuthService";

interface EmailOTPVerificationProps {
  email: string;
  onVerificationComplete: (success: boolean) => void;
  onCancel: () => void;
}

export const EmailOTPVerification: React.FC<EmailOTPVerificationProps> = ({
  email,
  onVerificationComplete,
  onCancel,
}) => {
  const [otp, setOtp] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState<boolean>(false);

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await firebaseAuthService.sendEmailOTP(email);
      if (success) {
        setOtpSent(true);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while sending OTP.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await firebaseAuthService.validateEmailOTP(email, otp);
      onVerificationComplete(success);
    } catch (err) {
      setError("An error occurred while verifying OTP.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtpSent(false);
    setOtp("");
    setError(null);
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center">Email Verification</h2>

      {!otpSent ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            We'll send a verification code to{" "}
            <span className="font-semibold">{email}</span>
          </p>
          <button
            onClick={handleSendOTP}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send Verification Code"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold">{email}</span>
          </p>
          <div className="flex justify-center">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-48 py-2 px-3 border border-gray-300 rounded-md text-center text-xl tracking-widest"
              placeholder="000000"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Resend
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        onClick={onCancel}
        className="mt-2 text-sm text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  );
};
