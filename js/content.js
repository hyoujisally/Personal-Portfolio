// ======================================================================
// CONTENT: the pieces in the portfolio and their write-ups. This is the file to edit.
//
// PART 1  PROJECTS: the list of pages, in display order (contents page, Works menu, Previous/Next).
// PART 2  DETAILS:  one write-up per project, matched to PROJECTS by id.
// PART 3  Fallback panels, shown for any project that has no DETAILS entry yet.
// ======================================================================

// ---------------------------------------------------------------------
// PART 1: PROJECTS
// ---------------------------------------------------------------------
const PROJECTS = [
  // ---- Works ----
  { id: 'work-1', group: 'Works', no: 'No. 1', title: 'Warner Music Group (Internship)', type: 'Digital Operations, 2026',
    summary: 'Designed and executed various automated workflows for the Digital Specialty Products team to streamline operations, such as focusing on improving efficiency in video claiming for Atlantic Records.' },
  { id: 'work-2', group: 'Works', no: 'No. 2', title: 'Credit Karma Client Project (IN PROGRESS)', type: 'Digital Product Design, 2026',
    summary: 'Ongoing client project researching how Credit Karma can become a daily money habit for Gen Z, using survey data, statistical analysis, and a research-based persona to decide what to prototype first.' },
  { id: 'work-3', group: 'Works', no: 'No. 3', title: 'Polaris - FigBuild 2026', type: 'Hackathon, 2026',
    summary: 'Collaborative project addressing how to digitally interpret sensory experiences during the 2026 FigBuild Hackathon.' },
  { id: 'work-4', group: 'Works', no: 'No. 4', title: 'User Research: CradleWave', type: 'Human-Centered Product Design, 2026',
    summary: 'The user research and design process behind CradleWave, an on-land roll-tacking simulation tool for the Northwestern Sailing Team.' },
  { id: 'work-5', group: 'Works', no: 'No. 5', title: 'Glow&Go', type: 'HCI, 2025',
    summary: 'HCI capstone project addressing user pain points in long-distance communication.' },
  { id: 'work-6', group: 'Works', no: 'No. 6', title: 'Animal Crossing: New Horizons Dashboard', type: 'Data Visualization, 2024',
    summary: 'Data dashboard for the game Animal Crossing: New Horizons.' },

  // ---- Creatives ----
  { id: 'creative-1', group: 'Creatives', no: 'I.', title: 'Live Concert Photography', type: 'Photography',
    summary: 'A collection of photos captured during live music performances I’ve attended.' },
  { id: 'creative-2', group: 'Creatives', no: 'II.', title: 'Digital Fashion and the Body', type: 'Fashion Design & Art Direction',
    summary: 'Three-garment series exploring the abstract relationship between time and physical form.' },
  { id: 'creative-3', group: 'Creatives', no: 'III.', title: 'Magazine Templates and Layouts', type: 'Graphic Design',
    summary: 'Experimental compositions built around rhythm, typography, and contrast.' },
  { id: 'creative-4', group: 'Creatives', no: 'IV.', title: 'Film Analysis', type: 'Cinema',
    summary: 'Analysis of narrative techniques and visual storytelling in contemporary cinema.' },

  // ---- About (keep last) ----
  { id: 'about', group: 'About', no: '', title: 'About', type: 'A short introduction',
    summary: 'Hello! My name is Hyouji (or Sally is good too). I’d like to describe myself as a data-driven thinker with a creative heart and a passion for empathetic digital product design.' }
];

// ---------------------------------------------------------------------
// PART 2: DETAILS
// Declared ONCE here. Every project below is added with DETAILS['id'] = { ... }.
// A project with no entry shows its summary plus the process-led fallback panels (Part 3).
//
// Each panel is either a section { h: 'Heading', p: ['paragraph', ...] } or an image { fig: 'Label', cap: 'Caption' }.
// The frame on the left page is optional. It appears only when a piece has media, and shows an image or a live website:
//   cover: 'images/cradlewave-cover.jpg'        piece-level image, shown first (in monochrome) when the piece opens
//   embed: 'https://your-site.example'          piece-level website, shown in the frame instead of an image
//   { h: 'Prototype 1', p: [...], img: 'images/cradlewave-prototype.jpg', alt: 'Describe the image' }   an image for one section
//   { h: 'Final build', p: [...], embed: 'https://your-site.example' }                                  a website for one section
//   { fig: 'Final report', cap: '...', src: 'images/cradlewave-report.jpg', alt: '...' }               (also shown in the description)
//   { figs: [ { fig, cap, src, alt }, { fig, cap, src, alt } ] }   two or more images set side by side (pointing at one shows it in the frame)
// A section with no media keeps showing the nearest picture or site above it. A piece with none hides the frame entirely.
// Some sites refuse to be embedded, so the frame always carries an "Open the site" link as a fallback.
// Write each section as evidence for a decision: what you observed, how you tested it, and what you changed because of it.
// Short lines at the start of a section (like "Team of 5") are set as a small list of facts.
// ---------------------------------------------------------------------
const DETAILS = {};

// Concert photos are kept in artist folders and listed in display order.
const CONCERT_PHOTO_GROUPS = [
  {
    artist: 'Men I Trust',
    folder: 'm',
    files: Array.from({ length: 21 }, (_, i) => `m${i + 1}.jpeg`)
  },
  {
    artist: 'Suki Waterhouse',
    folder: 'sw',
    files: ['sw.jpeg', ...Array.from({ length: 16 }, (_, i) => `sw${i + 1}.jpeg`)]
  },
  {
    artist: 'Dominic Fike',
    folder: 'df',
    files: Array.from({ length: 13 }, (_, i) => `df${i + 1}.jpeg`)
  },
  {
    artist: 'Rochelle',
    folder: 'r',
    files: Array.from({ length: 3 }, (_, i) => `r${i + 1}.jpeg`)
  },
  {
    artist: 'Smashing Pumpkins',
    folder: 'sp',
    files: Array.from({ length: 5 }, (_, i) => `sm${i + 1}.jpeg`)
  }
];

// An artist with more photos than this is split in two, each half in its own popup as you scroll.
const PHOTOS_PER_POPUP = 12;

DETAILS['creative-1'] = {
  cover: 'images/concert_photos/m/m1.jpeg',
  panels: CONCERT_PHOTO_GROUPS.flatMap(({ artist, folder, files }) => {
    // all of an artist's photos in one group each: they sit next to each other (a grid) instead of in a long column
    const photos = files.map((file, i) => ({
      fig: `${artist} — Photo ${i + 1}`,
      cap: '',
      src: `images/concert_photos/${folder}/${file}`,
      alt: `${artist} concert photograph ${i + 1}`
    }));
    const half = Math.ceil(photos.length / 2);
    const parts = photos.length > PHOTOS_PER_POPUP ? [photos.slice(0, half), photos.slice(half)] : [photos];
    let from = 1;
    return parts.flatMap((part, k) => {
      const to = from + part.length - 1;
      const head = k === 0
        ? { h: artist, p: [`${photos.length} concert photos`, ...(parts.length > 1 ? [`Photos ${from}–${to}`] : [])] }
        : { h: `${artist}, continued`, p: [`Photos ${from}–${to}`] };
      from = to + 1;
      return [head, { figs: part }];
    });
  })
};

// ---- work-1: Warner Music Group ----
DETAILS['work-1'] = {
  lede: 'Warner Music Group: Automating Operations for Digital Specialty Products',
  panels: [
    { h: 'Project overview', facts: [
        ['Role', 'Digital Operations Intern, Emerging Talent Associate'],
        ['Location', 'Los Angeles'],
        ['Timing', 'Summer 2026'],
        ['Team', 'Digital Specialty Products'],
        ['Tools', 'Snowflake SQL, Python, R (tidymodels), Google Apps Script, Google Cloud (Workflows, Cloud Functions, Vertex AI), Gmail and Chat APIs']
      ],
      p: [
        'At Warner Music Group, I spent most of my internship building automation for the Digital Specialty Products team, whose YouTube claiming work relied on manual sheet-checking and chasing missing information. I designed and prototyped two systems to move that work into the background, and tested both end to end with sample data. Alongside them, I queried and joined digital asset datasets with 1M+ rows in Snowflake to build custom reports for label requests, and automated recurring metadata reports with Python.'
      ] },
    { h: 'Atlantic Unclaimed Video Autoalert System', p: [
        'A Google Apps Script system that monitors a claiming sheet and reminds the right person to act, based on claim type and time elapsed:',
        'Urgent claims: a 4-hour SLA, then repeat alerts every 24 hours. Bulk submissions are grouped into one alert per submission.',
        'Non-urgent claims: a 72-hour SLA, with delayed tracks bundled into one summary email per submitter.',
        'Unassigned claims: routed by the GRID column. Not Atlantic and duplicate claims move to their own tabs and leave the alert flow, and claims with no GRID value go to Team Claim in a bundled report.',
        'Alerts go out as styled emails and Google Chat messages with track metadata, time overdue, the responsible person, and a link to the exact row. I capped alerts at one per issue per 24 hours to prevent alert fatigue.'
      ] },
    { h: 'Parasitic Claim Tracker and Classification Model', p: [
        '“Parasitic” is WMG’s term for fraudulent claims, which are cases where a label incorrectly “claims” that a digital asset is theirs to monetize off of. Because not catching these claims can result in financial losses, various streaming platforms are sensitive to this issue; my manager and I worked mainly with YouTube.',
        'I had access to a previously written SQL filter with a list of “blocked” characteristics typical of parasitic claims, and built the system around it:',
        'Weekly risk-scan reports are ingested into a Google Sheets tracker through Drive and Apps Script.',
        'Reviewers mark rows Y or N, and rows route to Parasitic or Cleared tabs with the reviewer logged.',
        'A nightly batch script refreshes a summary dashboard and alerts the team when a rep owner reaches 10 or more flagged assets.',
        'Cleared ISRCs feed a Snowflake exclusion table so reviewed tracks don’t resurface.',
        'To cut review time further, I built a 228-claim labeled dataset and trained a supervised classification model in R (tidymodels). I compared regularized logistic regression, random forest, and XGBoost using stratified 10-fold cross-validation repeated 5 times, and engineered features including TF-IDF tokenization of track titles and target encoding of rep owner and artist. The tuned random forest reached a cross-validated ROC-AUC of 0.995. On a held-out test set of 46 tracks it reached 97.8% accuracy and caught all 20 parasitic claims, with one false positive.'
      ] },
    { h: 'Outcome', p: [
        'Built and tested with sample data. Both systems were designed to replace manual checking with automatic SLA enforcement, and the model is a working proof of concept for pre-scoring weekly reports so reviewers can focus on the uncertain cases.'
      ] },
    { h: 'Tools', list: [
        'Snowflake SQL',
        'Python',
        'R (tidymodels)',
        'Google Apps Script',
        'Google Cloud (Workflows, Cloud Functions, Vertex AI)',
        'Gmail and Chat APIs'
      ] }
  ]
};



// ---- work-2: Credit Karma client project (in progress) ----
DETAILS['work-2'] = {
  lede: 'For Credit Karma, my team is researching how to turn an occasional credit-check app into a daily money habit for Gen Z. We started with a survey and statistical analysis so that each design direction traces back to observed student behavior. The project is in progress and is now moving from research into prototyping and testing.',
  // cover: 'images/creditkarma-persona.jpg',
  panels: [
    { h: 'Project overview', p: ['Status: In progress, prototyping next', 'Client: Intuit, Credit Karma', 'Team: [team size]', 'Role: [your role, e.g. survey analysis]', 'The client’s mission is to champion financial progress for all. We focused on Gen Z adults who are just starting to build credit, and framed the work around three measurable objectives: becoming the first finance app Gen Z downloads, building a daily money habit, and improving financial literacy.'] },
    { h: 'Defining success before designing', p: ['We chose three KPIs that follow the user journey from install to habit: download rate, engagement rate (DAU/MAU), and retention rate. Download rate and engagement are leading indicators of revenue, since habits form before affiliate commissions do. Retention checks whether the product delivers lasting value rather than a good first impression. Download rate is only informative alongside engagement, so the three are read together.'] },
    { h: 'Survey research', p: ['Method: Survey', 'Sample: 21 respondents to date', 'We surveyed Gen Z students about how they manage money and use their phones. 71% are partially or fully dependent on their parents and 91% are not employed, so a first credit card is often their first experience managing money. Only 6 of 21 (29%) track a budget. The pattern suggests financial literacy has been optional for this group, which likely explains why they haven’t come across Credit Karma.'] },
    { h: 'Persona built from the data', p: ['We built our persona, Abby, from these results rather than from assumptions. She is 19, opened her first credit card a year ago, pays on time, spends freely on food and shopping, and finds budgeting tools too much work to set up. Because parental support removes any urgency, the design has to give her a reason to engage instead of assuming she already feels one.'] },
    { fig: 'Persona: Abby', cap: 'Persona with known habits, pain points, and jobs to be done.', 
      src: 'images/creditkarma-persona.jpg', alt: 'Persona card for Abby, a 19-year-old first-time credit card user' },
    { h: 'Data analysis and its limits', p: ['To see what the survey could and could not support, we ran exploratory tests in R: Fisher’s exact test, Cramér’s V, Mann-Whitney U, Kruskal-Wallis, Spearman correlation, Cochran’s Q, and McNemar. Cramér’s V and Spearman proved the most useful.', 'Budgeting-tool use was strongly tied to spending level (V = 0.73) and to getting money advice online (V = 0.72), the only significant associations. Students who spend more also check their banking app more often (Spearman rho = 0.58), though no pair reached significance at our sample size.', 'We treat these results as directional. All six tool users spend $500+ a month and rely on online advice, so the data cannot separate those two factors, and the sample is small.'] },
    { fig: 'Cramér’s V heatmap', cap: 'Strength of association between student characteristics and financial habits.', 
      src: 'images/creditkarma-cramers-v.jpg', alt: 'Heatmap of Cramér’s V values between survey variables' },
    { h: 'From findings to design direction', p: ['Tool adoption tracks with having more money to manage, so the value proposition must also work for lower-spending students and cannot depend on manual setup. This is why our concepts center on zero-effort spend visibility.', 'Post-purchase nudges (62%) and weekly summaries (52%) were the most valued lock-screen updates, and students were most receptive in the evening (52%) and during transit (43%). These are our first candidates to prototype, timed accordingly.', 'Students already keep short daily habits: everyone quick-scrolls, 81% track tasks, and about half keep streaks. That supports brief, habit-based check-ins over asking for a new routine.', 'About 1 in 4 respondents feel anxiety from banking notifications, so notification tone will be tested rather than assumed.'] },
    { h: 'Current stage and next steps', p: ['Research, KPI definitions, and the persona are complete, and we are moving into prototyping. Next, we will prototype the post-purchase nudge and weekly summary and test their timing and tone with students. An open question we raised with the client is whether this should be a new feature within the app or an entirely new app. This page will be updated with test results as they are collected.'] }
  ]
};

// ---- work-3: Polaris, FigBuild 2026 ----
DETAILS['work-3'] = {
  lede: 'Your memories aren’t a timeline. They’re a constellation. Polaris maps memories by how they felt, not when they happened.',
  cover: 'images/polaris/thumbnail.png',
  embed: 'https://zone-droop-75286977.figma.site/',
  panels: [
    { h: 'Project overview', facts: [
        ['Team', 'Rosie Nguyen, Hyouji Joo, Cheryl Nguyen, Reese Odvina'],
        ['Role', 'Concept Lead · UX/UI Designer'],
        ['Context', 'FigBuild 2026 · 3-day hackathon'],
        ['Prompt', 'A speculative tool that tracks a “new” sense to support emotional health and self-understanding'],
        ['Built with', 'Figma, Figma Make, Claude, React, JavaScript, HTML, CSS'],
        ['Target users', 'Any users navigating stress, transition, and identity, particularly those often reflecting on the past to experience certain emotions again']
      ],
      p: ['Polaris is a memory visualization tool that turns personal experiences into a constellation of emotional and sensory signals. The “new” sense we chose to track is nostalgic resonance: the emotional signal created when memories share similar sensory environments and feelings.'
      ]
    },

    { h: 'My contributions', list: [
        'Originated the concept: organizing memories like a constellation system, clusters/connections forming based on attached emotions',
        'Designed the emotion-color system, icons, and memory orbs, and specified an orb PNG generator (built with AI assistance) that outputs all 41 emotion combinations',
        'Led wireframing and page layout, testing and implementing user flow into page structure',
        'Defined UI components: input form, tags, hover and click states, zoom controls, and the Resonance Insight panel',
        'Co-built the Figma Make prototype with teammates, splitting work fluidly under a 3-day timeline and a limited credit budget'
      ] },
    { h: 'Inspiration', p: [
        'Our team based our design on color psychology, which explains our tendency to associate certain colors with specific emotions.',
        'Pixar’s Inside Out is a primary example of how effective color theory is in visual understanding.',
        'Using colors we culturally associate with certain emotions (ex. blue as sadness) proves to be effective in communicating abstract feelings to a wide audience, particularly children who often learn visually.',
        'This influenced our approach of mapping emotions to multi-colored constellations.'
      ] },
    { fig: 'A personal sky', cap: 'A personal sky where stars cluster by feeling.', src: 'images/polaris/resonance.png', alt: 'Personal constellation with colored memory stars connected by feeling' },
    { h: 'Problem and research', p: [
        'Memories are rarely recalled through sequential logic. When thinking back to the time on the playground as a child, do you remember the exact steps of what you did there?',
        'People remember moments through sensory cues and emotions, but the digital and physical tools we have only record the objective details of a moment, making it hard to recognize patterns in the moments that bring comfort, joy, or connection. Another barrier is that emotions such as nostalgia are abstract and difficult to quantify, so they are often undertracked and underrepresented in existing tools.',
        'With the theme of sensory experiences, we decided to explore how to qualitatively measure or track memories. The focus of our product was not to act as an interpreter between complex and abstract feelings, but to give users autonomy in defining their own experiences, so they can understand their own emotional patterns and the sensory cues that trigger nostalgia.',
        'We wanted to help users recognize the patterns behind both positive and negative experiences without necessarily having to “re-experience” them.',
        'With three days to build, we could not run user research, but design choices were made with scientific evidence, particularly with the color selections.'
      ] },
    { h: 'Initial concept selection', p: ['We explored two directions in response to the prompt.'], list: [
        'Synesthesia visualizer: sound and words turned into color and shape',
        'Nostalgia constellations: memory as a space where entries cluster by feeling'
      ] },
    { h: 'Why constellations', p: [
        'I championed constellations because connectivity felt like the right metaphor for sensory experiences and gave us a wide range of design opportunities.',
        'Memories and the emotions attached to them link over time, mentally forming a "constellation" that influences behavior.'
      ] },
    { h: 'Main Experience', p: [
        'Users capture a memory by reflecting on what they sense, then tagging its cues such as sound, place, and emotion. Each memory becomes a star in a personal galaxy. Each star encodes a memory: color for emotion, and brightness for intensity.'
      ] },
    { figs: [
        { fig: 'Capturing a memory', cap: 'Tag a memory’s sensory cues and emotions.', src: 'images/polaris/add.png', alt: 'Memory capture screen' },
        { fig: 'Atmosphere', cap: 'Each star carries its memory’s atmosphere.', src: 'images/polaris/atmosphere.png', alt: 'Star atmosphere view' }
      ] },
    { h: 'How the constellation grows', p: ['As more memories are added, Polaris surfaces three patterns:'], list: [
        'Clusters: emotionally similar memories are connected',
        'Bridges: the lines connecting between distant life moments',
        'Recurring signals: sensory cues that repeat across memories'
      ] },
    { h: 'Emotion and color system', p: [
        'Based off of color psychology, stars are created with one or more emotions. The base emotions are the following:',
        'Joyful, Peaceful, Nostalgic, Melancholy, Anxious, Bitter',
        'Up to three blend into a single orb, giving 41 combinations: 6 singles, 15 pairs, and 20 triplets.',
        'You can also add your own color. The mood interpreter assigns it a name and a description based on color psychology, and you can regenerate the description for a different take.'
      ],
      src: 'images/polaris/emotion-orbs.png', alt: 'Six emotion orbs with their corresponding colors and icons' },
    { fig: 'Your own emotional color', cap: 'Pick any color and the mood interpreter describes it using color psychology.', src: 'images/polaris/choose.png', alt: 'Custom color picker with a purple circle and a mood interpretation reading “Dreamy & Nostalgic”, with a Regenerate button' },
    { h: 'Palette and accessibility', p: [
        'I revised the palette once to better match common color associations: warm yellow for joy, teal for calm, deep indigo for melancholy. These associations vary by person and culture, so testing how users read them is a next step.',
        'Color is never the only signal. Each emotion also has an icon and a text label.'
      ] },
    { h: 'The orb generator', p: [
        'Figma Make couldn’t reproduce the orb look from prompts alone. I defined the palette, blending rules, and export requirements (transparent PNGs, all 41 combinations, one-click batch download), generated the tool with AI assistance, and fed the finished assets into the build.'
      ] },
    { fig: 'All 41 blending combinations', cap: 'Every blend of the six emotions: 6 singles, 15 pairs, and 20 triplets.', src: 'images/polaris/orb-combinations.png', alt: 'Grid of all 41 emotion orb combinations' },
    { h: 'Flow: capture', p: [
        'A guided prompt (“What’s the strongest thing you’re sensing right now?”) leads to details, sensory tags, and an emotion check: “How does recalling this memory feel right now?” Users pick up to three emotions or choose their own color. On save, the memory becomes a star.'
      ] },
    { figs: [
        { fig: 'Choosing emotions', cap: 'Choose up to three emotions, or pick your own color.', src: 'images/polaris/emotional-energy.png', alt: 'Emotion selection screen' },
        { fig: 'A new star', cap: 'Your memory has become a star.', src: 'images/polaris/newstar.png', alt: 'Confirmation screen showing a new memory star' }
      ] },
    { h: 'Flow: explore', p: [
        'Hovering a star shows only its sensory summary (for example, “warm · crowded · energetic”). Clicking opens the full memory. Zooming out reveals clusters and bridges. A Resonance Insight panel surfaces patterns in plain language, and progressive disclosure keeps it from overwhelming users.'
      ] },
    { fig: 'Hover', cap: 'Hover for sensation.', src: 'images/polaris/hover-click.png', alt: 'Constellation view with a hovered star showing its sensory summary' },
    { fig: 'Click', cap: 'Click for the story.', src: 'images/polaris/hover-click2.png', alt: 'Memory panel for “adopting my cats” showing its emotion, date, sensory tags, and orb' },
    { h: 'Iteration: making the constellation readable', p: [
        'In the first build, every star was white and nearly every star connected to every other, which turned the map into tangled noise. The final version uses color-coded stars, selective connections, and quiet lines, so patterns read at a glance.'
      ] },
    { figs: [
        { fig: 'Before', cap: 'Before: everything connected.', src: 'images/polaris/before.png', alt: 'First build: white stars all connected to each other' },
        { fig: 'After', cap: 'After: color and restraint reveal structure.', src: 'images/polaris/warm.png', alt: 'Final build: color-coded stars with selective connections' }
      ] },
    { h: 'Prototype: building within constraints', p: [
        'Because the hackathon required us to use only Figma Make, we had to figure out ways to work within its limitations.'
      ], list: [
        'Specs: I prioritized specific prompts when using Figma Make, focusing on the overall architecture of layers and components, then on UI components such as color, transitions, timing, and hover behavior, and corrected issues in wireframing and flow (ex. a star must appear only after a memory is added).',
        'Scoping: We built the new star animation as an isolated component so that multiple people could work simultaneously, and it was later connected to the main page.',
        'Tradeoffs: Glow alignment on the stars took several prompts. Rather than keep spending credits, I simplified the star design.',
        'Work Division: We split visual UI, assets, motion, and interactions fluidly rather than by fixed roles; roles shifted based on the number of credits each member had.'
      ] },
    { h: 'Beyond the main flow', p: ['Using the sensory information from the main sequence, Polaris updates the memories for Insights and Library.'] },
    { figs: [
        { fig: 'Insights', cap: 'Making sense of your feelings: the Resonance Insight panel shows patterns in the constellation (sample data used for mockup).', src: 'images/polaris/insights.png', alt: 'The Insights page displays emotion distribution and any recurring emotional patterns' },
        { fig: 'Insights, continued', cap: 'More of the Insights page.', src: 'images/polaris/insights2.png', alt: 'Additional view of the Insights page showing recurring emotional patterns' }
      ] },
    { fig: 'Library', cap: 'A “Constellation Archive” for searching and filtering memories by sensory tag.', src: 'images/polaris/library.png', alt: 'Constellation library with memory cards' },
    { h: 'Challenges', p: [
        'We worked cross-functionally within the same Figma Make environment while designing both the narrative flow/presentation and the interface logic. Because the project combined storytelling, UX design, and speculative interaction, we made sure to align the visual design, user flows, and conceptual explanation. We also spent time debugging interactions and animations so that the constellation concept was emphasized and the user experience was seamless.'
      ] },
    { h: 'Accomplishments', p: [
        'We were able to make our product visually cohesive and understandable. The constellation visualization, emotional color system, and animated interactions contributed to the immersive experience.'
      ] },
    { h: 'What we learned', p: [
        'We learned more about designing effective UX flows and structuring interfaces that make complex ideas intuitive, including practical wireframing, information architecture, and the importance of narrative in digital product design. We also gained experience with more advanced Figma tools such as Figma Make, AI prompting, and prototyping features for future building purposes.'
      ] },
    { h: 'Safeguards', p: [
        'Users control what they record and can delete it anytime. Insights are meant to serve a surface-level reflection purpose, not meant for deeper psychological analysis.'
      ] },
    { h: 'Next steps', list: [
        'Run user research to test whether people recognize the patterns Polaris shows',
        'Test whether the color and icon mapping reads the way we intended, or let users set their own palette',
        'Weight emotions by intensity, so a memory can be mostly joyful with a hint of anxiety',
        'Add the time-drift view and constellation naming from our early planning',
        'Expand constellation interactions with emotional pattern insights and filters, building on Polaris as a wellbeing tool that helps users understand the memories that bring them comfort and connection'
      ] },
    { h: 'Reflection', p: [
        'This project gave me first-hand experience in why teamwork and collaboration are emphasized. Several factors created challenges for our team: all communication had to be digital because we were in different states, and we had to match four daily schedules to find meeting times. We also had to be strategic about how Figma Make credits were distributed and who on the team would primarily use them.'
      ] },
    { h: 'Presentation', p: ['The Figma presentation covers the full narrative, concept, and prototype walkthrough.'],
      embed: 'https://www.figma.com/deck/iXqua9IgbGv5ajlHcvBmdV/Presentation--Copy-?node-id=1-130&t=JBRZkOEyt1lsWSBa-1' }
  ]
};

// ---- work-4: CradleWave ----
DETAILS['work-4'] = {
  lede: 'CradleWave is a land-based simulator that lets sailors practice roll tacking, a maneuver that can normally only be practiced on the water. My role was the research behind it: observing the Northwestern Sailing Team’s practice, interviewing its sailors, and testing every prototype stage with them, so each design decision traces back to something users said or did.',
  cover: 'images/cradlewave/final-prototype.webp',
  panels: [
    { h: 'Project overview', facts: [
        ['Team', 'Team of 5'],
        ['Role', 'User research: observations, interviews, synthesis, and prototype user testing'],
        ['Context', 'Human-centered design course'],
        ['Target users', 'Competitive sailors on the Northwestern Sailing Team who need more roll tack repetitions than on-water practice allows'],
        ['Outcome', 'Full-scale prototype built around a real 420 sailboat and delivered to the Northwestern Sailing Center']
      ],
      p: [
        'Roll tacking uses body weight to heel the boat so it turns through the wind faster. Sailors described it as a make-or-break skill in racing, yet there was no effective way to practice it on land. We set out to find out why, and what a simulator would need to do for the skill to transfer to the water.'
      ] },
    { h: 'My contributions', list: [
        'Planned and carried out observations at the sailing center, tracking what takes the most time, where sailors hesitate, and what workarounds they invent during setup, on the water, and at pack-up',
        'Interviewed sailing team members with open, non-leading questions, from newer team members to experienced racers, and documented their answers',
        'Synthesized observations and interviews into the journey map, persona, and the needs behind the specification chart',
        'Translated interview findings into measurable requirements, such as 45° heel on each side and setup time targets',
        'Ran user testing on the scaled mockups and the full-scale prototype, and recorded what worked and what didn’t'
      ] },
    { h: 'How we researched', facts: [
        ['Observation', 'Sailing team practice at the Northwestern Sailing Center, using an AEIOU framework'],
        ['Interviews', 'Four members of the sailing team, from a newer sailor to a six-year veteran'],
        ['Synthesis', 'Journey map, persona, weighted concept matrix, specification chart'],
        ['Testing', 'Scaled mockups, a full-scale fit and safety check, then testing with sailing team members']
      ],
      p: [
        'The interview guide opened with background and general learning questions before reaching roll tacking. That order let sailors describe their own experience first, so our questions didn’t steer them toward the answer we expected. We asked what they improvise, what goes wrong for beginners, and what would have helped them learn faster.',
        'The observation plan split a practice into three stages with different things to watch for. Setup showed what takes the most hands, on the water showed hesitation and communication breakdowns, and pack-up often brought out the most candid comments. We asked questions between maneuvers, never mid-tack.'
      ] },
    { h: 'What we observed', p: [
        'On land, the team practices roll tacking by having two sailors stand on opposite sides of a boat, lift it, and tip it while a third sits inside. Our journey map of this process surfaced three pain points. It takes several people, which rules out solo practice. Lifting the boat is tiring, so practice stops quickly. And it can’t be repeated much in one session.',
        'It also can’t happen at all on rainy or windy days, which came up repeatedly in the observation notes.'
      ] },
    { fig: 'Current practice journey map', cap: 'Journey map of how sailors currently try to practice roll tacking on land, with the pain points marked.', src: 'images/cradlewave/journey-map.webp', alt: 'Journey map of land-based roll tack practice' },
    { h: 'What interviews told us', list: [
        'Roll tacking is “make-or-break” for competitive performance, and one team member said, “You can’t really practice rolltacking on land.”',
        'A newer team member estimated that beginners need around four months to land several roll tacks in a row. Practice outside the water was limited to videos, which don’t rehearse the movement.',
        'An experienced sailor said the hardest part is the resistance when pushing the boat back down to flat.',
        'Sailors named the same needs: a rocking, heeling motion, a tiller, the main and jib lines, and hiking straps for the footwork.',
        'They said the sail, mast, and wind direction don’t matter for practice. One sailor added that resistance depends on wind, centerboard, and boat speed, so it would be hard to match.',
        'Sailors volunteered interest: “We would definitely use something you make.”'
      ] },
    { h: 'From findings to design decisions', facts: [
        ['Real 420 hull', 'Sailors ranked a near-perfect copy of the cockpit highest, with the tiller, lines, and hiking straps in place. So we carry the actual boat instead of building a mock cockpit.'],
        ['45° heel', 'Interviews put the heel range at roughly 40–55°, and a technique article we found supports 45° as the functional target. So the cradle reaches 45° each side.'],
        ['No sail or mast', 'Sailors said sails, masts, and wind direction don’t affect the practice. So we left them out and spent our budget on motion and interior accuracy.'],
        ['No resistance rig', 'Resistance varies with wind, centerboard, and speed, and a magnetic-brake concept scored lowest on feasibility. So we dropped it and told the sailors openly what the simulator wouldn’t feel like.'],
        ['Rocking cradle', 'Our concept matrix weighted rolling motion highest (150%), then accurate interior. The rocking cradle scored 14.3, ahead of the pivot mount (13.9) and the resistance simulator (12.5).']
      ],
      p: [
        'We chose the criteria weights from what sailors told us, then scored each concept individually. The rocking cradle came out on top on all five scorecards.'
      ] },
    { h: 'Testing in stages', p: [
        'We tested early and at small scale, so changes were cheap.'
      ], list: [
        'One-twentieth scale 3D-printed profiles: smooth curves made the move between heeled and flat far too easy, so we switched to flat planes.',
        'One-fifth scale laser-cut model with a single 45° step: sailors found the transition far too abrupt. The final profile has a flat section, a 22.5° step, and a 45° step on each side.',
        'Full-scale fit check: some boat supports didn’t touch the hull, so we added foam and checked fit again.',
        'Safety check before any user got in: we strapped in the empty boat and rocked it to 45° on each side, harder and faster each time, until nothing creaked, shifted, or slipped.'
      ] },
    { fig: 'Mockups that shaped the profile', cap: 'Scaled mockups that tested how the cradle profile controls the heel transition.', src: 'images/cradlewave/mockups.webp', alt: 'Small-scale 3D-printed and laser-cut CradleWave models' },
    { h: 'User testing the full prototype', p: [
        'We tested at the sailing center beach with two sailing team members, walking them through the whole process from setup to takedown.',
        'Setup was the biggest pain point. Lifting the roughly 300 lb boat into the frame took about six people, and it was the most laborious and error-prone step. That echoed what we had seen in observation, where heavy boats already needed several people to move. Once the boat was strapped in, the rest was simple.',
        'For roll tacking, sailors said it would be great for training new sailors and very useful for practicing footwork. They found it hard to reach the full 45° heel and easy to overshoot flat on the way out of the tack. Both can likely be fixed by adding weight to the frame, which the design allows.',
        'Only two sailors tested the full-scale prototype, so we treat these results as directional rather than conclusive.'
      ] },
    { fig: 'Testing with the sailing team', cap: 'Sailing team members testing the CradleWave at the Northwestern Sailing Center.', src: 'images/cradlewave/user-testing.webp', alt: 'Sailors testing the CradleWave with a 420 sailboat on the beach' },
    { h: 'Results against what users needed', facts: [
        ['45° heel', 'Pass. The cradle reaches it, and sailors said the range is right and they wouldn’t go further.'],
        ['Accurate interior', 'Pass. A real, rigged 420 means the interior is exact, and sailors could roll tack with their normal controls.'],
        ['Holds heel', 'Pass. The cradle stays in heel while sailors rest in the heel position.'],
        ['Realistic feel', 'Medium. Sailors liked how hard it is to get into heel but found it too easy to overcorrect on exit, a known limit of a gravity-driven design.'],
        ['Natural hiking', 'Medium. Sailors had to exaggerate their movement to reach full heel.']
      ] },
    { h: 'Next steps', list: [
        'Add weight to the frame (sandbags outside, or water inside the hollow PVC) and retest the 45° effort and the overshoot on exit with sailors',
        'Cut setup from about six people and several minutes to two people in under 30 seconds',
        'Test with beginners to see whether the CradleWave shortens the time it takes to learn a roll tack, against a target of one to two months',
        'Track foam pad wear and frame durability over repeated use'
      ] },
    { h: 'Reflection', p: [
        'The research set the priorities that decided between concepts, and testing at each scale caught problems early, including a profile that was too easy and one that was too abrupt. The biggest finding from testing, how many people it takes to load the boat, had already shown up in the observation notes, which is why I now treat observation as a source of requirements, not just context.'
      ] }
  ]
};

// ---- work-5: Glow&Go ----
DETAILS['work-5'] = {}



// ---- about ----
DETAILS['about'] = {
  panels: [
    { h: 'What I do', p: ['With my academic background, I love finding the stories behind numbers, understanding how people think, and translating abstract ideas into intuitive, meaningful, and empathetic digital experiences.'] },
    { h: 'Beyond work', p: ['Beyond pixels and prototypes, I’m a music enthusiast, arts and cinema lover, and a hobby collector. I always find myself being inspired by everything, from a good playlist to a very poorly designed faucet.'] }
  ]
};

// ---------------------------------------------------------------------
// PART 3: fallback panels (shown for projects with no DETAILS entry)
// ---------------------------------------------------------------------
const WORK_PANELS = [
  { h: 'Problem and context', p: ['Team: size and your role', 'Users: who the design was for', 'Who the users were, what problem they faced, and the evidence that showed it was worth solving.'] },
  { h: 'Research and observations', p: ['The methods you used (interviews, surveys, usability sessions, analytics) and what you observed. State the sample size and the finding that shaped the direction.'] },
  { fig: 'Research artifact', cap: 'An affinity map, interview synthesis, or data chart that supports the finding above.' },
  { h: 'Design decisions and rationale', p: ['For each major decision: what you chose, the alternatives you considered, and the observation or test result that justified the choice.'] },
  { h: 'Testing and iteration', p: ['How you tested (task, participants, metrics), what failed or confused users, and what you changed in response.'] },
  { h: 'Outcome and reflection', p: ['Measured results (task success, time on task, user feedback) and what you would test next.'] }
];
const CREATIVE_PANELS = [
  { h: 'Intent and constraints', p: ['What you set out to explore, the constraints you worked within, and the references or observations that shaped the brief.'] },
  { fig: 'Process and iterations', cap: 'Sketches, drafts, or versions showing how the work developed.' },
  { h: 'Decisions and feedback', p: ['The choices you made at each stage, the critique or testing that informed them, and what you revised as a result.'] },
  { fig: 'Final piece', cap: 'The finished work, with a note on which decisions are visible in it.' }
];