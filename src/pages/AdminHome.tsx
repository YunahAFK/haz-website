// src/pages/AdminHome.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import {
  getFirestore, collection, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';

// Import new reusable components
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { AddItemCard } from '../components/ui/AddItemCard';
import { AdminLectureCard } from '../components/lecture/AdminLectureCard';

interface Lecture {
  id: string;
  title: string;
  description: string;
  content: string;
  image?: string;
  images?: string[];
  createdAt: any;
  status: 'draft' | 'published';
  isPublished?: boolean;
}

export default function AdminHome() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [showDrafts, setShowDrafts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingLectures, setUpdatingLectures] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    lecture: null as Lecture | null,
    isDeleting: false
  });

  const firestore = getFirestore();
  const storage = getStorage();

  const fetchLectures = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const lecturesQuery = query(collection(firestore, 'lectures'), orderBy('createdAt', 'desc'));
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
          isPublished: data.isPublished ?? false
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

  const handleDeleteLecture = (id: string) => {
    const lecture = lectures.find(l => l.id === id);
    if (lecture) {
      setDeleteModal({ isOpen: true, lecture, isDeleting: false });
    }
  };

  const confirmDeleteLecture = async () => {
    const { lecture } = deleteModal;
    if (!lecture) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      // Delete images from storage
      const imagesToDelete = [
        ...(lecture.image ? [lecture.image] : []),
        ...(lecture.images || [])
      ];

      for (const imageUrl of imagesToDelete) {
        try {
          if (imageUrl && imageUrl.includes('firebase')) {
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1].split('?')[0];
            const filePath = decodeURIComponent(fileName);
            await deleteObject(ref(storage, filePath));
          }
        } catch (imageError) {
          console.warn(`Failed to delete image ${imageUrl}:`, imageError);
        }
      }

      await deleteDoc(doc(firestore, 'lectures', lecture.id));
      setLectures(prev => prev.filter(l => l.id !== lecture.id));
      setDeleteModal({ isOpen: false, lecture: null, isDeleting: false });
    } catch (err) {
      console.error('Error deleting lecture:', err);
      setError('Failed to delete lecture. Please try again.');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
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
        l.id === id ? { ...l, status: newStatus, isPublished: newStatus === 'published' } : l
      ));
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

  const handleRetryFetch = () => {
    setError(null);
    fetchLectures();
  };

  const handleDismissError = () => {
    setError(null);
  };

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
              Manage lectures and learning resources.
              Create, edit, and publish educational content to keep your community informed.
            </p>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <section className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto mb-6">
              <ErrorMessage
                message={error}
                onRetry={handleRetryFetch}
                onDismiss={handleDismissError}
                title="Error Loading Lectures"
              />
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
                <AddItemCard
                  onClick={() => navigate('/admin/create-lecture')}
                  title="Add New Lecture"
                  description="Create a new educational lecture"
                  icon={Plus}
                />

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
                      onEdit={(id: string) => navigate(`/admin/edit-lecture/${id}`)}
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
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => !deleteModal.isDeleting && setDeleteModal({ isOpen: false, lecture: null, isDeleting: false })}
        onConfirm={confirmDeleteLecture}
        title="Delete Lecture"
        message="Are you sure you want to delete this lecture?"
        itemName={deleteModal.lecture?.title || ''}
        isLoading={deleteModal.isDeleting}
        confirmText="Delete Lecture"
        variant="danger"
        icon={<Trash2 className="w-6 h-6" />}
      />

      <Footer />
    </div>
  );
}