import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  getDocs,
  limit
} from "firebase/firestore";
import { db } from "./firebase";
import { Address, InvitationCode } from "@/types";

const ADDRESSES_COLLECTION = "addresses";
const INVITATION_CODES_COLLECTION = "invitationCodes";

export const subscribeToAddresses = (callback: (addresses: Address[]) => void) => {
  const q = query(collection(db, ADDRESSES_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const addresses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Address[];
    callback(addresses);
  });
};

export const addAddress = async (address: Omit<Address, "id" | "createdAt" | "updatedAt">) => {
  return await addDoc(collection(db, ADDRESSES_COLLECTION), {
    ...address,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateAddress = async (id: string, address: Partial<Address>) => {
  const addressRef = doc(db, ADDRESSES_COLLECTION, id);
  return await updateDoc(addressRef, {
    ...address,
    updatedAt: serverTimestamp(),
  });
};

export const deleteAddress = async (id: string) => {
  const addressRef = doc(db, ADDRESSES_COLLECTION, id);
  return await deleteDoc(addressRef);
};

export const validateInvitationCode = async (code: string): Promise<boolean> => {
  const normalizedCode = code.trim().toUpperCase();
  const q = query(
    collection(db, INVITATION_CODES_COLLECTION),
    where("code", "==", normalizedCode),
    where("isValid", "==", true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

export const getInvitationCode = async (code: string) => {
  const normalizedCode = code.trim().toUpperCase();
  const q = query(
    collection(db, INVITATION_CODES_COLLECTION),
    where("code", "==", normalizedCode),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as InvitationCode;
};

export const addBulkAddresses = async (addresses: Omit<Address, "id" | "createdAt" | "updatedAt">[]) => {
  const promises = addresses.map((address) => addAddress(address));
  return await Promise.all(promises);
};

export const createInvitationCode = async (code: string, description: string = "Generiert über App") => {
  const normalizedCode = code.trim().toUpperCase();
  return await addDoc(collection(db, INVITATION_CODES_COLLECTION), {
    code: normalizedCode,
    isValid: true,
    description,
    createdAt: serverTimestamp(),
  });
};
