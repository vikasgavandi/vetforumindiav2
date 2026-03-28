
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Availability } from '../types';
import { Save, User as UserIcon, Briefcase, Calendar, MapPin, Mail, Phone, Clock, Plus, Trash2, Camera, Upload } from 'lucide-react';
import { getUserAvatarUrl } from '../services/imageUtils';
import { ProfilePhotoEditor } from '../components/ProfilePhotoEditor';

export const Profile: React.FC = () => {
  const { user, updateUser, uploadProfilePhoto, deleteProfilePhoto, fetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'availability'>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    state: '',
    bio: '',
    currentPosition: '',
    specialization: '',
    qualification: '',
    designation: '',
    experience: '',
    fee: 0,
    availability: [
      { day: 'Mon', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Tue', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Wed', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Thu', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Fri', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Sat', isAvailable: false, slots: [] },
      { day: 'Sun', isAvailable: false, slots: [] },
    ]
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        mobile: user.mobile || '',
        state: user.state || '',
        bio: user.bio || '',
        currentPosition: user.currentPosition || '',
        specialization: user.specialization || '',
        qualification: user.qualification || '',
        designation: user.designation || '',
        experience: user.experience || '',
        fee: user.fee || 0,
        availability: user.availability || formData.availability
      });
    }
  }, [user]);

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAvailability = (index: number) => {
    const newAvailability = [...formData.availability];
    newAvailability[index].isAvailable = !newAvailability[index].isAvailable;
    // Add default slot if turning on
    if (newAvailability[index].isAvailable && newAvailability[index].slots.length === 0) {
      newAvailability[index].slots.push({ start: '09:00', end: '17:00' });
    }
    setFormData(prev => ({ ...prev, availability: newAvailability }));
  };

  const handleSlotChange = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    const newAvailability = [...formData.availability];
    newAvailability[dayIndex].slots[slotIndex] = {
      ...newAvailability[dayIndex].slots[slotIndex],
      [field]: value
    };
    setFormData(prev => ({ ...prev, availability: newAvailability }));
  };

  const handlePhotoUpload = async (file: File) => {
    setError('');
    setSuccess('');

    const result = await uploadProfilePhoto(file);
    if (result.success) {
      setSuccess('Profile photo updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Photo update failed');
    }
    setShowPhotoOptions(false);
  };

  const handlePhotoDelete = async () => {
    setError('');
    setSuccess('');

    const result = await deleteProfilePhoto();
    if (result.success) {
      setSuccess('Profile photo deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Photo delete failed');
    }
    setShowPhotoOptions(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setShowPhotoOptions(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    const result = await updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      state: formData.state,
      bio: formData.bio
    });

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Update failed');
    }

    setIsSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card - Minimalist LinkedIn Style */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Subtle Background Header */}
        <div className="h-32 bg-slate-100 border-b border-slate-200"></div>

        <div className="px-8 pb-8 flex flex-col md:flex-row gap-8 relative">
          {/* Profile Image - Raised over Subtle Header */}
          <div className="flex flex-col items-center -mt-16 md:-mt-20 relative z-10">
            <div className="relative group">
              {getUserAvatarUrl(user) ? (
                <img
                  src={getUserAvatarUrl(user)!}
                  alt="Profile"
                  className="w-40 h-40 rounded-full border-4 border-white shadow-md object-cover bg-white"
                />
              ) : (
                <div className="w-40 h-40 rounded-full border-4 border-white shadow-md bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-5xl">
                  {user.firstName?.charAt(0)}
                </div>
              )}
              <button
                onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                className="absolute bottom-2 right-2 bg-white border border-slate-200 text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Camera size={20} />
              </button>

              {showPhotoOptions && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 min-w-[180px] animate-in fade-in zoom-in duration-150">
                  <button
                    onClick={() => {
                      cameraInputRef.current?.click();
                      setShowPhotoOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
                  >
                    <Camera size={16} /> Take Photo
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowPhotoOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
                  >
                    <Upload size={16} /> Upload Photo
                  </button>
                  {user.profilePhoto && (
                    <button
                      onClick={handlePhotoDelete}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                    >
                      <Trash2 size={16} /> Delete Photo
                    </button>
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Details Area */}
          <div className="flex-1 pt-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
                      ${user.role === UserRole.VET ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-teal-50 text-teal-700 border border-teal-100'}`}>
                    {user.role}
                  </span>
                </div>

                <div className="text-slate-600 font-medium text-sm flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-6 mt-3">
                  <span className="flex items-center gap-1.5"><Mail size={16} className="text-slate-400" /> {user.email}</span>
                  {formData.state && (
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {formData.state}</span>
                  )}
                  {formData.mobile && (
                    <span className="flex items-center gap-1.5"><Phone size={16} className="text-slate-400" /> {formData.mobile}</span>
                  )}
                </div>

                <div className="mt-4 max-w-2xl">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {formData.bio || "Professional profile bio. Add information about your expertise and background."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2
             ${activeTab === 'personal' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <UserIcon size={16} /> Personal Info
        </button>

        {user.role === UserRole.VET && (
          <>
            <button
              onClick={() => setActiveTab('professional')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2
                     ${activeTab === 'professional' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Briefcase size={16} /> Professional Details
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2
                     ${activeTab === 'availability' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Calendar size={16} /> Availability
            </button>
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

        {/* PERSONAL TAB */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input type="email" value={user.email} disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-500 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number</label>
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">About</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500" placeholder="Tell us about yourself..." />
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-6">
            {success}
          </div>
        )}

        {/* PROFESSIONAL TAB (VETS) */}
        {activeTab === 'professional' && user.role === UserRole.VET && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Qualifications</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Specialization</label>
                <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Degree / Qualification</label>
                <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. BVSc & AH" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Designation</label>
                <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Senior Surgeon" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Practice Details</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Experience (Years)</label>
                <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Consultation Fee (₹)</label>
                <input type="number" name="fee" value={formData.fee} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* AVAILABILITY TAB (VETS) */}
        {activeTab === 'availability' && user.role === UserRole.VET && (
          <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Weekly Schedule</h3>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span> Available
                <span className="w-2 h-2 bg-slate-300 rounded-full ml-2"></span> Unavailable
              </div>
            </div>

            <div className="space-y-3">
              {formData.availability.map((dayData, index) => (
                <div key={dayData.day} className={`flex flex-col p-4 rounded-xl border transition-all
                             ${dayData.isAvailable ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-70'}`}>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                                        ${dayData.isAvailable ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'}`}>
                        {dayData.day}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dayData.isAvailable}
                          onChange={() => toggleAvailability(index)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>

                  {dayData.isAvailable && (
                    <div className="pl-16 space-y-2">
                      {dayData.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleSlotChange(index, slotIndex, 'start', e.target.value)}
                            className="bg-transparent border border-slate-200 rounded p-1 text-sm outline-none focus:border-teal-500"
                          />
                          <span className="text-slate-400">-</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleSlotChange(index, slotIndex, 'end', e.target.value)}
                            className="bg-transparent border border-slate-200 rounded p-1 text-sm outline-none focus:border-teal-500"
                          />
                          {/* Note: Profile page has simplified editing. Full editing on dedicated Vet Profile page. */}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">For advanced schedule management (adding/removing specific slots), please visit your <a href={`#/vet/${user.id}`} className="text-green-600 font-bold hover:underline">Public Profile</a>.</p>
            </div>
          </div>
        )}

        {/* Save Button at Bottom */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-600/20 disabled:opacity-50 ml-auto"
          >
            {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </div>

      </div>

      {/* Profile Photo Editor Modal */}
      {selectedImage && (
        <ProfilePhotoEditor
          image={selectedImage}
          onSave={(file) => {
            setSelectedImage(null);
            handlePhotoUpload(file);
          }}
          onCancel={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};
