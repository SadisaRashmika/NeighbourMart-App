import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ImageBackground } from 'react-native';
import { useAuth } from '@/features/auth/useAuth';
import { deletePickupReminder, getPickupReminder, savePickupReminder, type ReminderItem } from '@/features/customer/reminderApi';

type DraftItem = ReminderItem;

export function PickupReminderCard() {
  const { token } = useAuth();
  const [items, setItems] = useState<ReminderItem[]>([]);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (!token) return;

    getPickupReminder(token)
      .then(({ reminder }) => {
        if (isMounted) setItems(reminder.items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  function openEditor() {
    setDraftItems(items.map((item) => ({ ...item })));
    setNewItemName('');
    setIsModalVisible(true);
  }

  function addItem() {
    const name = newItemName.trim();
    if (!name) return;
    setDraftItems((currentItems) => [...currentItems, { id: `draft-${Date.now()}`, name, quantity: 1 }]);
    setNewItemName('');
  }

  function updateItem(id: string, patch: Partial<Pick<ReminderItem, 'name' | 'quantity'>>) {
    setDraftItems((currentItems) => currentItems.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function removeItem(id: string) {
    setDraftItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  async function saveList() {
    if (!token) return;
    const validItems = draftItems.filter((item) => item.name.trim());
    setIsSaving(true);
    try {
      const result = await savePickupReminder(token, validItems);
      setItems(result.reminder.items);
      setIsModalVisible(false);
    } catch (requestError) {
      Alert.alert('Could not save reminder list', requestError instanceof Error ? requestError.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDeleteList() {
    Alert.alert('Delete pickup reminder?', 'This removes the saved list. You can create another one later.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete list', style: 'destructive', onPress: deleteList },
    ]);
  }

  async function deleteList() {
    if (!token) return;
    setIsSaving(true);
    try {
      await deletePickupReminder(token);
      setItems([]);
      setDraftItems([]);
      setIsModalVisible(false);
    } catch (requestError) {
      Alert.alert('Could not delete reminder list', requestError instanceof Error ? requestError.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  const previewItems = items.slice(0, 3);
  const itemCountLabel = items.length === 1 ? '1 item saved' : `${items.length} items saved`;

  return (
    <>
      <TouchableOpacity accessibilityLabel="Edit pickup reminder list" onPress={openEditor} style={styles.squareCard}>
        <ImageBackground source={require('../../../assets/images/img5.jpg')} style={styles.bgImage} imageStyle={styles.bgImageStyle}>
          <View style={styles.overlay}>
            <View style={styles.textPill}>
              <Text style={styles.squareTitle}>Reminder List</Text>
              <Text style={styles.squareSubtitle} numberOfLines={1}>
                {isLoading ? 'Loading...' : items.length ? `${items.length} items` : 'Empty'}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
      <Modal animationType="slide" presentationStyle="pageSheet" visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalScreen}>
          <View style={styles.modalHeader}><TouchableOpacity onPress={() => setIsModalVisible(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity><Text style={styles.modalTitle}>Pickup reminder list</Text><TouchableOpacity disabled={isSaving} onPress={saveList}><Text style={styles.save}>{isSaving ? 'Saving...' : 'Save'}</Text></TouchableOpacity></View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled"><Text style={styles.modalIntro}>Keep a reusable list of things you want to collect from the shop.</Text><View style={styles.addRow}><TextInput autoCapitalize="sentences" onChangeText={setNewItemName} onSubmitEditing={addItem} placeholder="Add an item, e.g. milk" placeholderTextColor="#98A2B3" returnKeyType="done" style={styles.addInput} value={newItemName} /><TouchableOpacity accessibilityLabel="Add item" disabled={!newItemName.trim()} onPress={addItem} style={[styles.addButton, !newItemName.trim() && styles.disabledButton]}><Ionicons color="#fff" name="add" size={21} /></TouchableOpacity></View>{draftItems.length ? <View style={styles.itemList}>{draftItems.map((item) => <View key={item.id} style={styles.itemRow}><TextInput onChangeText={(name) => updateItem(item.id, { name })} style={styles.itemInput} value={item.name} /><View style={styles.quantityControl}><TouchableOpacity accessibilityLabel={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1} onPress={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}><Ionicons color={item.quantity <= 1 ? '#D0D5DD' : '#138A43'} name="remove-circle-outline" size={22} /></TouchableOpacity><Text style={styles.quantity}>{item.quantity}</Text><TouchableOpacity accessibilityLabel={`Increase ${item.name} quantity`} disabled={item.quantity >= 99} onPress={() => updateItem(item.id, { quantity: Math.min(99, item.quantity + 1) })}><Ionicons color={item.quantity >= 99 ? '#D0D5DD' : '#138A43'} name="add-circle-outline" size={22} /></TouchableOpacity></View><TouchableOpacity accessibilityLabel={`Delete ${item.name}`} onPress={() => removeItem(item.id)}><Ionicons color="#B42318" name="trash-outline" size={19} /></TouchableOpacity></View>)}</View> : <View style={styles.emptyModal}><Ionicons color="#8ACFA2" name="basket-outline" size={34} /><Text style={styles.emptyModalTitle}>Your list is empty</Text><Text style={styles.emptyModalText}>Add groceries above and save them for your next pickup.</Text></View>}{draftItems.length ? <TouchableOpacity onPress={() => setDraftItems([])} style={styles.clearButton}><Text style={styles.clearText}>Clear all items</Text></TouchableOpacity> : null}<TouchableOpacity disabled={isSaving || !draftItems.length} onPress={saveList} style={[styles.fullSave, (!draftItems.length || isSaving) && styles.disabledSave]}><Text style={styles.fullSaveText}>{isSaving ? 'Saving list...' : 'Save reminder list'}</Text></TouchableOpacity>{items.length ? <TouchableOpacity disabled={isSaving} onPress={confirmDeleteList} style={styles.deleteList}><Text style={styles.deleteListText}>Delete saved list</Text></TouchableOpacity> : null}</ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  squareCard: { flex: 1, aspectRatio: 1, minHeight: 110, borderRadius: 14, borderWidth: 2, borderColor: '#138A43', overflow: 'hidden' },
  bgImage: { flex: 1, width: '100%', height: '100%', justifyContent: 'center' },
  bgImageStyle: { borderRadius: 14 },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 10 },
  textPill: { paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', width: '100%' },
  squareTitle: { color: '#172B24', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  squareSubtitle: { color: '#138A43', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  modalScreen: { backgroundColor: '#F7F9F8', flex: 1 },
  modalHeader: { alignItems: 'center', backgroundColor: '#fff', borderBottomColor: '#E4E8EF', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  cancel: { color: '#667085', fontSize: 14 },
  modalTitle: { color: '#172B24', fontSize: 16, fontWeight: '800' },
  save: { color: '#138A43', fontSize: 14, fontWeight: '800' },
  modalContent: { gap: 14, padding: 18, paddingBottom: 36 },
  modalIntro: { color: '#667085', fontSize: 12, lineHeight: 18 },
  addRow: { flexDirection: 'row', gap: 8 },
  addInput: { backgroundColor: '#fff', borderColor: '#D8DEE8', borderRadius: 10, borderWidth: 1, color: '#172B24', flex: 1, minHeight: 48, paddingHorizontal: 13 },
  addButton: { alignItems: 'center', backgroundColor: '#138A43', borderRadius: 10, justifyContent: 'center', width: 48 },
  disabledButton: { backgroundColor: '#98A2B3' },
  itemList: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12 },
  itemRow: { alignItems: 'center', borderBottomColor: '#F0F2F5', borderBottomWidth: 1, flexDirection: 'row', gap: 8, minHeight: 58 },
  itemInput: { color: '#344054', flex: 1, fontSize: 13, minHeight: 42 },
  quantityControl: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  quantity: { color: '#13753F', fontSize: 13, fontWeight: '800', minWidth: 18, textAlign: 'center' },
  emptyModal: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 28 },
  emptyModalTitle: { color: '#344054', fontSize: 14, fontWeight: '800', marginTop: 8 },
  emptyModalText: { color: '#98A2B3', fontSize: 12, lineHeight: 18, marginTop: 4, textAlign: 'center' },
  clearButton: { alignItems: 'center', padding: 8 },
  clearText: { color: '#B42318', fontSize: 12, fontWeight: '700' },
  fullSave: { alignItems: 'center', backgroundColor: '#138A43', borderRadius: 10, padding: 14 },
  disabledSave: { backgroundColor: '#98A2B3' },
  fullSaveText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  deleteList: { alignItems: 'center', borderColor: '#F2B8B5', borderRadius: 10, borderWidth: 1, padding: 12 },
  deleteListText: { color: '#B42318', fontSize: 12, fontWeight: '800' },
});
