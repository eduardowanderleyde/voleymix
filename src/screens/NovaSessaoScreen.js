import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { colors, DIAS_SEMANA } from '../theme';
import FormScreen from '../components/FormScreen';
import { mostrarAlerta } from '../utils/alerta';

export default function NovaSessaoScreen() {
  const navigation = useNavigation();
  const [titulo, setTitulo] = useState('');
  const [recorrente, setRecorrente] = useState(true);
  const [diaSemana, setDiaSemana] = useState(2); // terça, dia mais comum de pelada
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar() {
    if (!titulo.trim()) {
      mostrarAlerta('Dê um nome pra sessão.', 'Ex: "Pelada de terça" ou "Vôlei da firma".');
      return;
    }
    if (!recorrente && !data.trim()) {
      mostrarAlerta('Informe a data dessa pelada.');
      return;
    }

    setSalvando(true);
    try {
      await addDoc(collection(db, 'sessoes'), {
        ownerId: auth.currentUser.uid,
        titulo: titulo.trim(),
        recorrente,
        diaSemana: recorrente ? diaSemana : null,
        data: recorrente ? null : data.trim(),
        horario: horario.trim(),
        local: local.trim(),
        presentes: {},
        ativa: true,
        createdAt: serverTimestamp(),
      });
      navigation.goBack();
    } catch (e) {
      mostrarAlerta('Não deu pra criar a sessão.', e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <FormScreen>
      <Text style={styles.titulo}>Nova sessão</Text>
      <Text style={styles.hint}>
        Uma sessão é a pelada de sempre — cadastre uma vez e reaproveite a lista de presença toda semana.
      </Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        placeholder='Ex: "Pelada de terça"'
        placeholderTextColor={colors.inkSoft}
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.label}>Frequência</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.freqCard, recorrente && styles.freqCardAtiva]}
          onPress={() => setRecorrente(true)}
        >
          <Text style={[styles.freqTexto, recorrente && styles.freqTextoAtivo]}>🔁 Toda semana</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.freqCard, !recorrente && styles.freqCardAtiva]}
          onPress={() => setRecorrente(false)}
        >
          <Text style={[styles.freqTexto, !recorrente && styles.freqTextoAtivo]}>📆 Data única</Text>
        </TouchableOpacity>
      </View>

      {recorrente ? (
        <>
          <Text style={styles.label}>Dia da semana</Text>
          <View style={styles.rowWrap}>
            {DIAS_SEMANA.map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[styles.chip, diaSemana === d.value && styles.chipAtivo]}
                onPress={() => setDiaSemana(d.value)}
              >
                <Text style={[styles.chipText, diaSemana === d.value && styles.chipTextAtivo]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 20/09"
            placeholderTextColor={colors.inkSoft}
            value={data}
            onChangeText={setData}
          />
        </>
      )}

      <Text style={styles.label}>Horário (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 19h"
        placeholderTextColor={colors.inkSoft}
        value={horario}
        onChangeText={setHorario}
      />

      <Text style={styles.label}>Local (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Quadra do bairro"
        placeholderTextColor={colors.inkSoft}
        value={local}
        onChangeText={setLocal}
      />

      <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={salvando}>
        {salvando ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Criar sessão</Text>}
      </TouchableOpacity>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: '700', color: colors.navy, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 12, color: colors.inkSoft, textAlign: 'center', marginBottom: 20, lineHeight: 17 },
  label: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 8, marginTop: 12 },
  input: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
  },
  row: { flexDirection: 'row', gap: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  freqCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
  },
  freqCardAtiva: { borderColor: colors.ocean, backgroundColor: colors.oceanTint },
  freqTexto: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  freqTextoAtivo: { color: colors.ocean },
  chip: {
    borderWidth: 1,
    borderColor: colors.ocean,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipAtivo: { backgroundColor: colors.ocean },
  chipText: { color: colors.ocean, fontWeight: '700' },
  chipTextAtivo: { color: colors.white },
  button: {
    backgroundColor: colors.ocean,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
