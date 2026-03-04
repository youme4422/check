import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Contact } from '../storage/types';

type Props = {
  visible: boolean;
  title: string;
  emptyText: string;
  closeLabel: string;
  contacts: Contact[];
  onClose: () => void;
  onSelect: (contact: Contact) => void;
};

export function ContactPickerModal({
  visible,
  title,
  emptyText,
  closeLabel,
  contacts,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {contacts.length === 0 ? <Text style={styles.empty}>{emptyText}</Text> : null}
            {contacts.map((contact) => (
              <Pressable
                key={contact.id}
                onPress={() => onSelect(contact)}
                style={({ pressed }) => [styles.item, pressed ? styles.itemPressed : null]}
              >
                <Text style={styles.name}>{contact.name}</Text>
                <Text style={styles.meta}>{contact.phone || contact.email}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.close, pressed ? styles.itemPressed : null]}>
            <Text style={styles.closeLabel}>{closeLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 16, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    maxHeight: '75%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C3B31',
    marginBottom: 12,
  },
  list: {
    maxHeight: 320,
  },
  empty: {
    color: '#5C6D64',
    lineHeight: 22,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8E2DC',
  },
  itemPressed: {
    opacity: 0.72,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C3B31',
  },
  meta: {
    fontSize: 13,
    color: '#607067',
    marginTop: 2,
  },
  close: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  closeLabel: {
    color: '#1A7F64',
    fontWeight: '700',
  },
});
