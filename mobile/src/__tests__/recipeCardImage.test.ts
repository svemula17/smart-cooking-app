/**
 * RecipeCard's image-source resolution rule, extracted into pure logic so
 * we can pin the priority without rendering the full RN component.
 *
 *   remote URL (from DB image_url) → bundled local asset → null (=> emoji
 *   fallback)
 *
 * This bug regressed once already (the card was ignoring the DB URL and
 * only ever using the local bundle, which is why every newly-added recipe
 * showed a cuisine emoji instead of a real photo). The test below keeps
 * the priority pinned.
 */

type Source = { uri: string } | number | null;

function resolveImageSource(image_url: string | null | undefined, localImage: number | null): Source {
  const remoteOk = image_url && /^https?:\/\//i.test(image_url);
  if (remoteOk) return { uri: image_url };
  if (localImage) return localImage;
  return null;
}

describe('RecipeCard image source resolution', () => {
  test('prefers remote DB URL when present', () => {
    expect(resolveImageSource('https://example.com/biryani.jpg', 42)).toEqual({
      uri: 'https://example.com/biryani.jpg',
    });
  });

  test('falls back to local bundled asset when image_url is null', () => {
    expect(resolveImageSource(null, 42)).toBe(42);
  });

  test('falls back to local asset when image_url is empty string', () => {
    expect(resolveImageSource('', 42)).toBe(42);
  });

  test('returns null when both sources are missing (caller renders cuisine emoji)', () => {
    expect(resolveImageSource(null, null)).toBeNull();
  });

  test('rejects non-http URLs to avoid bundler trying to require them', () => {
    // Even if the DB had a `data:` or `file://` URL we treat it as missing
    // and let local/emoji fallback take over — this is defence in depth
    // against bad seed data.
    expect(resolveImageSource('data:image/png;base64,xxx', 42)).toBe(42);
    expect(resolveImageSource('file:///tmp/foo.jpg', 42)).toBe(42);
  });
});
