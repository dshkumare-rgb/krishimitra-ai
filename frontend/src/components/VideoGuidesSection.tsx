import React, { useState } from 'react';
import { videoGuides, VideoGuide } from '../config/videoGuides';
import { useLanguage } from '../context/LanguageContext';
import { FiPlay, FiSearch, FiX, FiVideo } from 'react-icons/fi';

interface VideoGuidesSectionProps {
  context: 'disease' | 'machinery';
}

export const VideoGuidesSection: React.FC<VideoGuidesSectionProps> = ({ context }) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoGuide | null>(null);

  // Filter videos based on context and search query
  const filteredVideos = videoGuides.filter(v => {
    if (v.context !== context) return false;
    if (searchQuery.trim() === '') return true;

    const term = searchQuery.toLowerCase();
    const matchesTitle = v.title.toLowerCase().includes(term);
    const matchesCrop = v.crop ? v.crop.toLowerCase().includes(term) : false;
    const matchesDisease = v.diseaseName ? v.diseaseName.toLowerCase().includes(term) : false;

    return matchesTitle || matchesCrop || matchesDisease;
  });

  return (
    <div className="space-y-6">
      
      {/* Search Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <FiVideo className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">
            {t('videoGuides')}
          </h3>
        </div>
        
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder={t('searchVideos')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Grid of Video Cards */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
          {language === 'hi' ? 'कोई वीडियो गाइड नहीं मिली।' : 'No instructional video guides found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(vid => (
            <div 
              key={vid.id} 
              className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              
              {/* Thumbnail Container */}
              <div 
                onClick={() => setSelectedVideo(vid)}
                className="relative aspect-video bg-gray-900 cursor-pointer overflow-hidden"
              >
                <img 
                  src={`https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`} 
                  alt={vid.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <div className="w-12 h-12 bg-white/90 hover:bg-white text-primary-600 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <FiPlay className="w-6 h-6 ml-0.5" />
                  </div>
                </div>
                
                {/* Duration Badge */}
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {vid.duration}
                </span>
              </div>

              {/* Description */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 line-clamp-2">
                  {vid.title}
                </h4>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex gap-1.5">
                    {vid.crop && (
                      <span className="bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-900">
                        {vid.crop}
                      </span>
                    )}
                    {vid.diseaseName && (
                      <span className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900">
                        {vid.diseaseName}
                      </span>
                    )}
                  </div>

                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    {vid.language}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Play Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            
            {/* Modal Title bar */}
            <div className="p-4 bg-gray-50 dark:bg-gray-950 flex justify-between items-center border-b border-gray-100 dark:border-gray-850">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-1 pr-6">
                {selectedVideo.title}
              </h4>
              <button 
                onClick={() => setSelectedVideo(null)} 
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Video Iframe Embed */}
            <div className="relative aspect-video bg-black">
              <iframe 
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`} 
                title={selectedVideo.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGuidesSection;
