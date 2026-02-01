import React, { useState } from 'react';
import { Plus, Trash2, FileText, Activity, Pill } from 'lucide-react';
import { PrescriptionItem } from '../../types';

interface DoctorToolsProps {
    notes: string;
    setNotes: (notes: string) => void;
    diagnosis: string;
    setDiagnosis: (diagnosis: string) => void;
    prescriptions: PrescriptionItem[];
    setPrescriptions: (prescriptions: PrescriptionItem[]) => void;
}

const DoctorTools: React.FC<DoctorToolsProps> = ({
    notes,
    setNotes,
    diagnosis,
    setDiagnosis,
    prescriptions,
    setPrescriptions
}) => {
    const [newMed, setNewMed] = useState<Partial<PrescriptionItem>>({
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
    });

    const handleAddMedication = () => {
        if (newMed.name && newMed.dosage && newMed.frequency) {
            setPrescriptions([
                ...prescriptions,
                {
                    id: Math.random().toString(36).substr(2, 9),
                    name: newMed.name,
                    dosage: newMed.dosage,
                    frequency: newMed.frequency,
                    duration: newMed.duration || '7 days',
                    instructions: newMed.instructions || ''
                } as PrescriptionItem
            ]);
            setNewMed({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
        }
    };

    const removeMedication = (id: string) => {
        setPrescriptions(prescriptions.filter(p => p.id !== id));
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Doctor Consultation Tools
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Diagnosis Section */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Activity className="h-4 w-4 mr-1 text-blue-500" />
                        Diagnosis
                    </label>
                    <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Acute Viral Bronchitis"
                    />
                </div>

                {/* Clinical Notes */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-blue-500" />
                        Clinical Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Patient presented with..."
                    />
                </div>

                {/* Prescriptions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <Pill className="h-4 w-4 mr-1 text-blue-500" />
                            Prescription
                        </label>
                    </div>

                    {/* Add Medication Form */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                        <input
                            placeholder="Medication Name (e.g. Amoxicillin)"
                            value={newMed.name}
                            onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                placeholder="Dosage (e.g. 500mg)"
                                value={newMed.dosage}
                                onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <input
                                placeholder="Freq (e.g. 3x daily)"
                                value={newMed.frequency}
                                onChange={e => setNewMed({ ...newMed, frequency: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <input
                            placeholder="Duration (e.g. 5 days)"
                            value={newMed.duration}
                            onChange={e => setNewMed({ ...newMed, duration: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                            onClick={handleAddMedication}
                            disabled={!newMed.name || !newMed.dosage}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Medication
                        </button>
                    </div>

                    {/* List of Meds */}
                    <div className="space-y-2">
                        {prescriptions.map((med) => (
                            <div key={med.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <div>
                                    <p className="font-medium text-sm text-gray-900">{med.name} <span className="text-gray-500 text-xs">({med.dosage})</span></p>
                                    <p className="text-xs text-gray-500">{med.frequency} for {med.duration}</p>
                                </div>
                                <button
                                    onClick={() => removeMedication(med.id)}
                                    className="text-gray-400 hover:text-red-500 p-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorTools;
