/* ==========================================================
   M3U Parser — Obsidian Minimal M3U Player
   Parses M3U/M3U8 playlist files into structured channel data
   ========================================================== */

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  tvgId?: string;
  tvgName?: string;
  language?: string;
  country?: string;
}

export interface M3UPlaylist {
  channels: Channel[];
  groups: string[];
  totalCount: number;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function parseM3U(content: string): M3UPlaylist {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const channels: Channel[] = [];
  let currentMeta: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('#EXTINF:')) {
      currentMeta = {};

      // Extract tvg-id
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
      if (tvgIdMatch) currentMeta.tvgId = tvgIdMatch[1];

      // Extract tvg-name
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/i);
      if (tvgNameMatch) currentMeta.tvgName = tvgNameMatch[1];

      // Extract tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      if (logoMatch) currentMeta.logo = logoMatch[1];

      // Extract group-title
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      if (groupMatch) currentMeta.group = groupMatch[1] || 'عام';

      // Extract language
      const langMatch = line.match(/tvg-language="([^"]*)"/i);
      if (langMatch) currentMeta.language = langMatch[1];

      // Extract country
      const countryMatch = line.match(/tvg-country="([^"]*)"/i);
      if (countryMatch) currentMeta.country = countryMatch[1];

      // Extract channel name (after last comma)
      const nameMatch = line.match(/,([^,]+)$/);
      if (nameMatch) currentMeta.name = nameMatch[1].trim();

    } else if (line.startsWith('#')) {
      // Skip other directives
      continue;
    } else if (line.startsWith('http') || line.startsWith('rtmp') || line.startsWith('rtsp') || line.startsWith('udp')) {
      // This is a URL line
      if (currentMeta.name || currentMeta.tvgName) {
        channels.push({
          id: generateId(),
          name: currentMeta.name || currentMeta.tvgName || 'قناة غير معروفة',
          url: line,
          logo: currentMeta.logo,
          group: currentMeta.group || 'عام',
          tvgId: currentMeta.tvgId,
          tvgName: currentMeta.tvgName,
          language: currentMeta.language,
          country: currentMeta.country,
        });
      }
      currentMeta = {};
    }
  }

  const groupSet = new Set<string>();
  channels.forEach(ch => {
    if (ch.group) groupSet.add(ch.group);
  });

  const groups = Array.from(groupSet).sort();

  return {
    channels,
    groups,
    totalCount: channels.length,
  };
}

export async function fetchM3UFromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`فشل تحميل القائمة: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  if (!text.includes('#EXTM3U') && !text.includes('#EXTINF')) {
    throw new Error('الملف لا يبدو أنه قائمة M3U صالحة');
  }
  return text;
}
