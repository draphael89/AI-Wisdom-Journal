import { firestore } from './firebase';
import { collection, addDoc, getDocs, query, where, DocumentData, orderBy } from 'firebase/firestore';

export const addJournalEntry = async (userId: string, content: string) => {
  try {
    const docRef = await addDoc(collection(firestore, 'journalEntries'), {
      userId,
      content,
      createdAt: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const getJournalEntries = async (userId: string): Promise<DocumentData[]> => {
  const q = query(
    collection(firestore, 'journalEntries'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};