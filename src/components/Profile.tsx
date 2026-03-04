import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Camera, Save, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ProfileData {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
}

export default function Profile({ isOpen, onClose }: ProfileProps) {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load profile data on mount
    useEffect(() => {
        if (isOpen && user) {
            loadProfile();
        }
    }, [isOpen, user]);

    const loadProfile = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        // Get profile from user metadata
        const metadata = user.user_metadata as ProfileData | undefined;

        setFirstName(metadata?.first_name || '');
        setLastName(metadata?.last_name || '');
        setAvatarUrl(metadata?.avatar_url || null);
        setIsLoading(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image must be less than 2MB');
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const uploadAvatar = async (): Promise<string | null> => {
        if (!avatarFile || !user) return avatarUrl;

        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            // If bucket doesn't exist, we'll just skip avatar upload
            return avatarUrl;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Upload avatar if changed
            const newAvatarUrl = await uploadAvatar();

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    avatar_url: newAvatarUrl,
                }
            });

            if (updateError) {
                setError(updateError.message);
            } else {
                setSuccess('Profile updated successfully!');
                setAvatarUrl(newAvatarUrl);
                setAvatarFile(null);
                setAvatarPreview(null);
            }
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const displayAvatar = avatarPreview || avatarUrl;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-white">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">My Profile</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex flex-col items-center">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                            {displayAvatar ? (
                                                <img
                                                    src={displayAvatar}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-12 h-12 text-gray-400" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 p-2 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-primary/90 transition-colors"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Click to change photo</p>
                                </div>

                                {/* Error/Success Messages */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600"
                                        >
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-sm font-medium">{error}</span>
                                        </motion.div>
                                    )}
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-600"
                                        >
                                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-sm font-medium">{success}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Form Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-brand-primary/50 focus:bg-white transition-all text-[#1A2847]"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-brand-primary/50 focus:bg-white transition-all text-[#1A2847]"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-4 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                </div>

                                {/* Save Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full h-14 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/30 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" /> Save Changes
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
