// src/hooks/useFirestore.ts
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDoc,
  collection,
  addDoc
} from 'firebase/firestore';

export const useFirestore = () => {
  const firestore = getFirestore();

  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    const docRef = doc(firestore, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  };

  const createDocument = async (collectionName: string, data: any) => {
    const docRef = await addDoc(collection(firestore, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  };

  const getDocument = async (collectionName: string, docId: string) => {
    const docRef = doc(firestore, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  };

  return {
    updateDocument,
    createDocument,
    getDocument
  };
};