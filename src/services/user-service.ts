import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Save or update user profile
export const saveUserRecord = async (uid: string, email: string) => {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      email,
      updatedAt: new Date().toISOString(),
    },
    { merge: true } // important: don't overwrite future fields
  );
};
