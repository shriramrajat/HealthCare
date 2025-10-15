import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BodyDiagramProps {
  selectedLocation?: string;
  onLocationSelect: (location: string) => void;
  className?: string;
}

const bodyParts = [
  { id: 'head', name: 'Head', x: 50, y: 15, width: 12, height: 10 },
  { id: 'neck', name: 'Neck', x: 50, y: 25, width: 8, height: 5 },
  { id: 'left-shoulder', name: 'Left Shoulder', x: 35, y: 30, width: 8, height: 6 },
  { id: 'right-shoulder', name: 'Right Shoulder', x: 57, y: 30, width: 8, height: 6 },
  { id: 'chest', name: 'Chest', x: 42, y: 35, width: 16, height: 15 },
  { id: 'left-arm', name: 'Left Arm', x: 25, y: 35, width: 6, height: 20 },
  { id: 'right-arm', name: 'Right Arm', x: 69, y: 35, width: 6, height: 20 },
  { id: 'abdomen', name: 'Abdomen', x: 42, y: 50, width: 16, height: 12 },
  { id: 'left-hand', name: 'Left Hand', x: 20, y: 55, width: 8, height: 8 },
  { id: 'right-hand', name: 'Right Hand', x: 72, y: 55, width: 8, height: 8 },
  { id: 'pelvis', name: 'Pelvis', x: 42, y: 62, width: 16, height: 8 },
  { id: 'left-thigh', name: 'Left Thigh', x: 40, y: 70, width: 8, height: 15 },
  { id: 'right-thigh', name: 'Right Thigh', x: 52, y: 70, width: 8, height: 15 },
  { id: 'left-knee', name: 'Left Knee', x: 40, y: 85, width: 8, height: 5 },
  { id: 'right-knee', name: 'Right Knee', x: 52, y: 85, width: 8, height: 5 },
  { id: 'left-calf', name: 'Left Calf', x: 40, y: 90, width: 8, height: 12 },
  { id: 'right-calf', name: 'Right Calf', x: 52, y: 90, width: 8, height: 12 },
  { id: 'left-foot', name: 'Left Foot', x: 38, y: 102, width: 10, height: 6 },
  { id: 'right-foot', name: 'Right Foot', x: 52, y: 102, width: 10, height: 6 }
];

const BodyDiagram: React.FC<BodyDiagramProps> = ({
  selectedLocation,
  onLocationSelect,
  className = ''
}) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const handlePartClick = (partName: string) => {
    onLocationSelect(partName);
  };

  const getPartColor = (partId: string) => {
    if (selectedLocation === bodyParts.find(p => p.id === partId)?.name) {
      return 'fill-red-500 stroke-red-600';
    }
    if (hoveredPart === partId) {
      return 'fill-blue-200 stroke-blue-400';
    }
    return 'fill-gray-200 stroke-gray-300 hover:fill-blue-100';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Click on the body part where you felt the symptom
        </h3>
        {selectedLocation && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-blue-600 font-medium"
          >
            Selected: {selectedLocation}
          </motion.p>
        )}
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <svg
            width="200"
            height="220"
            viewBox="0 0 100 110"
            className="border border-gray-200 rounded-lg bg-white"
          >
            {/* Body outline */}
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#00000020"/>
              </filter>
            </defs>

            {/* Body parts */}
            {bodyParts.map((part) => (
              <motion.ellipse
                key={part.id}
                cx={part.x}
                cy={part.y}
                rx={part.width / 2}
                ry={part.height / 2}
                className={`cursor-pointer transition-all duration-200 ${getPartColor(part.id)}`}
                strokeWidth="1"
                filter="url(#shadow)"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                onClick={() => handlePartClick(part.name)}
              />
            ))}

            {/* Labels for hovered parts */}
            {hoveredPart && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {(() => {
                  const part = bodyParts.find(p => p.id === hoveredPart);
                  if (!part) return null;
                  
                  return (
                    <text
                      x={part.x}
                      y={part.y - part.height / 2 - 3}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700"
                      style={{ fontSize: '3px' }}
                    >
                      {part.name}
                    </text>
                  );
                })()}
              </motion.g>
            )}
          </svg>
        </div>
      </div>

      {/* Quick selection buttons */}
      <div className="space-y-2">
        <p className="text-xs text-gray-600 text-center">Quick select common areas:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Head', 'Chest', 'Abdomen', 'Left Arm', 'Right Arm', 'Left Leg', 'Right Leg'].map((area) => (
            <button
              key={area}
              onClick={() => handlePartClick(area)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedLocation === area
                  ? 'bg-red-100 border-red-300 text-red-700'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-blue-100 hover:border-blue-300'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Clear selection */}
      {selectedLocation && (
        <div className="text-center">
          <button
            onClick={() => onLocationSelect('')}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
};

export default BodyDiagram;