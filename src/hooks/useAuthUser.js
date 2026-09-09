import { useEffect, useState } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

// auth.currentUser é lido uma vez e nunca muda de referência sozinho — um
// updateProfile() (ex: displayName no cadastro) não faz o componente
// re-renderizar. onIdTokenChanged também dispara nesses updates, então usar
// esse hook garante que o nome/e-mail exibidos ficam sempre atualizados.
export function useAuthUser() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return onIdTokenChanged(auth, setUser);
  }, []);

  return user;
}
