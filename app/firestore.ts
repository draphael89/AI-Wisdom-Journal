import { firestore } from './firebase';
import { collection, addDoc, getDocs, query, where, DocumentData, orderBy, Firestore } from 'firebase/firestore';

export const addJournalEntry = async (userId: string, content: string) => {
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const docRef = await addDoc(collection(firestore as Firestore, 'journalEntries'), {
      userId,
      content,
      createdAt: new Date(),
      wordCount: content.trim().split(/\s+/).length,
      duration: 300, // 5 minutes in seconds
      completed: true
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const getJournalEntries = async (userId: string): Promise<DocumentData[]> => {
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }

  const q = query(
    collection(firestore as Firestore, 'journalEntries'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  }));
};