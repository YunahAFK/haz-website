// src/pages/AdminHome.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HazardCard } from '../components/hazard/HazardCard';
import { Footer } from '../components/layout/Footer';
import { 
  Plus, 
  Settings, 
  Users, 
  BarChart3, 
  Shield, 
  Edit3, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface Hazard {
  id: string;
  title: string;
  image: string;
  description: string;
  isPublished?: boolean;
}

const initialHazards: Hazard[] = [
  {
    id: 'typhoon',
    title: 'Typhoon',
    image: 'https://images.unsplash.com/photo-1601110958456-0bee398ce406?...',
    description: 'Powerful tropical storms with strong winds and heavy rainfall that can cause significant damage.',
    isPublished: true
  },
  {
    id: 'flooding',
    title: 'Flooding',
    image: 'https://images.unsplash.com/photo-1657069343871-fd1476990d04?...',
    description: 'Water overflow that submerges normally dry land, often caused by heavy rainfall or dam failure.',
    isPublished: true
  },
  {
    id: 'volcanic',
    title: 'Volcanic Eruption',
    image: 'https://images.unsplash.com/photo-1623059570754-5462839e76a7?...',
    description: 'Explosive release of lava, ash, and gases from volcanic activity that can affect large areas.',
    isPublished: false
  }
];

// Add New Hazard Card Component
const AddHazardCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer group min-h-[320px] flex flex-col items-center justify-center"
  >
    <div className="text-center p-8">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
        <Plus className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Add New Hazard</h3>
      <p className="text-gray-500 text-sm">Create a new hazard information card</p>
    </div>
  </div>
);

// Admin Controls Component
const AdminControls: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <Shield className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Admin Dashboard</h3>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
        <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Users className="w-4 h-4" />
          <span>Users</span>
        </button>
        <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  </div>
);

// Enhanced Hazard Card with Admin Controls
const AdminHazardCard: React.FC<{
  hazard: Hazard;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
}> = ({ hazard, onEdit, onDelete, onTogglePublish }) => (
  <div className="relative group">
    <HazardCard
      title={hazard.title}
      image={hazard.image}
      description={hazard.description}
      onClick={() => console.log(`Viewing ${hazard.title}`)}
    />
    
    {/* Admin Overlay */}
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl">
      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          hazard.isPublished 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        }`}>
          {hazard.isPublished ? 'Published' : 'Draft'}
        </span>
      </div>
      
      {/* Admin Controls */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePublish(hazard.id);
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-md transition-colors"
            title={hazard.isPublished ? 'Unpublish' : 'Publish'}
          >
            {hazard.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(hazard.id);
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-md transition-colors"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(hazard.id);
            }}
            className="bg-white hover:bg-red-50 text-red-600 p-2 rounded-lg shadow-md transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function AdminHome() {
  const navigate = useNavigate();
  const [hazards, setHazards] = useState<Hazard[]>(initialHazards);
  const [showDrafts, setShowDrafts] = useState(true);

  const handleAddHazard = () => {
    navigate('/admin/create-lecture');
  };

  const handleEditHazard = (id: string) => {
    console.log(`Editing hazard: ${id}`);
    // Navigate to edit form or open edit modal
  };

  const handleDeleteHazard = (id: string) => {
    if (window.confirm('Are you sure you want to delete this hazard?')) {
      setHazards(hazards.filter(h => h.id !== id));
    }
  };

  const handleTogglePublish = (id: string) => {
    setHazards(hazards.map(h => 
      h.id === id ? { ...h, isPublished: !h.isPublished } : h
    ));
  };

  const filteredHazards = showDrafts 
    ? hazards 
    : hazards.filter(h => h.isPublished);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      <main className="relative">
        {/* Hero Section */}
        <section className="text-center py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl sm:text-8xl font-bold text-gray-900 mb-8 tracking-tight">
              HAZ
              <span className="text-blue-600 text-3xl sm:text-4xl ml-2">Admin</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Manage hazard information and disaster preparedness resources. 
              Create, edit, and publish content to keep your community informed.
            </p>
          </div>
        </section>

        {/* Admin Controls */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <AdminControls />
          </div>
        </section>

        {/* Hazards Management Section */}
        <section id="hazards" className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">Manage Hazards</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDrafts}
                    onChange={(e) => setShowDrafts(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show drafts</span>
                </label>
                
                <div className="text-sm text-gray-500">
                  {filteredHazards.length} hazard{filteredHazards.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Add New Hazard Card */}
              <AddHazardCard onClick={handleAddHazard} />
              
              {/* Existing Hazards */}
              {filteredHazards.map((hazard) => (
                <AdminHazardCard
                  key={hazard.id}
                  hazard={hazard}
                  onEdit={handleEditHazard}
                  onDelete={handleDeleteHazard}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}