// ScanReceiptScreen — take a photo of a grocery receipt, get it parsed
// by ai-service vision, edit the line items, then bulk-add to pantry.
//
// Graceful fallback: if the backend says parser_available=false (no
// OPENAI_API_KEY on Railway, or OCR errored), we show a manual-entry
// form with the photo as a visual reference. The user still saves time
// vs typing from scratch because they can see the receipt.

import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import type { RootStackParamList } from '../types';
import { receiptService, type ParsedReceiptItem } from '../services/receiptService';
import { pantryService } from '../services/pantryService';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { radii } from '../theme/radii';
import { Badge, Button, Card, Header, IconButton, useToast } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanReceipt'>;

interface DraftItem {
  id: string; // local-only stable key
  name: string;
  quantity: string; // string for the TextInput, parsed on save
  unit: string;
  selected: boolean;
}

const newDraft = (seed?: ParsedReceiptItem): DraftItem => ({
  id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: seed?.name ?? '',
  quantity: seed?.quantity != null ? String(seed.quantity) : '1',
  unit: seed?.unit ?? 'unit',
  selected: true,
});

export default function ScanReceiptScreen({ navigation }: Props) {
  const c = useThemeColors();
  const toast = useToast();
  const qc = useQueryClient();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [parserUsed, setParserUsed] = useState<boolean | null>(null);
  const [store, setStore] = useState<string | null>(null);

  // Parse-receipt call
  const parse = useMutation({
    mutationFn: (b64: string) => receiptService.parse(b64),
    onSuccess: (result) => {
      setParserUsed(result.parser_available);
      setStore(result.store ?? null);
      if (result.parser_available && result.items.length > 0) {
        setItems(result.items.map(newDraft));
        toast.show(`Parsed ${result.items.length} items`, 'success');
      } else if (result.parser_available) {
        // Vision returned 0 items — probably a blurry photo.
        setItems([newDraft()]);
        toast.show('Couldn’t read items — enter manually', 'info');
      } else {
        // OCR unavailable — manual entry only.
        setItems([newDraft()]);
        toast.show('OCR not configured — add items manually', 'info');
      }
    },
    onError: () => {
      setParserUsed(false);
      setItems([newDraft()]);
      toast.show('Parse failed — entering manual mode', 'error');
    },
  });

  // Bulk save to pantry
  const save = useMutation({
    mutationFn: async (drafts: DraftItem[]) => {
      const results = await Promise.allSettled(
        drafts.map((d) =>
          pantryService.create({
            name: d.name.trim(),
            quantity: parseFloat(d.quantity) || 1,
            unit: d.unit.trim() || 'unit',
            category: 'other',
            location: 'pantry',
            expiry_date: null,
          }),
        ),
      );
      return results.filter((r) => r.status === 'fulfilled').length;
    },
    onSuccess: (savedCount) => {
      qc.invalidateQueries({ queryKey: ['pantry'] });
      toast.show(`Added ${savedCount} items to pantry`, 'success');
      navigation.goBack();
    },
    onError: () => toast.show('Some items failed to save', 'error'),
  });

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      // Permissions
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Camera permission needed', 'Please allow camera access in Settings.');
          return;
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Library permission needed', 'Please allow photo library access in Settings.');
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              base64: true,
              allowsEditing: false,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              base64: true,
              allowsEditing: false,
            });

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Image upload error', 'Couldn’t read the image. Try a different photo.');
        return;
      }
      setImageUri(asset.uri);
      setImageBase64(asset.base64);
      parse.mutate(asset.base64);
    } catch (err) {
      Alert.alert('Couldn’t open camera', String(err));
    }
  };

  const validItems = items.filter((d) => d.selected && d.name.trim().length > 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header title="Scan receipt" border onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}>
        {/* ─── No image yet: choose source ─────────────────────────────── */}
        {!imageUri ? (
          <View style={{ gap: spacing.md }}>
            <Card surface="surfaceMuted" radius="xl" padding="xl" elevation="flat">
              <Text style={[typography.h3, { color: c.text }]}>Snap your grocery receipt</Text>
              <Text style={[typography.body, { color: c.textSecondary, marginTop: spacing.sm }]}>
                We’ll auto-detect the items and add them to your pantry in one tap.
              </Text>
            </Card>
            <Button
              label="📷  Take photo"
              size="lg"
              fullWidth
              onPress={() => pickImage('camera')}
              hapticStyle="medium"
            />
            <Button
              label="🖼  Pick from library"
              size="lg"
              variant="secondary"
              fullWidth
              onPress={() => pickImage('library')}
            />
          </View>
        ) : null}

        {/* ─── Image preview ──────────────────────────────────────────── */}
        {imageUri ? (
          <View style={{ marginBottom: spacing.lg }}>
            <View style={[styles.preview, { borderColor: c.border }]}>
              <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="contain" />
            </View>
            <View style={styles.previewActions}>
              {parserUsed === false ? <Badge label="MANUAL" tone="warning" /> : null}
              {store ? (
                <Text style={[typography.caption, { color: c.textSecondary }]} numberOfLines={1}>
                  Store: {store}
                </Text>
              ) : null}
              <View style={{ flex: 1 }} />
              <Button
                label="Retake"
                size="sm"
                variant="secondary"
                onPress={() => {
                  setImageUri(null);
                  setImageBase64(null);
                  setItems([]);
                  setParserUsed(null);
                  setStore(null);
                }}
              />
            </View>
          </View>
        ) : null}

        {/* ─── Parsing in flight ──────────────────────────────────────── */}
        {parse.isPending ? (
          <Card surface="surface" radius="lg" padding="lg" elevation="card">
            <Text style={[typography.body, { color: c.text }]}>
              📖  Reading the receipt…
            </Text>
            <Text style={[typography.caption, { color: c.textSecondary, marginTop: spacing.xs }]}>
              Vision OCR can take 5-10 seconds.
            </Text>
          </Card>
        ) : null}

        {/* ─── Items editor ───────────────────────────────────────────── */}
        {items.length > 0 ? (
          <View>
            <View style={styles.listHeader}>
              <Text style={[typography.h4, { color: c.text }]}>
                Items ({validItems.length})
              </Text>
              <Button
                label="+ Add row"
                size="sm"
                variant="secondary"
                onPress={() => setItems((prev) => [...prev, newDraft()])}
              />
            </View>

            {items.map((it, idx) => (
              <Card
                key={it.id}
                surface="surface"
                radius="lg"
                padding="md"
                elevation="card"
                style={[
                  styles.itemRow,
                  !it.selected ? { opacity: 0.5 } : null,
                ]}
              >
                <IconButton
                  icon={it.selected ? '☑' : '☐'}
                  size={28}
                  accessibilityLabel={it.selected ? 'Deselect item' : 'Select item'}
                  onPress={() =>
                    setItems((prev) =>
                      prev.map((d, i) => (i === idx ? { ...d, selected: !d.selected } : d)),
                    )
                  }
                />
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <TextInput
                    style={[styles.input, { color: c.text, borderColor: c.border }]}
                    value={it.name}
                    onChangeText={(t) =>
                      setItems((prev) => prev.map((d, i) => (i === idx ? { ...d, name: t } : d)))
                    }
                    placeholder="Item name"
                    placeholderTextColor={c.textLight}
                  />
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <TextInput
                      style={[styles.input, styles.qtyInput, { color: c.text, borderColor: c.border }]}
                      value={it.quantity}
                      onChangeText={(t) =>
                        setItems((prev) => prev.map((d, i) => (i === idx ? { ...d, quantity: t } : d)))
                      }
                      placeholder="Qty"
                      placeholderTextColor={c.textLight}
                      keyboardType="decimal-pad"
                    />
                    <TextInput
                      style={[styles.input, styles.unitInput, { color: c.text, borderColor: c.border }]}
                      value={it.unit}
                      onChangeText={(t) =>
                        setItems((prev) => prev.map((d, i) => (i === idx ? { ...d, unit: t } : d)))
                      }
                      placeholder="unit"
                      placeholderTextColor={c.textLight}
                    />
                  </View>
                </View>
                <IconButton
                  icon="✕"
                  size={28}
                  accessibilityLabel="Remove row"
                  onPress={() =>
                    setItems((prev) => prev.filter((_, i) => i !== idx))
                  }
                />
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* ─── Save bar ─────────────────────────────────────────────────── */}
      {items.length > 0 ? (
        <View style={[styles.saveBar, { borderTopColor: c.border, backgroundColor: c.background }]}>
          <Button
            label={save.isPending ? 'Saving…' : `Add ${validItems.length} to pantry`}
            size="lg"
            fullWidth
            disabled={validItems.length === 0 || save.isPending}
            onPress={() => save.mutate(validItems)}
            hapticStyle="medium"
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewImg: { width: '100%', height: '100%' },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 15,
  },
  qtyInput: { width: 70 },
  unitInput: { width: 80 },
  saveBar: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
