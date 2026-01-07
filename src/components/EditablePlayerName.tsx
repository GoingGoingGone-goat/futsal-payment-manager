'use client';

import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { editPlayer } from '@/app/actions';

export function EditablePlayerName({ id, initialName }: { id: string, initialName: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsSaving(true);

        const formData = new FormData();
        formData.append('id', id);
        formData.append('name', name);

        await editPlayer(formData);

        setIsSaving(false);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[hsl(var(--background))] border border-[hsl(var(--primary))] rounded px-2 py-1 text-2xl font-bold text-foreground w-auto min-w-[200px] focus:outline-none"
                    autoFocus
                />
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-1 rounded-full bg-[hsl(var(--primary))] text-white hover:opacity-90"
                >
                    <Check size={18} />
                </button>
                <button
                    onClick={() => {
                        setName(initialName);
                        setIsEditing(false);
                    }}
                    className="p-1 rounded-full bg-slate-600 text-white hover:opacity-90"
                >
                    <X size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 group">
            <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-tight text-3xl font-bold">
                {initialName}
            </h1>
            <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-white"
            >
                <Pencil size={16} />
            </button>
        </div>
    );
}
