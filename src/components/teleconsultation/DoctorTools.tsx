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
    // Track the medication being typed in the form
    const [medicationDraft, setMedicationDraft] = useState<Partial<PrescriptionItem>>({
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
    });

    const addMedicationToList = () => {
        const { name, dosage, frequency, duration, instructions } = medicationDraft;

        // Basic validation - need at least name, dosage, and frequency
        if (!name || !dosage || !frequency) return;

        const newPrescription: PrescriptionItem = {
            id: `rx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            name: name.trim(),
            dosage: dosage.trim(),
            frequency: frequency.trim(),
            duration: duration?.trim() || '7 days',
            instructions: instructions?.trim() || ''
        };

        setPrescriptions([...prescriptions, newPrescription]);

        // Clear the form
        setMedicationDraft({
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
        });
    };

    const deleteMedication = (medId: string) => {
        setPrescriptions(prescriptions.filter(rx => rx.id !== medId));
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Medical Notes & Prescriptions
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Diagnosis Section */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Activity className="h-4 w-4 mr-1 text-blue-500" />
                        Primary Diagnosis
                    </label>
                    <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Upper Respiratory Infection"
                    />
                </div>

                {/* Clinical Notes */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-blue-500" />
                        Consultation Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Patient history, symptoms, examination findings..."
                    />
                </div>

                {/* Prescriptions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <Pill className="h-4 w-4 mr-1 text-blue-500" />
                            Medications
                        </label>
                    </div>

                    {/* Add Medication Form */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                        <input
                            placeholder="Drug name (e.g., Ibuprofen)"
                            value={medicationDraft.name}
                            onChange={e => setMedicationDraft({ ...medicationDraft, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                placeholder="Strength (e.g., 400mg)"
                                value={medicationDraft.dosage}
                                onChange={e => setMedicationDraft({ ...medicationDraft, dosage: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <input
                                placeholder="How often (e.g., TID)"
                                value={medicationDraft.frequency}
                                onChange={e => setMedicationDraft({ ...medicationDraft, frequency: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <input
                            placeholder="Treatment length (e.g., 10 days)"
                            value={medicationDraft.duration}
                            onChange={e => setMedicationDraft({ ...medicationDraft, duration: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                            onClick={addMedicationToList}
                            disabled={!medicationDraft.name || !medicationDraft.dosage}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Prescription
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
                                    onClick={() => deleteMedication(med.id)}
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
