import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Escuta em tempo real os documentos de `nomeColecao` que pertencem ao
// usuário logado (ownerId == uid), já ordenados no cliente — evita depender
// de índices compostos do Firestore pra combinar where + orderBy.
export function useMinhaColecao(nomeColecao, comparador) {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, nomeColecao), where('ownerId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (comparador) lista.sort(comparador);
        setDados(lista);
        setCarregando(false);
      },
      () => setCarregando(false)
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomeColecao]);

  return { dados, carregando };
}
