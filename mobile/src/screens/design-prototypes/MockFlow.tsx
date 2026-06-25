// MockFlow — renders a swipeable 3-screen mock (Home → Browse → Recipe) in a
// given DesignTheme. Pure presentational + sample data; nothing here touches
// the real app theme, navigation, or backend. Built once, parameterized by
// theme, so all 5 directions reuse the same layout with different tokens.

import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { DesignTheme } from './themes';
import { SAMPLE_RECIPES, SAMPLE_CUISINES, SAMPLE_INGREDIENTS, type SampleRecipe } from './sampleData';

const { width: W } = Dimensions.get('window');

// ── style helpers ─────────────────────────────────────────────────────────
const heading = (t: DesignTheme, size: number, extra?: TextStyle): TextStyle => ({
  fontFamily: t.headingFamily ?? t.fontFamily,
  fontWeight: t.headingWeight,
  color: t.text,
  fontSize: size,
  ...extra,
});
const body = (t: DesignTheme, size: number, dim = false, extra?: TextStyle): TextStyle => ({
  fontFamily: t.fontFamily,
  color: dim ? t.textDim : t.text,
  fontSize: size,
  ...extra,
});
const label = (t: DesignTheme, extra?: TextStyle): TextStyle => ({
  fontFamily: t.fontFamily,
  color: t.textDim,
  fontSize: 11,
  fontWeight: '700',
  letterSpacing: t.uppercaseLabels ? 1.2 : 0.2,
  textTransform: t.uppercaseLabels ? 'uppercase' : 'none',
  ...extra,
});
function shadow(t: DesignTheme): ViewStyle {
  if (t.cardShadow === 'none') return {};
  if (t.cardShadow === 'soft')
    return { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 };
  return { shadowColor: t.accent, shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 };
}

// ── primitives ────────────────────────────────────────────────────────────
function Chip({ t, text, active }: { t: DesignTheme; text: string; active?: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: t.chipStyle === 'pill' ? 999 : 8,
        backgroundColor: active ? t.accent : t.surfaceAlt,
        borderWidth: t.borderWidth,
        borderColor: t.border,
        marginRight: 8,
      }}
    >
      <Text style={body(t, 13, false, { color: active ? t.onAccent : t.textDim, fontWeight: '600' })}>{text}</Text>
    </View>
  );
}

function PrimaryButton({ t, text }: { t: DesignTheme; text: string }) {
  return (
    <View
      style={[
        {
          backgroundColor: t.accent,
          borderRadius: t.buttonRadius,
          paddingVertical: 15,
          alignItems: 'center',
        },
        shadow(t),
      ]}
    >
      <Text style={{ color: t.onAccent, fontWeight: '800', fontSize: 15, fontFamily: t.fontFamily }}>{text}</Text>
    </View>
  );
}

function card(t: DesignTheme, extra?: ViewStyle): ViewStyle {
  return {
    backgroundColor: t.surface,
    borderRadius: t.radius,
    borderWidth: t.borderWidth,
    borderColor: t.border,
    overflow: 'hidden',
    ...shadow(t),
    ...extra,
  };
}

function RecipeCard({ t, r }: { t: DesignTheme; r: SampleRecipe }) {
  // list = horizontal row · tall = photo-on-top · wide = big photo + overlay
  if (t.cardStyle === 'list') {
    return (
      <View style={[card(t), { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: t.gap }]}>
        <Image source={{ uri: r.image }} style={{ width: 64, height: 64, borderRadius: t.radius - 2 }} contentFit="cover" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={heading(t, 15)} numberOfLines={1}>{r.name}</Text>
          <Text style={body(t, 12, true, { marginTop: 2 })}>{r.cuisine} · {r.minutes}m · ★ {r.rating}</Text>
        </View>
        <Text style={{ color: t.accent, fontWeight: '800', fontSize: 13 }}>{r.kcal}</Text>
      </View>
    );
  }
  if (t.cardStyle === 'wide') {
    return (
      <View style={[card(t), { marginBottom: t.gap }]}>
        <View>
          <Image source={{ uri: r.image }} style={{ width: '100%', height: 170 }} contentFit="cover" />
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, backgroundColor: 'rgba(0,0,0,0.35)' }} />
          <Text style={[heading(t, 18, { color: '#fff' }), { position: 'absolute', left: 14, bottom: 26 }]}>{r.name}</Text>
          <Text style={{ position: 'absolute', left: 14, bottom: 10, color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
            {r.cuisine} · {r.minutes}m · ★ {r.rating}
          </Text>
        </View>
      </View>
    );
  }
  // tall
  return (
    <View style={[card(t), { marginBottom: t.gap }]}>
      <Image source={{ uri: r.image }} style={{ width: '100%', height: 140 }} contentFit="cover" />
      <View style={{ padding: 12 }}>
        <Text style={heading(t, 16)} numberOfLines={1}>{r.name}</Text>
        <Text style={body(t, 12, true, { marginTop: 3 })}>{r.cuisine} · {r.minutes}m · ★ {r.rating}</Text>
      </View>
    </View>
  );
}

function Hero({ t }: { t: DesignTheme }) {
  if (t.heroStyle === 'photo') {
    const r = SAMPLE_RECIPES[0];
    return (
      <View style={[card(t), { marginBottom: t.gap }]}>
        <Image source={{ uri: r.image }} style={{ width: '100%', height: 150 }} contentFit="cover" />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
        <View style={{ position: 'absolute', left: 16, bottom: 14 }}>
          <Text style={label(t, { color: 'rgba(255,255,255,0.85)' })}>Tonight's pick</Text>
          <Text style={heading(t, 22, { color: '#fff', marginTop: 2 })}>{r.name}</Text>
        </View>
      </View>
    );
  }
  if (t.heroStyle === 'stat') {
    return (
      <View style={[card(t), { padding: t.pad, marginBottom: t.gap }]}>
        <Text style={label(t)}>Today</Text>
        <Text style={heading(t, 28, { marginTop: 4 })}>
          1,540 <Text style={body(t, 14, true)}>/ 2,200 kcal</Text>
        </Text>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: t.surfaceAlt, marginTop: 12 }}>
          <View style={{ width: '70%', height: '100%', borderRadius: 3, backgroundColor: t.accent }} />
        </View>
      </View>
    );
  }
  // rings
  const rings = [
    { label: 'Cal', pct: 0.7, color: t.accent },
    { label: 'Protein', pct: 0.55, color: t.accent },
    { label: 'Carbs', pct: 0.8, color: t.accent },
  ];
  return (
    <View style={[card(t), { padding: t.pad, marginBottom: t.gap, flexDirection: 'row', justifyContent: 'space-around' }]}>
      {rings.map((rg) => (
        <View key={rg.label} style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 56, height: 56, borderRadius: 28,
              borderWidth: 5, borderColor: rg.color,
              alignItems: 'center', justifyContent: 'center',
              opacity: 0.5 + rg.pct * 0.5,
            }}
          >
            <Text style={{ fontWeight: '800', color: t.text, fontSize: 13 }}>{Math.round(rg.pct * 100)}%</Text>
          </View>
          <Text style={body(t, 11, true, { marginTop: 6 })}>{rg.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ── screens ────────────────────────────────────────────────────────────────
function Page({ t, children }: { t: DesignTheme; children: React.ReactNode }) {
  return (
    <View style={{ width: W, height: '100%', backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: t.pad, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

function SearchBar({ t, placeholder }: { t: DesignTheme; placeholder: string }) {
  return (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: t.surfaceAlt, borderRadius: t.buttonRadius,
        borderWidth: t.borderWidth, borderColor: t.border,
        paddingHorizontal: 14, paddingVertical: 12, marginBottom: t.gap,
      }}
    >
      <Text style={{ fontSize: 15 }}>🔍</Text>
      <Text style={body(t, 14, true)}>{placeholder}</Text>
    </View>
  );
}

function MockHome({ t }: { t: DesignTheme }) {
  return (
    <Page t={t}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.gap }}>
        <View>
          <Text style={label(t)}>Good evening</Text>
          <Text style={heading(t, 26, { marginTop: 2 })}>Alex 👋</Text>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: t.accent, fontWeight: '800' }}>A</Text>
        </View>
      </View>
      <SearchBar t={t} placeholder="Search recipes…" />
      <Hero t={t} />
      <Text style={[label(t), { marginBottom: 10 }]}>Cook by cuisine</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: t.gap }}>
        {SAMPLE_CUISINES.map((cz, i) => <Chip key={cz} t={t} text={cz} active={i === 0} />)}
      </ScrollView>
      <Text style={[label(t), { marginBottom: 10 }]}>Popular tonight</Text>
      {SAMPLE_RECIPES.slice(0, 3).map((r) => <RecipeCard key={r.id} t={t} r={r} />)}
    </Page>
  );
}

function MockBrowse({ t }: { t: DesignTheme }) {
  return (
    <Page t={t}>
      <Text style={[heading(t, 24), { marginBottom: t.gap }]}>Browse</Text>
      <SearchBar t={t} placeholder="Search 250 recipes…" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: t.gap }}>
        {['All', 'Quick', 'High protein', 'Veggie', 'Under 30m'].map((f, i) => (
          <Chip key={f} t={t} text={f} active={i === 0} />
        ))}
      </ScrollView>
      {SAMPLE_RECIPES.map((r) => <RecipeCard key={r.id} t={t} r={r} />)}
    </Page>
  );
}

function MockRecipe({ t }: { t: DesignTheme }) {
  const r = SAMPLE_RECIPES[0];
  return (
    <Page t={t}>
      <View style={[card(t), { marginBottom: t.gap }]}>
        <Image source={{ uri: r.image }} style={{ width: '100%', height: 200 }} contentFit="cover" />
      </View>
      <Text style={heading(t, 26)}>{r.name}</Text>
      <Text style={body(t, 13, true, { marginTop: 6, marginBottom: t.gap })}>
        {r.cuisine} · {r.minutes} min · ★ {r.rating} · {r.kcal} kcal
      </Text>

      <View style={[card(t), { padding: t.pad, marginBottom: t.gap, flexDirection: 'row', justifyContent: 'space-around' }]}>
        {[['Cal', r.kcal], ['Protein', '38g'], ['Carbs', '42g'], ['Fat', '16g']].map(([k, v]) => (
          <View key={k as string} style={{ alignItems: 'center' }}>
            <Text style={{ color: t.accent, fontWeight: '800', fontSize: 16 }}>{v}</Text>
            <Text style={body(t, 11, true, { marginTop: 2 })}>{k}</Text>
          </View>
        ))}
      </View>

      <Text style={[label(t), { marginBottom: 10 }]}>Ingredients</Text>
      {SAMPLE_INGREDIENTS.map((ing) => (
        <View key={ing} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.accent }} />
          <Text style={body(t, 14)}>{ing}</Text>
        </View>
      ))}
      <View style={{ marginTop: t.gap }}>
        <PrimaryButton t={t} text="Start cooking →" />
      </View>
    </Page>
  );
}

// ── flow (pager) ────────────────────────────────────────────────────────────
const PAGES = ['Home', 'Browse', 'Recipe'];

export function MockFlow({ theme, onClose }: { theme: DesignTheme; onClose: () => void }) {
  const [page, setPage] = useState(0);
  const ref = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = Math.round(e.nativeEvent.contentOffset.x / W);
    if (p !== page) setPage(p);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        <MockHome t={theme} />
        <MockBrowse t={theme} />
        <MockRecipe t={theme} />
      </ScrollView>

      {/* Close */}
      <Pressable
        onPress={onClose}
        hitSlop={12}
        style={{
          position: 'absolute', top: 50, right: 16,
          width: 36, height: 36, borderRadius: 18,
          backgroundColor: theme.surface, borderWidth: theme.borderWidth, borderColor: theme.border,
          alignItems: 'center', justifyContent: 'center', ...shadow(theme),
        }}
      >
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>✕</Text>
      </Pressable>

      {/* Page label + dots */}
      <View style={{ position: 'absolute', bottom: 30, alignSelf: 'center', alignItems: 'center', gap: 8 }}>
        <View style={{ backgroundColor: theme.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, ...shadow(theme), borderWidth: theme.borderWidth, borderColor: theme.border }}>
          <Text style={{ color: theme.text, fontWeight: '700', fontSize: 12 }}>
            {theme.name} · {PAGES[page]}  (swipe →)
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {PAGES.map((_, i) => (
            <View key={i} style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === page ? theme.accent : theme.border }} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default MockFlow;
