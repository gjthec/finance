
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { firebaseConfig, FIREBASE_ON } from '../firebaseConfig';
import { Transaction, ChartOfAccount, Goal, DREConfig } from '../types';

const app = FIREBASE_ON ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;

export const firebaseService = {
  // FUNÇÃO PARA POPULAR O BANCO (SEED)
  async seedData(txs: Transaction[], accs: ChartOfAccount[], goals: Goal[], dre: DREConfig) {
    if (!db || !FIREBASE_ON) return;
    
    const batch = writeBatch(db);
    
    // Salvar Contas
    accs.forEach(acc => {
      const ref = doc(collection(db, 'accounts'), acc.id);
      batch.set(ref, acc);
    });

    // Salvar Transações (limitado para não travar o batch)
    txs.slice(0, 50).forEach(tx => {
      const ref = doc(collection(db, 'transactions'), tx.id);
      batch.set(ref, tx);
    });

    // Salvar Metas
    goals.forEach(goal => {
      const ref = doc(collection(db, 'goals'), goal.id);
      batch.set(ref, goal);
    });

    // Salvar DRE
    batch.set(doc(db, 'settings', 'dre'), dre);

    await batch.commit();
  },

  // TRANSAÇÕES
  async getTransactions(): Promise<Transaction[]> {
    if (!db || !FIREBASE_ON) return [];
    try {
      const snapshot = await getDocs(collection(db, 'transactions'));
      return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Transaction));
    } catch (e) {
      console.error("Firebase Read Error:", e);
      return [];
    }
  },

  async saveTransaction(tx: Transaction) {
    if (!db || !FIREBASE_ON) return;
    const { id, ...data } = tx;
    // Se o ID for de mock ou novo, criamos um novo doc
    if (id.startsWith('t-') || id.length < 10) {
      const newRef = doc(collection(db, 'transactions'));
      await setDoc(newRef, data);
      return newRef.id;
    }
    await setDoc(doc(db, 'transactions', id), data);
    return id;
  },

  async deleteTransaction(id: string) {
    if (!db || !FIREBASE_ON) return;
    await deleteDoc(doc(db, 'transactions', id));
  },

  // PLANO DE CONTAS
  async getAccounts(): Promise<ChartOfAccount[]> {
    if (!db || !FIREBASE_ON) return [];
    const snapshot = await getDocs(collection(db, 'accounts'));
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ChartOfAccount));
  },

  async saveAccount(acc: ChartOfAccount) {
    if (!db || !FIREBASE_ON) return;
    const { id, ...data } = acc;
    await setDoc(doc(db, 'accounts', id), data);
  },

  // Adicionando método para excluir conta no Firebase
  async deleteAccount(id: string) {
    if (!db || !FIREBASE_ON) return;
    await deleteDoc(doc(db, 'accounts', id));
  },

  // METAS
  async getGoals(): Promise<Goal[]> {
    if (!db || !FIREBASE_ON) return [];
    const snapshot = await getDocs(collection(db, 'goals'));
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Goal));
  },

  async saveGoal(goal: Goal) {
    if (!db || !FIREBASE_ON) return;
    const { id, ...data } = goal;
    await setDoc(doc(db, 'goals', id), data);
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
