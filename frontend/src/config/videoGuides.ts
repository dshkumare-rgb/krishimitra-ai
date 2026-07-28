export interface VideoGuide {
  id: string;
  youtubeId: string;
  title: string;
  duration: string;
  language: 'en' | 'hi' | 'pa';
  context: 'disease' | 'machinery';
  crop?: string;
  diseaseName?: string;
}

export const videoGuides: VideoGuide[] = [
  // Disease Detection Guides
  {
    id: 'vid-dis-wheat-rust-hi',
    youtubeId: 'eUvRzO_b5c8', // Wheat Yellow Rust advisory
    title: 'गेहूं में पीला रतुआ रोग की पहचान और नियंत्रण उपाय',
    duration: '4:12',
    language: 'hi',
    context: 'disease',
    crop: 'Wheat',
    diseaseName: 'Rust'
  },
  {
    id: 'vid-dis-wheat-rust-en',
    youtubeId: 'pGzH2y55gX4',
    title: 'How to Manage Rust Disease in Wheat Fields',
    duration: '3:50',
    language: 'en',
    context: 'disease',
    crop: 'Wheat',
    diseaseName: 'Rust'
  },
  {
    id: 'vid-dis-tomato-blight-hi',
    youtubeId: 'F5WqA9Q0lB0',
    title: 'टमाटर के अगेती और पछेती झुलसा रोग (Blight) का जैविक समाधान',
    duration: '5:24',
    language: 'hi',
    context: 'disease',
    crop: 'Tomato',
    diseaseName: 'Blight'
  },
  {
    id: 'vid-dis-paddy-blast-hi',
    youtubeId: '2qO_nQ5Q0pU',
    title: 'धान की फसल में झोंका (Blast) रोग का अचूक इलाज',
    duration: '4:45',
    language: 'hi',
    context: 'disease',
    crop: 'Paddy (Rice)',
    diseaseName: 'Blast'
  },
  {
    id: 'vid-dis-mustard-mildew-hi',
    youtubeId: 'e1Z_yO-ZkU8',
    title: 'सरसों में सफेद रोली और डाउनी मिल्ड्यू रोग का समाधान',
    duration: '3:15',
    language: 'hi',
    context: 'disease',
    crop: 'Mustard',
    diseaseName: 'Downy Mildew'
  },

  // Machinery Guides
  {
    id: 'vid-mach-tractor-hi',
    youtubeId: '2f0Oq5y5b5c',
    title: 'स्मार्ट ट्रैक्टर IoT सेंसर सेटअप और डीजल बचत टिप्स',
    duration: '3:10',
    language: 'hi',
    context: 'machinery'
  },
  {
    id: 'vid-mach-harvester-hi',
    youtubeId: 'zQ9QO2O2pQ8',
    title: 'कम्बाइन हार्वेस्टर का सही रखरखाव और कटाई सेटिंग्स',
    duration: '5:02',
    language: 'hi',
    context: 'machinery'
  },
  {
    id: 'vid-mach-drones-hi',
    youtubeId: '1pPpO9Q8bXk',
    title: 'खेतों में कीटनाशक छिड़काव के लिए कृषि ड्रोन का उपयोग कैसे करें',
    duration: '4:20',
    language: 'hi',
    context: 'machinery'
  }
];
