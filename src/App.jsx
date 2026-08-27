import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import { db, auth } from "./firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, orderBy, onSnapshot, serverTimestamp, writeBatch } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import imageCompression from "browser-image-compression";
import placeholderImg from "./assets/placeholder.png";
import BlurUpImage from "./components/BlurUpImage";
import BulkImageUploader from "./components/BulkImageUploader";
import SingleImageUploader from "./components/SingleImageUploader";
import SEOMetadata from "./components/SEOMetadata";
import { generateSlug } from "./utils/slug";
import MaintenancePage from "./components/MaintenancePage";
import AdminMaintenance from "./components/AdminMaintenance";
import AdminSessionUpgrade from "./components/AdminSessionUpgrade";
import FrameNotFoundPage from "./components/NotFoundPage";
import EventTimelineTrack from "./components/EventTimelineTrack";
import CameraPopUpEffect from "./components/CameraPopUpEffect";


// ✦✦✦ PLACEHOLDER DATA ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦──

const TEAM_DATA = {
  founders: [
    { name: "Rishad Hoque", role: "Founder", dept: "Batch '24 Passout, CE", img: "/team/Rishad.png", insta: "https://www.instagram.com/rishad_hoque/" },
    { name: "Arman Mia", role: "Founder", dept: "4th Yr. CSE", img: "/team/Arman.png", insta: "https://www.instagram.com/arman_ansari.13/" },
  ],
  incharge: [
    { name: "Jyotirmoy Mondal", role: "Incharge", dept: "3rd Yr. EE", img: "https://beeimg.com/images/b69604998711.png", insta: "https://www.instagram.com/flybyfifteen/" },
    { name: "Saikat Saha", role: "Incharge", dept: "3rd Yr. CE", img: "https://beeimg.com/images/b93153899401.png", insta: "https://www.instagram.com/_riz_saha_/" },
  ],
  coordinators: [
    { name: "Samprada Adhikari", role: "Co-Ordinator", dept: "2nd Yr. ME", img: "https://beeimg.com/images/n41952554491.png" },
    { name: "Nirupam Konar", role: "Co-Ordinator", dept: "2nd Yr. ECE", img: "https://beeimg.com/images/w57847418951.png", insta: "https://www.instagram.com/itsnirupam07_/" },
  ],
  core: [
    { name: "Indrakshi Ghosh", role: "Moderator", dept: "1st Yr. CE", img: "https://beeimg.com/images/f26043735174.png", insta: "https://www.instagram.com/indrakshi.______/" },
    { name: "Nabanita Barman", role: "Photography Lead", dept: "1st Yr. CE", img: "https://beeimg.com/images/f45858083874.png", insta: "https://www.instagram.com/nabonitaaaaaaa/" },
    { name: "Shreejan Roy", role: "Photographer & Editor", dept: "1st Yr. EE", img: "https://beeimg.com/images/a00498169822.png", insta: "https://www.instagram.com/snapbyjaan/" },
    { name: "Arkadeb Thokdar", role: "Photographer & Editor", dept: "1st Yr. ME", img: "https://beeimg.com/images/u60184176212.png", insta: "https://www.instagram.com/destructive_antagonist/" },
    { name: "MD Kaif", role: "Photographer", dept: "1st Yr. ECE", img: "https://beeimg.com/images/z64013800204.png", insta: "https://www.instagram.com/k4if_28/" },
    { name: "Akash Ghara", role: "Photo Editor", dept: "1st Yr. ME", img: "https://beeimg.com/images/x01975698091.png", insta: "https://www.instagram.com/akash_ghara_/" },
    { name: "Ramanath Hansda", role: "Videography Lead", dept: "1st Yr. CSE", img: "https://beeimg.com/images/j40407354383.png", insta: "https://www.instagram.com/_jubatus._09/" },
    { name: "Irfan Ahmed", role: "Videographer", dept: "3rd Yr. CE", img: "https://beeimg.com/images/t53505068661.png", insta: "https://www.instagram.com/irfan.a.verse/" },
    { name: "Biswajyoti Deb", role: "Videographer & PR", dept: "1st Yr. CSE", img: "https://beeimg.com/images/k52178779054.png", insta: "https://www.instagram.com/kami.oni_/" },
    { name: "Priyanshu Mondal", role: "Videographer", dept: "1st Yr. ME", img: "https://beeimg.com/images/n43306411192.png" },
    { name: "Snehashis Ghosh", role: "Video Editor", dept: "2nd Yr. EE", img: "https://beeimg.com/images/e19762527764.png", insta: "https://www.instagram.com/mr_shinchan_editzs/" },
    { name: "Harasundar Patra", role: "Video Editor & Designer", dept: "2nd Yr. ME", img: "https://beeimg.com/images/e77593279463.png", insta: "https://www.instagram.com/harasundar_/" },
    { name: "Balaram Mardi", role: "Video Editor", dept: "3rd Yr. EE", img: "https://beeimg.com/images/h64107582483.png", insta: "https://www.instagram.com/balaram_mardi1/" },
    { name: "Dibyendu Kumar Kundu", role: "Video Editor & Designer", dept: "1st Yr. ECE", img: "https://beeimg.com/images/x58925079154.png", insta: "https://www.instagram.com/_dibyen.du_k_/" },
    { name: "Sampreety Swarnakar", role: "Content Writer", dept: "2nd Yr. ECE", img: "https://beeimg.com/images/v08825476523.png", insta: "https://www.instagram.com/koli.forever/" },
    { name: "Ankur Shit", role: "Content Writer & PR", dept: "1st Yr. CSE", img: "https://beeimg.com/images/q71563764654.png", insta: "https://www.instagram.com/_ankur_shit/" },
    { name: "Priyanshu Dhara", role: "Authenticity Verifier", dept: "3rd Yr. ME", img: "https://beeimg.com/images/t37555738064.png", insta: "https://www.instagram.com/iam_priyansu.12/" },
    { name: "Sabarno Mondal", role: "PR Manager", dept: "1st Yr. EE", img: "https://beeimg.com/images/w97506474033.png", insta: "https://www.instagram.com/culer_mariner_sabarno_10/" },
  ],
  members: []
};

// ✦✦✦ THEME CONFIGURATION ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦───
const THEMES = [
  { 
    id: 'golden_elegance', 
    name: 'Golden Elegance', 
    primary: '#C9A96E', 
    secondary: '#E8C98A', 
    heading: '#E8C98A',
    surface: '#111114'
  },
  { 
    id: 'midnight_royal', 
    name: 'Midnight Royal', 
    primary: '#D4AF37', 
    secondary: '#F9D976', 
    heading: '#FFFFFF',
    surface: '#0A0E1A'
  },
  { 
    id: 'crimson_velvet', 
    name: 'Crimson Velvet', 
    primary: '#DC143C', 
    secondary: '#FF4D4D', 
    heading: '#FFB3B3',
    surface: '#1A0A0A'
  },
  { 
    id: 'emerald_luxe', 
    name: 'Emerald Luxe', 
    primary: '#50C878', 
    secondary: '#77DD77', 
    heading: '#D1F2D1',
    surface: '#0A1A0F'
  },
  { 
    id: 'ocean_breeze', 
    name: 'Ocean Breeze', 
    primary: '#00CED1', 
    secondary: '#40E0D0', 
    heading: '#E0FFFF',
    surface: '#0A171A'
  },
  { 
    id: 'sunset_glow', 
    name: 'Sunset Glow', 
    primary: '#FF8C00', 
    secondary: '#FFA07A', 
    heading: '#FFE4E1',
    surface: '#1A120A'
  },
  { 
    id: 'amethyst_night', 
    name: 'Amethyst Night', 
    primary: '#9966CC', 
    secondary: '#B399D4', 
    heading: '#F0E6FF',
    surface: '#140A1A'
  },
  { 
    id: 'monochrome_noir', 
    name: 'Monochrome Noir', 
    primary: '#A0A0A0', 
    secondary: '#E0E0E0', 
    heading: '#FFFFFF',
    surface: '#111111'
  }
];

// This will be populated from Firestore
let STATIC_EVENTS = [
  { id: "varnakriti", name: "VARNAKRITI", subtitle: "Annual Photo Exhibition", date: "14 February 2026", color: "#C9A96E", desc: "Our flagship photo exhibition where the finest captures of the year are displayed on a gallery wall. Features a Top 3 Winners showcase with award ceremony.", highlight: "Top 3 Winners crowned. 30+ photos on display.", emoji: "🏆", order: 1 },
  { id: "esperanza", name: "ESPERANZA 2k26", subtitle: "Annual Tech Cum Cultural Fest", date: "12 June 2026", color: "#7EB8D4", desc: "The grand annual celebration of Capture Crew — a full-day photo walk, workshop, and exhibition bringing together photography enthusiasts from across the campus.", highlight: "500+ attendees. Campus-wide photo walk.", emoji: "🌟", comingSoon: true, order: 2 },
  { id: "republic", name: "Republic Day", subtitle: "Patriotic Documentation", date: "26 January 2026", color: "#FF9933", desc: "Celebrating the 77th Republic Day of India on campus. A day of pride, patriotism, and honoring the constitution through our lenses.", highlight: "Tricolor flag hoisting and cultural documentation.", emoji: "🇮🇳", iconUrl: "https://i.ibb.co/21qSZTTv/image.png", order: 3 },
  { id: "croeso", name: "CROESO 2k25", subtitle: "Freshers' Welcome", date: "10 February 2026", color: "#A8D8A8", desc: "A warm welcome for first-year students. Introductory sessions, camera handling workshops, and a mini photo-walk across campus.", highlight: "Welcome to the frame. New eyes, new stories.", emoji: "🎓", order: 4 },
  { id: "holi", name: "Holi Event", subtitle: "Festival of Colors", date: "14 March 2026", color: "#FF69B4", desc: "Celebrating the vibrant festival of colors with the Capture Crew family. A day of joy and splash of colors.", highlight: "Vibrance in every splash.", emoji: "🎨", order: 5 },
  { id: "saraswati", name: "Saraswati Puja", subtitle: "Festival Documentation", date: "23 January 2026", color: "#DEB8D0", desc: "Documenting the beauty and devotion of Saraswati Puja on campus — from rituals to the procession.", highlight: "Devotion in every frame.", emoji: "🌸", iconUrl: "https://i.postimg.cc/qMb9T5CS/image.png", order: 6 },
  { id: "independence", name: "Independence Day", subtitle: "15th August Special", date: "15 August 2026", color: "#FF9933", desc: "Capturing the spirit of patriotism — flag hoisting ceremonies and special themed photo series.", highlight: "Tricolor through the lens.", emoji: "🇮🇳", comingSoon: true, order: 7 }
];

const STATIC_EVENT_ICONS = {
  republic: "https://i.ibb.co/21qSZTTv/image.png",
  saraswati: "https://i.postimg.cc/qMb9T5CS/image.png"
};

const STATIC_EVENT_PHOTOS = {
  varnakriti: [],
  croeso: [],
  holi: [],
  saraswati: [
    "https://i.postimg.cc/qMb9T5CS/image.png",
    "https://i.postimg.cc/0yr1Kss1/image-(1).png",
    "https://i.postimg.cc/Y965B21f/image-(2).png",
    "https://i.postimg.cc/JnNfC7bK/image-(3).png",
    "https://i.postimg.cc/XJfR6Nwh/image-(4).png",
    "https://i.postimg.cc/KjmdGXN0/image-(5).png"
  ],
  republic: [
    "https://i.ibb.co/cKvTd26Z/image-1.png", "https://i.ibb.co/WN2RhJ8w/image-2.png", "https://i.ibb.co/hRZJQsjB/image-3.png",
    "https://i.ibb.co/gM9kRmK3/image-4.png", "https://i.ibb.co/v4vvwFbs/image-5.png", "https://i.ibb.co/KxcKwsDc/image-6.png",
    "https://i.ibb.co/Z16J13cX/image-7.png", "https://i.ibb.co/k69Vt6Gk/image-8.png", "https://i.ibb.co/Z43DjX7/image-9.png",
    "https://i.ibb.co/MJ0k1t6/image-10.png", "https://i.ibb.co/rG1r3Q6r/image-11.png", "https://i.ibb.co/jk6vQfSm/image-12.png",
    "https://i.ibb.co/HDcYS9Ff/image-13.png", "https://i.ibb.co/xK5j6t3b/image-14.png", "https://i.ibb.co/v4K6JpBD/image-15.png",
    "https://i.ibb.co/Wmbq5Fp/image-16.png", "https://i.ibb.co/1tS00rPx/image-17.png", "https://i.ibb.co/svLXkpFx/image-18.png",
    "https://i.ibb.co/ZRmcRm87/image-19.png", "https://i.ibb.co/Vcdz97bb/image-20.png", "https://i.ibb.co/NdVv1Y6S/image-21.png",
    "https://i.ibb.co/YFY0swYk/image-22.png", "https://i.ibb.co/WNcvvKjR/image-23.png", "https://i.ibb.co/0VvY79kB/image-24.png",
    "https://i.ibb.co/7dPMQ5Bb/image-25.png", "https://i.ibb.co/K8g7MBk/image-27.png", "https://i.ibb.co/LDc9Sqwv/image-28.png",
    "https://i.ibb.co/4RBCCYSp/image-29.png", "https://i.ibb.co/KzV78YZC/image-30.png", "https://i.ibb.co/rR94SJ9T/image-31.png",
    "https://i.ibb.co/MkqdRZ5W/image-32.png", "https://i.ibb.co/hx5N1zQv/image-33.png", "https://i.ibb.co/LdRW1b3n/image-34.png",
    "https://i.ibb.co/21qSZTTv/image.png"
  ]
};

const flattenPhotos = (photos) => {
  if (!photos) return [];
  let flat = [];
  if (Array.isArray(photos)) {
    flat = photos;
  } else {
    flat = [
      ...(photos.general || []),
      ...(photos.prize || []),
      ...(photos.winners || [])
    ];
  }
  return flat.map(p => typeof p === 'string' ? p : (p.url || p.imageUrl));
};

const GALLERY_CATEGORIES = ["All", "Weekly Captures", "Monthly Captures", "The Extra Frame"];

const GALLERY = [
  {
    id: 1,
    category: "Weekly Captures",
    title: "A quiet river, but it speaks louder than noise",
    photographer: "Pritam Ghosh",
    dept: "CSE",
    year: "1st Year",
    url: "/gallery/week/week_1.jpg",
    aspect: 1.5,
    hue: 200,
    story: "Silence turns into beauty.",
    captureDate: "2024-05-01"
  },
  {
    id: 2,
    category: "Weekly Captures",
    title: "Bridges connect stories",
    photographer: "Raj Samannay Bag",
    dept: "Electrical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_2.jpg",
    aspect: 1.4,
    hue: 45,
    story: "Bridges don't just connect places, they connect stories.",
    captureDate: "2024-05-02"
  },
  {
    id: 3,
    category: "Weekly Captures",
    title: "Dark wings, soft bloom",
    photographer: "Rahul Sheet",
    dept: "Mechanical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_3.webp",
    aspect: 1.5,
    hue: 210,
    story: "Where silence turns into beauty.",
    captureDate: "2024-05-03"
  },
  {
    id: 4,
    category: "Weekly Captures",
    title: "Nature painted this morning",
    photographer: "Akash Ghara",
    dept: "Mechanical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_4.heic",
    aspect: 1.2,
    hue: 45,
    story: "Nature painted this morning with rays of gold.",
    captureDate: "2024-05-04"
  },
  {
    id: 5,
    category: "Weekly Captures",
    title: "Royal Vibes",
    photographer: "Indrakshi Ghosh",
    dept: "Civil Engineering",
    year: "1st Year",
    url: "/gallery/week/week_5.heic",
    aspect: 1.4,
    hue: 30,
    story: "Timeless elegance at Cooch Behar Rajbari.",
    captureDate: "2024-05-05"
  },
  {
    id: 6,
    category: "Weekly Captures",
    title: "Dil ki har khushi",
    photographer: "Shreejan Roy",
    dept: "Electrical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_6.jpg",
    aspect: 1.1,
    hue: 340,
    story: "Saath saath woh hai mere.",
    captureDate: "2024-05-06"
  },
  {
    id: 7,
    category: "Weekly Captures",
    title: "The Train Memories",
    photographer: "Sabarno Mondal",
    dept: "Electrical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_7.heic",
    aspect: 1.0,
    hue: 190,
    story: "The train may be late, but the memories arrive on time.",
    captureDate: "2024-05-07"
  },
  {
    id: 8,
    category: "Weekly Captures",
    title: "Classroom Silence",
    photographer: "Anupam Das",
    dept: "Electrical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_8.webp",
    aspect: 1.3,
    hue: 160,
    story: "Where dreams once sat in classrooms, now the silence writes its own story.",
    captureDate: "2024-05-08"
  },
  {
    id: 9,
    category: "Weekly Captures",
    title: "Water Whispers",
    photographer: "Debasis Biswas",
    dept: "CSE",
    year: "3rd Year",
    url: "/gallery/week/week_9.jpg",
    aspect: 1.5,
    hue: 200,
    story: "Where the water whispers and the hills smile back.",
    captureDate: "2024-05-09"
  },
  {
    id: 10,
    category: "Weekly Captures",
    title: "শূন্যতার কোলাহল",
    photographer: "Subhajit Sil",
    dept: "ECE",
    year: "1st Year",
    url: "/gallery/week/week_10.webp",
    aspect: 0.8,
    hue: 280,
    story: "Capturing the void.",
    captureDate: "2024-05-10"
  },
  {
    id: 11,
    category: "Weekly Captures",
    title: "Nature's Rhythm",
    photographer: "Sumon Mondal",
    dept: "ECE",
    year: "1st Year",
    url: "/gallery/week/week_11.webp",
    aspect: 1.1,
    hue: 120,
    story: "Nature doesn't rush, yet everything feels perfect here.",
    captureDate: "2024-05-11"
  },
  {
    id: 12,
    category: "Monthly Captures",
    title: "Lone Tree Dreams",
    photographer: "Prince Mahato",
    dept: "ECE",
    year: "1st Year",
    url: "/gallery/month/month_1.heic",
    aspect: 1.6,
    hue: 320,
    story: "A lone tree, a golden field, and a sky that feels like a dream.",
    captureDate: "2024-05-12"
  },
  {
    id: 13,
    category: "Monthly Captures",
    title: "Tastes Like Summer",
    photographer: "Jyotirmoy Mondal",
    dept: "Electrical Engineering",
    year: "3rd Year",
    url: "/gallery/month/month_2.webp",
    aspect: 1.5,
    hue: 45,
    story: "Summer vibes in a frame.",
    captureDate: "2024-05-13"
  },
  {
    id: 14,
    category: "Monthly Captures",
    title: "Celebration Night",
    photographer: "Akash Ghara",
    dept: "Mechanical Engineering",
    year: "1st Year",
    url: "/gallery/month/month_3.jpg",
    aspect: 1.5,
    hue: 40,
    story: "Under a sky of fairy lights and whispered wishes.",
    captureDate: "2024-05-14"
  }
];

const WEEK_CAPTURE = GALLERY[3]; // Akash Ghara's "Nature painted"

const MONTH_CAPTURES = [
  GALLERY[13], // Akash Ghara's "Celebration Night"
  GALLERY[12], // Jyotirmoy Mondal
  GALLERY[11]  // Prince Mahato
];

const HERO_COVERS = [
  "covers/image.png",
  "covers/image (1).png",
  "covers/image (2).png",
  "covers/image (3).png",
  "covers/image (4).png",
  "covers/image (5).png",
  "covers/image (6).png",
  "covers/image (7).png",
  "covers/image (8).png"
].map(path => (import.meta.env.BASE_URL || "/") + path);

// ✦✦✦ APP ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦────

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', verticalAlign: 'middle', display: 'inline-block' }}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const InstagramIcon = ({ size = 18, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...props.style }}
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);




const getOptimizedUrl = (url) => {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) return url;
  const uploadIndex = url.indexOf("/upload");
  if (uploadIndex === -1) return url;
  return `${url.substring(0, uploadIndex + 7)}/f_auto,q_auto${url.substring(uploadIndex + 7)}`;
};

const reorderPhotosForMasonry = (items) => {
  if (!items || items.length === 0) return [];
  return items;
};

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const decodedPath = decodeURIComponent(location.pathname);
  const pathParts = decodedPath.split('/').filter(Boolean);
  const isLegacyGallery = ["/Weekly Captures", "/Monthly Captures", "/The Extra Frame"].includes(decodedPath);
  const isGallerySub = pathParts[0] === 'gallery' && pathParts[1];
  
  let galleryFilter = "All";
  if (isLegacyGallery) {
    galleryFilter = decodedPath.substring(1);
  } else if (isGallerySub) {
    const slugMap = {
      'weekly-captures': 'Weekly Captures',
      'monthly-captures': 'Monthly Captures',
      'the-extra-frame': 'The Extra Frame'
    };
    galleryFilter = slugMap[pathParts[1]] || "All";
  }
  
  const activeSection = location.pathname === "/" ? "home" : (location.pathname === "/events-gallery" ? "events-gallery" : (isLegacyGallery || isGallerySub ? "gallery" : location.pathname.substring(1).split('/')[0]));

  const setGalleryFilterRoute = (cat) => {
    navigate(cat === "All" ? "/gallery" : `/gallery/${generateSlug(cat)}`);
  };
  const [lightboxItem, setLightboxItem] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(() => {
    const last = localStorage.getItem("lastHeroIndex");
    let next = Math.floor(Math.random() * HERO_COVERS.length);
    if (last !== null && HERO_COVERS.length > 1) {
      while (next === parseInt(last)) {
        next = Math.floor(Math.random() * HERO_COVERS.length);
      }
    }
    localStorage.setItem("lastHeroIndex", next);
    return next;
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(false);
  const [archiveConfig, setArchiveConfig] = useState({ order: [], hidden: [] });
  const [liveEventConfig, setLiveEventConfig] = useState({
    active: false,
    eventName: "",
    subtitle: "",
    color: "#ffcc00",
    photos: []
  });
  const [themeId, setThemeId] = useState("golden_elegance");
  const [coverPhotos, setCoverPhotos] = useState([]);
  const activeCovers = coverPhotos.length > 0 ? coverPhotos : HERO_COVERS;

  useEffect(() => {
    if (!activeCovers || activeCovers.length === 0) return;
    
    // Boundary check for when the covers list shrinks
    if (currentHeroIndex >= activeCovers.length) {
      setCurrentHeroIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % activeCovers.length);
    }, 8000);
    
    return () => clearInterval(timer);
  }, [activeCovers.length, currentHeroIndex]);

  // Disable right click (context menu) site-wide
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Global Hash Scrolling Effect
  useEffect(() => {
    if (location.hash) {
      const id = decodeURIComponent(location.hash.replace('#', ''));
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [location.pathname, location.hash]);
  
  // Certificate State
  const [certId, setCertId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [adminSection, setAdminSection] = useState("certificates");

  const [siteConfig, setSiteConfig] = useState({
    logoUrl: "/logo.jpg",
    faviconUrl: "/logo.jpg",
    siteName: "Capture Crew",
    heroEyebrow: "Capture Crew · CGEC Photography Club",
    heroTitle: "CAPTURING MOMENTS,\nCREATING MEMORIES.",
    heroTagline: "Exploring the World through the CGEC lens",
    instaLink: "https://instagram.com/cgec_capture_crew?igshid=NGVhN2U2NjQ0Yg==",
    linkedinLink: "https://www.linkedin.com/company/cgec-capture-crew/",
    waLink: "https://chat.whatsapp.com/BSV9q40j6EN2B5sQz47eYK?mode=gi_t",
    fbLink: "https://www.facebook.com/profile.php?id=61551537531538&mibextid=V3Yony",
    activeYear: "2026",
    availableYears: ["2026"],
    emailSenderName: "Capture Crew",
    emailSenderAddress: "newsletter@capturecrew.site",
    emailReplyTo: "newsletter@capturecrew.site",
    contributorsNotice: "<p style=\"margin-bottom: 1rem; opacity: 0.9;\">All data displayed here has been collected for the current year only.</p><p style=\"margin-bottom: 1rem; opacity: 0.9;\">To get featured, please upload your pictures in the WhatsApp group using the correct format:<br/><strong style=\"color: var(--white);\">Name, Department, Year</strong><br/>Submissions without the proper format will not be considered.</p><h4 style=\"font-size: 1rem; color: var(--gold); margin-bottom: 0.5rem; margin-top: 1.5rem;\">📩 Profile Showcase (Featured Members)</h4><p style=\"margin-bottom: 0.8rem; opacity: 0.9;\">If you have already been featured and want to showcase your <strong style=\"color: var(--white);\">profile photo on the website</strong>, please send your profile image along with your <strong style=\"color: var(--white);\">Name, Department, and Year</strong> to:<br/>📧 <a href=\"mailto:cc@capturecrew.site?subject=Profile%20Showcase%20(Featured%20Members)\" style=\"color: var(--gold); text-decoration: underline; font-weight: bold;\">cc@capturecrew.site</a></p><p style=\"margin-bottom: 1.5rem; opacity: 0.9;\">Only verified entries will be updated.</p><h4 style=\"font-size: 1rem; color: var(--gold); margin-bottom: 0.5rem; margin-top: 1.5rem;\">🔄 Weekly Updates</h4><p style=\"margin-bottom: 0; opacity: 0.9;\">Content is reviewed and updated every week. If you have already submitted but your entry is not visible, please share a screenshot as proof,profile photo and email us at:<br/>📧 <a href=\"mailto:contact@capturecrew.site?subject=Entry%20Not%20Visible%20%E2%80%93%20Submission%20Proof\" style=\"color: var(--gold); text-decoration: underline; font-weight: bold;\">contact@capturecrew.site</a></p>"
  });

  // Live Data State
  const [gallery, setGallery] = useState(GALLERY);
  const [weekCapture, setWeekCapture] = useState(null);
  const [monthCapture, setMonthCapture] = useState(null);
  const [extraFrameCapture, setExtraFrameCapture] = useState(null);
  const [showRecruitment, setShowRecruitment] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedGallery, setExpandedGallery] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState(false);
  const [expandedMembers, setExpandedMembers] = useState(false);
  const [shuffledCore, setShuffledCore] = useState([]);
  const [shuffledMembers, setShuffledMembers] = useState([]);
  const [dynamicMembers, setDynamicMembers] = useState([]);
  const [teamMembers, setTeamMembers] = useState({ founders: [], incharge: [], ex_incharge: [], coordinators: [], core: [] });
  const [liveEvents, setLiveEvents] = useState({});
  const [liveEventsList, setLiveEventsList] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [ccEvents, setCcEvents] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showGlobalGallery, setShowGlobalGallery] = useState(false);
  const [maintenanceConfig, setMaintenanceConfig] = useState(null);

  // Newsletter Broadcast Progress State
  const [broadcastProgress, setBroadcastProgress] = useState(null);

  const ensureAbsoluteUrl = (url) => {
    if (!url) return '';
    const str = typeof url === 'string' ? url : (url.url || url.imageUrl || '');
    if (!str || typeof str !== 'string') return '';
    const trimmed = str.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `https://www.capturecrew.site${cleanPath}`;
  };

  const sendResendNotification = async ({ subject, title, description, imageUrl, images, link, photographer }) => {
    try {
      const mainImageUrl = ensureAbsoluteUrl(imageUrl);
      let secondaryImages = (images || []).map(ensureAbsoluteUrl).filter(url => url && url !== mainImageUrl);
      let finalMainImage = mainImageUrl;
      if (!finalMainImage && secondaryImages.length > 0) {
        finalMainImage = secondaryImages[0];
        secondaryImages = secondaryImages.slice(1);
      }
      const finalSecondaryImages = secondaryImages.slice(0, 3);

      // 1. Fetch active subscribers
      const subsSnap = await getDocs(query(collection(db, "subscribers"), where("active", "==", true)));
      if (subsSnap.empty) {
        console.log("No active subscribers found.");
        return;
      }

      const subscribersList = subsSnap.docs.map(d => d.data());
      const totalRecipients = subscribersList.length;

      // 2. Set progress state
      setBroadcastProgress({
        sending: true,
        current: 0,
        total: totalRecipients,
        subject
      });

      // 3. Extract sender configurations
      const senderName = (siteConfig?.emailSenderName || "Capture Crew").replace(/"/g, '');
      const senderAddress = siteConfig?.emailSenderAddress || "newsletter@capturecrew.site";
      const replyToAddress = siteConfig?.emailReplyTo || "newsletter@capturecrew.site";
      const fromField = `"${senderName}" <${senderAddress}>`;

      // 4. Send in batch chunks of 100
      const batchSize = 100;
      let sentCount = 0;

      for (let i = 0; i < subscribersList.length; i += batchSize) {
        const chunk = subscribersList.slice(i, i + batchSize).map(subscriber => {
          const subName = subscriber.name || "friend";
          const subEmail = subscriber.email;
          const unsubscribeUrl = `https://www.capturecrew.site/unsubscribe?email=${encodeURIComponent(subEmail)}`;

          const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi ${subName},</p>
  <p>We wanted to share this week's Capture Crew update with you.</p>
  <p style="font-size: 18px; font-weight: bold; margin-top: 24px; color: #111;">${title}</p>
  ${photographer ? `<p style="font-style: italic; color: #666; margin-top: -10px; margin-bottom: 20px; font-size: 14px;">By ${photographer}</p>` : ''}
  ${finalMainImage ? `<div style="margin: 24px 0; border-radius: 8px; overflow: hidden; border: 1px solid #e1e1e1; background-color: #000; text-align: center;"><img src="${finalMainImage}" alt="${title}" style="width: 100%; max-width: 600px; height: auto; max-height: 480px; object-fit: cover; display: block; margin: 0 auto;" /></div>` : ''}
  ${finalSecondaryImages.length > 0 ? `<div style="display: flex; gap: 8px; margin: 12px 0 24px 0;">${finalSecondaryImages.map(imgUrl => `<div style="flex: 1; border-radius: 6px; overflow: hidden; border: 1px solid #e1e1e1; background-color: #000;"><img src="${imgUrl}" alt="${title}" style="width: 100%; height: 110px; object-fit: cover; display: block;" /></div>`).join('')}</div>` : ''}
  <p style="white-space: pre-line;">${description}</p>
  <p style="margin-top: 30px;">You can view the full details and showcase on the <a href="${link || 'https://www.capturecrew.site'}" style="color: #c9a96e; text-decoration: underline; font-weight: bold;">Capture Crew website</a>.</p>
  <p style="margin-top: 30px;">Feel free to reply directly to this email to share your thoughts, ask questions, or just say hello! We read every message and love hearing from our members.</p>
  <p style="margin-top: 24px;">Warmly,</p>
  <p style="margin: 0; font-weight: bold;">Capture Crew Team</p>
  <p style="margin: 0; font-size: 13px; color: #666;">Cooch Behar Government Engineering College</p>
  <hr style="border: none; border-top: 1px solid #eeeeee; margin: 40px 0 20px 0;" />
  <p style="font-size: 12px; color: #888888; text-align: center; line-height: 1.4;">
    You are receiving this update because you are a member of the CGEC Capture Crew club newsletter.
    <br />
    To ensure delivery, please add ${replyToAddress} to your contact list.
    <br />
    If you'd rather not receive these club updates, you can <a href="${unsubscribeUrl}" style="color: #888888; text-decoration: underline;">unsubscribe here</a>.
  </p>
</div>
          `;

          const textContent = `Hi ${subName},

We wanted to share this week's Capture Crew update with you.

${title}
${photographer ? `By ${photographer}` : ''}

${description}

You can view the full details and showcase on the Capture Crew website: ${link || 'https://www.capturecrew.site'}

Feel free to reply directly to this email to share your thoughts, ask questions, or just say hello! We read every message and love hearing from our members.

Warmly,
Capture Crew Team
Cooch Behar Government Engineering College

--
You are receiving this update because you are a member of the CGEC Capture Crew club newsletter.
To ensure delivery, please add ${replyToAddress} to your contact list.
If you'd rather not receive these club updates, you can unsubscribe here: ${unsubscribeUrl}`;

          return {
            to: subEmail,
            subject,
            html: htmlContent,
            text: textContent,
            reply_to: replyToAddress,
            headers: {
              'List-Unsubscribe': `<https://www.capturecrew.site/api/unsubscribe?email=${encodeURIComponent(subEmail)}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
            }
          };
        });

        try {
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: fromField,
              batch: chunk
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to send batch chunk");
          }

          sentCount += chunk.length;
          setBroadcastProgress(prev => ({
            ...prev,
            current: sentCount
          }));
        } catch (err) {
          console.error("Batch chunk send error:", err);
        }

        // If there are more chunks, wait 1 second to respect rate limits
        if (i + batchSize < subscribersList.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setTimeout(() => {
        setBroadcastProgress(null);
      }, 4000);

    } catch (e) {
      console.error("Broadcast notification error:", e);
      setBroadcastProgress(null);
    }
  };

  // Initial Shuffles
  useEffect(() => {
    const shuffle = (array) => {
      const s = [...array];
      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
      }
      return s;
    };
    setShuffledCore(shuffle(teamMembers.core || []));
  }, [teamMembers.core]);

  useEffect(() => {
    const shuffle = (array) => {
      const s = [...array];
      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
      }
      return s;
    };
    const combinedMembers = [...dynamicMembers];
    setShuffledMembers(shuffle(combinedMembers));
  }, [dynamicMembers]);


  // Parallel Real-time & Data Fetching
  useEffect(() => {
    // Guaranteed max splash timeout so loading screen NEVER gets stuck on black screen
    const maxSplashTimeout = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    const handleErr = (name) => (err) => {
      console.warn(`Firestore snapshot note (${name}):`, err);
      setIsInitializing(false);
    };

    // 1. Members Snapshot
    const qMembers = query(collection(db, "members"), orderBy("createdAt", "desc"));
    const unsubMembers = onSnapshot(qMembers, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDynamicMembers(fetched);
    }, handleErr("members"));

    // 1b. Team Members Snapshot
    const unsubTeam = onSnapshot(collection(db, "team_members"), (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const grouped = {
        founders: fetched.filter(m => m.category === 'founders').sort((a,b) => (a.order || 0) - (b.order || 0)),
        incharge: fetched.filter(m => m.category === 'incharge').sort((a,b) => (a.order || 0) - (b.order || 0)),
        ex_incharge: fetched.filter(m => m.category === 'ex_incharge').sort((a,b) => (a.order || 0) - (b.order || 0)),
        coordinators: fetched.filter(m => m.category === 'coordinators').sort((a,b) => (a.order || 0) - (b.order || 0)),
        core: fetched.filter(m => m.category === 'core').sort((a,b) => (a.order || 0) - (b.order || 0)),
      };
      if (fetched.length === 0) {
        setTeamMembers(TEAM_DATA);
      } else {
        setTeamMembers(grouped);
      }
    }, handleErr("team"));

    // 2. Fetch Gallery
    const unsubGallery = onSnapshot(collection(db, "gallery"), (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (fetched.length === 0) {
        setGallery(GALLERY);
      } else {
        setGallery(fetched);
      }
    }, handleErr("gallery"));

    // 3. Events Snapshot
    const unsubEvents = onSnapshot(collection(db, "events"), async (snap) => {
      const eventsMap = {};
      const eventList = [];
      snap.forEach(d => {
        const data = d.data();
        eventsMap[d.id] = data.photos || [];
        eventList.push({ id: d.id, ...data });
      });

      try {
        const seedRef = doc(db, "config", "events_seeded");
        const seedSnap = await getDoc(seedRef);
        if (!seedSnap.exists()) {
          if (snap.empty) {
            for (const ev of STATIC_EVENTS) {
              await setDoc(doc(db, "events", ev.id), {
                ...ev,
                calendarYear: "2026"
              });
            }
          }
          await setDoc(seedRef, { seeded: true });
        }
      } catch (e) {
        console.warn("Seeding check note:", e);
      }

      setLiveEvents(eventsMap);
      setLiveEventsList(eventList.sort((a,b) => (a.order || 99) - (b.order || 99)));
      setEventsLoaded(true);
    }, handleErr("events"));

    // 4. CC Events Snapshot
    const unsubCCEvents = onSnapshot(collection(db, "cc_events"), (snap) => {
      setCcEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.order || 99) - (b.order || 99)));
    }, handleErr("cc_events"));

    const unsubConfig = onSnapshot(doc(db, "config", "archive"), (doc) => {
      if (doc.exists()) setArchiveConfig(doc.data());
    }, handleErr("archive"));
    
    const unsubTheme = onSnapshot(doc(db, "config", "theme"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.themeId) {
          setThemeId(data.themeId);
        } else if (data.primaryColor) {
          const nearestTheme = THEMES.find(t => t.primary.toLowerCase() === data.primaryColor.toLowerCase()) || THEMES[0];
          setThemeId(nearestTheme.id);
        }
      }
    }, handleErr("theme"));

    const unsubCovers = onSnapshot(doc(db, "config", "covers"), (doc) => {
      if (doc.exists() && doc.data().urls) setCoverPhotos(doc.data().urls);
    }, handleErr("covers"));

    const unsubLiveEvent = onSnapshot(doc(db, "config", "live_event"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLiveEventConfig({
          active: !!data.active,
          eventName: data.eventName || "",
          subtitle: data.subtitle || "",
          color: data.color || "#ffcc00",
          photos: data.photos || []
        });
      }
    }, handleErr("live_event"));

    // 4. Site Config Listener
    const unsubSite = onSnapshot(doc(db, "config", "site"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSiteConfig(prev => ({
          ...prev,
          ...data,
          activeYear: data.activeYear || "2026",
          availableYears: data.availableYears || ["2026"]
        }));
        setTimeout(() => setIsInitializing(false), 600);
      } else {
        setIsInitializing(false);
      }
    }, handleErr("site"));

    // 5. Maintenance Config Listener
    const unsubMaintenance = onSnapshot(doc(db, "maintenanceSettings", "global"), (snap) => {
      if (snap.exists()) {
        setMaintenanceConfig(snap.data());
      } else {
        setMaintenanceConfig({ enabled: false });
      }
    }, handleErr("maintenance"));

    return () => {
      clearTimeout(maxSplashTimeout);
      unsubMembers();
      unsubTeam();
      unsubEvents();
      unsubCCEvents();
      unsubConfig();
      unsubTheme();
      unsubCovers();
      unsubLiveEvent();
      unsubSite();
      unsubGallery();
      unsubMaintenance();
    };
  }, []);

  const [selectedYear, setSelectedYear] = useState("2026");

  useEffect(() => {
    if (siteConfig?.activeYear) {
      setSelectedYear(siteConfig.activeYear);
    }
  }, [siteConfig.activeYear]);

  const filteredGalleryByYear = gallery.filter(item => (item.calendarYear || "2026") === selectedYear);

  // Derive Featured Captures Dynamically from Gallery
  useEffect(() => {
    if (!filteredGalleryByYear || filteredGalleryByYear.length === 0) {
      setWeekCapture(null);
      setMonthCapture(null);
      setExtraFrameCapture(null);
      return;
    }

    const sorted = [...filteredGalleryByYear].sort((a, b) => {
      const dateA = a.captureDate || "";
      const dateB = b.captureDate || "";
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      
      const createdA = a.createdAt || "";
      const createdB = b.createdAt || "";
      return createdB.localeCompare(createdA);
    });

    const latestWeek = sorted.find(g => g.category === "Weekly Captures");
    const latestMonth = sorted.find(g => g.category === "Monthly Captures");
    const latestExtra = sorted.find(g => g.category === "The Extra Frame");

    setWeekCapture(latestWeek || null);
    setMonthCapture(latestMonth || null);
    setExtraFrameCapture(latestExtra || null);
  }, [gallery, selectedYear]);




  // Nav scroll & Mobile detection
  useEffect(() => {
    const fn = () => {
      setNavScrolled(window.scrollY > 60);
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("scroll", fn);
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("resize", fn);
    };
  }, []);

  // Consolidated Intersection Observer for fade-in animations
  useEffect(() => {
    if (location.pathname === '/') {
      document.title = "CGEC Capture Crew \u2013 Photography Club";
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = "Capture Crew is the official photography club of CGEC. Explore event galleries, fest coverage, photography projects, club activities, and member contributions. Secure sign-in is used for membership verification, contributor access, and administrative features.";
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach(el => observer.observe(el));

    // Re-observe when components might re-render or expand (e.g. dynamic/lazy load backups)
    const timer = setInterval(() => {
      const newElements = document.querySelectorAll('.fade-in:not(.visible)');
      newElements.forEach(el => observer.observe(el));
    }, 500);

    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [
    location.pathname,
    galleryFilter,
    gallery,
    liveEvents,
    shuffledMembers,
    isInitializing,
    weekCapture,
    monthCapture,
    extraFrameCapture,
    expandedGallery,
    expandedEvents,
    expandedTeam,
    expandedMembers
  ]);

  // Lightbox keyboard navigation (Esc, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxItem) return;
      if (e.key === "Escape") {
        setLightboxItem(null);
      } else if (e.key === "ArrowLeft" && lightboxItem.playlist && lightboxItem.playlist.length > 1) {
        const prevIdx = (lightboxItem.currentIndex - 1 + lightboxItem.playlist.length) % lightboxItem.playlist.length;
        setLightboxItem({
          ...lightboxItem.playlist[prevIdx],
          playlist: lightboxItem.playlist,
          currentIndex: prevIdx
        });
      } else if (e.key === "ArrowRight" && lightboxItem.playlist && lightboxItem.playlist.length > 1) {
        const nextIdx = (lightboxItem.currentIndex + 1) % lightboxItem.playlist.length;
        setLightboxItem({
          ...lightboxItem.playlist[nextIdx],
          playlist: lightboxItem.playlist,
          currentIndex: nextIdx
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxItem]);

  // Auth Listener with Admin Check
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setIsAuthChecking(true);
        try {
          const email = u.email.toLowerCase();
          const adminDoc = await getDoc(doc(db, "admins", email));
          if (adminDoc.exists()) {
            setIsAdmin(true);
            setAdminData(adminDoc.data());
          } else {
            setIsAdmin(false);
            setAdminData(null);
          }
        } catch (err) {
          console.error("Admin check error:", err);
          setIsAdmin(false);
        }
        setIsAuthChecking(false);
      } else {
        setIsAdmin(false);
        setAdminData(null);
        setIsAuthChecking(false);
      }
    });
  }, []);

  // Apply Dynamic Theme
  useEffect(() => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--gold', theme.primary);
    root.style.setProperty('--gold2', theme.secondary);
    root.style.setProperty('--heading-accent', theme.heading);
    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--ink', theme.surface === '#111114' ? '#0A0A0B' : `${theme.surface}CC`);
  }, [themeId]);

  const updateTheme = async (id) => {
    try {
      await setDoc(doc(db, "config", "theme"), { themeId: id }, { merge: true });
    } catch (err) {
      alert("Failed to update theme: " + err.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);
    const startTime = Date.now();
    try {
      const q = query(collection(db, "certificates"), where("serialNo", "==", certId.trim()));
      const snap = await getDocs(q);
      
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 1200) {
        await new Promise(resolve => setTimeout(resolve, 1200 - elapsedTime));
      }

      if (!snap.empty) {
        setVerifyResult(snap.docs[0].data());
      } else {
        setVerifyResult({ error: "Certificate not found. Please check the serial number." });
      }
    } catch (err) {
      console.error(err);
      setVerifyResult({ error: "Verification service unavailable." });
    }
    setIsVerifying(false);
  };
  const scrollTo = (id) => {
    if (selectedEvent) setSelectedEvent(null);
    setMobileMenuOpen(false);
    let route = "/";
    if (id === "gallery") route = "/gallery";
    if (id === "events") route = "/events";
    if (id === "team") route = "/team";
    if (id === "verify") route = "/verify";
    navigate(route);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const sortedGallery = [...filteredGalleryByYear].sort((a, b) => {
    const dateA = a.captureDate || a.createdAt || "";
    const dateB = b.captureDate || b.createdAt || "";
    if (dateB !== dateA) return dateB.localeCompare(dateA);
    const createdA = a.createdAt || "";
    const createdB = b.createdAt || "";
    return createdB.localeCompare(createdA);
  });

  const filteredGallery = galleryFilter === "All"
    ? sortedGallery.filter(g => ["Weekly Captures", "Monthly Captures", "The Extra Frame"].includes(g.category))
    : sortedGallery.filter(g => g.category === galleryFilter);

  const filteredEventsList = liveEventsList.filter(ev => (ev.calendarYear || "2026") === selectedYear);
  const filteredCcEvents = ccEvents.filter(ev => (ev.calendarYear || "2026") === selectedYear);

  if (isInitializing) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="shutter-icon">
            <img src={siteConfig.logoUrl || "/logo.jpg"} alt="Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px solid var(--gold)', padding: '5px' }} />
          </div>
          <h1 className="splash-logo">{siteConfig.siteName?.split(' ')[0]} <span>{siteConfig.siteName?.split(' ')[1]}</span></h1>
          <div className="splash-loader">
            <div className="loader-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  if (maintenanceConfig?.enabled && !isAdmin && !location.pathname.startsWith('/admin')) {
    return <MaintenancePage config={maintenanceConfig} siteConfig={siteConfig} />;
  }

  return (
    <div className="app-container">
      <CameraPopUpEffect />
      <SEOMetadata />
      {/* NAV */}
      <nav className={`nav ${navScrolled ? "scrolled" : ""}`}>
        <div className="nav-brand" onClick={() => scrollTo("home")}>
          <div className="nav-logo">
            <img src={siteConfig.logoUrl || "/logo.jpg"} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <div className="nav-name">{siteConfig.siteName}</div>
        </div>
        
        <button className={`nav-toggle ${mobileMenuOpen ? "active" : ""}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span><span></span><span></span>
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {[
            { id: "home", label: "Home" },
            { id: "gallery", label: "Gallery", dropdown: [
              { label: "Weekly Captures", route: "/gallery/weekly-captures" },
              { label: "Monthly Captures", route: "/gallery/monthly-captures" },
              { label: "The Extra Frame", route: "/gallery/the-extra-frame" }
            ] },
            { id: "events", label: "Events", dropdown: liveEventsList.map(ev => ({
              label: ev.name, route: `/events/${ev.slug || generateSlug(ev.name)}`, comingSoon: ev.comingSoon
            })) },
            { id: "events-gallery", label: "Events Gallery" },
            { id: "team", label: "Team" },
            { id: "verify", label: "Verify" },
            { id: "join", label: "Join" },
            { id: "contributors", label: "Contributors" },
            { id: "contact", label: "Contact Us" },
            { id: "about", label: "About Us" },
            { id: "admin", label: "Admin Login" }
          ].map((item) => {
            const id = item.id;
            const label = item.label;
            let route = item.route || (id === "home" ? "/" : `/${id}`);
            return (
              <li key={id} className={`nav-item ${activeSection === id ? "active" : ""} ${item.dropdown ? "has-dropdown" : ""}`}>
                <Link 
                  to={route} 
                  onClick={(e) => {
                    if (selectedEvent) setSelectedEvent(null);
                    // Don't close mobile menu immediately if it has dropdown, to allow clicking, unless handled by CSS.
                    // Actually, clicking the main link should navigate and close it.
                    setMobileMenuOpen(false);
                    if (!sessionStorage.getItem("cc_events_timeline_scroll")) {
                      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
                    }
                  }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {label}
                </Link>
                {item.dropdown && (
                  <ul className="dropdown-menu">
                    {item.dropdown.map(d => (
                      <li key={d.label}>
                        <Link 
                          to={d.comingSoon ? "#" : d.route}
                          onClick={(e) => {
                            if (d.comingSoon) {
                              e.preventDefault();
                              alert("Coming Soon!");
                              return;
                            }
                            if (selectedEvent) setSelectedEvent(null);
                            setMobileMenuOpen(false);
                            setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
                          }}
                          style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
                        >
                          {d.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
          {siteConfig.availableYears && siteConfig.availableYears.length > 1 && (
            <li className="nav-year-selector" style={{ display: 'flex', alignItems: 'center', margin: isMobile ? '1rem 0 0 0' : '0 0 0 1rem' }}>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  color: '#fff',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {siteConfig.availableYears.map(yr => (
                  <option key={yr} value={yr} style={{ background: '#111', color: '#fff' }}>
                    {yr} Edition
                  </option>
                ))}
              </select>
            </li>
          )}
        </ul>
      </nav>

      {/* HERO */}
      <Routes>
        <Route path="/" element={
          <>
            {liveEventConfig.active ? (
              <LiveShowcase config={liveEventConfig} setLightboxItem={setLightboxItem} />
            ) : (
              <>
                <section id="home" className="hero">
        <div className="hero-bg">
          {activeCovers.map((img, idx) => (
            (idx === currentHeroIndex || idx === (currentHeroIndex + 1) % activeCovers.length) && (
              <div
                key={idx}
                className={`hero-slide ${idx === currentHeroIndex ? "active" : ""}`}
                style={{ backgroundImage: `url("${img}")`, backgroundColor: '#111' }}
              />
            )
          ))}
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">{siteConfig.heroEyebrow}</div>
          <h1 className="hero-title" dangerouslySetInnerHTML={{ 
            __html: siteConfig.heroTitle?.split('\n').map(line => {
              const words = line.split(' ');
              if (words.length >= 2) {
                // First word white, rest emphasized (gold)
                return `${words[0]} <em>${words.slice(1).join(' ')}</em>`;
              }
              return line;
            }).join('<br/>')
          }} />
          <p className="hero-tagline">{siteConfig.heroTagline}</p>


          <a 
            href="/events" 
            className="event-btn"
            onClick={(e) => {
              e.preventDefault();
              navigate('/events');
              setTimeout(() => {
                const el = document.querySelector('.timeline-section-sticky-wrapper');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            <div className="event-icon">
              <svg width="22" height="22" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="7" width="26" height="22" rx="3"/>
                <line x1="4" y1="13" x2="30" y2="13"/>
                <line x1="10" y1="3" x2="10" y2="10"/>
                <line x1="24" y1="3" x2="24" y2="10"/>
              </svg>
            </div>

            <div className="event-content">
              <span className="label">EXPLORE</span>
              <h3>EVENTS & MEMORIES</h3>
            </div>

            <div className="event-arrow">
              →
            </div>
          </a>
        </div>

      </section>

      {(() => {
        const sections = [];
        if (weekCapture) {
          sections.push({
            date: weekCapture.captureDate || "",
            created: weekCapture.createdAt || "",
            element: (
              <section id="week" className="week-section" key="week" style={{ padding: '2rem 0' }}>
                <div className="container">
                  <div className="fade-in" style={{ marginBottom: "1.5rem" }}>
                    <div className="section-label"></div>
                    <h2 className="section-title">Capture of the <em>Week</em></h2>
                  </div>
                  <div className="week-inner fade-in">
                    <div className="week-image-wrap">
                      <BlurUpImage src={weekCapture.url || "/placeholder.jpg"} alt={weekCapture.title} className="week-img" style={{ cursor: 'pointer' }} onClick={() => setLightboxItem(weekCapture)} />
                    </div>
                    <div className="week-info">
                      <div className="week-date"></div>
                      <p className="week-story">{weekCapture.title || "Fetching the latest capture..."}</p>
                      <div className="month-photographer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        By <span>{weekCapture.photographer}</span> ({weekCapture.dept} · {weekCapture.year})
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          });
        } else {
          sections.push({
            date: "",
            created: "",
            element: (
              <section id="week" className="week-section" key="week" style={{ padding: '2rem 0' }}>
                <div className="container">
                  <div className="fade-in" style={{ marginBottom: "1.5rem" }}>
                    <div className="section-label"></div>
                    <h2 className="section-title">Capture of the <em>Week</em></h2>
                  </div>
                  <div className="week-inner fade-in">
                    <div className="week-image-wrap">
                      <BlurUpImage src="/placeholder.jpg" alt="Placeholder" className="week-img" style={{ cursor: 'default' }} />
                    </div>
                    <div className="week-info">
                      <div className="week-date"></div>
                      <p className="week-story">Fetching the latest capture...</p>
                    </div>
                  </div>
                </div>
              </section>
            )
          });
        }

        if (monthCapture) {
          sections.push({
            date: monthCapture.captureDate || "",
            created: monthCapture.createdAt || "",
            element: (
              <section id="month" className="month-section" key="month" style={{ padding: '2rem 0' }}>
                <div className="container">
                  <div className="month-header fade-in" style={{ marginBottom: "1.5rem" }}>
                    <div>
                      <div className="section-label"></div>
                      <h2 className="section-title">Capture of the <em>Month</em></h2>
                    </div>
                  </div>
                  <div className="month-slide fade-in">
                    <div className="month-image-wrap">
                      <BlurUpImage src={monthCapture.url || "/placeholder.jpg"} alt={monthCapture.title} className="month-img" style={{ cursor: 'pointer' }} onClick={() => setLightboxItem(monthCapture)} />
                      <div className="month-frame" />
                    </div>
                    <div className="month-info">
                      <div className="month-of"></div>
                      <h3 className="week-title" style={{ fontSize: '2.2rem', marginBottom: '1.2rem' }}>{monthCapture.title}</h3>
                      <div className="month-photographer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        By <span>{monthCapture.photographer}</span> ({monthCapture.dept} · {monthCapture.year})
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          });
        } else {
          sections.push({
            date: "",
            created: "",
            element: (
              <section id="month" className="month-section" key="month" style={{ padding: '2rem 0' }}>
                <div className="container">
                  <div className="month-header fade-in" style={{ marginBottom: "1.5rem" }}>
                    <div>
                      <div className="section-label"></div>
                      <h2 className="section-title">Capture of the <em>Month</em></h2>
                    </div>
                  </div>
                  <div className="month-slide fade-in">
                    <div className="month-image-wrap">
                      <BlurUpImage src="/placeholder.jpg" alt="Placeholder" className="month-img" style={{ cursor: 'default' }} />
                      <div className="month-frame" />
                    </div>
                    <div className="month-info">
                      <div className="month-of"></div>
                      <h3 className="week-title" style={{ fontSize: '2.2rem', marginBottom: '1.2rem' }}>Fetching the latest capture...</h3>
                    </div>
                  </div>
                </div>
              </section>
            )
          });
        }

        if (extraFrameCapture) {
          sections.push({
            date: extraFrameCapture.captureDate || "",
            created: extraFrameCapture.createdAt || "",
            element: (
              <section id="extra" className="week-section" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: '2rem 0' }} key="extra">
                <div className="container">
                  <div className="fade-in" style={{ marginBottom: "1.5rem" }}>
                    <div className="section-label"></div>
                    <h2 className="section-title">The <em>Extra Frame</em></h2>
                  </div>
                  <div className="week-inner fade-in">
                    <div className="week-image-wrap" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                      <BlurUpImage src={extraFrameCapture.url} alt={extraFrameCapture.title} className="week-img" style={{ borderRadius: '0', cursor: 'pointer' }} onClick={() => setLightboxItem(extraFrameCapture)} />
                    </div>
                    <div className="week-info" style={{ padding: '0' }}>
                      <div className="week-date"></div>
                      <h3 className="week-title" style={{ fontSize: '2.2rem', marginBottom: '1.2rem' }}>{extraFrameCapture.title}</h3>
                      <div className="month-photographer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        By <span>{extraFrameCapture.photographer}</span> ({extraFrameCapture.dept} · {extraFrameCapture.year})
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          });
        }

        // Sort sections: newest first
        sections.sort((a, b) => {
          if (a.date === "" && b.date !== "") return 1;
          if (b.date === "" && a.date !== "") return -1;
          if (b.date !== a.date) return b.date.localeCompare(a.date);
          return b.created.localeCompare(a.created);
        });

        return sections.map(s => s.element);
      })()}
            </>
          )}
          <NewsletterSection siteConfig={siteConfig} />
          </>
        } />

        {/* Legacy redirect routes for backward compatibility */}
        <Route path="/Weekly Captures" element={<Navigate to="/gallery/weekly-captures" replace />} />
        <Route path="/Monthly Captures" element={<Navigate to="/gallery/monthly-captures" replace />} />
        <Route path="/The Extra Frame" element={<Navigate to="/gallery/the-extra-frame" replace />} />

        {["/gallery", "/gallery/weekly-captures", "/gallery/monthly-captures", "/gallery/the-extra-frame", "/gallery/:category"].map(path => (
          <Route key={path} path={path} element={
          <section id="gallery" className="gallery-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem" }}>
            <div className="section-label">✧ Our Work</div>
            <h2 className="section-title">The <em>Gallery</em></h2>
            <p className="section-sub">Curated captures from our photographers — click any image to view full screen.</p>
          </div>
          <div className="gallery-filter fade-in">
            {["All", "Weekly Captures", "Monthly Captures", "The Extra Frame"].map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${galleryFilter === cat ? "active" : ""}`} 
                onClick={() => setGalleryFilterRoute(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="gallery-masonry fade-in">
            {filteredGallery.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: '16px', gridColumn: '1 / -1', width: '100%' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📸</div>
                <h4 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>No Captures Yet for {siteConfig.activeYear || "2026"}</h4>
                <p style={{ fontSize: '0.85rem' }}>The shutter is waiting! Upload new photos in the Admin Console to fill this space.</p>
              </div>
            ) : (
              reorderPhotosForMasonry(filteredGallery.slice(0, !expandedGallery ? (isMobile ? 3 : 12) : undefined), isMobile).map(item => (
                <div
                  key={item.id}
                  className="gallery-item"
                  onClick={() => setLightboxItem(item)}
                >
                  <BlurUpImage 
                    src={item.url} 
                    alt={item.title} 
                    className="gallery-thumb" 
                    aspectRatio={item.aspect}
                  />
                  <div className="gallery-overlay">
                    <div>
                      <div className="gallery-item-title">{item.title}</div>
                      <div className="gallery-item-photo">by {item.photographer} · {item.dept}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {!expandedGallery && filteredGallery.length > (isMobile ? 3 : 12) && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button className="event-dive-btn" onClick={() => setExpandedGallery(true)}>View All Captures </button>
            </div>
          )}
        </div>
      </section>
        } />
        ))}

        <Route path="/events" element={
          <section id="events" className="events-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem" }}>
            <div className="section-label">✧ Milestones</div>
            <h2 className="section-title">College <em>Events</em></h2>
            <p className="section-sub">From vibrant campus fests to unforgettable college moments — every event, immortalized through our lenses.</p>
          </div>

          {/* Capture Crew Events Featured Card */}
          <div 
            className="event-card fade-in" 
            onClick={() => navigate('/events/cc-events')}
            style={{ 
              marginBottom: '4rem', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(201, 169, 110, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(201, 169, 110, 0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Glow design decoration */}
            <div style={{
              position: 'absolute',
              top: '-30%',
              right: '-10%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(201, 169, 110, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 1
            }}></div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <span className="event-emoji" style={{ fontSize: '3rem', display: 'inline-block', marginBottom: '1rem' }}>🏆</span>
              <div className="event-subtitle" style={{ color: 'var(--gold)', fontWeight: 600 }}>Exclusive Club Competitions</div>
              <div className="event-name" style={{ fontSize: '2.2rem', marginTop: '0.2rem' }}>Capture Crew <em>Events</em></div>
              <p className="event-desc" style={{ maxWidth: '800px', fontSize: '0.92rem', marginTop: '0.8rem', marginBottom: '1.5rem', opacity: 0.85 }}>
                Dive into our internal theme-based photography challenges, view competition rules, keep up with upcoming events, and explore the Hall of Fame celebrating our top winners.
              </p>
              
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>✦</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Upcoming Events: {filteredCcEvents.filter(e => e.upcoming).length}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>🏆</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Hall of Fame: {filteredCcEvents.filter(e => !e.upcoming).length} Competitions
                  </span>
                </div>
              </div>

              <a 
                href="/events" 
                className="event-btn"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/events');
                  setTimeout(() => {
                    const el = document.querySelector('.timeline-section-sticky-wrapper');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                <div className="event-icon">
                  <svg width="22" height="22" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="7" width="26" height="22" rx="3"/>
                    <line x1="4" y1="13" x2="30" y2="13"/>
                    <line x1="10" y1="3" x2="10" y2="10"/>
                    <line x1="24" y1="3" x2="24" y2="10"/>
                  </svg>
                </div>

                <div className="event-content">
                  <span className="label">EXPLORE</span>
                  <h3>CC EVENTS</h3>
                </div>

                <div className="event-arrow">
                  →
                </div>
              </a>
            </div>
          </div>

          {/* Interactive Event Timeline Track */}
          <EventTimelineTrack 
            events={filteredEventsList} 
            staticIcons={STATIC_EVENT_ICONS} 
            navigate={navigate} 
            generateSlug={generateSlug} 
            siteConfig={siteConfig} 
          />
        </div>
      </section>
        } />

        <Route path="/team" element={
          <section id="team" className="team-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem" }}>
            <div className="section-label">✧ The People Behind the Lens</div>
            <h2 className="section-title"><em>Team</em></h2>
            <p className="section-sub">The dedicated photographers, editors, and organizers who keep Capture Crew alive.</p>
          </div>
          <div className="team-container">
            {/* FOUNDERS */}
            {teamMembers.founders?.length > 0 && (
              <div className="team-subcategory">
                <h3 className="subcategory-title"><em>Founders</em></h3>
                <div className="team-grid">
                  {teamMembers.founders.map(m => (
                    <div key={m.id || m.name} className="team-card fade-in">
                      <div 
                        className={`team-avatar ${m.img ? 'clickable' : ''}`}
                        onClick={m.img ? () => setLightboxItem({ url: m.img, title: m.name }) : undefined}
                      >
                        <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div className="team-name">{m.name}</div>
                      <div className="team-role">{m.role}</div>
                      <div className="team-dept">{m.dept} {m.year ? `· ${m.year}` : ""}</div>
                      {m.insta && (
                        <div className="team-socials">
                          <a href={m.insta} target="_blank" rel="noopener noreferrer" className="team-social-icon" title="Instagram">
                            <InstagramIcon />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INCHARGE */}
            {teamMembers.incharge?.length > 0 && (
              <div className="team-subcategory">
                <h3 className="subcategory-title"><em>Incharges</em></h3>
                <div className="team-grid incharge-grid">
                  {teamMembers.incharge.map(m => (
                    <div key={m.id || m.name} className="team-card incharge-card fade-in">
                      <div 
                        className={`team-avatar highlight-silver ${m.img ? 'clickable' : ''}`}
                        onClick={m.img ? () => setLightboxItem({ url: m.img, title: m.name }) : undefined}
                      >
                        <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div className="team-name">{m.name}</div>
                      <div className="team-role">{m.role}</div>
                      <div className="team-dept">{m.dept} {m.year ? `· ${m.year}` : ""}</div>
                      {m.insta && (
                        <div className="team-socials">
                          <a href={m.insta} target="_blank" rel="noopener noreferrer" className="team-social-icon" title="Instagram">
                            <InstagramIcon />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CLUB ADVISORS */}
            {teamMembers.ex_incharge?.length > 0 && (
              <div className="team-subcategory">
                <h3 className="subcategory-title"><em>Club Advisors</em></h3>
                <div className="team-grid incharge-grid">
                  {teamMembers.ex_incharge.map(m => (
                    <div key={m.id || m.name} className="team-card incharge-card fade-in">
                      <div 
                        className={`team-avatar highlight-silver ${m.img ? 'clickable' : ''}`}
                        onClick={m.img ? () => setLightboxItem({ url: m.img, title: m.name }) : undefined}
                      >
                        <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div className="team-name">{m.name}</div>
                      <div className="team-role">{m.role}</div>
                      <div className="team-dept">{m.dept} {m.year ? `· ${m.year}` : ""}</div>
                      {m.insta && (
                        <div className="team-socials">
                          <a href={m.insta} target="_blank" rel="noopener noreferrer" className="team-social-icon" title="Instagram">
                            <InstagramIcon />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COORDINATORS */}
            {teamMembers.coordinators?.length > 0 && (
              <div className="team-subcategory">
                <h3 className="subcategory-title"><em>Co-Ordinators</em></h3>
                <div className="team-grid">
                  {teamMembers.coordinators.map(m => (
                    <div key={m.id || m.name} className="team-card fade-in">
                      <div 
                        className={`team-avatar ${m.img ? 'clickable' : ''}`}
                        onClick={m.img ? () => setLightboxItem({ url: m.img, title: m.name }) : undefined}
                      >
                        <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div className="team-name">{m.name}</div>
                      <div className="team-role">{m.role}</div>
                      <div className="team-dept">{m.dept} {m.year ? `· ${m.year}` : ""}</div>
                      {m.insta && (
                        <div className="team-socials">
                          <a href={m.insta} target="_blank" rel="noopener noreferrer" className="team-social-icon" title="Instagram">
                            <InstagramIcon />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CORE TEAM */}
            {teamMembers.core?.length > 0 && (
              <div className="team-subcategory">
                <h3 className="subcategory-title"><em>Core Team</em></h3>
                <div className="team-grid">
                  {(isMobile && !expandedTeam ? teamMembers.core.slice(0, 3) : teamMembers.core).map(m => (
                    <div key={m.id || m.name} className="team-card fade-in">
                      <div 
                        className={`team-avatar ${m.img ? 'clickable' : ''}`}
                        onClick={m.img ? () => setLightboxItem({ url: m.img, title: m.name }) : undefined}
                      >
                        {m.img ? (
                          <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          m.emoji || "📸"
                        )}
                      </div>
                      <div className="team-name">{m.name}</div>
                      <div className="team-role">{m.role}</div>
                      <div className="team-dept">{m.dept} {m.year ? `· ${m.year}` : ""}</div>
                      {m.insta && (
                        <div className="team-socials">
                          <a href={m.insta} target="_blank" rel="noopener noreferrer" className="team-social-icon" title="Instagram">
                            <InstagramIcon />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isMobile && !expandedTeam && teamMembers.core.length > 3 && (
                    <div className="team-card fade-in" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }} onClick={() => setExpandedTeam(true)}>
                      <div className="team-avatar" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>
                        📂
                      </div>
                      <div className="team-name" style={{ color: 'var(--gold)' }}>Show All</div>
                      <div className="team-role">Full Core Team</div>
                      <div className="team-dept">{teamMembers.core.length} Members Total</div>
                    </div>
                  )}
                  
                  {/* RECRUITMENT CARD */}
                  {(expandedTeam || !isMobile) && (
                    <div className="team-card fade-in" style={{ cursor: 'pointer', border: '1px dashed var(--gold)', background: 'rgba(201,169,110,0.03)' }} onClick={() => navigate('/join')}>
                      <div className="team-avatar" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold2))', color: 'var(--ink)' }}>
                        ➕
                      </div>
                      <div className="team-name" style={{ color: 'var(--gold)' }}>Join Our Crew</div>
                      <div className="team-role">Become a Member</div>
                      <div className="team-dept">Apply for Core Team</div>
                      <button className="event-dive-btn" style={{ marginTop: '1rem', width: '100%' }}>Apply Now </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Members section moved to Contributors page */}
          </div>
        </div>
      </section>
        } />

        <Route path="/join" element={<RecruitmentPage />} />
        <Route path="/apply" element={<RecruitmentPage />} />
        <Route path="/contributors" element={<ContributorsPage shuffledMembers={shuffledMembers} expandedMembers={expandedMembers} setExpandedMembers={setExpandedMembers} isMobile={isMobile} setLightboxItem={setLightboxItem} siteConfig={siteConfig} />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsConditionsPage />} />
        <Route path="/unsubscribe" element={<UnsubscribePage />} />

        <Route path="/verify" element={
          <section id="verify" className="verify-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem", textAlign: "center" }}>
            <div className="section-label">✧ Authenticity</div>
            <h2 className="section-title">Verify <em>Certificate</em></h2>
            <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>Enter your certificate serial number to verify its authenticity and details.</p>
          </div>
          <div className="verify-box fade-in">
            <form className="verify-form" onSubmit={handleVerify}>
              <input 
                type="text" 
                placeholder="Enter Serial Number (e.g. CC-2024-001)" 
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="form-input"
              />
              <button type="submit" className="form-submit" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Now "}
              </button>
            </form>

            {isVerifying && (
              <div className="finding-animation-container fade-in visible">
                <div className="finding-gif-wrapper">
                  <img src="/finding.gif" alt="Searching Certificate..." className="finding-gif" />
                </div>
                <div className="finding-status-text">
                  Searching Certificate Record<span className="finding-dots">...</span>
                </div>
              </div>
            )}

            {!isVerifying && verifyResult && (
              <div className="verify-result fade-in visible">
                {verifyResult.error ? (
                  <div className="result-error">{verifyResult.error}</div>
                ) : (
                  <div className="result-success">
                    <div className="result-badge">✓ Verified Authenticity</div>
                    <div className="result-grid">
                      <div className="result-item">
                        <span className="label">Issued To</span>
                        <span className="value">{verifyResult.name}</span>
                      </div>
                      <div className="result-item">
                        <span className="label">Date Issued</span>
                        <span className="value">{verifyResult.date}</span>
                      </div>
                      <div className="result-item">
                        <span className="label">Event</span>
                        <span className="value">{verifyResult.event}</span>
                      </div>
                    </div>
                    {(verifyResult.link || verifyResult.certUrl || verifyResult.url || verifyResult.certificateUrl || verifyResult.pdfUrl) && (
                      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <a 
                          href={verifyResult.link || verifyResult.certUrl || verifyResult.url || verifyResult.certificateUrl || verifyResult.pdfUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="form-submit" 
                          style={{ 
                            display: 'inline-block', 
                            textDecoration: 'none', 
                            textAlign: 'center',
                            minWidth: '200px'
                          }}
                        >
                          Download Certificate
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
        } />
        <Route path="/events-gallery" element={
          <EventPage 
            isGlobal={true}
            event={{ id: 'global', name: 'Event Archive', desc: 'A universal journey through all our club milestones and collective memories.' }}
            onClose={() => navigate('/events')}
            setLightboxItem={setLightboxItem}
            liveEvents={liveEvents}
            archiveConfig={archiveConfig}
            liveEventsList={filteredEventsList}
            isMobile={isMobile}
          />
        } />
        <Route path="/events/archive" element={<Navigate to="/events-gallery" replace />} />
        <Route path="/events/:eventId" element={
          <EventRouteWrapper 
            liveEventsList={filteredEventsList}
            liveEvents={liveEvents}
            setLightboxItem={setLightboxItem}
            archiveConfig={archiveConfig}
            navigate={navigate}
            eventsLoaded={eventsLoaded}
            ccEvents={filteredCcEvents}
            isMobile={isMobile}
          />
        } />
        <Route path="/admin" element={
          <AdminRouteWrapper
            user={user}
            isAuthChecking={isAuthChecking}
            isAdmin={isAdmin}
            adminData={adminData}
            archiveConfig={archiveConfig}
            themeId={themeId}
            coverPhotos={coverPhotos}
            liveEvents={liveEvents}
            liveEventsList={liveEventsList}
            dynamicMembers={dynamicMembers}
            teamMembers={teamMembers}
            ccEvents={ccEvents}
            updateTheme={updateTheme}
            siteConfig={siteConfig}
            gallery={gallery}
            navigate={navigate}
            liveEventConfig={liveEventConfig}
            sendResendNotification={sendResendNotification}
            maintenanceConfig={maintenanceConfig}
          />
        } />
        <Route path="*" element={<FrameNotFoundPage />} />
      </Routes>

      <footer className="footer">
        <div className="container">
          <div className="footer-top" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem', fontWeight: 'bold' }}>
              Capturing Moments · Creating Memories
            </div>
            <div className="footer-brand" style={{ marginBottom: '0.2rem' }}>
              {siteConfig.siteName?.split(' ')[0]} <span>{siteConfig.siteName?.split(' ')[1]}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--white)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: '500' }}>
              Photography Club of CGEC
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic', letterSpacing: '0.05em' }}>
              Exploring the World through the CGEC lens
            </div>
          </div>
          
          <div className="footer-mid">
            <div className="footer-links">
              {[
                ["home", "Home"],
                ["about", "About Us"],
                ["contact", "Contact Us"],
                ["gallery", "Gallery"],
                ["events", "Events"],
                ["events-gallery", "Events Gallery"],
                ["team", "Team"],
                ["verify", "Verify"],
                ["join", "Join"],
                ["contributors", "Contributors"],
                ["privacy-policy", "Privacy Policy"],
                ["terms", "Terms of Service"],
                ["admin", "Admin Login"]

              ].map(([id, label]) => {
                let route = id === "home" ? "/" : `/${id}`;
                return (
                  <Link 
                    key={id}
                    to={route} 
                    onClick={(e) => {
                      if (selectedEvent) setSelectedEvent(null);
                      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
                    }}
                    className="footer-link"
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
            
            {siteConfig.availableYears && siteConfig.availableYears.length > 1 && (
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Switch Edition</div>
                {siteConfig.availableYears.map(yr => (
                  <button
                    key={yr}
                    onClick={() => {
                      setSelectedYear(yr);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="footer-link"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: selectedYear === yr ? 'var(--gold)' : 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: 0,
                      fontWeight: selectedYear === yr ? 'bold' : 'normal'
                    }}
                  >
                    {yr} Edition {selectedYear === yr ? "✓" : ""}
                  </button>
                ))}
              </div>
            )}

            <div className="footer-socials">
              <a href={siteConfig.instaLink} target="_blank" rel="noreferrer" className="footer-social-btn instagram" title="Follow us on Instagram">
                <svg className="footer-social-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>
              <a href={siteConfig.linkedinLink || "https://www.linkedin.com/company/cgec-capture-crew/"} target="_blank" rel="noreferrer" className="footer-social-btn linkedin" title="Connect on LinkedIn">
                <svg className="footer-social-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
              <a href={siteConfig.fbLink} target="_blank" rel="noreferrer" className="footer-social-btn facebook" title="Like us on Facebook">
                <svg className="footer-social-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copy">
              <span className="footer-copy-line">© 2026 Capture Crew. All rights reserved.</span>
              <span className="footer-credit-line">Designed & Developed by <a href="https://www.instagram.com/destructive_antagonist/" target="_blank" rel="noopener noreferrer">Arkadeb Thokdar</a></span>
            </div>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      <div className={`lightbox ${lightboxItem ? "open" : ""}`} onClick={() => setLightboxItem(null)}>
        <button className="lightbox-close" onClick={() => setLightboxItem(null)}>✕</button>
        
        {lightboxItem && lightboxItem.playlist && lightboxItem.playlist.length > 1 && (
          <>
            <button 
              className="lightbox-nav-btn prev"
              onClick={(e) => {
                e.stopPropagation();
                const prevIdx = (lightboxItem.currentIndex - 1 + lightboxItem.playlist.length) % lightboxItem.playlist.length;
                setLightboxItem({
                  ...lightboxItem.playlist[prevIdx],
                  playlist: lightboxItem.playlist,
                  currentIndex: prevIdx
                });
              }}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button 
              className="lightbox-nav-btn next"
              onClick={(e) => {
                e.stopPropagation();
                const nextIdx = (lightboxItem.currentIndex + 1) % lightboxItem.playlist.length;
                setLightboxItem({
                  ...lightboxItem.playlist[nextIdx],
                  playlist: lightboxItem.playlist,
                  currentIndex: nextIdx
                });
              }}
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}

        {lightboxItem && (
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img
              src={getOptimizedUrl(lightboxItem.url)}
              alt={lightboxItem.title}
              className="lightbox-img-tag"
              referrerPolicy="no-referrer"
              style={{
                width: "auto",
                maxWidth: "90vw",
                maxHeight: "80vh",
                borderRadius: "12px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
              }}
            />
            {lightboxItem.playlist && lightboxItem.playlist.length > 1 && (
              <div className="lightbox-counter">
                {lightboxItem.currentIndex + 1} / {lightboxItem.playlist.length}
              </div>
            )}
            <div className="lightbox-title">{lightboxItem.title}</div>
            {(lightboxItem.photographer || lightboxItem.dept || lightboxItem.year) && (
              <div className="lightbox-credit">
                {lightboxItem.photographer ? `by ${lightboxItem.photographer}` : ""}
                {lightboxItem.photographer && lightboxItem.dept ? " · " : ""}
                {lightboxItem.dept ? lightboxItem.dept : ""}
                {lightboxItem.year ? ` (${lightboxItem.year})` : ""}
              </div>
            )}
          </div>
        )}
      </div>
      {/* MODALS */}
      {showRecruitment && (
        <RecruitmentModal onClose={() => setShowRecruitment(false)} />
      )}

      {/* FLOATING BROADCAST PROGRESS TOAST */}
      {broadcastProgress && (
        <div className="broadcast-toast">
          {broadcastProgress.current < broadcastProgress.total ? (
            <div className="broadcast-spinner"></div>
          ) : (
            <div style={{ color: '#00ff96', fontSize: '1.2rem', fontWeight: 'bold' }}>✓</div>
          )}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
              {broadcastProgress.current < broadcastProgress.total ? 'Sending Notifications...' : 'Notifications Sent!'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>
              {broadcastProgress.current} / {broadcastProgress.total} subscribers notified
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventRouteWrapper({ liveEventsList, liveEvents, setLightboxItem, archiveConfig, navigate, eventsLoaded, ccEvents, isMobile }) {
  if (!eventsLoaded) {
    return (
      <div className="lightbox open" style={{ color: '#fff', background: 'rgba(0,0,0,0.95)', zIndex: 3000 }}>
        <div className="lightbox-content" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Loading</div>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Loading <em>Event Details...</em></h2>
        </div>
      </div>
    );
  }

  const { eventId } = useParams();
  
  if (eventId === 'cc-events' || eventId === 'capture-crew-events') {
    return (
      <CCEventsPage 
        ccEvents={ccEvents} 
        onClose={() => navigate('/events')} 
        setLightboxItem={setLightboxItem} 
        isMobile={isMobile}
      />
    );
  }

  if (eventId === 'archive') {
    return (
      <EventPage 
        isGlobal={true}
        event={{ id: 'global', name: 'Event Archive', desc: 'A universal journey through all our club milestones and collective memories.' }}
        onClose={() => navigate('/events')}
        setLightboxItem={setLightboxItem}
        liveEvents={liveEvents}
        archiveConfig={archiveConfig}
        liveEventsList={liveEventsList}
        isMobile={isMobile}
      />
    );
  }

  const decoded = decodeURIComponent(eventId);
  let event = liveEventsList.find(e => e.slug === eventId || generateSlug(e.name) === eventId || generateSlug(e.id) === eventId);
  
  if (!event) {
    // Check if it's an old encoded style link or id
    event = liveEventsList.find(e => e.name === decoded || e.id === decoded);
    if (event) {
      // It's an old link, redirect to the clean slug
      return <Navigate to={`/events/${event.slug || generateSlug(event.name)}`} replace />;
    }
    return <div style={{ color: 'white', padding: '5rem', textAlign: 'center' }}>Event not found</div>;
  }

  return (
    <EventPage 
      event={event} 
      onClose={() => navigate('/events')}
      setLightboxItem={setLightboxItem} 
      liveEvents={liveEvents}
      isMobile={isMobile}
    />
  );
}

function AdminRouteWrapper({ user, isAuthChecking, isAdmin, adminData, archiveConfig, themeId, coverPhotos, liveEvents, liveEventsList, dynamicMembers, teamMembers, ccEvents, updateTheme, siteConfig, gallery, navigate, liveEventConfig, sendResendNotification, maintenanceConfig }) {
  if (!user) return <LoginModal onClose={() => navigate('/')} />;
  
  if (isAuthChecking) {
    return (
      <div className="lightbox open" style={{ color: '#fff', background: 'rgba(0,0,0,0.95)', zIndex: 3000 }}>
        <div className="lightbox-content" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Security Check</div>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Verifying <em>Authorization...</em></h2>
          <div style={{ marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem' }}>Checking email: {user.email}</div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) return <LoginModal user={user} onClose={() => navigate('/')} isUnauthorized={true} />;
  
  return (
    <AdminDashboard 
      user={user} 
      adminData={adminData} 
      archiveConfig={archiveConfig} 
      themeId={themeId}
      coverPhotos={coverPhotos}
      onClose={() => navigate('/')} 
      liveEvents={liveEvents} 
      liveEventsList={liveEventsList} 
      dynamicMembers={dynamicMembers} 
      teamMembers={teamMembers}
      ccEvents={ccEvents} 
      updateTheme={updateTheme}
      siteConfig={siteConfig}
      gallery={gallery}
      liveEventConfig={liveEventConfig}
      sendResendNotification={sendResendNotification}
      maintenanceConfig={maintenanceConfig}
    />
  );
}

// ✦✦✦ ADMIN COMPONENTS ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦—

function LoginModal({ onClose, user, isUnauthorized }) {
  const [error, setError] = useState("");

  const mailtoUrl = `mailto:contact@capturecrew.site?subject=${encodeURIComponent("Add email to website")}&body=${encodeURIComponent(
    `Hello Capture Crew Team,\n\nPlease add my email address to the authorized administrators database.\n\nMy Email: ${user?.email || ""}\n\nThanks!`
  )}`;

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("Failed to sign in with Google.");
    }
  };

  return (
    <div className="lightbox open" onClick={onClose} style={{ color: '#fff', background: 'rgba(0,0,0,0.95)', zIndex: 2000 }}>
      <div className="lightbox-content admin-modal" onClick={e => e.stopPropagation()} style={{ 
        background: '#111', 
        padding: '3rem', 
        borderRadius: '24px', 
        border: '1px solid var(--gold)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <button className="lightbox-close" onClick={onClose} style={{ color: '#fff' }}>✕</button>
        <div className="section-label" style={{ color: 'var(--gold)' }}>{isUnauthorized ? "Access Denied" : "Restricted Access"}</div>
        <h2 className="section-title" style={{ color: '#fff', fontSize: '2rem', margin: '1rem 0' }}>Team <em>{isUnauthorized ? "Unauthorized" : "Login"}</em></h2>
        
        {isUnauthorized ? (
          <div className="fade-in visible">
            <p style={{ color: '#ff4d4d', fontWeight: 'bold', marginBottom: '1rem' }}>
              Authentication Successful, but Authorization Failed.
            </p>
            <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              Your email <strong>{user?.email}</strong> is not listed in our authorized administrators database.
              <br /><br />
              If you are a Core Member, please contact a Lead or email us at <a href={mailtoUrl} style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 'bold' }}>contact@capturecrew.site</a> to have your email added to the system.
            </p>
            <button className="form-submit" onClick={() => signOut(auth)} style={{ width: '100%', background: '#ff4d4d' }}>Sign Out & Try Different Account</button>
          </div>
        ) : (
          <div>
            <p className="section-sub" style={{ fontSize: '0.9rem', margin: '1.5rem 0', opacity: 0.7 }}>
              Access is restricted to authorized Capture Crew Core Team members only.
            </p>
            <button className="form-submit" onClick={handleGoogleLogin} style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '1rem',
              background: 'var(--gold)',
              color: '#000',
              fontWeight: 'bold'
            }}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
              Continue with Google
            </button>
          </div>
        )}
        {error && <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
}

function AdminDashboard({ user, adminData, archiveConfig, themeId, coverPhotos, onClose, liveEvents, liveEventsList, dynamicMembers, teamMembers, ccEvents, updateTheme, siteConfig, gallery, liveEventConfig, sendResendNotification, maintenanceConfig }) {
  const triggerEventEmailIfNeeded = async (eventId, updatedPhotos) => {
    const eventObj = liveEventsList.find(e => e.id === eventId);
    if (!eventObj) return;

    if (eventObj.emailSent) {
      console.log(`Email already sent for event: ${eventId}`);
      return;
    }

    const rawPhotos = updatedPhotos || (liveEvents[eventId] && (Array.isArray(liveEvents[eventId]) ? liveEvents[eventId].length > 0 : true) ? liveEvents[eventId] : STATIC_EVENT_PHOTOS[eventId]) || [];
    const allPhotos = flattenPhotos(rawPhotos);

    const firstPhoto = allPhotos[0] || (eventObj.iconUrl && eventObj.iconUrl.trim()) || (STATIC_EVENT_ICONS[eventId] || null);

    if (!firstPhoto && allPhotos.length === 0 && !eventObj.iconUrl) {
      console.log(`No photos or icon found for event ${eventId}, skipping email.`);
      return;
    }

    await sendResendNotification({
      subject: `New Event Announcement: ${eventObj.name}`,
      title: `Campus Event: ${eventObj.name}`,
      description: `${eventObj.desc || 'Check out our new event on the website!'}\n\nSubtitle: ${eventObj.subtitle || ''}`,
      imageUrl: firstPhoto,
      images: allPhotos.slice(0, 4),
      link: `https://www.capturecrew.site/events/${eventObj.slug || generateSlug(eventObj.name || eventObj.id)}`
    });

    try {
      await updateDoc(doc(db, "events", eventId), {
        emailSent: true
      });
      console.log(`Marked event ${eventId} as emailSent.`);
    } catch (err) {
      console.error("Failed to mark event as emailSent:", err);
    }
  };

  const [tab, setTab] = useState(adminData?.role === 'core_member' ? 'profile' : 'week');
  const [notifySubscribers, setNotifySubscribers] = useState(true);
  const [liveForm, setLiveForm] = useState({
    active: false,
    eventName: "",
    subtitle: "",
    color: "#ffcc00",
    photosRaw: ""
  });
  const [isSavingLive, setIsSavingLive] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    if (adminData?.role === 'core_member') return;
    const q = query(collection(db, "applications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.seen === false) {
          count++;
        }
      });
      setUnseenCount(count);
    });
    return unsubscribe;
  }, [adminData]);

  useEffect(() => {
    if (liveEventConfig) {
      setLiveForm({
        active: !!liveEventConfig.active,
        eventName: liveEventConfig.eventName || "",
        subtitle: liveEventConfig.subtitle || "",
        color: liveEventConfig.color || "#ffcc00",
        photosRaw: (liveEventConfig.photos || []).join("\n")
      });
    }
  }, [liveEventConfig]);

  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    id: "", name: "", subtitle: "", date: "", color: "#C9A96E",
    desc: "", highlight: "", emoji: "📅", iconUrl: "", comingSoon: false, order: 99
  });
  const [profileForm, setProfileForm] = useState({ name: "", profilePic: "", insta: "", year: "1st Year" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (adminData) {
      setProfileForm({ 
        name: adminData.name || "", 
        profilePic: adminData.profilePic || "",
        insta: adminData.insta || "",
        year: adminData.year || "1st Year"
      });
    }
  }, [adminData]);
  const [newEventPhoto, setNewEventPhoto] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [localEventPhotos, setLocalEventPhotos] = useState([]);
  const [localCoverPhotos, setLocalCoverPhotos] = useState([]);
  const [certs, setCerts] = useState([]);
  const [newCert, setNewCert] = useState({ name: "", serialNo: "", date: "", event: "", link: "" });
  
  const [featuredData, setFeaturedData] = useState({ 
    url: "", title: "", photographer: "", captureDate: new Date().toISOString().split('T')[0], 
    dept: "Computer Science & Engineering", year: "1st Year" 
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [bulkCertInput, setBulkCertInput] = useState("");
  const [showBulkCert, setShowBulkCert] = useState(false);
  const [bulkCoverInput, setBulkCoverInput] = useState("");
  const [showBulkCover, setShowBulkCover] = useState(false);
  const [siteForm, setSiteForm] = useState(siteConfig);
  const [isSavingSite, setIsSavingSite] = useState(false);
  const [manageGalleryCategory, setManageGalleryCategory] = useState("All");


  useEffect(() => {
    if (tab === 'covers') {
      setLocalCoverPhotos(coverPhotos);
    }
  }, [tab, coverPhotos]);

  useEffect(() => {
    setSiteForm(siteConfig);
  }, [siteConfig]);

  useEffect(() => {
    if (editingEvent && editingEvent !== 'new') {
      const data = liveEvents[editingEvent];
      setLocalEventPhotos(flattenPhotos(data));
    } else {
      setLocalEventPhotos([]);
    }
  }, [editingEvent, liveEvents]);

  const handleGlobalCleanup = async () => {
    if (!window.confirm("This will deduplicate and format ALL members. Proceed?")) return;
    try {
      const collections = ["members", "team_members"];
      let totalCleaned = 0;
      
      for (const collName of collections) {
        const q = query(collection(db, collName));
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const namesSeen = new Set();
        const deptMap = {
          "CE": "Civil Engineering", "ME": "Mechanical Engineering", "EE": "Electrical Engineering",
          "ECE": "Electronics & Communication Engineering", "CSE": "Computer Science & Engineering"
        };
        for (const m of all) {
          const cleanName = m.name?.trim();
          if (namesSeen.has(cleanName) && collName === "members") {
            await deleteDoc(doc(db, collName, m.id));
            continue;
          }
          let fixedDept = m.dept || "";
          let fixedYear = m.year || "";
          if (!fixedYear && fixedDept.includes("Yr.")) {
            const parts = fixedDept.split("Yr.");
            fixedYear = parts[0].trim() + " Year";
            fixedDept = parts[1].trim().replace(".", "").replace(",", "");
          }
          const upperDept = fixedDept.toUpperCase();
          if (deptMap[upperDept]) fixedDept = deptMap[upperDept];
          else {
            if (upperDept.includes("CIVIL")) fixedDept = "Civil Engineering";
            if (upperDept.includes("MECHANICAL")) fixedDept = "Mechanical Engineering";
            if (upperDept.includes("ELECTRICAL")) fixedDept = "Electrical Engineering";
            if (upperDept.includes("ELECTRONICS")) fixedDept = "Electronics & Communication Engineering";
            if (upperDept.includes("COMPUTER")) fixedDept = "Computer Science & Engineering";
          }
          if (fixedYear.includes("1st")) fixedYear = "1st Year";
          if (fixedYear.includes("2nd")) fixedYear = "2nd Year";
          if (fixedYear.includes("3rd")) fixedYear = "3rd Year";
          if (fixedYear.includes("4th")) fixedYear = "4th Year";
          if (fixedDept !== m.dept || fixedYear !== m.year || cleanName !== m.name) {
            await updateDoc(doc(db, collName, m.id), { dept: fixedDept, year: fixedYear, name: cleanName });
            totalCleaned++;
          }
          namesSeen.add(cleanName);
        }
      }
      alert(`System Cleanup Complete! ${totalCleaned} records updated.`);
    } catch (err) { alert("Cleanup Failed: " + err.message); }
  };

  const DEPTS = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering"
  ];
  const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Passout"];

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex, list, setter) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const items = [...list];
    const draggedItem = items[draggedItemIndex];
    items.splice(draggedItemIndex, 1);
    items.splice(targetIndex, 0, draggedItem);
    
    setter(items);
    setDraggedItemIndex(null);
  };

  const updateRepublicDayPhotos = async () => {
    const setA = [
      "https://beeimg.com/images/c58546952951.jpg", "https://beeimg.com/images/h17773436031.jpg",
      "https://beeimg.com/images/h24306429703.jpg", "https://beeimg.com/images/h76457001124.jpg",
      "https://beeimg.com/images/h92001462694.jpg", "https://beeimg.com/images/i26770832012.jpg",
      "https://beeimg.com/images/i74985926181.jpg", "https://beeimg.com/images/l04924985234.jpg",
      "https://beeimg.com/images/l85960008731.jpg", "https://beeimg.com/images/m22098630431.jpg",
      "https://beeimg.com/images/o94080227041.jpg", "https://beeimg.com/images/p18742122001.jpg",
      "https://beeimg.com/images/s29365005831.jpg", "https://beeimg.com/images/t36116439454.jpg",
      "https://beeimg.com/images/u19710983213.jpg", "https://beeimg.com/images/v33738435441.jpg",
      "https://beeimg.com/images/y92907525492.jpg"
    ];
    const setB = [
      "https://beeimg.com/images/a67512667801.jpg", "https://beeimg.com/images/b34039500352.jpg",
      "https://beeimg.com/images/e53889717241.jpg", "https://beeimg.com/images/e63150308074.jpg",
      "https://beeimg.com/images/f87714856584.jpg", "https://beeimg.com/images/i77784487892.jpg",
      "https://beeimg.com/images/j01977566252.jpg", "https://beeimg.com/images/l98281316032.jpg",
      "https://beeimg.com/images/m42901990783.jpg", "https://beeimg.com/images/n54912540972.jpg",
      "https://beeimg.com/images/o56420603291.jpg", "https://beeimg.com/images/s13252935251.jpg",
      "https://beeimg.com/images/t36126096752.jpg", "https://beeimg.com/images/v97906815254.jpg",
      "https://beeimg.com/images/y44644881521.jpg", "https://beeimg.com/images/y52550178933.jpg"
    ];
    try {
      await setDoc(doc(db, "events", "republic"), { photos: [...setA, ...setB] }, { merge: true });
      alert("Republic Day gallery updated successfully!");
    } catch (err) { alert("Update failed: " + err.message); }
  };

  useEffect(() => {
    fetchCerts();
    fetchAdmins();
  }, []);

  const fetchCerts = async () => {
    try {
      const snap = await getDocs(collection(db, "certificates"));
      setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const fetchAdmins = async () => {
    try {
      const snap = await getDocs(collection(db, "admins"));
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    try {
      await setDoc(doc(db, "admins", newAdminEmail.trim().toLowerCase()), {
        addedBy: user.email,
        addedAt: new Date().toISOString(),
        role: "admin",
        canManageAdmins: false
      });
      setNewAdminEmail("");
      fetchAdmins();
      alert("Admin access granted!");
    } catch (err) {
      alert("Failed to add admin: " + err.message);
    }
  };
  
  const updateAdminPermissions = async (email, field, value) => {
    // Allow self-update of name, profilePic, insta, year, or lead-update of anything
    const allowedSelfFields = ['name', 'profilePic', 'insta', 'year'];
    const isSelfUpdate = email === user.email && allowedSelfFields.includes(field);
    const isAuthorized = adminData?.role === 'lead' || adminData?.role === 'incharge';
    if (!isAuthorized && !isSelfUpdate) return alert("Only Leads and In-charges can modify permissions.");
    try {
      const batch = writeBatch(db);
      
      // 1. Update Admins Collection
      batch.update(doc(db, "admins", email), { [field]: value });
      
      // 2. Sync with Team Members Collection if relevant fields change
      const syncFields = ['name', 'profilePic', 'insta', 'year'];
      if (syncFields.includes(field)) {
        const teamQ = query(collection(db, "team_members"), where("email", "==", email));
        const teamSnap = await getDocs(teamQ);
        if (!teamSnap.empty) {
          teamSnap.forEach(tDoc => {
            let teamField = field;
            if (field === 'profilePic') teamField = 'img';
            batch.update(doc(db, "team_members", tDoc.id), { [teamField]: value });
          });
        } else if (field === 'name' && value) {
          const nameQ = query(collection(db, "team_members"), where("name", "==", value));
          const nameSnap = await getDocs(nameQ);
          nameSnap.forEach(tDoc => {
            batch.update(doc(db, "team_members", tDoc.id), { email: email });
          });
        }
      }
      
      await batch.commit();
      fetchAdmins();
    } catch (err) { alert("Failed to update: " + err.message); }
  };

  const removeAdmin = async (email) => {
    if (email === user.email) return alert("You cannot remove your own admin access!");
    const isAuthorized = adminData?.role === 'lead' || adminData?.role === 'incharge';
    if (!isAuthorized) return alert("Only Leads and In-charges can revoke access.");
    if (window.confirm(`Revoke admin access for ${email}?`)) {
      try {
        await deleteDoc(doc(db, "admins", email));
        fetchAdmins();
        alert("Access revoked.");
      } catch (err) {
        alert("Failed to revoke: " + err.message);
      }
    }
  };


  const updateFeatured = async (type) => {
    setIsUpdating(true);
    try {
      const newPhoto = {
        ...featuredData,
        category: type === "week" ? "Weekly Captures" : type === "month" ? "Monthly Captures" : "The Extra Frame",
        createdAt: new Date().toISOString(),
        calendarYear: siteConfig.activeYear || "2026"
      };

      // 1. Add to the public Gallery
      await addDoc(collection(db, "gallery"), newPhoto);
      
      alert(`Saved to Gallery and Featured automatically!`);

      sendResendNotification({
        subject: `New Featured Capture: ${newPhoto.title}`,
        title: `Featured Capture of the ${type === 'week' ? 'Week' : type === 'month' ? 'Month' : 'Frame'}`,
        description: `A new photograph under the category "${newPhoto.category}" by ${newPhoto.photographer} (${newPhoto.dept} · ${newPhoto.year}) has been published to CGEC Capture Crew! Check it out in the gallery.`,
        imageUrl: newPhoto.url,
        link: `https://www.capturecrew.site/gallery/${generateSlug(newPhoto.category)}`,
        photographer: newPhoto.photographer
      });

      setFeaturedData({ url: "", title: "", photographer: "", captureDate: new Date().toISOString().split('T')[0], dept: DEPTS[0], year: YEARS[0] });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const addCert = async (e) => {
    e.preventDefault();
    try {
      const certData = { ...newCert };
      await addDoc(collection(db, "certificates"), certData);
      setNewCert({ name: "", serialNo: "", date: "", event: "", link: "" });
      fetchCerts();
      alert("Certificate Issued!");
    } catch (err) {
      alert("Failed to Issue: " + err.message);
    }
  };

  const deleteCert = async (id) => {
    if (window.confirm("Delete this certificate record?")) {
      try {
        await deleteDoc(doc(db, "certificates", id));
        fetchCerts();
        alert("Certificate record deleted.");
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  const issueBulkCerts = async () => {
    if (!bulkCertInput.trim()) return;
    const lines = bulkCertInput.split('\n').filter(l => l.trim());
    const batch = writeBatch(db);
    let count = 0;
    
    try {
      lines.forEach(line => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 4) {
          const [name, serialNo, date, event, link] = parts;
          const newDocRef = doc(collection(db, "certificates"));
          const certData = { 
            name, 
            serialNo, 
            date, 
            event, 
            createdAt: new Date().toISOString() 
          };
          if (link) {
            certData.link = link;
          }
          batch.set(newDocRef, certData);
          count++;
        }
      });
      
      if (count > 0) {
        await batch.commit();
        setBulkCertInput("");
        setShowBulkCert(false);
        fetchCerts();
        alert(`Successfully issued ${count} certificates!`);
      } else {
        alert("No valid certificate lines found. Format: Name, SerialNo, Date, Event");
      }
    } catch (err) {
      alert("Bulk Issue Error: " + err.message);
    }
  };

  const handleSaveLive = async () => {
    setIsSavingLive(true);
    try {
      const photosArray = liveForm.photosRaw
        .split(/[\s,;]+/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => {
          if (!p.startsWith("http://") && !p.startsWith("https://")) {
            if (p.includes(".") && !p.startsWith("/")) {
              return "https://" + p;
            }
          }
          return p;
        })
        .filter(p => p.startsWith("http://") || p.startsWith("https://"));
      
      const isActive = !!liveForm.active;
      await setDoc(doc(db, "config", "live_event"), {
        active: isActive,
        eventName: liveForm.eventName,
        subtitle: liveForm.subtitle,
        color: liveForm.color,
        photos: photosArray
      });
      alert("Live Showcase settings updated successfully!");
      
      if (isActive) {
        sendResendNotification({
          subject: `Live Fest Showcase: ${liveForm.eventName}`,
          title: `🔴 Live Showcase Active: ${liveForm.eventName}`,
          description: `We are running a live showcase for the fest "${liveForm.eventName}" (${liveForm.subtitle}). See real-time photography captures directly on our home page!`,
          imageUrl: photosArray.length > 0 ? photosArray[0] : null,
          link: 'https://www.capturecrew.site/#live-showcase'
        });
      }
    } catch (err) {
      console.error("Error updating live event config: ", err);
      alert("Failed to update settings: " + err.message);
    } finally {
      setIsSavingLive(false);
    }
  };

  const updateCovers = async (newUrls) => {
    try {
      await setDoc(doc(db, "config", "covers"), { urls: newUrls });
    } catch (err) { alert(err.message); }
  };

  const updateArchiveConfig = async (newOrder, newHidden) => {
    try {
      await setDoc(doc(db, "config", "archive"), { order: newOrder, hidden: newHidden });
    } catch (err) { alert(err.message); }
  };

  const reorderEvents = async (index, direction) => {
    const newList = [...liveEventsList];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];

    try {
      const batch = writeBatch(db);
      newList.forEach((ev, idx) => {
        batch.update(doc(db, "events", ev.id), { order: idx + 1 });
      });
      await batch.commit();
    } catch (err) { alert(err.message); }
  };

  if (!adminData) return <div className="lightbox open" style={{ color: 'var(--white)' }}><div className="lightbox-content">Loading Admin Data...</div></div>;

  return (
    <div className="event-page-overlay" style={{ color: 'var(--white)', zIndex: 1500, background: '#0A0A0B' }}>
      <div className="container" style={{ paddingBottom: '5rem' }}>
        <header className="event-page-header">
          <button className="back-btn" onClick={onClose}><ArrowLeft /> Close Dashboard</button>
          <div className="section-label">Admin Login</div>
          <h1 className="section-title">Team <em>Dashboard</em></h1>
          <p className="section-sub">Logged in as: {user.email}</p>
          <button className="event-dive-btn" style={{ position: 'absolute', top: '0', right: 0 }} onClick={() => signOut(auth)}>Sign Out</button>
        </header>

        <div className="gallery-filter">
          {/* TIER 2: Management & TIER 3: Admin (Everyone except core_member has access to these) */}
          {adminData?.role !== 'core_member' && (
            <>
              <button className={`filter-btn ${tab === 'week' ? 'active' : ''}`} onClick={() => setTab('week')}>Set Week</button>
              <button className={`filter-btn ${tab === 'month' ? 'active' : ''}`} onClick={() => setTab('month')}>Set Month</button>
              <button className={`filter-btn ${tab === 'extra' ? 'active' : ''}`} onClick={() => setTab('extra')}>Set Extra Frame</button>
              <button className={`filter-btn ${tab === 'gallery' ? 'active' : ''}`} onClick={() => setTab('gallery')}>Manage Gallery</button>
              <button className={`filter-btn ${tab === 'apps' ? 'active' : ''}`} onClick={() => setTab('apps')}>
                Applications
                {unseenCount > 0 && <span className="app-notification-badge">{unseenCount}</span>}
              </button>
              <button className={`filter-btn ${tab === 'certs' ? 'active' : ''}`} onClick={() => setTab('certs')}>Certificates</button>
              <button className={`filter-btn ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>Manage Members</button>
              <button className={`filter-btn ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>Manage Events</button>
              <button className={`filter-btn ${tab === 'archive' ? 'active' : ''}`} onClick={() => setTab('archive')}>Manage Archive</button>
              <button className={`filter-btn ${tab === 'covers' ? 'active' : ''}`} onClick={() => setTab('covers')}>Manage Covers</button>
              <button className={`filter-btn ${tab === 'cc_events' ? 'active' : ''}`} onClick={() => setTab('cc_events')}>CC Event Panel</button>
              <button className={`filter-btn ${tab === 'live_event' ? 'active' : ''}`} onClick={() => setTab('live_event')}>🔴 Live Showcase</button>
              <button className={`filter-btn ${tab === 'maintenance' ? 'active' : ''}`} onClick={() => setTab('maintenance')}>Maintenance Mode</button>
            </>
          )}

          {/* TIER 2.5: System Management (Lead, Incharge, Coordinator, Moderator) */}
          {(adminData?.role === 'lead' || adminData?.role === 'incharge' || adminData?.role === 'coordinator' || adminData?.role === 'moderator' || adminData?.canManageAdmins) && (
            <>
              <button className={`filter-btn ${tab === 'team_mgmt' ? 'active' : ''}`} onClick={() => setTab('team_mgmt')}>Manage Core Team</button>
              <button className={`filter-btn ${tab === 'theme' ? 'active' : ''}`} onClick={() => setTab('theme')}>Theme Settings</button>
              <button className={`filter-btn ${tab === 'site' ? 'active' : ''}`} onClick={() => setTab('site')}>Site Settings</button>
            </>
          )}

          {/* TIER 3: Lead/Incharge/Admin Management Only */}
          {(adminData?.role === 'lead' || adminData?.role === 'incharge' || adminData?.canManageAdmins) && (
            <>
              <button className={`filter-btn ${tab === 'admins' ? 'active' : ''}`} onClick={() => setTab('admins')}>Manage Admins</button>
            </>
          )}
          
          {/* TIER 1: Everyone has access to Profile */}
          <button className={`filter-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile Settings</button>
        </div>

        {adminData?.role !== 'core_member' && (tab === 'week' || tab === 'month' || tab === 'extra') && (
          <div className="visible">
            <h3 className="subcategory-title">Update {tab === 'week' ? 'Weekly' : tab === 'month' ? 'Monthly' : 'Extra Frame'} <em>Featured</em></h3>
            <div className="feedback-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginTop: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <SingleImageUploader 
                  label="Choose image from gallery"
                  currentUrl={featuredData.url}
                  onUploadComplete={(url) => setFeaturedData({...featuredData, url})}
                />
              </div>
              <input className="form-input" placeholder="Caption / Title" value={featuredData.title} onChange={e => setFeaturedData({...featuredData, title: e.target.value})} />
              <input className="form-input" placeholder="Photographer Name" value={featuredData.photographer} onChange={e => setFeaturedData({...featuredData, photographer: e.target.value})} />
              
              <select className="form-input" value={featuredData.dept} onChange={e => setFeaturedData({...featuredData, dept: e.target.value})}>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              
              <select className="form-input" value={featuredData.year} onChange={e => setFeaturedData({...featuredData, year: e.target.value})}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <input type="date" className="form-input" placeholder="Capture Date" value={featuredData.captureDate} onChange={e => setFeaturedData({...featuredData, captureDate: e.target.value})} />
              

              <button className="form-submit" style={{ gridColumn: '1 / -1' }} onClick={() => updateFeatured(tab)}>
                {isUpdating ? "Updating..." : `Update & Save to Gallery `}
              </button>
            </div>
          </div>
        )}


        {adminData?.role !== 'core_member' && tab === 'gallery' && (
          <div className="visible">
            <h3 className="subcategory-title">Gallery <em>Archive Management</em></h3>
            <p className="section-sub" style={{ marginBottom: '1.5rem' }}>
              Manage main featured captures (Weekly Captures, Monthly Captures, and The Extra Frame).
            </p>

            {/* Sub-category Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {["All", "Weekly Captures", "Monthly Captures", "The Extra Frame"].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-btn ${manageGalleryCategory === cat ? 'active' : ''}`}
                  onClick={() => setManageGalleryCategory(cat)}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
                >
                  {cat === "All" ? "All Main Captures" : cat}
                </button>
              ))}
            </div>

            {(() => {
              const mainCategories = ["Weekly Captures", "Monthly Captures", "The Extra Frame"];
              const mainPhotos = (gallery || []).filter(g => mainCategories.includes(g.category));
              const displayedPhotos = manageGalleryCategory === "All"
                ? mainPhotos
                : mainPhotos.filter(g => g.category === manageGalleryCategory);

              return (
                <div className="gallery-grid">
                  {displayedPhotos.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: '16px' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📸</div>
                      <p>No featured captures found in this category. Upload captures via "Set Week", "Set Month", or "Set Extra Frame".</p>
                    </div>
                  ) : (
                    displayedPhotos.map(g => (
                      <div key={g.id} className="gallery-item" style={{ border: '1px solid var(--border)', background: 'var(--card2)', display: 'flex', flexDirection: 'column' }}>
                        <img src={g.url} alt="" loading="lazy" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} referrerPolicy="no-referrer" />
                        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.2rem' }}>{g.title || "Untitled"}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '1rem' }}>{g.photographer || "Unknown"} · <span style={{ color: 'var(--gold)' }}>{g.category}</span></div>
                          <button onClick={async () => {
                            if (window.confirm(`Delete "${g.title || 'Photo'}" from Gallery?`)) {
                              try { await deleteDoc(doc(db, "gallery", g.id)); alert("Deleted!"); }
                              catch (err) { alert("Error: " + err.message); }
                            }
                          }} style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '6px', padding: '0.5rem', fontSize: '0.7rem', width: '100%', cursor: 'pointer', marginTop: 'auto' }}>Delete Photo 🗑️</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}
          </div>
        )}
        {adminData?.role !== 'core_member' && tab === 'apps' && (
          <div className="visible">
            <h3 className="subcategory-title">Recruitment <em>Applications</em></h3>
            <AdminApplications />
          </div>
        )}

        {adminData?.role !== 'core_member' && tab === 'certs' && (
          <div className="visible">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="subcategory-title">Issue <em>Certificates</em></h3>
              <button 
                onClick={() => setShowBulkCert(!showBulkCert)} 
                style={{ background: 'var(--gold)', color: 'var(--ink)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {showBulkCert ? "SWITCH TO SINGLE" : "🚀 SWITCH TO BULK ISSUE"}
              </button>
            </div>

            {showBulkCert ? (
              <div className="glass-form fade-in visible" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <h4 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Bulk Certificate Issuance</h4>
                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '1.5rem' }}>
                  Paste student details line by line from your Excel/Sheet. <br/>
                  <strong>Format:</strong> Student Name, Serial No, Date, Event, Certificate Link (Optional)
                </p>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '200px', fontSize: '0.8rem', fontFamily: 'monospace' }} 
                  placeholder="John Doe, CC-VAR-001, 15 Feb 2026, Varnakriti, https://res.cloudinary.com/...&#10;Jane Smith, CC-VAR-002, 15 Feb 2026, Varnakriti"
                  value={bulkCertInput}
                  onChange={e => setBulkCertInput(e.target.value)}
                />
                <button className="form-submit" style={{ marginTop: '1.5rem' }} onClick={issueBulkCerts}>
                  ISSUE ALL CERTIFICATES 
                </button>
              </div>
            ) : (
              <form className="feedback-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }} onSubmit={addCert}>
                <input className="form-input" placeholder="Student Name" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} required />
                <input className="form-input" placeholder="Serial No (CC-XXXX)" value={newCert.serialNo} onChange={e => setNewCert({...newCert, serialNo: e.target.value})} required />
                <input className="form-input" placeholder="Issue Date" value={newCert.date} onChange={e => setNewCert({...newCert, date: e.target.value})} required />
                <input className="form-input" placeholder="Event Name" value={newCert.event} onChange={e => setNewCert({...newCert, event: e.target.value})} required />
                <div style={{ gridColumn: '1 / -1' }}>
                  <SingleImageUploader 
                    label="Choose image from gallery"
                    currentUrl={newCert.link}
                    onUploadComplete={(url) => setNewCert({...newCert, link: url})}
                  />
                </div>
                <button className="form-submit" type="submit" style={{ gridColumn: '1 / -1' }}>Issue Certificate </button>
              </form>
            )}

            <h3 className="subcategory-title">Issued <em>Certificates</em></h3>
            <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Student Name</th>
                    <th style={{ padding: '1rem' }}>Serial No</th>
                    <th style={{ padding: '1rem' }}>Event</th>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Link</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{c.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--gold)' }}>{c.serialNo}</td>
                      <td style={{ padding: '1rem' }}>{c.event}</td>
                      <td style={{ padding: '1rem', opacity: 0.7 }}>{c.date}</td>
                      <td style={{ padding: '1rem' }}>
                        {(c.link || c.certUrl || c.url || c.certificateUrl || c.pdfUrl) ? (
                          <a href={c.link || c.certUrl || c.url || c.certificateUrl || c.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>View Link</a>
                        ) : (
                          <span style={{ opacity: 0.4 }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => deleteCert(c.id)} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {certs.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No certificates issued yet.</div>}
            </div>
          </div>
        )}

        {adminData?.role !== 'core_member' && tab === 'members' && (
          <div className="visible">
            <h3 className="subcategory-title">Add New <em>Member</em></h3>
            <MemberForm DEPTS={DEPTS} YEARS={YEARS} onAdded={() => {}} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4rem', marginBottom: '1.5rem' }}>
              <h3 className="subcategory-title" style={{ margin: 0 }}>Manage <em>Live Members</em></h3>
              <button onClick={handleGlobalCleanup} style={{ background: 'var(--gold)', color: 'var(--ink)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>🛠️ SYSTEM CLEANUP & DEDUPLICATE</button>
            </div>
            <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Member Name</th>
                    <th style={{ padding: '1rem' }}>Dept</th>
                    <th style={{ padding: '1rem' }}>Year</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicMembers.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{m.name}</td>
                      <td style={{ padding: '1rem' }}>{m.dept}</td>
                      <td style={{ padding: '1rem', color: 'var(--gold)' }}>{m.year}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'inline-block', width: '150px', verticalAlign: 'middle', marginRight: '0.5rem' }}>
                          <SingleImageUploader 
                            label="Choose image from gallery"
                            currentUrl={m.img}
                            onUploadComplete={async (url) => {
                              try {
                                await updateDoc(doc(db, "members", m.id), { img: url });
                              } catch (err) { alert("Failed: " + err.message); }
                            }}
                          />
                        </div>
                        <button onClick={async () => {
                          if (window.confirm("Remove this member?")) {
                            try {
                              await deleteDoc(doc(db, "members", m.id));
                              alert("Member removed.");
                            } catch (err) { alert("Failed: " + err.message); }
                          }
                        }} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dynamicMembers.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No live members added via Admin yet.</div>}
            </div>
          </div>
        )}

        {tab === 'team_mgmt' && (adminData?.role === 'lead' || adminData?.role === 'incharge' || adminData?.role === 'coordinator' || adminData?.role === 'moderator' || adminData?.canManageAdmins) && (
          <div className="fade-in visible">
            <h3 className="subcategory-title">Manage <em>Core Team & Incharges</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Add, remove, or promote members within the Core Team, Incharge, and Coordinator sections.</p>
            <AdminTeamMgmt teamMembers={teamMembers} DEPTS={DEPTS} YEARS={YEARS} />
          </div>
        )}

        {adminData?.role !== 'core_member' && tab === 'events' && (
          <div className="visible">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="subcategory-title" style={{ margin: 0 }}>Manage <em>Events</em></h3>
              <button onClick={() => {
                setEditingEvent("new");
                setEventFormData({ id: "", name: "", subtitle: "", date: "", color: "#C9A96E", desc: "", highlight: "", emoji: "📅", iconUrl: "", comingSoon: false, order: liveEventsList.length + 1, calendarYear: siteConfig.activeYear || "2026" });
              }} style={{ background: 'var(--gold)', color: 'var(--ink)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>➕ ADD NEW EVENT</button>
            </div>

            {editingEvent ? (
              <div className="glass-form fade-in visible" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <h4 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>{editingEvent === 'new' ? 'Add New' : 'Edit'} Event Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <input className="form-input" placeholder="Event Slug (e.g. freshers-2026)" value={eventFormData.id || ""} disabled={editingEvent !== 'new'} onChange={e => setEventFormData({...eventFormData, id: e.target.value.toLowerCase().replace(/ /g, '-')})} />
                  <input className="form-input" placeholder="Event Name" value={eventFormData.name || ""} onChange={e => setEventFormData({...eventFormData, name: e.target.value})} />
                  <input className="form-input" placeholder="Sub-heading" value={eventFormData.subtitle || ""} onChange={e => setEventFormData({...eventFormData, subtitle: e.target.value})} />
                  <input className="form-input" placeholder="Date/Season" value={eventFormData.date || ""} onChange={e => setEventFormData({...eventFormData, date: e.target.value})} />
                  <input className="form-input" placeholder="Highlight Text" value={eventFormData.highlight || ""} onChange={e => setEventFormData({...eventFormData, highlight: e.target.value})} />
                  <input className="form-input" placeholder="Emoji (Fallback)" value={eventFormData.emoji || ""} onChange={e => setEventFormData({...eventFormData, emoji: e.target.value})} />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Event Icon</label>
                    <SingleImageUploader 
                      label="Choose from gallery"
                      currentUrl={eventFormData.iconUrl}
                      onUploadComplete={(url) => setEventFormData({...eventFormData, iconUrl: url})}
                    />
                  </div>
                  <input className="form-input" type="color" value={eventFormData.color || "#C9A96E"} onChange={e => setEventFormData({...eventFormData, color: e.target.value})} title="Theme Color" />
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>CALENDAR YEAR</label>
                    <input className="form-input" placeholder="e.g. 2026" value={eventFormData.calendarYear || ""} onChange={e => setEventFormData({...eventFormData, calendarYear: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={!!eventFormData.comingSoon} onChange={e => setEventFormData({...eventFormData, comingSoon: e.target.checked})} />
                    <label style={{ fontSize: '0.8rem' }}>Coming Soon?</label>
                  </div>
                  <textarea className="form-input" style={{ gridColumn: '1 / -1', minHeight: '80px' }} placeholder="Description" value={eventFormData.desc || ""} onChange={e => setEventFormData({...eventFormData, desc: e.target.value})} />
                  
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                    <button className="form-submit" style={{ flex: 1 }} onClick={async () => {
                      if (!eventFormData.id || !eventFormData.name) return alert("Slug and Name are required.");
                      try {
                        const cleanedData = {
                          ...eventFormData,
                          calendarYear: eventFormData.calendarYear || siteConfig.activeYear || "2026",
                          iconUrl: eventFormData.iconUrl ? eventFormData.iconUrl.trim() : "",
                          slug: generateSlug(eventFormData.name)
                        };
                        const existingEvent = liveEventsList.find(e => e.id === eventFormData.id);
                        const photos = eventFormData.photos || (existingEvent && existingEvent.photos) || [];
                        const emailSent = eventFormData.emailSent || (existingEvent && existingEvent.emailSent);

                        if (photos.length > 0 && !emailSent) {
                          cleanedData.emailSent = true;
                          sendResendNotification({
                            subject: `New Event Announcement: ${cleanedData.name}`,
                            title: `Campus Event: ${cleanedData.name}`,
                            description: `${cleanedData.desc || 'Check out our new event on the website!'}\n\nSubtitle: ${cleanedData.subtitle || ''}`,
                            imageUrl: photos[0] || ((cleanedData.iconUrl && cleanedData.iconUrl.trim().startsWith('http')) ? cleanedData.iconUrl.trim() : null),
                            link: `https://www.capturecrew.site/events/${cleanedData.slug || generateSlug(cleanedData.name || cleanedData.id)}`
                          });
                        }

                        await setDoc(doc(db, "events", eventFormData.id), cleanedData, { merge: true });
                        setEditingEvent(null);
                        alert("Event Saved!");
                      } catch (err) { alert("Error: " + err.message); }
                    }}>SAVE EVENT </button>
                    <button className="form-submit" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setEditingEvent(null)}>CANCEL</button>
                  </div>
                </div>

                {editingEvent !== 'new' && (
                  <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>Manage Event Photos</h4>

                    <BulkImageUploader 
                      hideMetadata={true}
                      defaultCategory="Event Capture"
                      onUploadComplete={async (results) => {
                        try {
                          const current = liveEvents[editingEvent] || [];
                          const currentArr = flattenPhotos(current);
                          
                          // Convert currentArr back to mixed objects or strings if necessary, 
                          // but since current is an array, we just prepend results.
                          // However, `liveEvents[editingEvent]` could be an object if it has {general:[]}.
                          // Let's assume it's an array based on the context of this edit screen.
                          const updated = [...results, ...currentArr];

                          await updateDoc(doc(db, "events", editingEvent), {
                            photos: updated
                          });
                          
                          // Also save rich metadata to the global gallery collection
                          const batch = writeBatch(db);
                          results.forEach(res => {
                            const ref = doc(collection(db, "gallery"));
                            batch.set(ref, res);
                          });
                          await batch.commit();

                          setLocalEventPhotos(updated.map(p => typeof p === 'string' ? p : p.url));
                          alert(`${results.length} photos uploaded and optimized successfully to ${editingEvent}!`);
                          await triggerEventEmailIfNeeded(editingEvent, updated);
                        } catch (err) { alert("Upload Error: " + err.message); }
                      }}
                    />

                    <h4 style={{ color: 'var(--gold)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Gallery Preview 
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 'normal' }}>🖱️ Drag to reorder</span>
                        <button className="admin-nav-btn" style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '0.3rem 0.8rem' }} onClick={async () => {
                          try {
                            const updatedData = localEventPhotos;
                            await updateDoc(doc(db, "events", editingEvent), { photos: updatedData });
                            alert("Photo order saved!");
                            await triggerEventEmailIfNeeded(editingEvent, updatedData);
                          } catch (err) { alert(err.message); }
                        }}>SAVE PHOTO ORDER</button>
                      </div>
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                      {localEventPhotos.map((url, idx) => (
                        <div 
                          key={idx} 
                          style={{ position: 'relative', cursor: 'move', transition: 'transform 0.2s' }}
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, idx, localEventPhotos, setLocalEventPhotos)}
                        >
                          <img src={url} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: draggedItemIndex === idx ? '2px solid var(--gold)' : '1px solid var(--border)' }} referrerPolicy="no-referrer" />
                          <button onClick={() => {
                            if (window.confirm("Remove this photo?")) {
                              const updated = localEventPhotos.filter((_, i) => i !== idx);
                              setLocalEventPhotos(updated);
                              updateDoc(doc(db, "events", editingEvent), { photos: updated }).catch(err => alert("Error updating database: " + err.message));
                            }
                          }} style={{ position: 'absolute', top: 5, right: 5, background: '#ff4444', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>×</button>
                          <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px', fontSize: '8px', pointerEvents: 'none' }}>#{idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem' }}>Emoji</th>
                      <th style={{ padding: '1rem' }}>Event Name</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Sequence</th>
                      <th style={{ padding: '1rem' }}>Photos</th>
                      <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveEventsList.map((ev, idx) => (
                      <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', fontSize: '1.2rem' }}>
                          {ev.iconUrl && ev.iconUrl.trim().startsWith('http') ? (
                            <img src={ev.iconUrl.trim()} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold)', display: 'block' }} referrerPolicy="no-referrer" />
                          ) : (
                            ev.emoji
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '600' }}>{ev.name}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{ev.id}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', background: ev.comingSoon ? 'rgba(255,153,51,0.1)' : 'rgba(168,216,168,0.1)', color: ev.comingSoon ? '#ff9933' : '#a8d8a8' }}>
                            {ev.comingSoon ? 'Coming Soon' : 'Live'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              disabled={idx === 0}
                              onClick={() => reorderEvents(idx, -1)}
                              style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.6rem', opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                            <button 
                              disabled={idx === liveEventsList.length - 1}
                              onClick={() => reorderEvents(idx, 1)}
                              style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.6rem', opacity: idx === liveEventsList.length - 1 ? 0.3 : 1 }}>▼</button>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>{flattenPhotos(liveEvents[ev.id]).length} photos</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => {
                              setEditingEvent(ev.id);
                              setEventFormData(ev);
                            }} style={{ background: 'var(--gold)', border: 'none', color: 'var(--ink)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Edit</button>
                            <button onClick={async () => {
                              if (window.confirm("Delete this event and ALL its photos?")) {
                                try {
                                  await deleteDoc(doc(db, "events", ev.id));
                                  if (editingEvent === ev.id) setEditingEvent(null);
                                  alert("Event deleted.");
                                } catch (err) { alert(err.message); }
                              }
                            }} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
         {adminData?.role !== 'core_member' && tab === 'cc_events' && <AdminCCEvents ccEvents={ccEvents} siteConfig={siteConfig} sendResendNotification={sendResendNotification} />}
         {adminData?.role !== 'core_member' && tab === 'maintenance' && (
           <AdminMaintenance 
             config={maintenanceConfig} 
             siteConfig={siteConfig}
             user={user}
             onSave={async (newConfig) => {
               await setDoc(doc(db, "maintenanceSettings", "global"), newConfig, { merge: true });
             }}
           />
         )}
        {adminData?.role !== 'core_member' && tab === 'archive' && (
          <div className="visible">
            <h3 className="subcategory-title">Manage <em>Archive Timeline</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Reorder how events appear in the Universal Gallery. Use 'Hide' to remove them from the archive without deleting the event itself.</p>
            
            <div className="admin-table-wrap" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[...liveEventsList]
                  .filter(ev => !archiveConfig.hidden?.includes(ev.id))
                  .sort((a, b) => {
                    const idxA = archiveConfig.order?.indexOf(a.id);
                    const idxB = archiveConfig.order?.indexOf(b.id);
                    if (idxA === -1 && idxB === -1) return (a.order || 99) - (b.order || 99);
                    if (idxA === -1 || idxA === undefined) return 1;
                    if (idxB === -1 || idxB === undefined) return -1;
                    return idxA - idxB;
                  })
                  .map((ev, idx, arr) => (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{ev.name}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{ev.date}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          disabled={idx === 0}
                          onClick={() => {
                            const newOrder = arr.map(e => e.id);
                            [newOrder[idx], newOrder[idx-1]] = [newOrder[idx-1], newOrder[idx]];
                            updateArchiveConfig(newOrder, archiveConfig.hidden || []);
                          }}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--gold)', color: 'var(--gold)', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                        <button 
                          disabled={idx === arr.length - 1}
                          onClick={() => {
                            const newOrder = arr.map(e => e.id);
                            [newOrder[idx], newOrder[idx+1]] = [newOrder[idx+1], newOrder[idx]];
                            updateArchiveConfig(newOrder, archiveConfig.hidden || []);
                          }}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--gold)', color: 'var(--gold)', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', opacity: idx === arr.length - 1 ? 0.3 : 1 }}>▼</button>
                        <button 
                          onClick={() => {
                            const hidden = [...(archiveConfig.hidden || []), ev.id];
                            updateArchiveConfig(archiveConfig.order || arr.map(e => e.id), hidden);
                          }}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', background: '#ff4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.7rem' }}>Hide from Archive</button>
                      </div>
                    </div>
                  ))}
              </div>

              {archiveConfig.hidden?.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Hidden from Archive</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {archiveConfig.hidden.map(hid => (
                      <div key={hid} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>{hid}</span>
                        <button 
                          onClick={() => {
                            const hidden = archiveConfig.hidden.filter(h => h !== hid);
                            updateArchiveConfig(archiveConfig.order || [], hidden);
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: 'bold' }}>Restore</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {adminData?.role !== 'core_member' && tab === 'covers' && (
          <div className="visible">
            <h3 className="subcategory-title">Manage <em>Hero Covers</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Add or remove background images for the home page. Use direct image links.</p>
            
            <div className="glass-form" style={{ padding: '2rem' }}>
              <BulkImageUploader 
                hideMetadata={true}
                onUploadComplete={(results) => {
                  const urls = results.map(r => r.url);
                  setLocalCoverPhotos([...urls, ...localCoverPhotos]);
                  alert(`${urls.length} covers optimized and uploaded to pending list! Click 'SAVE COVER ORDER' to publish.`);
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Cover Gallery Preview 
                  <span style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 'normal' }}>🖱️ Drag to reorder</span>
                </h4>
                <button className="admin-nav-btn" style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '0.3rem 0.8rem' }} onClick={() => {
                  updateCovers(localCoverPhotos);
                  alert("Cover order saved!");
                }}>SAVE COVER ORDER</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {localCoverPhotos.map((url, idx) => (
                  <div 
                    key={idx} 
                    style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '150px', border: draggedItemIndex === idx ? '2px solid var(--gold)' : '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', cursor: 'move', transition: 'transform 0.2s' }}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx, localCoverPhotos, setLocalCoverPhotos)}
                  >
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => {
                        if (window.confirm("Remove this cover?")) {
                          const newCovers = localCoverPhotos.filter((_, i) => i !== idx);
                          setLocalCoverPhotos(newCovers);
                        }
                      }}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem', cursor: 'pointer', fontSize: '0.6rem', zIndex: 10 }}
                    >✕ DELETE</button>
                    <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px', fontSize: '8px', pointerEvents: 'none' }}>#{idx + 1}</div>
                  </div>
                ))}
                {localCoverPhotos.length === 0 && <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: '12px' }}>Using default covers. Add some to customize!</div>}
              </div>
            </div>
          </div>
        )}

        {tab === 'theme' && (adminData?.role === 'lead' || adminData?.role === 'incharge' || adminData?.role === 'coordinator' || adminData?.role === 'moderator' || adminData?.canManageAdmins) && (
          <div className="visible">
            <h3 className="subcategory-title">Webpage <em>Style Options</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Select a standardized visual style for this academic semester. This updates colors and headings across the entire platform.</p>
            
            <div className="theme-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {THEMES.map(t => (
                <div 
                  key={t.id} 
                  className={`theme-card ${themeId === t.id ? 'active' : ''}`}
                  onClick={() => updateTheme(t.id)}
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: themeId === t.id ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: t.primary }}></div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{t.name}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, height: '4px', background: t.primary, borderRadius: '2px' }}></div>
                    <div style={{ flex: 1, height: '4px', background: t.secondary, borderRadius: '2px' }}></div>
                    <div style={{ flex: 1, height: '4px', background: t.heading, borderRadius: '2px' }}></div>
                  </div>

                  <div style={{ fontSize: '0.7rem', opacity: 0.6, fontStyle: 'italic' }}>
                    Sample Heading: <span style={{ color: t.heading }}>{t.name}</span>
                  </div>

                  {themeId === t.id && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--gold)', color: 'var(--ink)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'site' && (adminData?.role === 'lead' || adminData?.role === 'incharge' || adminData?.role === 'coordinator' || adminData?.role === 'moderator' || adminData?.canManageAdmins) && (
          <div className="visible">
            <h3 className="subcategory-title">Site <em>Configuration</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Manage global brand identity, hero texts, social links, and academic session upgrades.</p>
            
            <AdminSessionUpgrade db={db} />

            <div className="glass-form" style={{ padding: '2rem' }}>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* IDENTITY */}
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Brand Identity</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Site Name</label>
                      <input className="form-input" value={siteForm.siteName} onChange={e => setSiteForm({...siteForm, siteName: e.target.value})} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Logo</label>
                      <SingleImageUploader 
                        label="Choose image from gallery"
                        currentUrl={siteForm.logoUrl}
                        onUploadComplete={(url) => setSiteForm({...siteForm, logoUrl: url})}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Favicon</label>
                      <SingleImageUploader 
                        label="Choose image from gallery"
                        currentUrl={siteForm.faviconUrl}
                        onUploadComplete={(url) => setSiteForm({...siteForm, faviconUrl: url})}
                      />
                    </div>
                  </div>
                </div>

                {/* HERO */}
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Hero Section</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Eyebrow Text</label>
                      <input className="form-input" value={siteForm.heroEyebrow} onChange={e => setSiteForm({...siteForm, heroEyebrow: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Title (Use \n for new line)</label>
                      <textarea className="form-input" style={{ minHeight: '60px' }} value={siteForm.heroTitle} onChange={e => setSiteForm({...siteForm, heroTitle: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Tagline</label>
                      <input className="form-input" value={siteForm.heroTagline} onChange={e => setSiteForm({...siteForm, heroTagline: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* SOCIALS */}
                <div style={{ paddingBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Social Links</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Instagram Link</label>
                      <input className="form-input" value={siteForm.instaLink} onChange={e => setSiteForm({...siteForm, instaLink: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>LinkedIn Link</label>
                      <input className="form-input" value={siteForm.linkedinLink ?? "https://www.linkedin.com/company/cgec-capture-crew/"} onChange={e => setSiteForm({...siteForm, linkedinLink: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Facebook Link</label>
                      <input className="form-input" value={siteForm.fbLink} onChange={e => setSiteForm({...siteForm, fbLink: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* EMAIL SETTINGS */}
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Email Delivery Settings</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Sender Name</label>
                      <input className="form-input" value={siteForm.emailSenderName || ""} placeholder="e.g. Capture Crew Team" onChange={e => setSiteForm({...siteForm, emailSenderName: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Sender Email Address</label>
                      <input className="form-input" value={siteForm.emailSenderAddress || ""} placeholder="e.g. team@capturecrew.site" onChange={e => setSiteForm({...siteForm, emailSenderAddress: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Reply-To Email Address</label>
                      <input className="form-input" value={siteForm.emailReplyTo || ""} placeholder="e.g. team@capturecrew.site" onChange={e => setSiteForm({...siteForm, emailReplyTo: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* YEAR & ARCHIVES */}
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem', gridColumn: '1 / -1' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Year & Archive Settings</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', opacity: 0.6 }}>Active Website Year</label>
                      <input 
                        className="form-input" 
                        placeholder="e.g. 2026" 
                        value={siteForm.activeYear || "2026"} 
                        onChange={e => setSiteForm({...siteForm, activeYear: e.target.value})} 
                      />
                      <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.5rem', lineHeight: '1.4' }}>
                        Changing this will immediately configure the year for new uploads. The primary year visitors see by default is controlled here.
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '0.5rem' }}>Add Available Year to Switcher</label>
                      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
                        <input 
                          id="new-available-year"
                          type="text" 
                          className="form-input" 
                          style={{ width: '120px' }} 
                          placeholder="e.g. 2027" 
                        />
                        <button 
                          type="button"
                          className="admin-nav-btn" 
                          style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '0.5rem 1rem', fontSize: '0.7rem' }}
                          onClick={() => {
                            const yearInput = document.getElementById('new-available-year');
                            const yearVal = yearInput.value.trim();
                            if (!yearVal) return alert("Please specify a Year.");
                            
                            const currentYears = siteForm.availableYears || ["2026"];
                            if (currentYears.includes(yearVal)) return alert("This year is already in the list.");
                            
                            const updatedYears = [...currentYears, yearVal].sort((a,b) => b.localeCompare(a));
                            setSiteForm({ ...siteForm, availableYears: updatedYears });
                            yearInput.value = "";
                          }}
                        >Add Year</button>
                      </div>

                      <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '0.5rem' }}>Selectable Years List</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(siteForm.availableYears || ["2026"]).map(yr => (
                          <div key={yr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{yr} Edition {siteForm.activeYear === yr ? "(Active)" : ""}</span>
                            {siteForm.activeYear !== yr && (
                              <button 
                                type="button"
                                style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' }}
                                onClick={() => {
                                  if (window.confirm(`Remove ${yr} from the selectable years switcher?`)) {
                                    const updatedYears = (siteForm.availableYears || ["2026"]).filter(y => y !== yr);
                                    setSiteForm({ ...siteForm, availableYears: updatedYears });
                                  }
                                }}
                              >🗑️</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(201,169,110,0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--gold)' }}>
                <h5 style={{ color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>💡 How to update Logo & Favicon?</h5>
                <p style={{ fontSize: '0.7rem', opacity: 0.8, lineHeight: '1.5' }}>
                  1. You cannot upload ZIP files directly. Extract your images first.<br/>
                  2. Upload your preferred logo (square) or favicon to a service like <a href="https://cloudinary.com" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>Cloudinary</a> or <a href="https://postimages.org" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>PostImage</a>.<br/>
                  3. Copy the <strong>Direct Link</strong> (ending in .jpg, .png, or .ico) and paste it into the fields above.
                </p>
              </div>

              <button 
                className="form-submit" 
                style={{ marginTop: '2rem', width: '100%' }}
                disabled={isSavingSite}
                onClick={async () => {
                  setIsSavingSite(true);
                  try {
                    await setDoc(doc(db, "config", "site"), siteForm);
                    alert("Site configuration saved successfully!");
                  } catch (err) { alert(err.message); }
                  setIsSavingSite(false);
                }}
              >
                {isSavingSite ? "Saving..." : "UPDATE GLOBAL SITE SETTINGS "}
              </button>
            </div>
          </div>
        )}
        {tab === 'live_event' && adminData?.role !== 'core_member' && (
          <div className="visible">
            <h3 className="subcategory-title">🔴 Live Showcase <em>Settings</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Configure the fullscreen live showcase overlay for campus fests on the home page.</p>
            
            <div className="glass-form" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* STATUS & IDENT */}
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Status & Identity</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }} 
                      onClick={() => setLiveForm({...liveForm, active: !liveForm.active})}
                    >
                      <input 
                        type="checkbox" 
                        id="liveShowcaseActive"
                        checked={liveForm.active}
                        onChange={() => {}} // handled by parent div click
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      />
                      <label htmlFor="liveShowcaseActive" style={{ fontSize: '0.9rem', cursor: 'pointer', color: liveForm.active ? 'var(--gold)' : 'inherit', fontWeight: 'bold' }}>
                        {liveForm.active ? "🔴 SHOWCASE IS ACTIVE" : "Showcase is Offline"}
                      </label>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Event Name / Heading (animated)</label>
                      <input 
                        className="form-input" 
                        placeholder="e.g. ESPARENZA"
                        value={liveForm.eventName} 
                        onChange={e => setLiveForm({...liveForm, eventName: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Subheading / Day Text (e.g. Day 1, Final Day)</label>
                      <input 
                        className="form-input" 
                        placeholder="e.g. Day 1 or Final Day"
                        value={liveForm.subtitle} 
                        onChange={e => setLiveForm({...liveForm, subtitle: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Theme Color</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="color" 
                          style={{ border: 'none', background: 'none', width: '30px', height: '35px', cursor: 'pointer' }}
                          value={liveForm.color}
                          onChange={e => setLiveForm({...liveForm, color: e.target.value})}
                        />
                        <input 
                          className="form-input" 
                          value={liveForm.color} 
                          onChange={e => setLiveForm({...liveForm, color: e.target.value})} 
                          style={{ fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* PHOTOS LIST */}
                <div style={{ paddingBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Cloudinary Image URLs</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Photo Links (URLs separated by space, comma, semicolon or newline)</label>
                      <BulkImageUploader 
                        hideMetadata={true}
                        onUploadComplete={(results) => {
                          const newUrls = results.map(r => r.url).join('\n');
                          const current = liveForm.photosRaw ? liveForm.photosRaw + '\n' : '';
                          setLiveForm({...liveForm, photosRaw: current + newUrls});
                        }}
                      />
                      <textarea 
                        className="form-input" 
                        style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: '1.4', marginTop: '1rem' }}
                        placeholder="https://res.cloudinary.com/... https://res.cloudinary.com/...&#10;or comma/semicolon separated..."
                        value={liveForm.photosRaw}
                        onChange={e => setLiveForm({...liveForm, photosRaw: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(201,169,110,0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--gold)' }}>
                <h5 style={{ color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>ℹ️ Live Event Showcase Guide</h5>
                <p style={{ fontSize: '0.7rem', opacity: 0.8, lineHeight: '1.5' }}>
                  • Enabling this checkbox overrides the normal Home page (Hero, Week Capture, Month Capture, Extra Frame).<br/>
                  • The circular 3D interactive wheel gallery will display on the home screen.<br/>
                  • Make sure to enter valid image URLs (Cloudinary, etc.) to showcase photos dynamically.
                </p>
              </div>

              <button 
                className="form-submit" 
                style={{ marginTop: '2rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                disabled={isSavingLive}
                onClick={handleSaveLive}
              >
                {isSavingLive ? "Saving..." : "SAVE SHOWCASE CONFIGURATION"}
              </button>
            </div>
          </div>
        )}
        {tab === "admins" && (adminData?.role === "lead" || adminData?.canManageAdmins) && (
          <div className="visible">
            <h3 className="subcategory-title">Manage <em>Admin Access</em></h3>
            <p className="section-sub" style={{ marginBottom: "2rem" }}>Only authorized emails can access this console. <strong>In-charges</strong> can manage permissions for others.</p>
            
            <form className="feedback-form" style={{ display: "flex", gap: "1rem", marginBottom: "3rem", padding: "2.5rem", alignItems: "stretch" }} onSubmit={addAdmin}>
              <input 
                className="form-input" 
                style={{ flex: 1, margin: 0 }} 
                placeholder="New Admin Email (e.g. name@gmail.com)" 
                value={newAdminEmail} 
                onChange={e => setNewAdminEmail(e.target.value)} 
                required 
              />
              <button className="form-submit" type="submit" style={{ width: "auto", padding: "0 2.5rem", margin: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>Authorize Access <ArrowRight /></button>
            </form>
            <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Admin Email</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Management</th>
                    <th style={{ padding: '1rem' }}>Added At</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(adm => (
                    <tr key={adm.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <img src={adm.profilePic || "https://ui-avatars.com/api/?name=" + (adm.name || adm.id) + "&background=C9A96E&color=111"} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                          <span style={{ fontWeight: '600' }}>{adm.name || 'No Name'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', opacity: 0.7 }}>{adm.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          className="form-input" 
                          style={{ padding: '0.2rem', fontSize: '0.7rem', width: 'auto', height: 'auto', background: 'transparent' }}
                          value={adm.role || 'core_member'}
                          onChange={(e) => updateAdminPermissions(adm.id, 'role', e.target.value)}
                          disabled={adminData?.role !== 'lead' || adm.id === user.email}
                        >
                          <option value="core_member" style={{ color: '#000' }}>Core Member</option>
                          <option value="coordinator" style={{ color: '#000' }}>Coordinator</option>
                          <option value="moderator" style={{ color: '#000' }}>Moderator</option>
                          <option value="incharge" style={{ color: '#000' }}>In-charge</option>
                          <option value="pr_manager" style={{ color: '#000' }}>PR Manager</option>
                          <option value="lead" style={{ color: '#000' }}>Lead (Developer)</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="checkbox" 
                            checked={adm.role === 'lead' || adm.canManageAdmins} 
                            disabled={(adminData?.role !== 'lead' && adminData?.role !== 'incharge') || adm.role === 'lead' || adm.id === user.email}
                            onChange={(e) => updateAdminPermissions(adm.id, 'canManageAdmins', e.target.checked)}
                          />
                          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Can Manage Admins</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', opacity: 0.5 }}>{adm.addedAt ? new Date(adm.addedAt).toLocaleDateString() : 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          onClick={() => removeAdmin(adm.id)} 
                          style={{ background: adm.id === user.email ? 'rgba(255,255,255,0.1)' : '#ff4444', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: adm.id === user.email ? 'default' : 'pointer', fontSize: '0.7rem' }}
                          disabled={adm.id === user.email || (adm.role === 'lead' && adminData?.role !== 'lead')}
                        >
                          {adm.id === user.email ? 'You (Current)' : 'Revoke Access'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === 'profile' && (
          <div className="visible">
            <h3 className="subcategory-title">Profile <em>Settings</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Update your administrative profile details. These are visible to other leads and managers.</p>
            
            <div className="glass-form" style={{ padding: '2.5rem', maxWidth: '600px' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--gold)', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img src={adminData?.profilePic || "https://ui-avatars.com/api/?name=" + (adminData?.name || user.email) + "&background=C9A96E&color=111"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 'bold' }}>{adminData?.role?.replace('_', ' ') || 'Admin'}</span>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }}>Display Name</label>
                    <input className="form-input" placeholder="Your Name" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }}>Profile Picture</label>
                    <SingleImageUploader 
                      label="Choose image from gallery"
                      currentUrl={profileForm.profilePic}
                      onUploadComplete={(url) => setProfileForm({...profileForm, profilePic: url})}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }}>Instagram URL</label>
                    <input className="form-input" placeholder="https://instagram.com/your-username" value={profileForm.insta} onChange={e => setProfileForm({...profileForm, insta: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }}>Academic Year</label>
                    <select className="form-input" value={profileForm.year} onChange={e => setProfileForm({...profileForm, year: e.target.value})} style={{ appearance: 'none', background: 'rgba(255,255,255,0.02)' }}>
                      <option value="1st Year" style={{ color: '#000' }}>1st Year</option>
                      <option value="2nd Year" style={{ color: '#000' }}>2nd Year</option>
                      <option value="3rd Year" style={{ color: '#000' }}>3rd Year</option>
                      <option value="4th Year" style={{ color: '#000' }}>4th Year</option>
                      <option value="Passout" style={{ color: '#000' }}>Passout</option>
                      <option value="Alumni" style={{ color: '#000' }}>Alumni</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }}>Email Address (Read-only)</label>
                    <input className="form-input" value={user.email} disabled style={{ opacity: 0.5 }} />
                  </div>
                  <button 
                    className="form-submit" 
                    disabled={isSavingProfile}
                    onClick={async () => {
                      setIsSavingProfile(true);
                      const fields = Object.keys(profileForm);
                      for (const f of fields) {
                        await updateAdminPermissions(user.email, f, profileForm[f]);
                      }
                      setIsSavingProfile(false);
                      alert("Profile updated successfully!");
                    }}
                  >
                    {isSavingProfile ? "Saving..." : "SAVE PROFILE SETTINGS "}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCCEvents({ ccEvents, siteConfig, sendResendNotification }) {
  const [editing, setEditing] = useState(null);
  const [notify, setNotify] = useState(true);
  const [formData, setFormData] = useState({
    title: "", subtitle: "", order: 1,
    upcoming: false, date: "", desc: "", bannerUrl: "",
    winners: {
      "1st": { name: "", dept: "", year: "1st Year", url: "" },
      "2nd": { name: "", dept: "", year: "1st Year", url: "" },
      "3rd": { name: "", dept: "", year: "1st Year", url: "" }
    }
  });

  const save = async () => {
    if (!formData.title) return alert("Title required");
    try {
      const id = editing === 'new' ? formData.title.toLowerCase().replace(/ /g, '-') : editing;
      const existing = ccEvents.find(e => e.id === id);
      const emailSent = formData.emailSent || (existing && existing.emailSent);

      const dataToSave = {
        ...formData,
        calendarYear: formData.calendarYear || siteConfig?.activeYear || "2026"
      };

      if (!emailSent) {
        dataToSave.emailSent = true;
        sendResendNotification({
          subject: `New Competition Announcement: ${dataToSave.title}`,
          title: `Capture Crew Challenge: ${dataToSave.title}`,
          description: `${dataToSave.desc || 'Check out our new internal photography challenge!'}\n\nSubtitle: ${dataToSave.subtitle || ''}`,
          imageUrl: dataToSave.bannerUrl || null,
          link: `https://www.capturecrew.site/events/cc-events#${encodeURIComponent(id)}`
        });
      }

      await setDoc(doc(db, "cc_events", id), dataToSave, { merge: true });
      setEditing(null);
      alert("CC Event Saved!");
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="fade-in visible">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 className="subcategory-title" style={{ margin: 0 }}>CC Event <em>Winners & Panel</em></h3>
        <button className="admin-nav-btn" style={{ background: 'var(--gold)', color: 'var(--ink)' }} onClick={() => {
          setEditing('new');
          setFormData({ 
            title: "", subtitle: "", order: ccEvents.length + 1, 
            upcoming: false, date: "", desc: "", bannerUrl: "", 
            calendarYear: siteConfig?.activeYear || "2026",
            winners: { 
              "1st": { name: "", dept: "", year: "1st Year", url: "" }, 
              "2nd": { name: "", dept: "", year: "1st Year", url: "" }, 
              "3rd": { name: "", dept: "", year: "1st Year", url: "" } 
            } 
          });
        }}>➕ ADD CC EVENT</button>
      </div>

      {editing ? (
        <div className="glass-form fade-in visible" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>EVENT TITLE</label>
              <input className="form-input" placeholder="e.g. Varnakriti 2026" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>SUBTITLE</label>
              <input className="form-input" placeholder="e.g. Annual photo competition" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>DATE / TIMING</label>
              <input className="form-input" placeholder="e.g. June 2026" value={formData.date || ""} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>EVENT STATUS</label>
              <select className="form-input" value={formData.upcoming ? "upcoming" : "past"} onChange={e => setFormData({...formData, upcoming: e.target.value === "upcoming"})}>
                <option value="past">Past Event (Show Winners)</option>
                <option value="upcoming">Upcoming Event (No Winners Yet)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>DISPLAY ORDER</label>
              <input className="form-input" type="number" placeholder="Order" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 1})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>CALENDAR YEAR</label>
              <input className="form-input" placeholder="e.g. 2026" value={formData.calendarYear || ""} onChange={e => setFormData({...formData, calendarYear: e.target.value})} />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>DESCRIPTION / RULES</label>
            <textarea className="form-input" style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Rules, guidelines, or details about the theme..." value={formData.desc || ""} onChange={e => setFormData({...formData, desc: e.target.value})} />
          </div>

          {formData.upcoming ? (
            <div className="glass-form" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '12px', marginBottom: '2rem' }}>
              <h4 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Upcoming Event Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)' }}>BANNER IMAGE</label>
                <SingleImageUploader 
                  label="Choose image from gallery"
                  currentUrl={formData.bannerUrl}
                  onUploadComplete={(url) => setFormData({...formData, bannerUrl: url})}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              {["1st", "2nd", "3rd"].map(rank => (
                <div key={rank} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: rank === '1st' ? 'var(--gold)' : '#fff', marginBottom: '1rem' }}>{rank} Place Winner</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <input className="form-input" placeholder="Student Name" value={formData.winners?.[rank]?.name || ""} onChange={e => {
                      const w = {...formData.winners}; if(!w[rank]) w[rank] = {}; w[rank].name = e.target.value; setFormData({...formData, winners: w});
                    }} />
                    <select className="form-input" value={formData.winners?.[rank]?.dept || ""} onChange={e => {
                      const w = {...formData.winners}; if(!w[rank]) w[rank] = {}; w[rank].dept = e.target.value; setFormData({...formData, winners: w});
                    }}>
                      <option value="">Select Dept</option>
                      {["Computer Science & Engineering", "Electronics & Communication Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select className="form-input" value={formData.winners?.[rank]?.year || ""} onChange={e => {
                      const w = {...formData.winners}; if(!w[rank]) w[rank] = {}; w[rank].year = e.target.value; setFormData({...formData, winners: w});
                    }}>
                      <option value="">Select Year</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year", "Passout"].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <div style={{ marginTop: '0.5rem' }}>
                      <SingleImageUploader 
                        label="Choose image from gallery"
                        currentUrl={formData.winners?.[rank]?.url}
                        onUploadComplete={(url) => {
                          const w = {...formData.winners}; if(!w[rank]) w[rank] = {}; w[rank].url = url; setFormData({...formData, winners: w});
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="form-submit" style={{ flex: 1 }} onClick={save}>SAVE EVENT</button>
            <button className="form-submit" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setEditing(null)}>CANCEL</button>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Event Title</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Winner / Banner Details</th>
                <th style={{ padding: '1rem' }}>Order</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ccEvents.map(ev => (
                <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{ev.title}</td>
                  <td style={{ padding: '1rem' }}>
                    {ev.upcoming ? (
                      <span style={{ color: '#ff9900', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>✦ Upcoming</span>
                    ) : (
                      <span style={{ color: 'var(--gold)' }}>🏆 Past Event</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--muted)' }}>{ev.date || "N/A"}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    {ev.upcoming ? (
                      ev.bannerUrl ? <a href={ev.bannerUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'lightblue', textDecoration: 'underline' }}>View Banner</a> : "No Banner"
                    ) : (
                      `1st: ${ev.winners?.["1st"]?.name || "N/A"}`
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>{ev.order}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-nav-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => { 
                        setEditing(ev.id); 
                        setFormData({
                          upcoming: false, date: "", desc: "", bannerUrl: "",
                          winners: {
                            "1st": { name: "", dept: "", year: "1st Year", url: "" },
                            "2nd": { name: "", dept: "", year: "1st Year", url: "" },
                            "3rd": { name: "", dept: "", year: "1st Year", url: "" }
                          },
                          ...ev 
                        }); 
                      }}>Edit</button>
                      <button className="admin-nav-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', background: '#ff4444' }} onClick={async () => {
                        if (window.confirm("Delete this event?")) await deleteDoc(doc(db, "cc_events", ev.id));
                      }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function AdminTeamMgmt({ teamMembers, DEPTS, YEARS }) {
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "", role: "", email: "", category: "core", dept: DEPTS[0], year: YEARS[0], img: "", insta: "", order: 99
  });

  const save = async () => {
    if (!formData.name || !formData.img) return alert("Name and Image URL are required");
    try {
      const id = editing === 'new' ? formData.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now() : editing;
      // If new, set order to end of category
      const currentList = teamMembers[formData.category] || [];
      const newOrder = editing === 'new' ? currentList.length : formData.order;
      
      await setDoc(doc(db, "team_members", id), { ...formData, order: newOrder }, { merge: true });
      setEditing(null);
      alert("Member Saved!");
    } catch (err) { alert(err.message); }
  };

  const reorder = async (category, index, direction) => {
    const list = teamMembers[category] || [];
    if (direction === 'up' && index > 0) {
      const itemA = list[index];
      const itemB = list[index - 1];
      
      const batch = writeBatch(db);
      // Ensure we swap actual values, fallback to index if missing
      const posA = itemA.order ?? index;
      const posB = itemB.order ?? (index - 1);
      
      // If positions are same, force posA to be posB + 1
      const finalPosA = posA === posB ? posB + 1 : posB;
      const finalPosB = posA === posB ? posB : posA;

      batch.update(doc(db, "team_members", itemA.id), { order: finalPosB });
      batch.update(doc(db, "team_members", itemB.id), { order: finalPosA });
      await batch.commit();
    } else if (direction === 'down' && index < list.length - 1) {
      const itemA = list[index];
      const itemB = list[index + 1];
      
      const batch = writeBatch(db);
      const posA = itemA.order ?? index;
      const posB = itemB.order ?? (index + 1);
      
      const finalPosA = posA === posB ? posB - 1 : posB;
      const finalPosB = posA === posB ? posB : posA;

      batch.update(doc(db, "team_members", itemA.id), { order: finalPosA });
      batch.update(doc(db, "team_members", itemB.id), { order: finalPosB });
      await batch.commit();
    }
  };

  const deleteMember = async (id) => {
    if (window.confirm("Remove this member from the team?")) {
      try {
        await deleteDoc(doc(db, "team_members", id));
        alert("Member removed.");
      } catch (err) { alert(err.message); }
    }
  };

  const categories = [
    { id: 'founders', label: 'Founders' },
    { id: 'incharge', label: 'Incharges' },
    { id: 'ex_incharge', label: 'Club Advisors' },
    { id: 'coordinators', label: 'Coordinators' },
    { id: 'core', label: 'Core Team' }
  ];

  return (
    <div className="admin-team-mgmt">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className="admin-nav-btn" style={{ background: 'var(--gold)', color: 'var(--ink)' }} onClick={() => {
          setEditing('new');
          setFormData({ name: "", role: "", email: "", category: "core", dept: DEPTS[0], year: YEARS[0], img: "", insta: "", order: 99 });
        }}>➕ ADD TEAM MEMBER</button>
      </div>

      {editing ? (
        <div className="glass-form fade-in visible" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <h4 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>{editing === 'new' ? 'Add' : 'Edit'} Team Member</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
            <input className="form-input" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input className="form-input" placeholder="Role (e.g. Photographer)" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
            <input className="form-input" placeholder="Email Address (To Link Profile)" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase().trim()})} />
            
            <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>

            <select className="form-input" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})}>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              <option value="Passout">Passout</option>
            </select>

            <select className="form-input" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              <option value="Alumni">Alumni</option>
            </select>

            <div style={{ gridColumn: '1 / -1' }}>
              <SingleImageUploader 
                label="Choose image from gallery"
                currentUrl={formData.img}
                onUploadComplete={(url) => setFormData({...formData, img: url})}
              />
            </div>
            <input className="form-input" placeholder="Instagram URL (Optional)" value={formData.insta} onChange={e => setFormData({...formData, insta: e.target.value})} />

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="form-submit" style={{ flex: 1 }} onClick={save}>SAVE MEMBER </button>
              <button className="form-submit" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setEditing(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          {categories.map(cat => (
            <div key={cat.id} style={{ marginBottom: '3rem' }}>
              <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>{cat.label}</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', opacity: 0.6 }}>
                    <th style={{ padding: '0.8rem' }}>Reorder</th>
                    <th style={{ padding: '0.8rem' }}>Name</th>
                    <th style={{ padding: '0.8rem' }}>Role</th>
                    <th style={{ padding: '0.8rem' }}>Dept/Year</th>
                    <th style={{ padding: '0.8rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(teamMembers[cat.id] || []).map((m, idx) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.8rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button 
                            className="admin-nav-btn" 
                            style={{ padding: '0 4px', fontSize: '10px', opacity: idx === 0 ? 0.2 : 1 }} 
                            onClick={() => reorder(cat.id, idx, 'up')}
                            disabled={idx === 0}
                          >▲</button>
                          <button 
                            className="admin-nav-btn" 
                            style={{ padding: '0 4px', fontSize: '10px', opacity: idx === (teamMembers[cat.id].length - 1) ? 0.2 : 1 }} 
                            onClick={() => reorder(cat.id, idx, 'down')}
                            disabled={idx === (teamMembers[cat.id].length - 1)}
                          >▼</button>
                        </div>
                      </td>
                      <td style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <img src={m.img} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                        <span style={{ fontWeight: '600' }}>{m.name}</span>
                      </td>
                      <td style={{ padding: '0.8rem' }}>{m.role}</td>
                      <td style={{ padding: '0.8rem', opacity: 0.7 }}>{m.dept} <br/> {m.year}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="admin-nav-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem' }} onClick={() => { setEditing(m.id); setFormData({ ...m, email: m.email || "" }); }}>Edit</button>
                          <button className="admin-nav-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem', background: '#ff4444' }} onClick={() => deleteMember(m.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!teamMembers[cat.id] || teamMembers[cat.id].length === 0) && (
                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>No members in this category.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ✦✦✦ LIVE EVENT SHOWCASE COMPONENT ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦
function LiveShowcase({ config, setLightboxItem }) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const cardContainerRef = useRef(null);
  const mouseRef = useRef(null);
  const progressRef = useRef(0);

  const photos = config.photos || [];
  const totalCards = photos.length;

  useEffect(() => {
    // Scroll to top when mounted
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !wrapperRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollHeight = rect.height;
      const viewportHeight = window.innerHeight;
      
      const scrollTop = -rect.top;
      const maxScroll = scrollHeight - viewportHeight;
      let progress = 0;
      if (maxScroll > 0) {
        progress = Math.max(0, Math.min(1, scrollTop / maxScroll));
      }

      progressRef.current = progress;

      // Direct DOM style updates to bypass React re-renders during scrolling
      const wrapper = wrapperRef.current;
      wrapper.style.setProperty('--rotate', progress);

      const cards = cardContainerRef.current?.children;
      if (cards && cards.length > 0) {
        for (let idx = 0; idx < cards.length; idx++) {
          const card = cards[idx];
          const cardI = idx + 1;
          const pos = (progress - (cardI - 1) / totalCards + 1.0) % 1.0;
          const dist = Math.min(pos, 1.0 - pos);
          card.style.setProperty('--card-dist', dist);
        }
      }

      if (mouseRef.current) {
        const mouseOpacity = Math.max(0, 1 - (progress / 0.05));
        mouseRef.current.style.opacity = mouseOpacity;
        mouseRef.current.style.pointerEvents = mouseOpacity > 0 ? 'auto' : 'none';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [totalCards]);

  const handleCardClick = (idx) => {
    const cardI = idx + 1;
    const progress = progressRef.current;
    const pos = (progress - (cardI - 1) / totalCards + 1.0) % 1.0;
    const dist = Math.min(pos, 1.0 - pos);

    if (dist < 0.05) {
      setLightboxItem({
        url: photos[idx], // Full quality original image URL
        title: `${config.eventName || "Live Event"} - Moment ${cardI}`,
        photographer: config.eventName || "Live Team",
        dept: config.subtitle || "Live Capture",
        year: "Current Fest"
      });
    } else {
      let targetProgress = (cardI - 1) / totalCards;

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollHeight = rect.height;
        const viewportHeight = window.innerHeight;
        const maxScroll = scrollHeight - viewportHeight;
        const targetScrollTop = window.scrollY + rect.top + (targetProgress * maxScroll);

        window.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  };

  const getShowcaseThumbnailUrl = (url) => {
    if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) return url;
    const uploadIndex = url.indexOf("/upload");
    if (uploadIndex === -1) return url;
    // Optimize size to 600px width at 50% quality to ensure buttery smooth rendering
    return `${url.substring(0, uploadIndex + 7)}/w_600,q_50,f_auto${url.substring(uploadIndex + 7)}`;
  };

  if (totalCards === 0) {
    return (
      <div 
        id="live-showcase"
        className="live-showcase-container" 
        style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          background: '#08080c',
          color: '#fff',
          '--live-color': config.color || '#ffcc00'
        }}
      >
        <span className="live-badge" style={{ animation: 'pulse 2s infinite' }}>🔴 LIVE SHOWCASE</span>
        <h2 style={{ fontFamily: "'Just Me Again Down Here', handwriting", fontSize: '3rem', margin: '1rem 0' }}>
          {config.eventName || "Event"}
        </h2>
        <p style={{ opacity: 0.6 }}>No photos uploaded yet. Open Admin Console to manage photos.</p>
      </div>
    );
  }

  return (
    <div 
      id="live-showcase"
      ref={containerRef} 
      className="live-showcase-container" 
      style={{ 
        height: `${Math.max(450, totalCards * 80)}vh`,
        '--live-color': config.color || '#ffcc00'
      }}
    >
      <div className="live-fixed-overlay">
        <div className="live-header-box">
          <div className="live-badge-wrap">
            <span className="live-indicator"></span>
            <span className="live-badge-text">LIVE SHOWCASE</span>
          </div>
          <h1 className="live-title">
            {config.eventName || "Event"} <em>Live</em>
          </h1>
          <p className="live-subtitle">{config.subtitle || "Ongoing Fest"}</p>
        </div>

        <div 
          ref={wrapperRef} 
          className="live-wheel-wrapper"
          style={{
            '--cards': totalCards,
            '--rotate': 0
          }}
        >
          <div ref={cardContainerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            {photos.map((url, idx) => {
              const cardI = idx + 1;
              const angle = ((cardI - 1) / totalCards) * 360;
              
              const initialPos = (0.0 - (cardI - 1) / totalCards + 1.0) % 1.0;
              const initialDist = Math.min(initialPos, 1.0 - initialPos);

              return (
                <div 
                  key={idx} 
                  className="live-card"
                  data-title={`Snap #${cardI}`}
                  onClick={() => handleCardClick(idx)}
                  style={{
                    '--card-i': cardI,
                    '--card-angle': `${angle}deg`,
                    '--card-dist': initialDist
                  }}
                >
                  <img src={getShowcaseThumbnailUrl(url)} alt={`Live Event Captures #${cardI}`} referrerPolicy="no-referrer" />
                </div>
              );
            })}
          </div>
        </div>

        <div ref={mouseRef} className="live-mouse-wrap" style={{ opacity: 1, pointerEvents: 'auto' }}>
          <div className="live-scroll-arrow">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
          <span className="live-mouse-text">Scroll to navigate</span>
          <span className="live-resolution-text">✦ Click centered photo to view in max resolution ✦</span>
        </div>
      </div>
    </div>
  );
}

function WinnerCard({ rank, data, color, isFeatured, setLightboxItem }) {
  if (!data || !data.url) return <div className="winner-card empty" style={{ border: '1px dashed var(--border)', borderRadius: '24px', minHeight: '300px' }}></div>;
  
  return (
    <div className={`winner-card ${isFeatured ? 'featured' : ''} fade-in`} style={{ "--rank-color": color }}>
      <div className="winner-rank">{rank}</div>
      <div className="winner-image-wrap" onClick={() => setLightboxItem({ url: data.url, title: `${rank} Place - ${data.name}`, photographer: data.name, dept: data.dept, year: data.year })}>
        <img src={data.url} alt={data.name} className="winner-img" referrerPolicy="no-referrer" />
        <div className="winner-overlay"></div>
      </div>
      <div className="winner-info">
        <h4 className="winner-name">{data.name}</h4>
        <p className="winner-dept">{data.dept} · {data.year}</p>
      </div>
    </div>
  );
}

// ✦✦✦ CC EVENTS PAGE COMPONENT ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦
function CCEventsPage({ ccEvents, onClose, setLightboxItem, isMobile }) {
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (hasScrolled.current) return;

    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.replace('#', ''));
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          hasScrolled.current = true;
        }
      }, 500);
    } else {
      window.scrollTo(0, 0);
      hasScrolled.current = true;
    }
  }, [ccEvents]);

  // Filter events into upcoming and past
  const upcomingEvents = ccEvents.filter(e => e.upcoming === true);
  const pastEvents = ccEvents.filter(e => !e.upcoming);

  return (
    <div className="event-page-overlay" style={{ '--c': 'var(--gold)', minHeight: '100vh', paddingBottom: '8rem' }}>
      <div className="container">
        <header className="event-page-header" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ display: 'block', width: '100%' }}>
            <button className="back-btn" onClick={onClose} style={{ position: 'static', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', margin: 0 }}>
              <ArrowLeft /> Back to Events
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '3rem', lineHeight: 1 }}>🏆</span>
            <div>
              <div className="section-label" style={{ color: 'var(--gold)', margin: '0 0 0.2rem 0' }}>
                Exclusive Club Competitions
              </div>
              <h1 className="section-title" style={{ margin: 0, fontSize: '2.5rem' }}>
                Capture Crew <em>Events</em>
              </h1>
            </div>
          </div>
          
          <p className="section-sub" style={{ fontSize: '1.05rem', lineHeight: '1.8', opacity: 0.9, maxWidth: '800px', margin: 0 }}>
            Welcome to the official arena of Capture Crew. Here we host internal themed photography challenges, showcase upcoming events, and immortalize the top captures in our Hall of Fame.
          </p>
        </header>

        {/* UPCOMING EVENTS SECTION */}
        <div className="cc-section-wrapper" style={{ marginBottom: '5rem', marginTop: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
            <span style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>✦</span>
            <h2 className="subcategory-title" style={{ margin: 0, border: 'none', padding: 0 }}>Upcoming <em>Events</em></h2>
          </div>

          {upcomingEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {upcomingEvents.map(event => (
                <div 
                  key={event.id} 
                  id={event.id}
                  className="glass-form fade-in visible" 
                  style={{ 
                    padding: isMobile ? '1.5rem' : '2.5rem', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(201, 169, 110, 0.25)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    display: 'flex',
                    flexDirection: (isMobile || !event.bannerUrl) ? 'column' : 'row',
                    gap: '2.5rem',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#ff4444', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '50px', letterSpacing: '1px', textTransform: 'uppercase' }}>Upcoming</span>
                      {event.date && <span style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 500 }}>🗓️ {event.date}</span>}
                    </div>
                    <h3 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 600, color: 'var(--white)', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-display)' }}>{event.title}</h3>
                    {event.subtitle && <p style={{ color: 'var(--gold)', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{event.subtitle}</p>}
                    {event.desc && <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.75', margin: 0 }}>{event.desc}</p>}
                  </div>
                  {event.bannerUrl && (
                    <div 
                      style={{ 
                        width: isMobile ? '100%' : '320px', 
                        height: isMobile ? '220px' : '240px', 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        border: '1px solid var(--border)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      onClick={() => setLightboxItem({ url: event.bannerUrl, title: `${event.title} - Announcement`, photographer: "Capture Crew", dept: event.subtitle, year: "Upcoming" })}
                    >
                      <img 
                        src={event.bannerUrl} 
                        alt={event.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-form" style={{ padding: isMobile ? '1.5rem' : '3rem', textAlign: 'center', color: 'var(--muted)', borderRadius: '24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📢</div>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>No upcoming events at the moment. Keep practicing, the next challenge is just around the corner!</p>
            </div>
          )}
        </div>

        {/* PAST EVENTS SECTION */}
        <div className="cc-section-wrapper" style={{ marginTop: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏆</span>
            <h2 className="subcategory-title" style={{ margin: 0, border: 'none', padding: 0 }}>Hall of <em>Fame</em></h2>
          </div>

          {pastEvents.length > 0 ? (
            <div className="cc-events-container" style={{ padding: 0 }}>
              {pastEvents.map(event => (
                <div key={event.id} id={event.id} className="cc-event-block" style={{ marginBottom: '6rem', background: 'rgba(255,255,255,0.01)', padding: isMobile ? '1.5rem' : '3rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div className="cc-event-header" style={{ textAlign: 'center', marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="section-label" style={{ margin: '0 0 0.8rem' }}>✧ Competition Results</div>
                    <h3 className="subcategory-title" style={{ border: 'none', padding: 0, fontSize: '2.2rem', margin: '0' }}>{event.title} <em>Winners</em></h3>
                    {event.date && <div style={{ color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.05em', marginTop: '0.4rem' }}>🗓️ {event.date}</div>}
                    {event.subtitle && <p className="section-sub" style={{ margin: '0.8rem 0 0', opacity: 0.8, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{event.subtitle}</p>}
                    {event.desc && <p style={{ color: 'var(--muted)', fontSize: '0.92rem', maxWidth: '650px', margin: '1rem auto 0', lineHeight: '1.6' }}>{event.desc}</p>}
                  </div>
                  
                  <div className="podium-grid">
                    <WinnerCard rank="2nd" data={event.winners?.["2nd"]} color="#A8A8A8" setLightboxItem={setLightboxItem} />
                    <WinnerCard rank="1st" data={event.winners?.["1st"]} color="var(--gold)" isFeatured={true} setLightboxItem={setLightboxItem} />
                    <WinnerCard rank="3rd" data={event.winners?.["3rd"]} color="#CD7F32" setLightboxItem={setLightboxItem} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-form" style={{ padding: isMobile ? '1.5rem' : '3rem', textAlign: 'center', color: 'var(--muted)', borderRadius: '24px' }}>
              <p style={{ margin: 0 }}>No past event winners posted yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ✦✦✦ EVENT PAGE COMPONENT ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦


function EventPage({ event, liveEvents, onClose, setLightboxItem, isGlobal, archiveConfig, liveEventsList, isMobile }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getEventPhotos = () => {
    const livePhotos = liveEvents[event.id];
    const hasLivePhotos = livePhotos && (
      Array.isArray(livePhotos) ? livePhotos.length > 0 : (
        (livePhotos.general && livePhotos.general.length > 0) ||
        (livePhotos.prize && livePhotos.prize.length > 0) ||
        (livePhotos.winners && livePhotos.winners.length > 0)
      )
    );
    const photosRaw = hasLivePhotos ? livePhotos : (STATIC_EVENT_PHOTOS[event.id] || []);
    return flattenPhotos(photosRaw);
  };

  const photos = getEventPhotos();
  const logoUrl = (event.iconUrl && event.iconUrl.trim().startsWith('http')) ? event.iconUrl.trim() : (STATIC_EVENT_ICONS[event.id] && STATIC_EVENT_ICONS[event.id].trim().startsWith('http') ? STATIC_EVENT_ICONS[event.id].trim() : null);

  // Get grouped events for global archive
  const getGroupedEvents = () => {
    if (!isGlobal) return [];
    
    // Use custom order if exists, otherwise use liveEventsList order
    let sortedList = [...liveEventsList];
    if (archiveConfig.order && archiveConfig.order.length > 0) {
      sortedList.sort((a, b) => {
        const indexA = archiveConfig.order.indexOf(a.id);
        const indexB = archiveConfig.order.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return (a.order || 99) - (b.order || 99);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    } else {
      sortedList.sort((a, b) => (a.order || 99) - (b.order || 99));
    }

    // Filter out hidden events
    return sortedList.filter(ev => !archiveConfig.hidden?.includes(ev.id));
  };

  const groupedEvents = getGroupedEvents();

  // Build global playlist for Universal Archive view across all listed events in exact order
  const globalPlaylist = isGlobal ? (() => {
    const list = [];
    groupedEvents.forEach(ev => {
      const evPhotos = (
        liveEvents[ev.id] && (
          Array.isArray(liveEvents[ev.id]) ? liveEvents[ev.id].length > 0 : (
            (liveEvents[ev.id].general && liveEvents[ev.id].general.length > 0) ||
            (liveEvents[ev.id].prize && liveEvents[ev.id].prize.length > 0) ||
            (liveEvents[ev.id].winners && liveEvents[ev.id].winners.length > 0)
          )
        )
      ) ? flattenPhotos(liveEvents[ev.id]) : flattenPhotos(STATIC_EVENT_PHOTOS[ev.id]);

      evPhotos.forEach(p => {
        list.push({
          url: p,
          title: ev.name,
          photographer: "Capture Crew",
          dept: ev.date || ev.subtitle || "Event Archive",
          year: ev.calendarYear || "2026"
        });
      });
    });
    return list;
  })() : null;

  // Single event playlist
  const eventPlaylist = !isGlobal ? photos.map(p => ({
    url: p,
    title: event.name,
    photographer: "Capture Crew",
    dept: event.subtitle || "Highlights",
    year: event.calendarYear || "2026"
  })) : null;

  return (
    <div className="event-page-overlay" style={{ '--c': event.color || 'var(--gold)' }}>
      <div className="container" style={{ paddingBottom: '8rem' }}>
        <header className="event-page-header">
          <button className="back-btn" onClick={onClose}><ArrowLeft /> Back to Events</button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {!isGlobal && (logoUrl ? (
              <img 
                src={logoUrl} 
                alt={event.name} 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '2.5px solid var(--c)',
                  boxShadow: '0 0 20px rgba(255,255,255,0.05)'
                }} 
                referrerPolicy="no-referrer"
              />
            ) : (
              <span style={{ fontSize: '3rem', lineHeight: 1 }}>{event.emoji || "📅"}</span>
            ))}
            <div>
              <div className="section-label" style={{ color: 'var(--c)', margin: 0 }}>
                {isGlobal ? "Universal Archive" : (event.subtitle || "Event Showcase")}
              </div>
              <h1 className="section-title" style={{ margin: 0, fontSize: '2.5rem' }}>
                {event.name} <em style={{ color: 'var(--c)' }}>Glimpse</em>
              </h1>
            </div>
          </div>
          
          {event.date && (
            <div className="event-date" style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
              🗓️ {event.date}
            </div>
          )}
          
          <p className="section-sub" style={{ fontSize: '1rem', lineHeight: '1.8', opacity: 0.9, maxWidth: '800px', margin: '0 0 1.5rem 0' }}>
            {event.desc}
          </p>

          {!isGlobal && event.highlight && (
            <div className="event-highlight" style={{ maxWidth: '600px' }}>
              {event.highlight}
            </div>
          )}
        </header>

        {isGlobal ? (
          <div className="archive-timeline">
            {groupedEvents.map((ev, idx) => (
              <div key={ev.id} className="archive-group" style={{ marginBottom: '5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="section-label" style={{ margin: 0 }}>Chapter {(idx + 1).toString().padStart(2, '0')}</div>
                  <h2 className="subcategory-title" style={{ margin: 0, border: 'none', padding: 0 }}>{ev.name} <em>{ev.date}</em></h2>
                </div>
                <EventSection 
                  title={ev.name} 
                  subtitle={ev.date} 
                  photos={
                    liveEvents[ev.id] && (
                      Array.isArray(liveEvents[ev.id]) ? liveEvents[ev.id].length > 0 : (
                        (liveEvents[ev.id].general && liveEvents[ev.id].general.length > 0) ||
                        (liveEvents[ev.id].prize && liveEvents[ev.id].prize.length > 0) ||
                        (liveEvents[ev.id].winners && liveEvents[ev.id].winners.length > 0)
                      )
                    ) ? flattenPhotos(liveEvents[ev.id]) : flattenPhotos(STATIC_EVENT_PHOTOS[ev.id])
                  } 
                  setLightboxItem={setLightboxItem} 
                  onClose={onClose} 
                  eventYear={ev.calendarYear || "2026"}
                  isMobile={isMobile}
                  playlist={globalPlaylist}
                  showShare={false}
                />
              </div>
            ))}
            {groupedEvents.length === 0 && (
              <div className="no-results">The archive is currently empty.</div>
            )}
          </div>
        ) : (
          <>
            <EventSection 
              title="Gallery" 
              subtitle={event.subtitle || "Highlights"} 
              photos={photos} 
              setLightboxItem={setLightboxItem} 
              onClose={onClose} 
              eventYear={event.calendarYear || "2026"} 
              isMobile={isMobile} 
              playlist={eventPlaylist}
              showShare={true}
              eventName={event.name}
            />
          </>
        )}
      </div>
    </div>
  );
}

function EventShareButton({ title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const getShareUrl = () => {
    return window.location.href;
  };

  const getShareText = () => {
    return `Check out ${title || 'this event'} on CGEC Capture Crew!`;
  };

  const handleCopyLink = async (platformName) => {
    try {
      const url = getShareUrl();
      await navigator.clipboard.writeText(url);
      setToastMessage(platformName ? `Link copied for ${platformName}!` : "Link copied to clipboard!");
      setTimeout(() => setToastMessage(""), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShareWhatsApp = () => {
    const url = getShareUrl();
    const text = getShareText();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = getShareUrl();
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(liUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareInstagram = () => {
    handleCopyLink("Instagram");
    setTimeout(() => {
      window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
    }, 600);
  };

  return (
    <div 
      className={`tooltip-container ${isOpen ? 'active' : ''}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {toastMessage && (
        <div className="share-toast-bubble">
          {toastMessage}
        </div>
      )}
      <div 
        className="button-content"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        role="button"
        aria-label="Share Event"
      >
        <span className="text">Share</span>
        <svg
          className="share-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
        >
          <path
            d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
          ></path>
        </svg>
      </div>
      <div className="tooltip-content">
        <div className="social-icons">
          <button
            type="button"
            className="social-icon instagram"
            onClick={handleShareInstagram}
            title="Share / Copy for Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </button>
          <button
            type="button"
            className="social-icon whatsapp"
            onClick={handleShareWhatsApp}
            title="Share via WhatsApp"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </button>
          <button
            type="button"
            className="social-icon linkedin"
            onClick={handleShareLinkedIn}
            title="Share on LinkedIn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            className="social-icon copy-link"
            onClick={() => handleCopyLink()}
            title="Copy Link to Clipboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function EventSection({ title, subtitle, photos, setLightboxItem, onClose, eventYear, isMobile, playlist, showShare = true, eventName }) {
  const [searchTerm, setSearchTerm] = useState("");
  if (!photos || photos.length === 0) return null;

  const filteredPhotos = photos.filter((_, i) => 
    `IMG_${1000 + i}.JPG`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedPhotos = reorderPhotosForMasonry(filteredPhotos, isMobile);

  return (
    <div className="event-detail-section fade-in visible">
      <div className="explorer-header">
        <div className="explorer-toolbar">
          <div className="explorer-path">
            <span className="path-root" onClick={onClose} style={{ cursor: 'pointer' }}><ArrowLeft /> Events</span>
            <span className="path-sep">/</span>
            <span className="path-folder">{subtitle}</span>
            <span className="path-sep">/</span>
            <span className="path-current">{title}</span>
          </div>
          <div className="explorer-actions">
            <div className="explorer-search">
              <span className="search-icon">🔍 </span>
              <input 
                type="text" 
                placeholder="Search images..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {showShare && <EventShareButton title={eventName || title} />}
            <div className="explorer-info">{filteredPhotos.length} Items</div>
          </div>
        </div>
      </div>
      
      <div className="gallery-grid-system">
        {displayedPhotos.map((p, i) => (
          <div 
            key={`${p}-${i}`} 
            className="gallery-grid-item" 
            style={{ "--delay": `${(i % 12) * 0.05}s` }}
            onClick={() => {
              let itemIndex = 0;
              if (playlist && playlist.length > 0) {
                const foundIdx = playlist.findIndex(item => item.url === p);
                if (foundIdx !== -1) itemIndex = foundIdx;
              }

              const activeItem = (playlist && playlist[itemIndex]) ? playlist[itemIndex] : {
                url: p,
                title: title,
                photographer: "Capture Crew",
                dept: subtitle,
                year: eventYear || "2026"
              };

              setLightboxItem({
                ...activeItem,
                playlist: playlist && playlist.length > 0 ? playlist : [activeItem],
                currentIndex: itemIndex
              });
            }}
          >
            <div className="grid-item-inner">
              <BlurUpImage src={p} alt={title} />
            </div>
          </div>
        ))}
      </div>
      {filteredPhotos.length === 0 && (
        <div className="no-results">No images found matching "{searchTerm}"</div>
      )}
    </div>
  );
}

// ✦✦✦ RECRUITMENT MODAL ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦
// ✦✦✦ RECRUITMENT COMPONENTS ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦
function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [activePhotoModal, setActivePhotoModal] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (s) => setApps(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const unseenApps = apps.filter(app => app.seen === false);

  useEffect(() => {
    const unseenIds = apps.filter(a => a.seen === false).map(a => a.id);
    if (unseenIds.length > 0) {
      const timer = setTimeout(async () => {
        const batch = writeBatch(db);
        unseenIds.forEach(id => {
          batch.update(doc(db, "applications", id), { seen: true });
        });
        try {
          await batch.commit();
        } catch (err) {
          console.error("Error marking applications as seen:", err);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [apps]);

  return (
    <div className="admin-grid-view">
      {unseenApps.length > 0 && (
        <div className="new-app-banner fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            <div>
              <strong style={{ color: 'var(--gold)' }}>New Applications Received!</strong>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
                You have {unseenApps.length} new candidate{unseenApps.length > 1 ? 's' : ''} to review.
              </div>
            </div>
          </div>
          <span className="app-notification-badge" style={{ margin: 0 }}>NEW</span>
        </div>
      )}

      <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Applicant</th>
              <th style={{ padding: '1rem' }}>Position</th>
              <th style={{ padding: '1rem' }}>Contact Info</th>
              <th style={{ padding: '1rem' }}>Uploaded Photos</th>
              <th style={{ padding: '1rem' }}>Showcase Links</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => {
              const photoList = app.photos || (app.photoUrl ? [app.photoUrl] : []);
              return (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                      {app.seen === false && <span className="new-app-dot" title="New Application" />}
                      {app.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '4px' }}>{app.dept} · {app.year}</div>
                  </td>
                  <td style={{ padding: '1rem', color: '#E8C98A', fontWeight: '500' }}>{app.position}</td>
                  <td style={{ padding: '1rem' }}>
                    <div>{app.email}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>{app.phone}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {photoList.length > 0 ? (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '6px', fontWeight: 'bold' }}>
                          {photoList.length} Photo{photoList.length > 1 ? 's' : ''}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '180px' }}>
                          {photoList.map((pUrl, pIdx) => (
                            <img 
                              key={pIdx} 
                              src={pUrl} 
                              alt={`Work ${pIdx + 1}`} 
                              onClick={() => setActivePhotoModal({ url: pUrl, title: `${app.name} - Photo ${pIdx + 1}` })}
                              style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--gold)', cursor: 'pointer', transition: 'transform 0.2s' }}
                              title="Click to view full image"
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span style={{ opacity: 0.4, fontSize: '0.75rem' }}>No photos</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {app.driveLink && (
                        <a href={app.driveLink} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span>📁</span> Drive / Video Link
                        </a>
                      )}
                      {app.instaLink && (
                        <a href={app.instaLink} target="_blank" rel="noreferrer" style={{ color: '#FF7A90', textDecoration: 'underline', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <InstagramIcon size={13} /> Instagram Link
                        </a>
                      )}
                      {app.portfolio && !app.driveLink && !app.instaLink && (
                        <a href={app.portfolio} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline', fontSize: '0.75rem' }}>
                          🔗 Portfolio Link
                        </a>
                      )}
                      {!app.driveLink && !app.instaLink && !app.portfolio && (
                        <span style={{ opacity: 0.4, fontSize: '0.75rem' }}>No links provided</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={async () => {
                      if (window.confirm(`Delete recruitment application from ${app.name || app.email}?`)) {
                        try {
                          await deleteDoc(doc(db, "applications", app.id));
                          alert("Application deleted.");
                        } catch (err) { alert("Delete failed: " + err.message); }
                      }
                    }} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {apps.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No applications yet.</div>}
      </div>

      {activePhotoModal && (
        <div className="lightbox open" onClick={() => setActivePhotoModal(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img src={activePhotoModal.url} alt="Full view" style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', border: '2px solid var(--gold)' }} />
            <div style={{ color: '#fff', textAlign: 'center', marginTop: '8px', fontSize: '0.9rem' }}>{activePhotoModal.title}</div>
            <button className="lightbox-close" onClick={() => setActivePhotoModal(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberForm({ DEPTS, YEARS, onAdded }) {
  const [data, setData] = useState({ name: "", dept: DEPTS[0], year: YEARS[0], img: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "members"), {
        ...data,
        role: "Member",
        createdAt: serverTimestamp()
      });
      setData({ name: "", dept: DEPTS[0], year: YEARS[0], img: "" });
      onAdded();
      alert("Member Added Successfully!");
    } catch (err) {
      alert("Error adding member: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="feedback-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }} onSubmit={handleSubmit}>
      <input className="form-input" placeholder="Student Name" value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
      <select className="form-input" value={data.dept} onChange={e => setData({...data, dept: e.target.value})}>
        {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select className="form-input" value={data.year} onChange={e => setData({...data, year: e.target.value})}>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <div style={{ gridColumn: '1 / -1' }}>
        <SingleImageUploader 
          label="Choose image from gallery"
          currentUrl={data.img}
          onUploadComplete={(url) => setData({...data, img: url})}
        />
      </div>
      <button className="form-submit" type="submit" disabled={loading} style={{ gridColumn: '1 / -1' }}>
        {loading ? "Adding..." : "Add Member"}
      </button>
    </form>
  );
}

async function sendApplicationConfirmationEmail(formData) {
  try {
    const photoList = formData.photos || [];
    const driveLink = formData.driveLink || '';
    const instaLink = formData.instaLink || '';

    // 1. Applicant Confirmation Email
    const applicantEmailPromise = fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Capture Crew <apply@capturecrew.site>',
        to: formData.email,
        subject: 'Application Received - Capture Crew Core Team 📸',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0B; color: #fff; padding: 2rem; border-radius: 16px; border: 1px solid #222;">
            <div style="text-align: center; border-bottom: 1px solid #222; padding-bottom: 1.5rem; margin-bottom: 2rem;">
              <img src="https://res.cloudinary.com/dwp7fe7bo/image/upload/v1780682580/554399431_17944411011051405_1793754745012835189_n_qmgbm8.jpg" alt="Capture Crew Logo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 1.5px solid #C9A96E; display: inline-block;" />
              <h1 style="color: #C9A96E; font-size: 24px; margin: 0;">Capture Crew</h1>
              <p style="color: #888; font-size: 11px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Capturing Moments · Creating Memories</p>
            </div>
            
            <h2 style="color: #fff; font-size: 20px; font-weight: normal; margin-bottom: 1.5rem;">Application Received! ✧</h2>
            
            <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin-bottom: 1.5rem;">
              Hi <strong>${formData.name}</strong>,
            </p>
            
            <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin-bottom: 1.5rem;">
              Thank you for applying to join the <strong>Capture Crew Core Team</strong>. We have successfully received your application details, and our team is already reviewing your profile.
            </p>

            <div style="background-color: rgba(201, 169, 110, 0.05); border: 1px solid rgba(201, 169, 110, 0.2); padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;">
              <h3 style="color: #C9A96E; font-size: 16px; margin-top: 0; margin-bottom: 1rem;">Summary of your application:</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #ccc;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 140px; color: #888;">Position(s):</td>
                  <td style="padding: 6px 0; color: #fff;">${formData.positions.join(', ')}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Department:</td>
                  <td style="padding: 6px 0; color: #fff;">${formData.dept}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Academic Year:</td>
                  <td style="padding: 6px 0; color: #fff;">${formData.year}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Photos Uploaded:</td>
                  <td style="padding: 6px 0; color: #fff;">${photoList.length} Photo(s)</td>
                </tr>
                ${driveLink ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #888;">Drive / Video Link:</td><td style="padding: 6px 0; color: #fff;"><a href="${driveLink}" target="_blank" style="color: #C9A96E;">View Drive/Video</a></td></tr>` : ''}
                ${instaLink ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #888;">Instagram Link:</td><td style="padding: 6px 0; color: #fff;"><a href="${instaLink}" target="_blank" style="color: #C9A96E;">View Instagram Page</a></td></tr>` : ''}
              </table>
            </div>

            <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin-bottom: 2rem;">
              The Capture Crew Team will reach out to you soon via email or WhatsApp regarding the next steps of the recruitment process.
            </p>

            <div style="text-align: center; margin-bottom: 2rem;">
              <a href="https://www.capturecrew.site" style="background-color: #C9A96E; color: #111; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Visit Capture Crew</a>
            </div>

            <div style="text-align: center; border-top: 1px solid #222; padding-top: 1.5rem; margin-top: 2.5rem; font-size: 11px; color: #666;">
              <p>This is an automated confirmation email for your application submission.</p>
              <p>&copy; ${new Date().getFullYear()} CGEC Capture Crew. Cooch Behar Government Engineering College.</p>
            </div>
          </div>
        `
      })
    });

    // 2. Admin Notification Email to contact@capturecrew.site
    const adminNotificationPromise = fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Capture Crew Applications <apply@capturecrew.site>',
        to: 'contact@capturecrew.site',
        reply_to: formData.email,
        subject: `🚨 New Core Team Application: ${formData.name} (${formData.positions.join(', ')})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0B; color: #fff; padding: 2rem; border-radius: 16px; border: 1px solid #222;">
            <div style="text-align: center; border-bottom: 1px solid #222; padding-bottom: 1.5rem; margin-bottom: 2rem;">
              <img src="https://res.cloudinary.com/dwp7fe7bo/image/upload/v1780682580/554399431_17944411011051405_1793754745012835189_n_qmgbm8.jpg" alt="Capture Crew Logo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 1.5px solid #C9A96E; display: inline-block;" />
              <h1 style="color: #C9A96E; font-size: 24px; margin: 0;">Capture Crew Admin Notification</h1>
              <p style="color: #888; font-size: 11px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">New Core Team Application Submitted</p>
            </div>
            
            <h2 style="color: #fff; font-size: 20px; font-weight: normal; margin-bottom: 1rem;">New Student Application Received 📝</h2>
            <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin-bottom: 1.5rem;">
              A student has submitted their details to join the <strong>Capture Crew Core Team</strong>. Here is the complete application breakdown:
            </p>

            <div style="background-color: rgba(201, 169, 110, 0.05); border: 1px solid rgba(201, 169, 110, 0.2); padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;">
              <h3 style="color: #C9A96E; font-size: 16px; margin-top: 0; margin-bottom: 1rem;">Applicant Details:</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #ccc;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 140px; color: #888;">Full Name:</td>
                  <td style="padding: 6px 0; color: #fff; font-weight: bold;">${formData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Email:</td>
                  <td style="padding: 6px 0; color: #fff;"><a href="mailto:${formData.email}" style="color: #C9A96E; text-decoration: none;">${formData.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Phone Number:</td>
                  <td style="padding: 6px 0; color: #fff;">${formData.phone || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Position(s):</td>
                  <td style="padding: 6px 0; color: #C9A96E; font-weight: bold;">${formData.positions.join(', ')}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Department:</td>
                  <td style="padding: 6px 0; color: #fff;">${formData.dept}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Academic Year:</td>
                  <td style="padding: 6px 0; color: #fff;">${formData.year}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Uploaded Photos:</td>
                  <td style="padding: 6px 0; color: #fff;">${photoList.length > 0 ? `${photoList.length} photos uploaded` : 'None'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Drive / Video Link:</td>
                  <td style="padding: 6px 0; color: #fff;">${driveLink ? `<a href="${driveLink}" target="_blank" style="color: #C9A96E; text-decoration: underline;">View Drive/Video</a>` : 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #888;">Instagram Link:</td>
                  <td style="padding: 6px 0; color: #fff;">${instaLink ? `<a href="${instaLink}" target="_blank" style="color: #C9A96E; text-decoration: underline;">View Instagram Link</a>` : 'Not provided'}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-bottom: 2rem;">
              <a href="https://www.capturecrew.site/admin" style="background-color: #C9A96E; color: #111; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Open Admin Console</a>
            </div>

            <div style="text-align: center; border-top: 1px solid #222; padding-top: 1.5rem; margin-top: 2.5rem; font-size: 11px; color: #666;">
              <p>Automated notification sent to contact@capturecrew.site</p>
              <p>&copy; ${new Date().getFullYear()} CGEC Capture Crew.</p>
            </div>
          </div>
        `
      })
    });

    await Promise.allSettled([applicantEmailPromise, adminNotificationPromise]);
  } catch (emailErr) {
    console.error("Error sending confirmation / admin notification email:", emailErr);
  }
}

function RecruitmentPhotoUploader({ photos, setPhotos, maxPhotos = 10 }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (photos.length + selectedFiles.length > maxPhotos) {
      const allowedCount = maxPhotos - photos.length;
      if (allowedCount <= 0) {
        setUploadError(`Maximum ${maxPhotos} photos limit reached.`);
        return;
      }
      setUploadError(`Only ${allowedCount} more photo(s) could be uploaded (Maximum ${maxPhotos}).`);
      selectedFiles.splice(allowedCount);
    } else {
      setUploadError("");
    }

    setUploading(true);
    const newUploadedUrls = [];

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dwp7fe7bo";
    const presetsToTry = [
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      "ml_default",
      "cgec_cc",
      "unsigned"
    ].filter(Boolean);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadProgress(`Uploading photo ${i + 1} of ${selectedFiles.length}...`);

      let uploadFile = file;
      try {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 2500,
          useWebWorker: true,
          initialQuality: 0.8
        };
        uploadFile = await imageCompression(file, options);
      } catch (compErr) {
        console.warn("Compression fallback:", compErr);
      }

      let uploadedUrl = null;
      for (const preset of presetsToTry) {
        try {
          const formData = new FormData();
          formData.append('file', uploadFile);
          formData.append('upload_preset', preset);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
          });

          if (res.ok) {
            const data = await res.json();
            if (data.secure_url) {
              uploadedUrl = data.secure_url;
              break;
            }
          }
        } catch (err) {
          console.warn(`Upload with preset '${preset}' failed:`, err);
        }
      }

      if (uploadedUrl) {
        newUploadedUrls.push(uploadedUrl);
      } else {
        setUploadError(`Failed to upload ${file.name}. Please check image size or connection.`);
      }
    }

    if (newUploadedUrls.length > 0) {
      setPhotos(prev => [...prev, ...newUploadedUrls].slice(0, maxPhotos));
    }
    setUploading(false);
    setUploadProgress("");
  };

  const removePhoto = (indexToRemove) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="recruitment-photo-uploader" style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
      <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 'bold' }}>
        Upload Your Best Photos (Up to 10) <span style={{ opacity: 0.7, fontWeight: 'normal' }}>({photos.length}/{maxPhotos})</span>
      </label>

      {photos.length < maxPhotos && (
        <div style={{
          border: '2px dashed var(--gold)',
          borderRadius: '12px',
          padding: '2rem 1rem',
          textAlign: 'center',
          background: 'rgba(201, 169, 110, 0.03)',
          cursor: uploading ? 'wait' : 'pointer',
          position: 'relative',
          transition: 'all 0.2s ease'
        }}>
          <input 
            type="file" 
            multiple 
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              opacity: 0, cursor: uploading ? 'wait' : 'pointer'
            }}
          />
          <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📸</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--white)' }}>
            {uploading ? uploadProgress : 'Click or Drag & Drop to Upload Best Photos'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: '0.4rem', opacity: 0.8 }}>
            Select up to 10 photos showcasing your photography & editing skills
          </div>
        </div>
      )}

      {uploadError && (
        <div style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '0.5rem', background: 'rgba(255,77,77,0.1)', padding: '0.5rem', borderRadius: '6px' }}>
          {uploadError}
        </div>
      )}

      {photos.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
          gap: '0.75rem',
          marginTop: '1rem'
        }}>
          {photos.map((url, idx) => (
            <div key={idx} style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--gold)',
              aspectRatio: '1',
              background: '#000'
            }}>
              <img src={url} alt={`Uploaded ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button 
                type="button"
                onClick={() => removePhoto(idx)}
                style={{
                  position: 'absolute',
                  top: '3px',
                  right: '3px',
                  background: 'rgba(0,0,0,0.85)',
                  color: '#ff4444',
                  border: '1px solid #ff4444',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  zIndex: 2
                }}
                title="Remove photo"
              >
                ✕
              </button>
              <span style={{
                position: 'absolute',
                bottom: '3px',
                left: '3px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                fontSize: '0.65rem',
                padding: '1px 5px',
                borderRadius: '3px',
                fontWeight: 'bold'
              }}>
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecruitmentModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dept: '', year: '', positions: [], otherPosition: '', driveLink: '', instaLink: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.positions.length === 0) {
      alert("Please select at least one position.");
      return;
    }
    if (formData.positions.includes("Others") && !formData.otherPosition.trim()) {
      alert("Please specify your desired position for 'Others'.");
      return;
    }
    if (photos.length === 0 && !formData.driveLink.trim() && !formData.instaLink.trim()) {
      alert("Please upload at least 1 photo OR provide a Google Drive / Video link or Instagram link to showcase your work.");
      return;
    }
    setIsSubmitting(true);
    try {
      const positionsToSubmit = formData.positions.map(p => {
        if (p === "Others") {
          return formData.otherPosition.trim() ? `Others (${formData.otherPosition.trim()})` : "Others";
        }
        return p;
      });

      const applicationData = {
        ...formData,
        positions: positionsToSubmit,
        position: positionsToSubmit.join(', '),
        photos,
        driveLink: formData.driveLink.trim(),
        instaLink: formData.instaLink.trim(),
        portfolio: formData.driveLink.trim() || formData.instaLink.trim() || (photos[0] || ''),
        timestamp: serverTimestamp(),
        seen: false
      };

      await addDoc(collection(db, "applications"), applicationData);
      sendApplicationConfirmationEmail(applicationData);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission failed. Please check your internet connection.");
    } finally { setIsSubmitting(false); }
  };

  const togglePosition = (pos) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(pos)
        ? prev.positions.filter(p => p !== pos)
        : [...prev.positions, pos]
    }));
  };

  const POSITIONS = [
    "Graphic Designer",
    "Video Editor",
    "Videographer",
    "Photographer",
    "Photo Editor",
    "PR Manager",
    "Content Writer",
    "Moderator",
    "Others"
  ];

  if (submitted) {
    return (
      <div className="lightbox open" onClick={onClose}>
        <div className="admin-modal glass-form fade-in visible" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '450px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✨</div>
          <h2 className="section-title">Application <em>Sent!</em></h2>
          <p className="section-sub">Your application has been received. We'll be in touch soon!</p>
          <button className="form-submit" onClick={onClose} style={{ marginTop: '2.5rem', width: '100%' }}>Return to Site</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lightbox open" onClick={onClose}>
      <div className="admin-modal glass-form fade-in visible" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="lightbox-close" onClick={onClose} style={{ top: '2rem', right: '2rem' }}>✕</button>
        <div className="section-label">✧ Join our legacy</div>
        <h2 className="section-title" style={{ fontSize: '2.5rem' }}>The <em>Core Team</em></h2>
        <p className="section-sub" style={{ marginBottom: '2.5rem' }}>We are looking for creative souls. Apply below.</p>
        
        <form className="feedback-form" style={{ background: 'transparent', padding: '0', boxShadow: 'none' }} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Full Name</label>
              <input className="form-input" placeholder="e.g. FirstName LastName" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Email Address</label>
              <input className="form-input" type="email" placeholder="name@gmail.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>WhatsApp No.</label>
              <input className="form-input" placeholder="+91 XXXX" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Department</label>
              <select className="form-input" style={{ appearance: 'none' }} required value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})}>
                <option value="" style={{ background: '#111' }}>Select Dept</option>
                <option style={{ background: '#111' }}>CSE</option><option style={{ background: '#111' }}>ECE</option><option style={{ background: '#111' }}>EE</option><option style={{ background: '#111' }}>ME</option><option style={{ background: '#111' }}>CE</option>
              </select>
            </div>
            <div className="form-group">
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Academic Year</label>
              <select className="form-input" style={{ appearance: 'none' }} required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                <option value="" style={{ background: '#111' }}>Select Year</option>
                <option style={{ background: '#111' }}>1st Year</option><option style={{ background: '#111' }}>2nd Year</option><option style={{ background: '#111' }}>3rd Year</option><option style={{ background: '#111' }}>4th Year</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '1rem', color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 'bold' }}>Positions you're applying for (Select all that apply)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem' }}>
                {POSITIONS.map(pos => (
                  <div 
                    key={pos} 
                    onClick={() => togglePosition(pos)}
                    style={{ 
                      padding: '0.8rem 1rem', 
                      borderRadius: '8px', 
                      background: formData.positions.includes(pos) ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                      color: formData.positions.includes(pos) ? 'var(--ink)' : 'var(--white)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: formData.positions.includes(pos) ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      fontWeight: formData.positions.includes(pos) ? 'bold' : 'normal'
                    }}
                  >
                    {pos}
                  </div>
                ))}
              </div>
              {formData.positions.includes("Others") && (
                <div style={{ marginTop: '1rem' }}>
                  <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Specify Desired Position</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. 3D Animator, Sound Engineer" 
                    required
                    value={formData.otherPosition} 
                    onChange={e => setFormData({ ...formData, otherPosition: e.target.value })} 
                  />
                </div>
              )}
            </div>

            {/* Photo Uploader */}
            <RecruitmentPhotoUploader photos={photos} setPhotos={setPhotos} maxPhotos={10} />

            {/* Showcase Links Section */}
            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '1.5rem' }}>
              <div style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                ✧ Work Showcase Links
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                You can paste your video editings/Google Drive link and Instagram page link below. Submitting both is not mandatory, but at least one form of showcase (photos or links) is required.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div className="form-group">
                  <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--gold)', fontSize: '0.7rem' }}>
                    Google Drive / Video Editing Link
                  </label>
                  <input 
                    className="form-input" 
                    type="url"
                    placeholder="https://drive.google.com/... or YouTube link" 
                    value={formData.driveLink} 
                    onChange={e => setFormData({...formData, driveLink: e.target.value})} 
                  />
                </div>

                <div className="form-group">
                  <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--gold)', fontSize: '0.7rem' }}>
                    Instagram Page / Profile Link
                  </label>
                  <input 
                    className="form-input" 
                    type="url"
                    placeholder="https://instagram.com/..." 
                    value={formData.instaLink} 
                    onChange={e => setFormData({...formData, instaLink: e.target.value})} 
                  />
                </div>
              </div>
            </div>

          </div>
          <button className="form-submit" type="submit" disabled={isSubmitting} style={{ marginTop: '2.5rem', width: '100%' }}>
            {isSubmitting ? "PROCESSING..." : <>SUBMIT APPLICATION <ArrowRight /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

function RecruitmentPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dept: '', year: '', positions: [], otherPosition: '', driveLink: '', instaLink: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.positions.length === 0) {
      alert("Please select at least one position.");
      return;
    }
    if (formData.positions.includes("Others") && !formData.otherPosition.trim()) {
      alert("Please specify your desired position for 'Others'.");
      return;
    }
    if (photos.length === 0 && !formData.driveLink.trim() && !formData.instaLink.trim()) {
      alert("Please upload at least 1 photo OR provide a Google Drive / Video link or Instagram link to showcase your work.");
      return;
    }
    setIsSubmitting(true);
    try {
      const positionsToSubmit = formData.positions.map(p => {
        if (p === "Others") {
          return formData.otherPosition.trim() ? `Others (${formData.otherPosition.trim()})` : "Others";
        }
        return p;
      });

      const applicationData = {
        ...formData,
        positions: positionsToSubmit,
        position: positionsToSubmit.join(', '),
        photos,
        driveLink: formData.driveLink.trim(),
        instaLink: formData.instaLink.trim(),
        portfolio: formData.driveLink.trim() || formData.instaLink.trim() || (photos[0] || ''),
        timestamp: serverTimestamp(),
        seen: false
      };

      await addDoc(collection(db, "applications"), applicationData);
      sendApplicationConfirmationEmail(applicationData);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission failed. Please check your internet connection.");
    } finally { setIsSubmitting(false); }
  };

  const togglePosition = (pos) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(pos)
        ? prev.positions.filter(p => p !== pos)
        : [...prev.positions, pos]
    }));
  };

  const POSITIONS = [
    "Graphic Designer",
    "Video Editor",
    "Videographer",
    "Photographer",
    "Photo Editor",
    "PR Manager",
    "Content Writer",
    "Moderator",
    "Others"
  ];

  if (submitted) {
    return (
      <section className="verify-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 0' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="admin-modal glass-form fade-in visible" style={{ textAlign: 'center', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✨</div>
            <h2 className="section-title">Application <em>Sent!</em></h2>
            <p className="section-sub">Your application has been received. We'll be in touch soon!</p>
            <button className="form-submit" onClick={() => navigate('/team')} style={{ marginTop: '2.5rem', width: '100%' }}>Return to Team</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="verify-section" style={{ minHeight: '80vh', padding: '8rem 0' }}>
      <div className="container" style={{ maxWidth: '750px' }}>
        <div className="admin-modal glass-form fade-in visible" style={{ padding: '3rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
          <button className="lightbox-close" onClick={() => navigate('/team')} style={{ top: '2rem', right: '2rem', position: 'absolute', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
          <div className="section-label">✧ Join our legacy</div>
          <h2 className="section-title" style={{ fontSize: '2.5rem' }}>The <em>Core Team</em></h2>
          <p className="section-sub" style={{ marginBottom: '3rem' }}>We are looking for creative souls. Apply below.</p>
          
          <form className="feedback-form" style={{ background: 'transparent', padding: '0', boxShadow: 'none' }} onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Full Name</label>
                <input className="form-input" placeholder="e.g. FirstName LastName" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Email Address</label>
                <input className="form-input" type="email" placeholder="name@gmail.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>WhatsApp No.</label>
                <input className="form-input" placeholder="+91 XXXX" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Department</label>
                <select className="form-input" style={{ appearance: 'none' }} required value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})}>
                  <option value="" style={{ background: '#111' }}>Select Dept</option>
                  <option style={{ background: '#111' }}>CSE</option><option style={{ background: '#111' }}>ECE</option><option style={{ background: '#111' }}>EE</option><option style={{ background: '#111' }}>ME</option><option style={{ background: '#111' }}>CE</option>
                </select>
              </div>
              <div className="form-group">
                <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Academic Year</label>
                <select className="form-input" style={{ appearance: 'none' }} required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                  <option value="" style={{ background: '#111' }}>Select Year</option>
                  <option style={{ background: '#111' }}>1st Year</option><option style={{ background: '#111' }}>2nd Year</option><option style={{ background: '#111' }}>3rd Year</option><option style={{ background: '#111' }}>4th Year</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="week-credit-role" style={{ display: 'block', marginBottom: '1rem', color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 'bold' }}>Positions you're applying for (Select all that apply)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem' }}>
                  {POSITIONS.map(pos => (
                    <div 
                      key={pos} 
                      onClick={() => togglePosition(pos)}
                      style={{ 
                        padding: '0.8rem 1rem', 
                        borderRadius: '8px', 
                        background: formData.positions.includes(pos) ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                        color: formData.positions.includes(pos) ? 'var(--ink)' : 'var(--white)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: formData.positions.includes(pos) ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        fontWeight: formData.positions.includes(pos) ? 'bold' : 'normal'
                      }}
                    >
                      {pos}
                    </div>
                  ))}
                </div>
                {formData.positions.includes("Others") && (
                  <div style={{ marginTop: '1rem' }}>
                    <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Specify Desired Position</label>
                    <input 
                      className="form-input" 
                      placeholder="e.g. 3D Animator, Sound Engineer" 
                      required
                      value={formData.otherPosition} 
                      onChange={e => setFormData({ ...formData, otherPosition: e.target.value })} 
                    />
                  </div>
                )}
              </div>

              {/* Photo Uploader */}
              <RecruitmentPhotoUploader photos={photos} setPhotos={setPhotos} maxPhotos={10} />

              {/* Showcase Links Section */}
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '1.5rem' }}>
                <div style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  ✧ Work Showcase Links
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                  You can paste your video editings/Google Drive link and Instagram page link below. Submitting both is not mandatory, but at least one form of showcase (photos or links) is required.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div className="form-group">
                    <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--gold)', fontSize: '0.7rem' }}>
                      Google Drive / Video Editing Link
                    </label>
                    <input 
                      className="form-input" 
                      type="url"
                      placeholder="https://drive.google.com/... or YouTube link" 
                      value={formData.driveLink} 
                      onChange={e => setFormData({...formData, driveLink: e.target.value})} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--gold)', fontSize: '0.7rem' }}>
                      Instagram Page / Profile Link
                    </label>
                    <input 
                      className="form-input" 
                      type="url"
                      placeholder="https://instagram.com/..." 
                      value={formData.instaLink} 
                      onChange={e => setFormData({...formData, instaLink: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

            </div>
            <button className="form-submit" type="submit" disabled={isSubmitting} style={{ marginTop: '2.5rem', width: '100%' }}>
              {isSubmitting ? "PROCESSING..." : <>SUBMIT APPLICATION <ArrowRight /></>}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ContributorsPage({ shuffledMembers, expandedMembers, setExpandedMembers, isMobile, setLightboxItem, siteConfig }) {
  const [displayMembers, setDisplayMembers] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const shuffle = (array) => {
      const s = [...array];
      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
      }
      return s;
    };
    if (shuffledMembers && shuffledMembers.length > 0) {
      setDisplayMembers(shuffle(shuffledMembers));
    } else {
      setDisplayMembers([]);
    }
  }, [shuffledMembers]);

  return (
    <section className="team-section" style={{ minHeight: '80vh', padding: '8rem 0' }}>
      <div className="container">
        <div className="fade-in" style={{ marginBottom: "3.5rem" }}>
          <div className="section-label">✧ The Crew Supporters</div>
          <h2 className="section-title">Club <em>Contributors</em></h2>
          <p className="section-sub">The active photographers, editors, and volunteers who contribute to the Capture Crew legacy.</p>
        </div>

        <div className="team-subcategory">
          <div className="team-grid" style={{ marginBottom: '4rem' }}>
            {displayMembers.slice(0, expandedMembers ? undefined : (isMobile ? 6 : 8)).map(m => (
              <div key={m.name || m.id} className="team-card fade-in" style={{ padding: '1.5rem 1rem', minHeight: '180px' }}>
                <div 
                  className="team-avatar" 
                  style={{ width: '50px', height: '50px', fontSize: '1rem', background: 'rgba(255,255,255,0.05)', marginBottom: '0.8rem', cursor: m.img ? 'pointer' : 'default', overflow: 'hidden' }}
                  onClick={() => {
                    if (m.img && setLightboxItem) {
                      setLightboxItem({ url: m.img, title: m.name });
                    }
                  }}
                >
                  {m.img ? <img src={getOptimizedUrl(m.img)} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📸'}
                </div>
                <div className="team-name" style={{ fontSize: '0.95rem' }}>{m.name}</div>
                {m.role && m.role !== 'Member' && (
                  <div className="team-role" style={{ fontSize: '0.65rem', color: 'var(--gold)', marginBottom: '0.3rem' }}>{m.role}</div>
                )}
                <div className="team-dept" style={{ fontSize: '0.65rem', opacity: 0.8 }}>{m.dept}</div>
                <div className="team-dept" style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '2px' }}>{m.year}</div>
              </div>
            ))}

            {!expandedMembers && shuffledMembers.length > (isMobile ? 6 : 8) && (
              <div className="team-card fade-in" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '1.5rem 1rem' }} onClick={() => setExpandedMembers(true)}>
                <div className="team-avatar" style={{ background: 'var(--gold)', color: 'var(--ink)', width: '50px', height: '50px', fontSize: '1rem' }}>
                  📂
                </div>
                <div className="team-name" style={{ color: 'var(--gold)', fontSize: '0.95rem' }}>Show All</div>
                <div className="team-role" style={{ fontSize: '0.65rem' }}>Full Contributor List</div>
                <div className="team-dept" style={{ fontSize: '0.65rem' }}>{shuffledMembers.length} Contributors</div>
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem', textAlign: 'left', fontSize: '0.85rem', lineHeight: '1.6' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--gold)', marginBottom: '1rem' }}>📌 Club Contributors Notice</h3>
            <div dangerouslySetInnerHTML={{ __html: siteConfig?.contributorsNotice || "" }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam.trim());
    }
  }, [location]);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const emailLower = email.trim().toLowerCase();
      
      const q = query(collection(db, "subscribers"), where("email", "==", emailLower));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        setStatus({ type: "error", message: "We couldn't find a subscription for that email address." });
        setLoading(false);
        return;
      }

      const batchPromises = querySnap.docs.map(document => {
        const docRef = doc(db, "subscribers", document.id);
        return updateDoc(docRef, { active: false, unsubscribedAt: new Date().toISOString() });
      });

      await Promise.all(batchPromises);

      setStatus({ 
        type: "success", 
        message: "You have been successfully unsubscribed from Capture Crew updates. We're sorry to see you go!" 
      });
      setEmail("");
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setStatus({ type: "error", message: `Failed to unsubscribe: ${err.message || err.toString()}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="verify-section" style={{ minHeight: '80vh', padding: '8rem 0' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="verify-box fade-in visible">
          <div className="section-label">✧ Subscription</div>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Unsubscribe from <em>Updates</em></h2>
          <p className="section-sub" style={{ margin: "0 auto 2.5rem", textAlign: "center" }}>
            We're sorry to see you go. Enter your email below to confirm your unsubscription from the Shutter Club.
          </p>

          <form className="verify-form" onSubmit={handleUnsubscribe} style={{ flexDirection: 'column', gap: '1.5rem' }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              disabled={loading}
            />
            <button 
              type="submit" 
              className="form-submit" 
              style={{ width: '100%', marginTop: '0', background: 'var(--gold)', color: 'var(--ink)' }}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Unsubscribe"}
            </button>
          </form>

          {status.message && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              {status.type === "success" ? (
                <div className="result-badge" style={{ display: 'block', padding: '1rem', background: 'rgba(0,255,150,0.05)', color: '#00ff96', borderRadius: '12px', border: '1px solid rgba(0,255,150,0.2)' }}>
                  ✓ {status.message}
                </div>
              ) : (
                <div style={{ padding: '1rem', background: 'rgba(255,77,77,0.05)', color: '#ff4d4d', borderRadius: '12px', border: '1px solid rgba(255,77,77,0.2)', fontSize: '0.9rem' }}>
                  {status.message}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '2.5rem', fontSize: '0.85rem' }}>
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>← Back to Homepage</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutUsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "About Us - Capture Crew";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = "Capture Crew is the official photography club of Cooch Behar Government Engineering College (CGEC). Our platform showcases campus events, fest coverage, photography projects, and memorable moments captured by our members.";
  }, []);

  return (
    <section className="verify-section" style={{ minHeight: '80vh', padding: '8rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="admin-modal glass-form fade-in visible legal-content" style={{ padding: '4rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
          <div className="section-label">✧ About Us</div>
          <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>About <em style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Capture Crew</em></h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem', color: '#ccc' }}>
            Capture Crew is the official photography club of Cooch Behar Government Engineering College (CGEC). Our platform showcases campus events, fest coverage, photography projects, and memorable moments captured by our members.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#ccc' }}>
            Visitors can explore galleries, discover event highlights, and stay updated with club activities. Google Sign-In is used to securely authenticate members and administrators, enabling access to protected features such as the Admin Console, contributor management, membership verification, and other club-related services.
          </p>
          <div style={{ marginTop: '2.5rem', fontSize: '0.85rem' }}>
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>← Back to Homepage</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy - Capture Crew";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = "Privacy Policy for Capture Crew, the official photography club of CGEC.";
  }, []);

  return (
    <section className="verify-section" style={{ minHeight: '80vh', padding: '8rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="admin-modal glass-form fade-in visible legal-content" style={{ padding: '4rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <h1>Privacy Policy</h1>
          <p>Last updated: June 05, 2026</p>
          <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
          <p>We use Your Personal Data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>
          <h2>Interpretation and Definitions</h2>
          <h3>Interpretation</h3>
          <p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
          <h3>Definitions</h3>
          <p>For the purposes of this Privacy Policy:</p>
          <ul>
            <li>
              <p><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</p>
            </li>
            <li>
              <p><strong>Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>
            </li>
            <li>
              <p><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Privacy Policy) refers to CGEC Capture Crew.</p>
            </li>
            <li>
              <p><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</p>
            </li>
            <li>
              <p><strong>Country</strong> refers to: West Bengal, India</p>
            </li>
            <li>
              <p><strong>Device</strong> means any device that can access the Service such as a computer, a cell phone or a digital tablet.</p>
            </li>
            <li>
              <p><strong>Personal Data</strong> (or "Personal Information") is any information that relates to an identified or identifiable individual.</p>
              <p>We use "Personal Data" and "Personal Information" interchangeably unless a law uses a specific term.</p>
            </li>
            <li>
              <p><strong>Service</strong> refers to the Website.</p>
            </li>
            <li>
              <p><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</p>
            </li>
            <li>
              <p><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p>
            </li>
            <li>
              <p><strong>Website</strong> refers to CGEC Capture Crew, accessible from <a href="https://www.capturecrew.site/" rel="external nofollow noopener" target="_blank">https://www.capturecrew.site/</a>.</p>
            </li>
            <li>
              <p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>
            </li>
          </ul>
          <h2>Collecting and Using Your Personal Data</h2>
          <h3>Types of Data Collected</h3>
          <h4>Personal Data</h4>
          <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
          <ul>
            <li>Email address</li>
          </ul>
          <h4>Usage Data</h4>
          <p>Usage Data is collected automatically when using the Service.</p>
          <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
          <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device's unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
          <p>We may also collect information that Your browser sends whenever You visit Our Service or when You access the Service by or through a mobile device.</p>
          <h4>Tracking Technologies and Cookies</h4>
          <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies We use include beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:</p>
          <ul>
            <li><strong>Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service.</li>
            <li><strong>Web Beacons.</strong> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).</li>
          </ul>
          <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>
          <p>Where required by law, we use non-essential cookies (such as analytics, advertising, and remarketing cookies) only with Your consent. You can withdraw or change Your consent at any time using Our cookie preferences tool (if available) or through Your browser/device settings. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.</p>
          <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
          <ul>
            <li>
              <p><strong>Necessary / Essential Cookies</strong></p>
              <p>Type: Session Cookies</p>
              <p>Administered by: Us</p>
              <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>
            </li>
            <li>
              <p><strong>Cookies Policy / Notice Acceptance Cookies</strong></p>
              <p>Type: Persistent Cookies</p>
              <p>Administered by: Us</p>
              <p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p>
            </li>
            <li>
              <p><strong>Functionality Cookies</strong></p>
              <p>Type: Persistent Cookies</p>
              <p>Administered by: Us</p>
              <p>Purpose: These Cookies allow Us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.</p>
            </li>
          </ul>
          <p>For more information about the cookies we use and your choices regarding cookies, please visit our Cookies Policy or the Cookies section of Our Privacy Policy.</p>
          <h3>Use of Your Personal Data</h3>
          <p>The Company may use Personal Data for the following purposes:</p>
          <ul>
            <li>
              <p><strong>To provide and maintain our Service</strong>, including to monitor the usage of our Service.</p>
            </li>
            <li>
              <p><strong>To manage Your Account:</strong> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</p>
            </li>
            <li>
              <p><strong>For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</p>
            </li>
            <li>
              <p><strong>To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</p>
            </li>
            <li>
              <p><strong>To provide You</strong> with news, special offers, and general information about other goods, services and events which We offer that are similar to those that you have already purchased or inquired about unless You have opted not to receive such information.</p>
            </li>
            <li>
              <p><strong>To manage Your requests:</strong> To attend and manage Your requests to Us.</p>
            </li>
            <li>
              <p><strong>For business transfers:</strong> We may use Your Personal Data to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.</p>
            </li>
            <li>
              <p><strong>For other purposes</strong>: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</p>
            </li>
          </ul>
          <p>We may share Your Personal Data in the following situations:</p>
          <ul>
            <li><strong>With Service Providers:</strong> We may share Your Personal Data with Service Providers to monitor and analyze the use of our Service, to contact You.</li>
            <li><strong>For business transfers:</strong> We may share or transfer Your Personal Data in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>
            <li><strong>With Affiliates:</strong> We may share Your Personal Data with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.</li>
            <li><strong>With business partners:</strong> We may share Your Personal Data with Our business partners to offer You certain products, services or promotions.</li>
            <li><strong>With other users:</strong> If Our Service offers public areas, when You share Personal Data or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside.</li>
            <li><strong>With Your consent</strong>: We may disclose Your Personal Data for any other purpose with Your consent.</li>
          </ul>
          <h3>Retention of Your Personal Data</h3>
          <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if We are required to retain Your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
          <p>Where possible, We apply shorter retention periods and/or reduce identifiability by deleting, aggregating, or anonymizing data. Unless otherwise stated, the retention periods below are maximum periods ("up to") and We may delete or anonymize data sooner when it is no longer needed for the relevant purpose. We apply different retention periods to different categories of Personal Data based on the purpose of processing and legal obligations:</p>
          <ul>
            <li>
              <p>Account Information</p>
              <ul>
                <li>User Accounts: retained for the duration of your account relationship plus up to 24 months after account closure to handle any post-termination issues or resolve disputes.</li>
              </ul>
            </li>
            <li>
              <p>Customer Support Data</p>
              <ul>
                <li>Support tickets and correspondence: up to 24 months from the date of ticket closure to resolve follow-up inquiries, track service quality, and defend against potential legal claims</li>
                <li>Chat transcripts: up to 24 months for quality assurance and staff training purposes.</li>
              </ul>
            </li>
            <li>
              <p>Usage Data</p>
              <ul>
                <li>
                  <p>Website analytics data (cookies, IP addresses, device identifiers): up to 24 months from the date of collection, which allows us to analyze trends while respecting privacy principles.</p>
                </li>
                <li>
                  <p>Server logs (IP addresses, access times): up to 24 months for security monitoring and troubleshooting purposes.</p>
                </li>
              </ul>
            </li>
          </ul>
          <p>Usage Data is retained in accordance with the retention periods described above, and may be retained longer only where necessary for security, fraud prevention, or legal compliance.</p>
          <p>We may retain Personal Data beyond the periods stated above for different reasons:</p>
          <ul>
            <li>Legal obligation: We are required by law to retain specific data (e.g., financial records for tax authorities).</li>
            <li>Legal claims: Data is necessary to establish, exercise, or defend legal claims.</li>
            <li>Your explicit request: You ask Us to retain specific information.</li>
            <li>Technical limitations: Data exists in backup systems that are scheduled for routine deletion.</li>
          </ul>
          <p>You may request information about how long We will retain Your Personal Data by contacting Us.</p>
          <p>When retention periods expire, We securely delete or anonymize Personal Data according to the following procedures:</p>
          <ul>
            <li>Deletion: Personal Data is removed from Our systems and no longer actively processed.</li>
            <li>Backup retention: Residual copies may remain in encrypted backups for a limited period consistent with our backup retention schedule and are not restored except where necessary for security, disaster recovery, or legal compliance.</li>
            <li>Anonymization: In some cases, We convert Personal Data into anonymous statistical data that cannot be linked back to You. This anonymized data may be retained indefinitely for research and analytics.</li>
          </ul>
          <h3>Transfer of Your Personal Data</h3>
          <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ from those from Your jurisdiction.</p>
          <p>Where required by applicable law, We will ensure that international transfers of Your Personal Data are subject to appropriate safeguards and supplementary measures where appropriate. The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.</p>
          <h3>Delete Your Personal Data</h3>
          <p>You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>
          <p>Our Service may give You the ability to delete certain information about You from within the Service.</p>
          <p>You may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the account settings section that allows you to manage Your personal information. You may also contact Us to request access to, correct, or delete any Personal Data that You have provided to Us.</p>
          <p>Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.</p>
          <h3>Disclosure of Your Personal Data</h3>
          <h4>Business Transactions</h4>
          <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
          <h4>Law enforcement</h4>
          <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>
          <h4>Other legal requirements</h4>
          <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
          <ul>
            <li>Comply with a legal obligation</li>
            <li>Protect and defend the rights or property of the Company</li>
            <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
            <li>Protect the personal safety of Users of the Service or the public</li>
            <li>Protect against legal liability</li>
          </ul>
          <h3>Security of Your Personal Data</h3>
          <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
          <h2>Children's Privacy</h2>
          <p>Our Service does not address anyone under the age of 16. We do not knowingly collect personally identifiable information from anyone under the age of 16. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 16 without verification of parental consent, We take steps to remove that information from Our servers.</p>
          <p>If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent's consent before We collect and use that information.</p>
          <h2>Links to Other Websites</h2>
          <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
          <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>
          <h2>Changes to this Privacy Policy</h2>
          <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
          <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.</p>
          <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, You can contact us:</p>
          <ul>
            <li>By email: <a href="mailto:contact@capturecrew.site">contact@capturecrew.site</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function TermsConditionsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Terms of Service - Capture Crew";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = "Terms of Service for Capture Crew, the official photography club of CGEC.";
  }, []);

  return (
    <section className="verify-section" style={{ minHeight: '80vh', padding: '8rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="admin-modal glass-form fade-in visible legal-content" style={{ padding: '4rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <h1>Terms and Conditions</h1>
          <p>Last updated: June 05, 2026</p>
          <p>Please read these terms and conditions carefully before using Our Service.</p>
          <h2>Interpretation and Definitions</h2>
          <h3>Interpretation</h3>
          <p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
          <h3>Definitions</h3>
          <p>For the purposes of these Terms and Conditions:</p>
          <ul>
            <li>
              <p><strong>Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>
            </li>
            <li>
              <p><strong>Country</strong> refers to: West Bengal, India</p>
            </li>
            <li>
              <p><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in these Terms and Conditions) refers to CGEC Capture Crew.</p>
            </li>
            <li>
              <p><strong>Device</strong> means any device that can access the Service such as a computer, a cell phone or a digital tablet.</p>
            </li>
            <li>
              <p><strong>Service</strong> refers to the Website.</p>
            </li>
            <li>
              <p><strong>Terms and Conditions</strong> (also referred to as "Terms") means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service.</p>
            </li>
            <li>
              <p><strong>Third-Party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service.</p>
            </li>
            <li>
              <p><strong>Website</strong> refers to CGEC Capture Crew, accessible from <a href="https://www.capturecrew.site/" rel="external nofollow noopener" target="_blank">https://www.capturecrew.site/</a></p>
            </li>
            <li>
              <p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>
            </li>
          </ul>
          <h2>Acknowledgment</h2>
          <p>These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
          <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
          <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
          <p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>
          <p>Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.</p>
          <h2>Links to Other Websites</h2>
          <p>Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.</p>
          <p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such websites or services.</p>
          <p>We strongly advise You to read the terms and conditions and privacy policies of any third-party websites or services that You visit.</p>
          <h3>Links from a Third-Party Social Media Service</h3>
          <p>The Service may display, include, make available, or link to content or services provided by a Third-Party Social Media Service. A Third-Party Social Media Service is not owned or controlled by the Company, and the Company does not endorse or assume responsibility for any Third-Party Social Media Service.</p>
          <p>You acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with Your access to or use of any Third-Party Social Media Service, including any content, goods, or services made available through them. Your use of any Third-Party Social Media Service is governed by that Third-Party Social Media Service's terms and privacy policies.</p>
          <h2>Termination</h2>
          <p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>
          <p>Upon termination, Your right to use the Service will cease immediately.</p>
          <h2>Limitation of Liability</h2>
          <p>Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.</p>
          <p>To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.</p>
          <p>Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party's liability will be limited to the greatest extent permitted by law.</p>
          <h2>"AS IS" and "AS AVAILABLE" Disclaimer</h2>
          <p>The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.</p>
          <p>Without limiting the foregoing, neither the Company nor any of the company's provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.</p>
          <p>Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.</p>
          <h2>Governing Law</h2>
          <p>The laws of the Country, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
          <h2>Disputes Resolution</h2>
          <p>If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.</p>
          <h2>For European Union (EU) Users</h2>
          <p>If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.</p>
          <h2>United States Legal Compliance</h2>
          <p>You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a "terrorist supporting" country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.</p>
          <h2>Severability and Waiver</h2>
          <h3>Severability</h3>
          <p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>
          <h3>Waiver</h3>
          <p>Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party's ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.</p>
          <h2>Translation Interpretation</h2>
          <p>These Terms and Conditions may have been translated if We have made them available to You on our Service.
          You agree that the original English text shall prevail in the case of a dispute.</p>
          <h2>Changes to These Terms and Conditions</h2>
          <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
          <p>By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the Service.</p>
          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
          <ul>
            <li>By email: <a href="mailto:contact@capturecrew.site">contact@capturecrew.site</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
}

// ✦✦✦ NEWSLETTER SECTION COMPONENT ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦
function NewsletterSection({ siteConfig }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const emailLower = email.trim().toLowerCase();
      // Check if already subscribed
      const q = query(collection(db, "subscribers"), where("email", "==", emailLower));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const docData = querySnap.docs[0].data();
        if (docData.active) {
          setStatus({ type: "error", message: "You are already subscribed to our newsletter!" });
          setLoading(false);
          return;
        } else {
          // Reactivate subscription
          const docRef = doc(db, "subscribers", querySnap.docs[0].id);
          await updateDoc(docRef, { active: true, name: name.trim(), subscribedAt: new Date().toISOString() });
          setStatus({ type: "success", message: "Thank you for subscribing back to CGEC Capture Crew!" });
          setName("");
          setEmail("");
          setIsSubscribed(true);
          setLoading(false);
          return;
        }
      }

      // Add new subscriber
      await addDoc(collection(db, "subscribers"), {
        name: name.trim(),
        email: emailLower,
        subscribedAt: new Date().toISOString(),
        active: true
      });

      try {
        const senderName = (siteConfig?.emailSenderName || "Capture Crew").replace(/"/g, '');
        const senderAddress = siteConfig?.emailSenderAddress || "newsletter@capturecrew.site";
        const replyToAddress = siteConfig?.emailReplyTo || "newsletter@capturecrew.site";
        const fromField = `"${senderName}" <${senderAddress}>`;
        const subName = name.trim();
        const unsubscribeUrl = `https://www.capturecrew.site/unsubscribe?email=${encodeURIComponent(emailLower)}`;

        const welcomeHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0B; color: #fff; padding: 2rem; border-radius: 16px; border: 1px solid #222;">
                <div style="text-align: center; border-bottom: 1px solid #222; padding-bottom: 1.5rem; margin-bottom: 2rem;">
                  <img src="https://res.cloudinary.com/dwp7fe7bo/image/upload/v1780682580/554399431_17944411011051405_1793754745012835189_n_qmgbm8.jpg" alt="Capture Crew Logo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 1.5px solid #C9A96E; display: inline-block;" />
                  <h1 style="color: #C9A96E; font-size: 24px; margin: 0;">Capture Crew</h1>
                  <p style="color: #888; font-size: 11px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Capturing Moments · Creating Memories</p>
                </div>
                
                <h2 style="color: #fff; font-size: 20px; font-weight: normal; margin-bottom: 1.5rem;">Welcome to Capture Crew, ${subName}! 📸</h2>
                
                <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin-bottom: 1.5rem;">
                  Thank you for subscribing to <strong>Capture Crew</strong>, the Photography Club of CGEC.
                </p>
                
                <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin-bottom: 1.5rem;">
                  <strong>Exploring the World through the CGEC Lens</strong>, we're excited to have you as part of our community of photographers, storytellers, and memory-makers.
                </p>

                <h3 style="color: #C9A96E; font-size: 16px; margin-top: 2rem; margin-bottom: 1rem;">Here's what you'll receive as a subscriber:</h3>
                <ul style="color: #ccc; font-size: 15px; line-height: 1.8; margin-bottom: 2rem; padding-left: 1.5rem; list-style-type: none;">
                  <li style="margin-bottom: 0.8rem;">📸 Notifications of new featured captures and gallery updates</li>
                  <li style="margin-bottom: 0.8rem;">🎉 Announcements of upcoming campus events, fests, and coverage</li>
                  <li style="margin-bottom: 0.8rem;">🏆 Updates on Capture Crew activities, challenges, and special projects</li>
                  <li style="margin-bottom: 0.8rem;">🌟 Behind-the-scenes stories from our creative journeys</li>
                  <li style="margin-bottom: 0.8rem;">📢 Real-time updates when new showcases and collections go live</li>
                </ul>

                <div style="text-align: center; margin-bottom: 2.5rem;">
                  <a href="https://www.capturecrew.site" style="background-color: #C9A96E; color: #111; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Explore our Website</a>
                </div>

                <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin-bottom: 2rem;">
                  Thank you for joining us as we continue <strong>Capturing Moments · Creating Memories</strong> through the lens of CGEC.
                </p>

                <div style="border-top: 1px solid #222; padding-top: 1.5rem; margin-top: 2.5rem; font-size: 13px; color: #ccc; line-height: 1.6;">
                  <p style="margin: 0; font-weight: bold;">Warm regards,</p>
                  <p style="margin: 5px 0 0 0; color: #C9A96E; font-weight: bold;">Capture Crew</p>
                  <p style="margin: 2px 0 0 0; font-size: 12px; color: #888;">Photography Club of CGEC</p>
                  <p style="margin: 2px 0 0 0; font-size: 11px; color: #666; font-style: italic;">Exploring the World through the CGEC Lens</p>
                </div>

                <div style="text-align: center; border-top: 1px solid #111; padding-top: 1rem; margin-top: 2rem; font-size: 11px; color: #555;">
                  <p style="margin: 0 0 5px 0;">You received this email because you subscribed to Capture Crew updates.</p>
                  <p style="margin: 0;">&copy; 2026 Capture Crew. Photography Club of CGEC.</p>
                  <p style="margin: 5px 0 0 0;">If you did not sign up for this, you can <a href="${unsubscribeUrl}" style="color: #888888; text-decoration: underline;">unsubscribe here</a>.</p>
                </div>
              </div>
        `;

        const welcomeText = `Hi ${subName},

Thanks for joining the CGEC Capture Crew! We're excited to have you in our community of photographers, storytellers, and visual creators.

Here is what you'll get as a member of our Shutter Club:
- Notifications when we publish new featured weekly or monthly captures.
- Early announcements of fests, photography contests, and event coverages.
- Behind-the-scenes stories and tutorials from our creative journeys.

Two quick things to help get us connected:
1. Please add ${replyToAddress} to your contacts list so our updates don't get lost in spam or promotional folders.
2. Hit reply to this email and let us know: what kind of camera do you shoot with (even a phone!), and what's your favorite subject to photograph? We read every response and would love to hear from you!

You can browse our current galleries and member profiles on our website: https://www.capturecrew.site

Warmly,
Capture Crew Team
Cooch Behar Government Engineering College

--
If you did not sign up for this, you can unsubscribe here: ${unsubscribeUrl}`;

        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromField,
            to: emailLower,
            subject: "Welcome to Capture Crew! 📸",
            html: welcomeHtml,
            text: welcomeText,
            reply_to: replyToAddress
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Server returned ${response.status}: ${errText}`);
        }
      } catch (welcomeErr) {
        console.error("Failed to send welcome email:", welcomeErr);
        throw welcomeErr;
      }

      setStatus({ type: "success", message: "Welcome to Capture Crew Club! You have successfully subscribed." });
      setName("");
      setEmail("");
      setIsSubscribed(true);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: `Subscription failed: ${err.message || err.toString()}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-card fade-in">
          <div className="section-label">✧ Newsletter</div>
          <h2 className="newsletter-title">Join the <em>Shutter Club</em></h2>
          <p className="newsletter-desc">
            Subscribe to our photography newsletter to receive notifications whenever new photos, fests, fests coverage, or internal events are added.
          </p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input 
              type="text" 
              className="form-input newsletter-input" 
              placeholder="Your Name" 
              required 
              value={name} 
              onChange={e => { setName(e.target.value); setIsSubscribed(false); }} 
              disabled={loading}
            />
            <input 
              type="email" 
              className="form-input newsletter-input" 
              placeholder="Your Email" 
              required 
              value={email} 
              onChange={e => { setEmail(e.target.value); setIsSubscribed(false); }} 
              disabled={loading}
            />
            {/* From Uiverse.io by mahiatlinux (Adapted for Capture Crew theme) */}
            <button className={`button ${isSubscribed ? "is-sent" : ""}`} type="submit" disabled={loading}>
              <div className="outline"></div>
              <div className="state state--default">
                <div className="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    height="1em"
                    width="1em"
                  >
                    <g style={{ filter: "url(#shadow)" }}>
                      <path
                        fill="currentColor"
                        d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z"
                      ></path>
                      <path
                        fill="currentColor"
                        d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z"
                      ></path>
                    </g>
                    <defs>
                      <filter id="shadow">
                        <feDropShadow
                          floodOpacity="0.5"
                          stdDeviation="0.6"
                          dy="1"
                          dx="0"
                        ></feDropShadow>
                      </filter>
                    </defs>
                  </svg>
                </div>
                <p>
                  <span style={{ "--i": 0 }}>S</span>
                  <span style={{ "--i": 1 }}>u</span>
                  <span style={{ "--i": 2 }}>b</span>
                  <span style={{ "--i": 3 }}>s</span>
                  <span style={{ "--i": 4 }}>c</span>
                  <span style={{ "--i": 5 }}>r</span>
                  <span style={{ "--i": 6 }}>i</span>
                  <span style={{ "--i": 7 }}>b</span>
                  <span style={{ "--i": 8 }}>e</span>
                </p>
              </div>
              <div className="state state--sent">
                <div className="icon">
                  <svg
                    stroke="black"
                    strokeWidth="0.5px"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g style={{ filter: "url(#shadow)" }}>
                      <path
                        d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z"
                        fill="currentColor"
                      ></path>
                    </g>
                  </svg>
                </div>
                <p>
                  <span style={{ "--i": 0 }}>S</span>
                  <span style={{ "--i": 1 }}>u</span>
                  <span style={{ "--i": 2 }}>b</span>
                  <span style={{ "--i": 3 }}>s</span>
                  <span style={{ "--i": 4 }}>c</span>
                  <span style={{ "--i": 5 }}>r</span>
                  <span style={{ "--i": 6 }}>i</span>
                  <span style={{ "--i": 7 }}>b</span>
                  <span style={{ "--i": 8 }}>e</span>
                  <span style={{ "--i": 9 }}>d</span>
                </p>
              </div>
            </button>
          </form>
          {status.message && (
            <div className={`newsletter-status ${status.type}`}>
              {status.type === "success" ? "✓ " : "✕ "} {status.message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ContactUsPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Contact Us - Capture Crew";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = "Contact Capture Crew — Photography Club of CGEC.";
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "info", message: "Sending message..." });

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: "contact@capturecrew.site",
          reply_to: formData.email,
          subject: `Contact Us: ${formData.subject}`,
          html: `
            <h2>New Contact Us Message</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p>${formData.message.replace(/\\n/g, '<br/>')}</p>
          `
        }),
      });

      if (response.ok) {
        setStatus({ type: "success", message: "Your message has been sent successfully. We'll get back to you soon!" });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const errorData = await response.json();
        setStatus({ type: "error", message: errorData.error || "Failed to send message. Please try again later." });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus({ type: "error", message: "An error occurred. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="verify-section" style={{ minHeight: '80vh', padding: '8rem 0' }}>
      <div className="container" style={{ maxWidth: '900px', padding: '0 1rem' }}>
        <div className="admin-modal glass-form fade-in visible legal-content contact-page-card">
          
          <div className="section-label" style={{ textAlign: 'center' }}>✧ Get in Touch</div>
          <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem', textAlign: 'center' }}>Contact <em style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Us</em></h1>
          
          <p style={{ fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '2.5rem', color: '#ccc', textAlign: 'center' }}>
            We’d love to hear from you. Whether you have questions, suggestions, collaboration ideas, or need support, feel free to reach out to us.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '3rem' }}>
            <div className="contact-info-box">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--gold)' }}>Contact Info</h2>
              <ul className="contact-info-list">
                <li>📍 <strong>Organization:</strong> Capture Crew — Photography Club of CGEC</li>
                <li>🌐 <strong>Website:</strong> <a href="https://www.capturecrew.site/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>https://www.capturecrew.site/</a></li>
                <li>📧 <strong>Email:</strong> <a href="mailto:contact@capturecrew.site" style={{ color: 'var(--gold)' }}>contact@capturecrew.site</a></li>
              </ul>
              
              <h3 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '0.5rem', color: '#fff' }}>Response Time</h3>
              <p style={{ color: '#ccc', fontSize: '0.95rem' }}>We usually respond within <strong>24–48 hours</strong> depending on the volume of messages.</p>

              <h3 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '0.5rem', color: '#fff' }}>Note</h3>
              <p style={{ color: '#ccc', fontSize: '0.95rem' }}>For urgent matters related to events, contributions, or technical issues, please mention <strong>“URGENT”</strong> in your subject line.</p>
            </div>
            
            <div className="contact-form-box">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', color: 'var(--gold)' }}>Send Us a Message</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Name <span style={{ color: 'var(--gold)' }}>*</span></label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name" 
                    className="form-input" 
                    style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Email <span style={{ color: 'var(--gold)' }}>*</span></label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email address" 
                    className="form-input" 
                    style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Subject <span style={{ color: 'var(--gold)' }}>*</span></label>
                  <input 
                    type="text" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Enter subject" 
                    className="form-input" 
                    style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Message <span style={{ color: 'var(--gold)' }}>*</span></label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Write your message here" 
                    className="form-input" 
                    style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', minHeight: '150px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                
                {status.message && (
                  <div style={{ 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    background: status.type === 'success' ? 'rgba(0, 255, 150, 0.1)' : status.type === 'error' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(255, 255, 255, 0.1)', 
                    color: status.type === 'success' ? '#00ff96' : status.type === 'error' ? '#ff4d4d' : '#fff',
                    border: `1px solid ${status.type === 'success' ? 'rgba(0, 255, 150, 0.3)' : status.type === 'error' ? 'rgba(255, 77, 77, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}>
                    {status.message}
                  </div>
                )}

                <button className="uiverse-submit-btn" type="submit" disabled={loading}>
                  <div className="outline"></div>
                  <div className="state state--default">
                    <div className="icon">
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22 2L11 13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 2L15 22L11 13L2 9L22 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p>
                      <span style={{ '--i': 1 }}>S</span>
                      <span style={{ '--i': 2 }}>e</span>
                      <span style={{ '--i': 3 }}>n</span>
                      <span style={{ '--i': 4 }}>d</span>
                      <span style={{ '--i': 5 }}>&nbsp;</span>
                      <span style={{ '--i': 6 }}>M</span>
                      <span style={{ '--i': 7 }}>e</span>
                      <span style={{ '--i': 8 }}>s</span>
                      <span style={{ '--i': 9 }}>s</span>
                      <span style={{ '--i': 10 }}>a</span>
                      <span style={{ '--i': 11 }}>g</span>
                      <span style={{ '--i': 12 }}>e</span>
                    </p>
                  </div>
                  <div className="state state--sent">
                    <div className="icon">
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p>
                      <span style={{ '--i': 1 }}>S</span>
                      <span style={{ '--i': 2 }}>e</span>
                      <span style={{ '--i': 3 }}>n</span>
                      <span style={{ '--i': 4 }}>t</span>
                    </p>
                  </div>
                </button>
              </form>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: '#ccc', marginBottom: '0.5rem' }}>Thank you for being part of the Capture Crew community.</p>
            <p style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '1.1rem' }}>Every message matters to us.</p>
            <div style={{ marginTop: '2rem', fontSize: '0.85rem' }}>
              <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>← Back to Homepage</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


