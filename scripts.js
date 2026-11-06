// Global variables
let allPublications = [];
let showingSelected = true;

// ========== CONFERENCE COUNTDOWN CONFIG ==========
// Edit these fields to switch to a different conference:
const CONF = {
  name: 'CVPR 2027',
  url:  'https://cvpr.thecvf.com/Conferences/2027/Dates',
  deadline: '2026-11-17T11:59:59Z', // Nov 16, 2026 11:59:59 PM AoE / UTC-12 (paper submission)
};
// ==================================================

function initCountdown() {
  const container = document.getElementById('conf-countdown');
  if (!container) return;

  const link = document.createElement('a');
  link.href = CONF.url;
  link.className = 'countdown-link';
  link.innerHTML = '<span class="countdown-label">' + CONF.name + '</span> <span id="conf-timer"></span>';
  container.appendChild(link);

  function tick() {
    const diff = new Date(CONF.deadline) - new Date();
    const timer = document.getElementById('conf-timer');
    if (diff <= 0) { timer.textContent = '(passed)'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    timer.textContent = d + 'd ' + h + 'h ' + m + 'm ' + s + 's';
  }
  tick();
  setInterval(tick, 1000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Start conference countdown
  initCountdown();

  // Load publications data
  loadPublications();
  
  // Initialize animation delays for sections
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    section.style.animationDelay = `${index * 0.1}s`;
  });
  
  // Add event listener for toggle button
  const toggleButton = document.getElementById('toggle-publications');
  if (toggleButton) {
    toggleButton.addEventListener('click', togglePublications);
  }
});

// Load publications from JSON file
function loadPublications() {
  fetch('publications.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Publications loaded successfully:", data);
      allPublications = data.publications;
      renderPublications(true);
    })
    .catch(error => {
      console.error('Error loading publications:', error);
      // Create fallback publications display if JSON loading fails
      displayFallbackPublications();
    });
}

// Fallback if JSON loading fails
function displayFallbackPublications() {
  const container = document.getElementById('publications-container');
  container.innerHTML = `Error loading publications.`;
}

// Toggle between showing all or selected publications
function togglePublications() {
  showingSelected = !showingSelected;
  renderPublications(showingSelected);
  
  // Update button text
  const toggleButton = document.getElementById('toggle-publications');
  toggleButton.textContent = showingSelected ? 'Show All' : 'Show Selected';
  const toggleHeader = document.getElementById('toggle-header');
  toggleHeader.textContent = showingSelected ? 'Selected Publications' : 'All Publications';
}

// Render publications based on selection state
function renderPublications(selectedOnly) {
  const publicationsContainer = document.getElementById('publications-container');
  publicationsContainer.innerHTML = '';
  
  const pubsToShow = selectedOnly ? 
    allPublications.filter(pub => pub.selected === 1) : 
    allPublications;
  
  pubsToShow.forEach(publication => {
    const pubElement = createPublicationElement(publication);
    publicationsContainer.appendChild(pubElement);
  });
}

// Create HTML element for a publication
function createPublicationElement(publication) {
  const pubItem = document.createElement('div');
  pubItem.className = 'publication-item';
  
  // Create thumbnail
  const thumbnail = document.createElement('div');
  thumbnail.className = 'pub-thumbnail';
  thumbnail.onclick = () => openModal(publication.thumbnail);
  
  const thumbnailImg = document.createElement('img');
  thumbnailImg.src = publication.thumbnail;
  thumbnailImg.alt = `${publication.title} thumbnail`;
  thumbnail.appendChild(thumbnailImg);
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'pub-content';
  
  // Add title
  const title = document.createElement('div');
  title.className = 'pub-title';
  title.textContent = publication.title;
  content.appendChild(title);
  
  // Add authors with highlight
  const authors = document.createElement('div');
  authors.className = 'pub-authors';
  
  // Format authors with highlighting
  let authorsHTML = '';
  publication.authors.forEach((author, index) => {
    if (author.includes('Guangyan')) { // TODO: Highlight specific author
      authorsHTML += `<span class="highlight-name">${author}</span>`;
    } else {
      authorsHTML += author;
    }
    
    if (index < publication.authors.length - 1) {
      authorsHTML += ', ';
    }
  });
  
  authors.innerHTML = authorsHTML;
  content.appendChild(authors);
  
  // Add venue with award if present
  const venueContainer = document.createElement('div');
  venueContainer.className = 'pub-venue-container';
  
  const venue = document.createElement('div');
  venue.className = 'pub-venue';
  venue.textContent = publication.venue;
  venueContainer.appendChild(venue);
  
  // Add award if it exists
  if (publication.award && publication.award.length > 0) {
    const award = document.createElement('div');
    award.className = 'pub-award';
    award.textContent = publication.award;
    venueContainer.appendChild(award);
  }
  
  content.appendChild(venueContainer);
  
  // Add links if they exist
  if (publication.links) {
    const links = document.createElement('div');
    links.className = 'pub-links';
    
    if (publication.links.pdf) {
      const pdfLink = document.createElement('a');
      pdfLink.href = publication.links.pdf;
      pdfLink.textContent = '[PDF]';
      links.appendChild(pdfLink);
    }
    
    if (publication.links.code) {
      const codeLink = document.createElement('a');
      codeLink.href = publication.links.code;
      codeLink.textContent = '[Code]';
      links.appendChild(codeLink);
    }
    
    if (publication.links.project) {
      const projectLink = document.createElement('a');
      projectLink.href = publication.links.project;
      projectLink.textContent = '[Project Page]';
      links.appendChild(projectLink);
    }
    
    content.appendChild(links);
  }
  
  // Assemble the publication item
  pubItem.appendChild(thumbnail);
  pubItem.appendChild(content);
  
  return pubItem;
}

// Modal functionality for viewing original images
function openModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  modal.style.display = "block";
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  modalImg.src = imageSrc;
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

// Close modal when clicking outside the image
window.onclick = function(event) {
  const modal = document.getElementById('imageModal');
  if (event.target == modal) {
    closeModal();
  }
}

/* Availability demo: no Google credentials or event metadata are accessed by the browser. */
const AVAILABILITY_TIME_ZONE = 'America/Chicago';
let availabilitySelectedDay = 0;

function availabilityDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: AVAILABILITY_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date);
}
function availabilityDayLabel(key) {
  const [y,m,d] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { weekday:'short', month:'short', day:'numeric', timeZone:'UTC' })
    .format(new Date(Date.UTC(y,m-1,d,12)));
}
function availabilitySlotLabel(index) {
  return String(Math.floor(index/2)).padStart(2,'0') + ':' + (index%2 ? '30' : '00');
}
function availabilityIntervals(slots) {
  const intervals=[]; let start=null;
  for(let i=0;i<=48;i++) {
    if(i<48 && slots[i]===false && start===null) start=i;
    if((i===48 || slots[i]!==false) && start!==null) {
      intervals.push(availabilitySlotLabel(start)+'–'+availabilitySlotLabel(i)); start=null;
    }
  }
  return intervals;
}
function renderAvailability(data) {
  const calendar=document.getElementById('availability-calendar');
  const status=document.getElementById('availability-status');
  const detail=document.getElementById('availability-day-detail');
  const range=document.getElementById('availability-range');
  if(!calendar || !detail || !range || !status) return;
  const today=availabilityDateKey(new Date());
  const dates=data.days.map(d=>d.date);
  if(!data.demo || data.timezone!==AVAILABILITY_TIME_ZONE || data.days.length!==7 ||
     data.days.some(d=>!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!Array.isArray(d.busy)||d.busy.length!==48||d.busy.some(x=>typeof x!=='boolean'))){
    throw new Error('Invalid demo availability data');
  }
  status.textContent='Preview only · Simulated schedule';
  range.textContent=availabilityDayLabel(dates[0])+' – '+availabilityDayLabel(dates[6])+' · CT';
  calendar.replaceChildren();
  const blank=document.createElement('div'); calendar.appendChild(blank);
  data.days.forEach((day,i)=>{
    const btn=document.createElement('button'); btn.type='button';
    btn.className='availability-day-button';
    btn.textContent=availabilityDayLabel(day.date).replace(',','');
    btn.setAttribute('aria-pressed',String(i===availabilitySelectedDay));
    btn.addEventListener('click',()=>{availabilitySelectedDay=i;renderAvailability(data);});
    calendar.appendChild(btn);
  });
  for(let slot=0;slot<48;slot++){
    const time=document.createElement('div');time.className='availability-hour';
    if(slot%4===0)time.textContent=availabilitySlotLabel(slot);
    calendar.appendChild(time);
    data.days.forEach(day=>{
      const cell=document.createElement('div');
      cell.className='availability-slot'+(day.busy[slot]?' is-busy':'')+(day.date<today?' is-past':'');
      cell.title=availabilityDayLabel(day.date)+' '+availabilitySlotLabel(slot)+' · '+(day.busy[slot]?'Busy':'Free')+' (demo)';
      calendar.appendChild(cell);
    });
  }
  const day=data.days[availabilitySelectedDay];
  detail.replaceChildren();
  const heading=document.createElement('strong');heading.textContent=availabilityDayLabel(day.date)+' · Free intervals (demo)';
  const intervals=document.createElement('span'); intervals.textContent=availabilityIntervals(day.busy).join(' · ')||'No free intervals';
  detail.append(heading,intervals);
}
async function initAvailability(){
  if(!document.getElementById('availability-calendar'))return;
  try {
    const response=await fetch('data/availability-demo.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Availability preview unavailable');
    renderAvailability(await response.json());
  } catch(error) {
    console.error(error);
    document.getElementById('availability-status').textContent='Availability preview unavailable.';
  }
}
document.addEventListener('DOMContentLoaded',initAvailability);
