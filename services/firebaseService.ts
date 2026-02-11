
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { firebaseConfig, FIREBASE_ON } from '../firebaseConfig';
import { Transaction, ChartOfAccount, Goal, DREConfig } from '../types';

const app = FIREBASE_ON ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;

export const firebaseService = {
  // TRANSAÇÕES
  async getTransactions(): Promise<Transaction[]> {
    if (!db || !FIREBASE_ON) return [];
    const snapshot = await getDocs(collection(db, 'transactions'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
  },

  async saveTransaction(tx: Transaction) {
    if (!db || !FIREBASE_ON) return;
    const { id, ...data } = tx;
    if (id.startsWith('t-') || id.length < 15) { // Novo ou mock
      const newDoc = await addDoc(collection(db, 'transactions'), data);
      return newDoc.id;
    } else {
      await setDoc(doc(db, 'transactions', id), data);
      return id;
    }
  },

  async deleteTransaction(id: string) {
    if (!db || !FIREBASE_ON) return;
    await deleteDoc(doc(db, 'transactions', id));
  },

  // PLANO DE CONTAS
  async getAccounts(): Promise<ChartOfAccount[]> {
    if (!db || !FIREBASE_ON) return [];
    const snapshot = await getDocs(collection(db, 'accounts'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChartOfAccount));
  },

  async saveAccount(acc: ChartOfAccount) {
    if (!db || !FIREBASE_ON) return;
    const { id, ...data } = acc;
    if (id.length < 5) { // Mock id
      const newDoc = await addDoc(collection(db, 'accounts'), data);
      return newDoc.id;
    } else {
      await setDoc(doc(db, 'accounts', id), data);
      return id;
    }
  },

  // METAS
  async getGoals(): Promise<Goal[]> {
    if (!db || !FIREBASE_ON) return [];
    const snapshot = await getDocs(collection(db, 'goals'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Goal));
  },

  async saveGoal(goal: Goal) {
    if (!db || !FIREBASE_ON) return;
    const { id, ...data } = goal;
    if (id.length < 5) {
      const newDoc = await addDoc(collection(db, 'goals'), data);
      return newDoc.id;
    } else {
      await setDoc(doc(db, 'goals', id), data);
      return id;
    }
  },

  // DRE CONFIG
  async getDREConfig(): Promise<DREConfig | null> {
    if (!db || !FIREBASE_ON) return null;
    const d = await getDoc(doc(db, 'settings', 'dre'));
    return d.exists() ? d.data() as DREConfig : null;
  },

  async saveDREConfig(config: DREConfig) {
    if (!db || !FIREBASE_ON) return;
    await setDoc(doc(db, 'settings', 'dre'), config);
  }
};
