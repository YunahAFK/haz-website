// src/pages/AdminHome.tsx
import React, { useState, useEffect } from 'react';
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
  EyeOff,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  deleteObject 
} from 'firebase/storage';

interface Lecture {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string; // Single image from InfoTab
  images: string[]; // Array of images from ContentTab
  createdAt: any;
  status: 'draft' | 'published';
  isPublished?: boolean; // Legacy support
}

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lectureName: string;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, lectureName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Delete Lecture</h3>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">Are you sure you want to delete this lecture?</p>
              <p className="text-sm text-gray-600">"{lectureName}"</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            This action cannot be undone. The lecture and all associated images will be permanently deleted.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Lecture'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Add New Lecture</h3>
      <p className="text-gray-500 text-sm">create a new educational lecture</p>
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

// Lecture Card with Admin Controls
const AdminLectureCard: React.FC<{
  lecture: Lecture;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
  isUpdating?: boolean;
}> = ({ lecture, onEdit, onDelete, onTogglePublish, isUpdating = false }) => {
  const isPublished = lecture.status === 'published' || lecture.isPublished;

  return (
    <div className="relative group">
      <HazardCard
        title={lecture.title}
        image={lecture.image || lecture.images?.[0] || 'https://images.unsplash.com/photo-1689344683256-40b734b440e7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
        description={lecture.description || lecture.content?.substring(0, 100) + '...' || 'No description available'}
        onClick={() => console.log(`Viewing ${lecture.title}`)}
      />
      
      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Updating...</p>
          </div>
        </div>
      )}
      
      {/* Admin Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl">
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPublished 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
        
        {/* Image Count Badge */}
        {lecture.images && lecture.images.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded-full text-xs font-medium">
              {lecture.images.length} image{lecture.images.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        {/* Admin Controls */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePublish(lecture.id);
              }}
              disabled={isUpdating}
              className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-md transition-colors disabled:opacity-50"
              title={isPublished ? 'Unpublish' : 'Publish'}
            >
              {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(lecture.id);
              }}
              disabled={isUpdating}
              className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-md transition-colors disabled:opacity-50"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lecture.id);
              }}
              disabled={isUpdating}
              className="bg-white hover:bg-red-50 text-red-600 p-2 rounded-lg shadow-md transition-colors disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminHome() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [showDrafts, setShowDrafts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingLectures, setUpdatingLectures] = useState<Set<string>>(new Set());
  
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    lecture: Lecture | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    lecture: null,
    isDeleting: false
  });

  const firestore = getFirestore();
  const storage = getStorage();

  const fetchLectures = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const lecturesQuery = query(
        collection(firestore, 'lectures'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(lecturesQuery);
      const fetchedLectures: Lecture[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedLectures.push({
          id: doc.id,
          title: data.title || 'Untitled Lecture',
          description: data.description || '',
          content: data.content || '',
          image: data.image || '',
          images: data.images || [],
          createdAt: data.createdAt,
          status: data.status || (data.isPublished ? 'published' : 'draft'),
          isPublished: data.isPublished ?? false // Legacy support
        });
      });
      
      setLectures(fetchedLectures);
    } catch (err) {
      console.error('Error fetching lectures:', err);
      setError('Failed to load lectures. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const handleAddLecture = () => {
    navigate('/admin/create-lecture');
  };

  const handleEditLecture = (id: string) => {
    navigate(`/admin/create-lecture/${id}`);
  };

  const handleDeleteLecture = (id: string) => {
    const lecture = lectures.find(l => l.id === id);
    if (lecture) {
      setDeleteModal({
        isOpen: true,
        lecture,
        isDeleting: false
      });
    }
  };

  const confirmDeleteLecture = async () => {
    const { lecture } = deleteModal;
    if (!lecture) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const imagesToDelete = [];
      
      if (lecture.image) {
        imagesToDelete.push(lecture.image);
      }
      
      if (lecture.images && lecture.images.length > 0) {
        imagesToDelete.push(...lecture.images);
      }

      for (const imageUrl of imagesToDelete) {
        try {
          if (imageUrl && imageUrl.includes('firebase')) {
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1].split('?')[0];
            const filePath = decodeURIComponent(fileName);
            
            const imageRef = ref(storage, filePath);
            await deleteObject(imageRef);
            console.log(`Deleted image: ${filePath}`);
          }
        } catch (imageError) {
          console.warn(`Failed to delete image ${imageUrl}:`, imageError);
        }
      }

      await deleteDoc(doc(firestore, 'lectures', lecture.id));
      
      setLectures(prev => prev.filter(l => l.id !== lecture.id));
      
      setDeleteModal({
        isOpen: false,
        lecture: null,
        isDeleting: false
      });

      console.log(`Successfully deleted lecture: ${lecture.title}`);
      
    } catch (err) {
      console.error('Error deleting lecture:', err);
      setError('Failed to delete lecture. Please try again.');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        lecture: null,
        isDeleting: false
      });
    }
  };

  const handleTogglePublish = async (id: string) => {
    const lecture = lectures.find(l => l.id === id);
    if (!lecture) return;

    setUpdatingLectures(prev => new Set(prev).add(id));

    try {
      const currentStatus = lecture.status === 'published' || lecture.isPublished;
      const newStatus = currentStatus ? 'draft' : 'published';
      
      await updateDoc(doc(firestore, 'lectures', id), {
        status: newStatus,
        isPublished: newStatus === 'published',
        updatedAt: new Date()
      });
      
      setLectures(prev => prev.map(l => 
        l.id === id ? { 
          ...l, 
          status: newStatus,
          isPublished: newStatus === 'published'
        } : l
      ));

      console.log(`Successfully ${newStatus === 'published' ? 'published' : 'unpublished'} lecture: ${lecture.title}`);
      
    } catch (err) {
      console.error('Error updating publish status:', err);
      setError('Failed to update publish status. Please try again.');
    } finally {
      setUpdatingLectures(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const filteredLectures = showDrafts 
    ? lectures 
    : lectures.filter(l => l.status === 'published' || l.isPublished);

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
              manage lectures and learning resources. 
              create, edit, and publish educational content to keep your community informed.
            </p>
          </div>
        </section>

        {/* Admin Controls */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <AdminControls />
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <section className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      fetchLectures();
                    }}
                    className="ml-auto text-red-600 hover:text-red-800 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Lectures Management Section */}
        <section id="lectures" className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">Manage Lectures</h2>
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
                  <span className="text-sm text-gray-700">Show Drafts</span>
                </label>
                
                <div className="text-sm text-gray-500">
                  {isLoading ? 'Loading...' : `${filteredLectures.length} lecture${filteredLectures.length !== 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading Lectures...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Add New Lecture Card */}
                <AddHazardCard onClick={handleAddLecture} />
                
                {/* Existing Lectures */}
                {filteredLectures.length === 0 && !isLoading ? (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-gray-500">
                      {showDrafts 
                        ? 'No lectures found. Create your first lecture!' 
                        : 'No published lectures found.'}
                    </p>
                  </div>
                ) : (
                  filteredLectures.map((lecture) => (
                    <AdminLectureCard
                      key={lecture.id}
                      lecture={lecture}
                      onEdit={handleEditLecture}
                      onDelete={handleDeleteLecture}
                      onTogglePublish={handleTogglePublish}
                      isUpdating={updatingLectures.has(lecture.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteLecture}
        lectureName={deleteModal.lecture?.title || ''}
        isDeleting={deleteModal.isDeleting}
      />

      <Footer />
    </div>
  );
}