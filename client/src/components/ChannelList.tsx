/* ==========================================================
   ChannelList — Obsidian Minimal M3U Player
   Sidebar channel list with search and group filtering
   ========================================================== */

import { usePlayer } from '@/contexts/PlayerContext';
import { Channel } from '@/lib/m3u-parser';
import { Search, Tv2, ChevronDown, X, Layers } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ChannelList() {
  const {
    playlist,
    currentChannel,
    filteredChannels,
    searchQuery,
    selectedGroup,
    setSearchQuery,
    setSelectedGroup,
    playChannel,
  } = usePlayer();

  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowGroupDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll active channel into view
  useEffect(() => {
    if (currentChannel && listRef.current) {
      const el = listRef.current.querySelector(`[data-id="${currentChannel.id}"]`);
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentChannel]);

  if (!playlist) return null;

  const groups = ['الكل', ...playlist.groups];

  return (
    <div className="flex flex-col h-full bg-[#0d0d14] border-r border-white/5">
      {/* Header */}
      <div className="p-3 border-b border-white/5 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="بحث عن قناة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/8 rounded-lg pr-9 pl-8 py-2 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 focus:bg-white/8 transition-all"
          />
          {searchQuery && (
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Group filter */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="w-full flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white/70 hover:border-amber-500/30 transition-all"
            onClick={() => setShowGroupDropdown(prev => !prev)}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400/60" />
            <span className="flex-1 text-right truncate">{selectedGroup}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGroupDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showGroupDropdown && (
            <div className="absolute top-full mt-1 right-0 left-0 z-50 bg-[#1a1a28] border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
              {groups.map(g => (
                <button
                  key={g}
                  className={`w-full text-right px-3 py-2 text-sm transition-colors hover:bg-white/8 ${selectedGroup === g ? 'text-amber-400 bg-amber-500/10' : 'text-white/60'}`}
                  onClick={() => { setSelectedGroup(g); setShowGroupDropdown(false); }}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Count */}
        <p className="text-xs text-white/25 px-1">
          {filteredChannels.length} قناة
          {searchQuery && ` — نتائج "${searchQuery}"`}
        </p>
      </div>

      {/* Channel list */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Search className="w-6 h-6 text-white/15" />
            <p className="text-white/25 text-sm">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredChannels.map((channel, idx) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={currentChannel?.id === channel.id}
                index={idx}
                onClick={() => playChannel(channel)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ChannelItemProps {
  channel: Channel;
  isActive: boolean;
  index: number;
  onClick: () => void;
}

function ChannelItem({ channel, isActive, index, onClick }: ChannelItemProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      data-id={channel.id}
      className={`channel-card w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-right transition-all
        ${isActive
          ? 'bg-amber-500/12 border-amber-500/40 golden-glow'
          : 'border-transparent hover:border-white/8'
        }`}
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index * 20, 300)}ms` }}
    >
      {/* Logo */}
      <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-white/5 flex items-center justify-center">
        {channel.logo && !imgError ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <Tv2 className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-white/25'}`} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate leading-tight ${isActive ? 'text-amber-300' : 'text-white/80'}`}>
          {channel.name}
        </p>
        {channel.group && (
          <p className="text-xs text-white/30 truncate mt-0.5">{channel.group}</p>
        )}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 live-dot flex-shrink-0" />
      )}
    </button>
  );
}
