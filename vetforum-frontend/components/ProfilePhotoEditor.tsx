import React, { useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';

interface ProfilePhotoEditorProps {
    image: File;
    onSave: (file: File) => void;
    onCancel: () => void;
}

export const ProfilePhotoEditor: React.FC<ProfilePhotoEditorProps> = ({ image, onSave, onCancel }) => {
    const editorRef = useRef<AvatarEditor>(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);

    const handleSave = async () => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], image.name, { type: 'image/jpeg' });
                    onSave(file);
                }
            }, 'image/jpeg', 0.9);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Edit Profile Photo</h3>
                    <button
                        onClick={onCancel}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Editor */}
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-slate-100 rounded-xl p-4">
                        <AvatarEditor
                            ref={editorRef}
                            image={image}
                            width={250}
                            height={250}
                            border={20}
                            borderRadius={125}
                            color={[255, 255, 255, 0.6]}
                            scale={scale}
                            rotate={rotate}
                        />
                    </div>

                    {/* Zoom Control */}
                    <div className="w-full">
                        <label className="text-sm font-medium text-slate-600 block mb-2">
                            Zoom
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setScale(Math.max(1, scale - 0.1))}
                                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.01"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="flex-1"
                            />
                            <button
                                onClick={() => setScale(Math.min(3, scale + 0.1))}
                                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <ZoomIn size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Rotation Control */}
                    <div className="w-full">
                        <label className="text-sm font-medium text-slate-600 block mb-2">
                            Rotation
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setRotate((rotate - 90) % 360)}
                                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <RotateCw size={18} className="transform -scale-x-100" />
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                step="1"
                                value={rotate}
                                onChange={(e) => setRotate(parseInt(e.target.value))}
                                className="flex-1"
                            />
                            <button
                                onClick={() => setRotate((rotate + 90) % 360)}
                                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <RotateCw size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full mt-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            Save Photo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
