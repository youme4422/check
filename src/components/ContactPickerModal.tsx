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
    backgroundColor: 'rgba(11, 24, 19, 0.34)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0EBE4',
    shadowColor: '#153128',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    maxHeight: '75%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#17362C',
    marginBottom: 14,
  },
  list: {
    maxHeight: 320,
  },
  empty: {
    color: '#66766E',
    lineHeight: 22,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F7FBF8',
    borderWidth: 1,
    borderColor: '#E0EBE4',
  },
  itemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17362C',
  },
  meta: {
    fontSize: 13,
    color: '#66766E',
    marginTop: 4,
  },
  close: {
    marginTop: 8,
    alignSelf: 'center',
    minWidth: 120,
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F7F4',
  },
  closeLabel: {
    color: '#196B57',
    fontWeight: '800',
  },
});
