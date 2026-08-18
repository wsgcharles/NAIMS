import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('public/images');

function generateSVG(title, subtitle, category, bgGradientFrom = '#3B0764', bgGradientTo = '#1E1B4B') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradientFrom}" />
      <stop offset="50%" stop-color="#4C1D95" />
      <stop offset="100%" stop-color="${bgGradientTo}" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Background Canvas -->
  <rect width="800" height="500" fill="url(#grad)" />
  
  <!-- Subtle Architectural Grid Pattern -->
  <g opacity="0.08" stroke="#FFFFFF" stroke-width="1">
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="none"/>
      <path d="M 40 0 L 0 0 0 40"/>
    </pattern>
    <rect width="800" height="500" fill="url(#grid)" />
  </g>

  <!-- Category Badge -->
  <g transform="translate(60, 60)">
    <rect width="180" height="32" rx="16" fill="#FACC15" />
    <text x="90" y="21" fill="#3B0764" font-family="'Inter', sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="1.5">${category.toUpperCase()}</text>
  </g>

  <!-- Decorative Crest Emblem Circle -->
  <g transform="translate(680, 80)" opacity="0.2">
    <circle cx="0" cy="0" r="100" fill="none" stroke="#FACC15" stroke-width="4" />
    <circle cx="0" cy="0" r="80" fill="none" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- Title & Subtitle Container -->
  <g transform="translate(60, 320)" filter="url(#shadow)">
    <text x="0" y="0" fill="#FACC15" font-family="'Inter', sans-serif" font-size="13" font-weight="800" letter-spacing="2">NOAH'S ACADEMY INCORPORATED · TAGUIG CITY</text>
    <text x="0" y="42" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="32" font-weight="900">${title}</text>
    <text x="0" y="76" fill="#E9D5FF" font-family="'Inter', sans-serif" font-size="16" font-weight="600">${subtitle}</text>
  </g>
</svg>`;
}

const assets = [
  // Campus Facilities
  { path: 'campus/entrance.svg', title: 'Main Campus Gate & Entrance', subtitle: 'Signal Village, Taguig City', cat: 'School Facility' },
  { path: 'campus/building.svg', title: 'Main Academic Building', subtitle: 'Modern Multistory Learning Classrooms', cat: 'School Facility' },
  { path: 'campus/classrooms.svg', title: 'Air-Conditioned Classrooms', subtitle: 'Interactive Learning & Multimedia Projectors', cat: 'School Facility' },
  { path: 'campus/library.svg', title: 'Institutional Learning Resource Library', subtitle: 'Digital Reference Catalog & Reading Halls', cat: 'School Facility' },
  { path: 'campus/computer-lab.svg', title: 'ICT Support & Computer Laboratory', subtitle: 'High-Speed Workstations & Software Engineering Labs', cat: 'School Facility' },
  { path: 'campus/covered-court.svg', title: 'Multi-Purpose Athletic Covered Court', subtitle: 'Sports Tournaments & Institutional Assemblies', cat: 'School Facility' },
  
  // Hero Images
  { path: 'hero/campus-hero.svg', title: 'Noah\'s Academy Incorporated', subtitle: 'Excellence in Education, Virtue in Character · Taguig City', cat: 'Official Campus' },

  // News Highlights
  { path: 'news/graduation-2026.svg', title: 'Annual Commencement & Graduation Exercises', subtitle: 'Celebrating Batch 2026 Senior High Graduates', cat: 'Graduation' },
  { path: 'news/moving-up-2026.svg', title: 'Junior High Moving-Up Ceremony', subtitle: 'Honoring Grade 10 Completers Moving to Senior High', cat: 'Academic Ceremony' },
  { path: 'news/buwan-ng-wika.svg', title: 'Buwan ng Wika Cultural Showcase', subtitle: 'Patriotic Songs, Folk Dances & Literary Recitals', cat: 'Cultural Festival' },
  { path: 'news/teachers-day.svg', title: 'World Teachers\' Day Tribute', subtitle: 'Honoring Dedicated Educators of Noah\'s Academy', cat: 'Faculty Event' },
  { path: 'news/foundation-day.svg', title: '24th Foundation Day Celebration', subtitle: 'Institutional Parade, Talent Competition & Sportsfest', cat: 'Foundation Anniversary' },
  { path: 'news/united-nations.svg', title: 'United Nations Day Pageant & Parade', subtitle: 'Global Heritage & Cultural Attire Presentation', cat: 'Student Life' },

  // Events Highlights
  { path: 'events/sportsfest.svg', title: 'Annual Intramurals & Sportsfest', subtitle: 'Basketball, Volleyball & Track & Field Championships', cat: 'Sports Festival' },
  { path: 'events/christmas-program.svg', title: 'Annual Christmas Choral & Gift Giving', subtitle: 'Schoolwide Yuletide Celebration & Community Outreach', cat: 'School Program' },
  { path: 'events/nutrition-month.svg', title: 'Nutrition Month Culinary & Poster Exhibit', subtitle: 'Promoting Healthy Living & Cooking Demonstrations', cat: 'Health & Wellness' },
  { path: 'events/reading-month.svg', title: 'National Reading Month Book Fair', subtitle: 'Storytelling Sessions & Literary Character Costume Contest', cat: 'Academic Program' },
  { path: 'events/science-fair.svg', title: 'ASSH & ICT Innovation Research Fair', subtitle: 'Student Scientific Research & Enterprise Projects', cat: 'Academic Exhibition' },
  { path: 'events/parent-orientation.svg', title: 'Parent-Teacher Orientation & Portal Briefing', subtitle: 'NAISIS Student Ledger & Gradebook Orientation', cat: 'Parent Advisory' },

  // Gallery Categories
  { path: 'gallery/graduation/grad-1.svg', title: 'Senior High Graduation Ceremony', subtitle: 'Official Diploma Awarding & Valedictory Address', cat: 'Graduation' },
  { path: 'gallery/recognition/rec-1.svg', title: 'Academic Honors & Leadership Awards', subtitle: 'Recognizing Academic Excellence & Character Virtues', cat: 'Recognition Day' },
  { path: 'gallery/teachers-day/td-1.svg', title: 'Teachers\' Day Student Performances', subtitle: 'Tribute Songs & Student Council Presentation', cat: 'Teachers\' Day' },
  { path: 'gallery/foundation-day/fd-1.svg', title: 'Foundation Day Campus Parade', subtitle: 'Drum & Lyre Band Performance in Taguig City', cat: 'Foundation Day' },
  { path: 'gallery/buwan-ng-wika/bw-1.svg', title: 'Balagtasan & Sabayang Bigkas Contest', subtitle: 'Preserving Filipino Language & Cultural Heritage', cat: 'Buwan ng Wika' },
  { path: 'gallery/united-nations/un-1.svg', title: 'United Nations Costume Parade', subtitle: 'Elementary & High School International Parade', cat: 'United Nations' },
  { path: 'gallery/sportsfest/sf-1.svg', title: 'Intramurals Championship Game', subtitle: 'Senior High Inter-House Basketball Tournament', cat: 'Sports Fest' },
  { path: 'gallery/performances/pf-1.svg', title: 'Annual Cultural & Musical Presentation', subtitle: 'Student Dance Troupe & Choir Concert', cat: 'Performances' },
  { path: 'gallery/activities/act-1.svg', title: 'Student Council Leadership Workshop', subtitle: 'Team Building & Youth Leadership Seminar', cat: 'Student Life' },
];

assets.forEach(asset => {
  const fullPath = path.join(baseDir, asset.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, generateSVG(asset.title, asset.subtitle, asset.cat));
  console.log(`Generated: ${asset.path}`);
});
