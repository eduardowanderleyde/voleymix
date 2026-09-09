import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// updateProfile() no Auth não dispara onAuthStateChanged/onIdTokenChanged —
// então um componente que já montou antes dele resolver nunca vê o nome
// atualizado (confirmado testando isolado contra o emulador). O doc
// users/{uid} no Firestore é a fonte confiável: ele é escrito no mesmo
// fluxo do cadastro e, como toda escrita do Firestore, aparece pro
// onSnapshot local quase na hora, mesmo antes de confirmar com o servidor.
export function useMeuPerfil() {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      setPerfil(snap.exists() ? snap.data() : null);
    });
  }, [auth.currentUser?.uid]);

  return perfil;
}
