import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Upload, CheckCircle } from "lucide-react";
import { OtpInput } from "../components/OtpInput";
import { UserRole, VetType } from "../types";
// import vetLogo from '../images/vetLogo.svg';
import vetfulllogo from '../images/Vet forum india logo final.svg';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, requestOtp, authError, clearAuthError } = useAuth();

  // Step Management
  const [role, setRole] = useState<"veterinarian" | "non-veterinarian" | null>(
    null
  );
  const [vetType, setVetType] = useState<VetType | null>(null);
  const [error, setError] = useState<string>("");

  // Form Data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    mobile: "",
    state: "",
    country: "",
    password: "",
    confirmPassword: "",

    // Student Fields
    year: "1st",
    college: "",
    university: "",
    studentId: "",

    // Vet Fields
    vetRegNo: "",
    qualification: "",

    document: null as File | null,
    otp: "",
  });

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFormData(prev => ({ ...prev, document: selectedFile }));
      if (clearAuthError) clearAuthError();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clearAuthError) clearAuthError();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate role selection
    if (!role) {
      setError("Please select whether you are a veterinarian or not");
      return;
    }

    // Validate veterinarian type if user is a veterinarian
    if (role === "veterinarian" && !vetType) {
      setError("Please select whether you are a student or graduated");
      return;
    }

    // Validate required fields for students
    if (role === "veterinarian" && vetType === VetType.STUDENT) {
      if (!formData.college.trim()) {
        setError("College name is required for students");
        return;
      }
      if (!formData.university.trim()) {
        setError("University name is required for students");
        return;
      }
      if (!formData.studentId.trim()) {
        setError("Student ID is required for students");
        return;
      }
    }

    // Validate required fields for graduated veterinarians
    if (role === "veterinarian" && vetType === VetType.GRADUATED) {
      if (!formData.qualification.trim()) {
        setError("Qualification is required for graduated veterinarians");
        return;
      }
      if (!formData.vetRegNo.trim()) {
        setError("Veterinary registration number is required for graduated veterinarians");
        return;
      }
    }

    // Validate document upload for veterinarians
    if (role === "veterinarian" && !formData.document) {
      setError("Proof document is required for veterinarians");
      return;
    }

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Construct User Object
    const newUser = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      state: formData.state,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      isVeterinarian: role === "veterinarian" ? true : false,

      // Vet specific
      yearOfStudy:
        role === "veterinarian" && vetType === VetType.STUDENT
          ? formData.year
          : undefined,
      college:
        role === "veterinarian" && vetType === VetType.STUDENT
          ? formData.college
          : undefined,
      university:
        role === "veterinarian" && vetType === VetType.STUDENT
          ? formData.university
          : undefined,
      studentId:
        role === "veterinarian" && vetType === VetType.STUDENT
          ? formData.studentId
          : undefined,

      vetRegNo:
        role === "veterinarian" && vetType === VetType.GRADUATED
          ? formData.vetRegNo
          : undefined,
      qualification:
        role === "veterinarian" && vetType === VetType.GRADUATED
          ? formData.qualification
          : undefined,

      document: role === "veterinarian" ? formData.document : undefined,
      veterinarianType: role === "veterinarian" ? vetType : undefined,
      veterinarianState: role === "veterinarian" ? formData.state : undefined,
      otp: formData.otp, // NEW: Expose OTP to the register payload
    };

    const result = await register(newUser);
    if (result.success) {
      setIsRegistrationSuccess(true);
    } else {
      setError(result.error || "Registration failed");
    }
  };

  const handleSendOTP = async () => {
    setError("");

    // Validate email before sending OTP
    if (!formData.email.trim()) {
      setError("Email is required to send OTP");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoadingOtp(true);
    try {
      const result = await requestOtp(formData.email, formData.firstName);
      if (result.success) {
        setIsOtpSent(true);
      } else {
        setError(result.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("An error occurred while sending OTP");
    } finally {
      setIsLoadingOtp(false);
    }
  };

  if (isRegistrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-[#0065bd]" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Profile Under Verification
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Thank you for registering with Vet Forum India! Your profile has been submitted and is currently under verification by our team.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-sm text-[#0065bd] font-medium">
            You will receive an email notification once your profile is approved.
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-[#0065bd] hover:bg-[#0054a3] text-white font-bold rounded-xl transition-all shadow-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Sidebar */}
      <div className="hidden md:flex w-1/3 bg-[#0065bd] flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center justify-center p-3 mb-6">
            {/* <ShieldCheck className="text-[#0065bd]" size={40} /> */}
            <img src={vetfulllogo} />
          </div>
          {/* <h1 className="text-4xl font-bold mb-4">
            Join
            <br />
            Vet Forum
            <br />
            India
          </h1> */}
          <p className="text-blue-100 text-lg">
            Let's Connect with purpose, Innovate with passion and Elevate our shared vision.
          </p>
        </div>
        <div className="text-sm text-blue-200">
          @2026 Vet Forum India. All Rights Reserved. Empowering & Connecting Veterinary Professionals Across India.
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 overflow-y-auto h-screen p-8 md:p-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">
              Create Account
            </h2>
            <Link
              to="/login"
              className="text-[#0065bd] font-medium hover:underline"
            >
              Sign In
            </Link>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Mobile No
                </label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                  onChange={handleInputChange}
                  placeholder="+91"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                onChange={handleInputChange}
                placeholder="name@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Role Question */}
            <div className="space-y-3">
              <label className="text-base font-bold text-slate-800">
                Are you a Veterinarian? *
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setRole("veterinarian"); if (clearAuthError) clearAuthError(); }}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2
                                ${role === "veterinarian"
                      ? "border-[#0065bd] bg-blue-50 text-[#0065bd]"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  <CheckCircle
                    size={18}
                    className={
                      role === "veterinarian" ? "opacity-100" : "opacity-0"
                    }
                  />
                  Yes, I am
                </button>
                <button
                  type="button"
                  onClick={() => { setRole("non-veterinarian"); if (clearAuthError) clearAuthError(); }}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2
                                ${role === "non-veterinarian"
                      ? "border-[#0065bd] bg-blue-50 text-[#0065bd]"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  <CheckCircle
                    size={18}
                    className={
                      role === "non-veterinarian" ? "opacity-100" : "opacity-0"
                    }
                  />
                  No
                </button>
              </div>
            </div>

            {/* Veterinarian Specifics */}
            {role === "veterinarian" && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6 animate-in fade-in">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">
                    Are you a Student or Graduated? *
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => { setVetType(VetType.STUDENT); if (clearAuthError) clearAuthError(); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${vetType === VetType.STUDENT
                        ? "bg-[#0065bd] text-white border-[#0065bd]"
                        : "bg-white text-slate-600 border-slate-300"
                        }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => { setVetType(VetType.GRADUATED); if (clearAuthError) clearAuthError(); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${vetType === VetType.GRADUATED
                        ? "bg-[#0065bd] text-white border-[#0065bd]"
                        : "bg-white text-slate-600 border-slate-300"
                        }`}
                    >
                      Graduated
                    </button>
                  </div>
                </div>

                {vetType === VetType.STUDENT && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">
                        Current Year
                      </label>
                      <select
                        name="year"
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                        onChange={handleInputChange}
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Final Year</option>
                        <option>Internship</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">
                        College Name *
                      </label>
                      <input
                        type="text"
                        name="college"
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">
                        University *
                      </label>
                      <input
                        type="text"
                        name="university"
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">
                        Student ID Number *
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                {vetType === VetType.GRADUATED && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">
                        Degree / Qualification *
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        required
                        placeholder="e.g. BVSc & AH"
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">
                        Veterinary Registration / IVC Number *
                      </label>
                      <input
                        type="text"
                        name="vetRegNo"
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">
                    Proof Document Upload *
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    Attach valid proof (Student ID, Marks Card, Degree
                    Certificate, etc.)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png" // Optional: limit file types
                  />
                  <div
                    onClick={triggerFileInput}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer
                      ${formData.document ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-white hover:border-[#0065bd] hover:text-[#0065bd] text-slate-500'}`}
                  >
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm">
                      {formData.document ? `Selected: ${formData.document.name}` : 'Click to upload document'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Server-side / Auth error from context */}
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {authError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0065bd]"
                  onChange={handleInputChange}
                />
              </div>
            </div>



            {isOtpSent && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="text-center space-y-2">
                  <label className="text-sm font-bold text-[#0065bd] uppercase tracking-wider">
                    Verify Your Email
                  </label>
                  <p className="text-sm text-slate-500">
                    We've sent a 6-digit code to <span className="font-semibold text-slate-700">{formData.email}</span>
                  </p>
                </div>

                <OtpInput
                  value={formData.otp}
                  onChange={(val) => setFormData(prev => ({ ...prev, otp: val }))}
                  error={!!authError && isOtpSent}
                />

                <div className="flex flex-col items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoadingOtp}
                    className="text-sm text-[#0065bd] font-semibold hover:text-[#0054a3] transition-colors disabled:opacity-50"
                  >
                    {isLoadingOtp ? 'Sending...' : "Didn't receive code? Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoadingOtp}
              onClick={(e) => {
                if (!isOtpSent) {
                  e.preventDefault();
                  handleSendOTP();
                }
              }}
              className="w-full py-4 bg-[#7ab84f] hover:bg-[#6ca545] text-white font-bold rounded-xl transition-all shadow-lg mt-6 text-lg disabled:opacity-75"
            >
              {!isOtpSent ? (isLoadingOtp ? 'Sending OTP...' : 'Verify Email via OTP') : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
