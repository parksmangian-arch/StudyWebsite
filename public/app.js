// ==========================================================================
// STUDY SPACE - MINIMALIST CLIENT APPLICATION
// Handles Subjects, Lessons, Assignments, Focus Timer, and Node.js REST API
// ==========================================================================

const API_BASE = '/api';

// Application State
const state = {
  subjects: [],
  assignments: [],
  flashcardDecks: [],
  activeSubjectId: null,
  activeLessonId: null,
  activeLessonFilter: 'all',
  activeAssignmentFilter: 'pending',
  activeAssignmentSubject: 'all',
  activeDeckFilter: 'all',
  activeDeckSubject: 'all',
  currentViewingLesson: null,
  currentStudyDeck: null,
  currentCardIndex: 0,
  isCardFlipped: false,
  studySessionStats: { again: 0, good: 0, easy: 0 },
  tempLessonImages: [],
  tempAsgImages: [],
  tempGenCards: [],
  timer: {
    duration: 25 * 60,
    remaining: 25 * 60,
    intervalId: null,
    isRunning: false,
    mode: 'focus'
  }
};

// DOM Elements Cache
const elements = {
  // Navigation
  navTabs: document.getElementById('navTabs'),
  tabBtnSubjects: document.getElementById('tabBtnSubjects'),
  tabBtnAssignments: document.getElementById('tabBtnAssignments'),
  tabBtnFlashcards: document.getElementById('tabBtnFlashcards'),
  tabBtnFocus: document.getElementById('tabBtnFocus'),
  subjectsCount: document.getElementById('subjectsCount'),
  assignmentsCount: document.getElementById('assignmentsCount'),
  decksCount: document.getElementById('decksCount'),
  miniTimerDisplay: document.getElementById('miniTimerDisplay'),

  // Views
  viewSubjects: document.getElementById('viewSubjects'),
  viewAssignments: document.getElementById('viewAssignments'),
  viewFlashcards: document.getElementById('viewFlashcards'),
  viewFocus: document.getElementById('viewFocus'),

  // Flashcards UI
  decksListView: document.getElementById('decksListView'),
  decksOverviewMeta: document.getElementById('decksOverviewMeta'),
  btnOpenGenerateFlashcards: document.getElementById('btnOpenGenerateFlashcards'),
  btnEmptyGenerateDeck: document.getElementById('btnEmptyGenerateDeck'),
  btnQuickScanDocument: document.getElementById('btnQuickScanDocument'),
  deckFilterPills: document.getElementById('deckFilterPills'),
  deckSubjectFilter: document.getElementById('deckSubjectFilter'),
  decksGrid: document.getElementById('decksGrid'),
  decksEmptyState: document.getElementById('decksEmptyState'),

  // Flashcard Study Player
  deckStudyPlayer: document.getElementById('deckStudyPlayer'),
  btnExitDeckPlayer: document.getElementById('btnExitDeckPlayer'),
  playerSubjectBadge: document.getElementById('playerSubjectBadge'),
  playerDeckTitle: document.getElementById('playerDeckTitle'),
  btnShuffleDeck: document.getElementById('btnShuffleDeck'),
  btnRestartDeck: document.getElementById('btnRestartDeck'),
  flashcardStudyContainer: document.getElementById('flashcardStudyContainer'),
  flashcardCounter: document.getElementById('flashcardCounter'),
  flashcardStatusTag: document.getElementById('flashcardStatusTag'),
  activeFlashcard: document.getElementById('activeFlashcard'),
  cardQuestionText: document.getElementById('cardQuestionText'),
  cardAnswerText: document.getElementById('cardAnswerText'),
  btnRateAgain: document.getElementById('btnRateAgain'),
  btnRateGood: document.getElementById('btnRateGood'),
  btnRateEasy: document.getElementById('btnRateEasy'),
  playerProgressBar: document.getElementById('playerProgressBar'),

  deckFinishedCard: document.getElementById('deckFinishedCard'),
  finishedSessionStats: document.getElementById('finishedSessionStats'),
  btnFinishedStudyAgain: document.getElementById('btnFinishedStudyAgain'),
  btnFinishedBackToDecks: document.getElementById('btnFinishedBackToDecks'),

  // Flashcard Generator Modal
  modalGenerateFlashcards: document.getElementById('modalGenerateFlashcards'),
  btnCloseGenerateModal: document.getElementById('btnCloseGenerateModal'),
  genModalHeading: document.getElementById('genModalHeading'),
  genStepInput: document.getElementById('genStepInput'),
  genStepPreview: document.getElementById('genStepPreview'),
  formGenerateCards: document.getElementById('formGenerateCards'),
  genDeckTitle: document.getElementById('genDeckTitle'),
  genSubjectSelect: document.getElementById('genSubjectSelect'),
  btnLoadFromCurrentSubject: document.getElementById('btnLoadFromCurrentSubject'),
  genSourceText: document.getElementById('genSourceText'),
  fileScannerDropzone: document.getElementById('fileScannerDropzone'),
  fileScannerInput: document.getElementById('fileScannerInput'),
  btnBrowseScanFile: document.getElementById('btnBrowseScanFile'),
  scannerStatus: document.getElementById('scannerStatus'),
  scannerStatusText: document.getElementById('scannerStatusText'),
  btnCancelGenerate: document.getElementById('btnCancelGenerate'),
  btnSubmitGenerate: document.getElementById('btnSubmitGenerate'),
  genPreviewStats: document.getElementById('genPreviewStats'),
  btnAddManualCard: document.getElementById('btnAddManualCard'),
  genCardsList: document.getElementById('genCardsList'),
  btnBackToGenInput: document.getElementById('btnBackToGenInput'),
  btnSaveGeneratedDeck: document.getElementById('btnSaveGeneratedDeck'),

  btnLessonGenerateFlashcards: document.getElementById('btnLessonGenerateFlashcards'),

  // Subjects UI
  subjectsList: document.getElementById('subjectsList'),
  subjectWorkspace: document.getElementById('subjectWorkspace'),
  noSubjectsView: document.getElementById('noSubjectsView'),
  currentSubjectCode: document.getElementById('currentSubjectCode'),
  currentSubjectTitle: document.getElementById('currentSubjectTitle'),
  currentSubjectMeta: document.getElementById('currentSubjectMeta'),
  btnOpenAddSubject: document.getElementById('btnOpenAddSubject'),
  btnEmptyAddSubject: document.getElementById('btnEmptyAddSubject'),
  btnDeleteSubject: document.getElementById('btnDeleteSubject'),

  // Lessons & Google Docs Workspace UI
  btnOpenAddLesson: document.getElementById('btnOpenAddLesson'),
  btnEmptyAddLesson: document.getElementById('btnEmptyAddLesson'),
  lessonsContainer: document.getElementById('lessonsContainer'),
  lessonTabsBar: document.getElementById('lessonTabsBar'),
  lessonTabsScroll: document.getElementById('lessonTabsScroll'),
  btnTabAddLesson: document.getElementById('btnTabAddLesson'),
  docWorkspace: document.getElementById('docWorkspace'),
  docLessonTitle: document.getElementById('docLessonTitle'),
  docSaveStatus: document.getElementById('docSaveStatus'),
  btnDocGenerateCards: document.getElementById('btnDocGenerateCards'),
  btnDocInsertImage: document.getElementById('btnDocInsertImage'),
  btnDocDeleteLesson: document.getElementById('btnDocDeleteLesson'),
  docToolbar: document.getElementById('docToolbar'),
  btnToolbarAddImage: document.getElementById('btnToolbarAddImage'),
  btnToolbarHighlighter: document.getElementById('btnToolbarHighlighter'),
  highlighterIndicator: document.getElementById('highlighterIndicator'),
  highlighterPalette: document.getElementById('highlighterPalette'),
  docCanvasOuter: document.getElementById('docCanvasOuter'),
  selectionHighlighterBubble: document.getElementById('selectionHighlighterBubble'),
  docFormatBlock: document.getElementById('docFormatBlock'),
  docFontFamily: document.getElementById('docFontFamily'),
  docFontSize: document.getElementById('docFontSize'),
  btnFontSizeDec: document.getElementById('btnFontSizeDec'),
  btnFontSizeInc: document.getElementById('btnFontSizeInc'),
  btnInsertChecklist: document.getElementById('btnInsertChecklist'),
  docInlineImageInput: document.getElementById('docInlineImageInput'),
  docPaper: document.getElementById('docPaper'),
  lessonsEmptyState: document.getElementById('lessonsEmptyState'),

  // Assignments UI
  btnOpenAddAssignment: document.getElementById('btnOpenAddAssignment'),
  btnEmptyAddAssignment: document.getElementById('btnEmptyAddAssignment'),
  assignmentsOverviewMeta: document.getElementById('assignmentsOverviewMeta'),
  assignmentsList: document.getElementById('assignmentsList'),
  assignmentsEmptyState: document.getElementById('assignmentsEmptyState'),
  assignmentFilterPills: document.getElementById('assignmentFilterPills'),
  assignmentSubjectFilter: document.getElementById('assignmentSubjectFilter'),

  // Focus Timer
  timerClock: document.getElementById('timerClock'),
  timerCaption: document.getElementById('timerCaption'),
  timerToggleBtn: document.getElementById('timerToggleBtn'),
  timerResetBtn: document.getElementById('timerResetBtn'),

  // Modals
  modalAddSubject: document.getElementById('modalAddSubject'),
  formAddSubject: document.getElementById('formAddSubject'),
  btnCloseSubjectModal: document.getElementById('btnCloseSubjectModal'),
  btnCancelAddSubject: document.getElementById('btnCancelAddSubject'),
  subNameInput: document.getElementById('subName'),
  subCodeInput: document.getElementById('subCode'),

  modalAddLesson: document.getElementById('modalAddLesson'),
  formAddLesson: document.getElementById('formAddLesson'),
  lessonModalTitle: document.getElementById('lessonModalTitle'),
  editLessonId: document.getElementById('editLessonId'),
  lessonTitleInput: document.getElementById('lessonTitle'),
  btnCloseLessonModal: document.getElementById('btnCloseLessonModal'),
  btnCancelAddLesson: document.getElementById('btnCancelAddLesson'),

  modalAddAssignment: document.getElementById('modalAddAssignment'),
  formAddAssignment: document.getElementById('formAddAssignment'),
  assignmentModalTitle: document.getElementById('assignmentModalTitle'),
  editAssignmentId: document.getElementById('editAssignmentId'),
  asgTitleInput: document.getElementById('asgTitle'),
  asgSubjectSelect: document.getElementById('asgSubject'),
  asgDueDateInput: document.getElementById('asgDueDate'),
  asgPriorityInput: document.getElementById('asgPriority'),
  asgNotesInput: document.getElementById('asgNotes'),
  asgDropzone: document.getElementById('asgDropzone'),
  asgFileInput: document.getElementById('asgFileInput'),
  btnBrowseAsgFiles: document.getElementById('btnBrowseAsgFiles'),
  asgThumbnailsRow: document.getElementById('asgThumbnailsRow'),
  btnCloseAssignmentModal: document.getElementById('btnCloseAssignmentModal'),
  btnCancelAddAssignment: document.getElementById('btnCancelAddAssignment'),

  // Lesson Viewer Drawer
  drawerLessonView: document.getElementById('drawerLessonView'),
  btnCloseLessonView: document.getElementById('btnCloseLessonView'),
  viewLessonSubjectCode: document.getElementById('viewLessonSubjectCode'),
  viewLessonDate: document.getElementById('viewLessonDate'),
  viewLessonTitle: document.getElementById('viewLessonTitle'),
  viewLessonSummary: document.getElementById('viewLessonSummary'),
  viewLessonStatus: document.getElementById('viewLessonStatus'),
  viewLessonContent: document.getElementById('viewLessonContent'),
  viewLessonGallerySection: document.getElementById('viewLessonGallerySection'),
  viewLessonGalleryCount: document.getElementById('viewLessonGalleryCount'),
  viewLessonGalleryGrid: document.getElementById('viewLessonGalleryGrid'),
  btnEditCurrentLesson: document.getElementById('btnEditCurrentLesson'),
  btnDeleteCurrentLesson: document.getElementById('btnDeleteCurrentLesson'),
  btnToggleLessonStatus: document.getElementById('btnToggleLessonStatus'),

  // Lightbox
  lightboxModal: document.getElementById('lightboxModal'),
  btnCloseLightbox: document.getElementById('btnCloseLightbox'),
  lightboxImg: document.getElementById('lightboxImg'),
  lightboxCaption: document.getElementById('lightboxCaption'),

  toast: document.getElementById('toastMessage')
};

// ==========================================================================
// TOAST NOTIFICATION
// ==========================================================================
let toastTimeout;
function showToast(message) {
  if (toastTimeout) clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');
  toastTimeout = setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 3000);
}

// ==========================================================================
// API CLIENT & TWO-WAY CACHE RESILIENCE
// ==========================================================================
function persistCache() {
  try {
    localStorage.setItem('study_space_cache', JSON.stringify({
      subjects: state.subjects,
      assignments: state.assignments,
      flashcardDecks: state.flashcardDecks,
      savedAt: Date.now()
    }));
  } catch (e) {}
}

async function fetchStudyData() {
  // 1. Immediately load local cache so user's notes appear instantly with zero wipe
  let localCache = null;
  try {
    const raw = localStorage.getItem('study_space_cache');
    if (raw) localCache = JSON.parse(raw);
  } catch (e) {}

  if (localCache && Array.isArray(localCache.subjects) && localCache.subjects.length > 0) {
    state.subjects = localCache.subjects;
    state.assignments = localCache.assignments || [];
    state.flashcardDecks = localCache.flashcardDecks || [];
    if (!state.activeSubjectId && state.subjects.length > 0) {
      state.activeSubjectId = state.subjects[0].id;
    }
    renderAll();
  }

  // 2. Fetch from server with cache-busting
  try {
    const res = await fetch(`${API_BASE}/data?_t=${Date.now()}`);
    if (!res.ok) throw new Error('Failed to load server data');
    const data = await res.json();

    const serverSubjects = Array.isArray(data.subjects) ? data.subjects : [];

    // If server has no subjects (e.g. fresh Railway container startup/sleep), but client has saved data:
    if (localCache && Array.isArray(localCache.subjects) && localCache.subjects.length > 0 && serverSubjects.length === 0) {
      console.log('Restoring data to server from local cache...');
      try {
        await fetch(`${API_BASE}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjects: localCache.subjects,
            assignments: localCache.assignments || [],
            flashcardDecks: localCache.flashcardDecks || []
          })
        });
      } catch (syncErr) {}
      return;
    }

    // Server has data: adopt server state
    if (serverSubjects.length > 0 || !localCache) {
      state.subjects = serverSubjects;
      state.assignments = Array.isArray(data.assignments) ? data.assignments : [];
      state.flashcardDecks = Array.isArray(data.flashcardDecks) ? data.flashcardDecks : [];

      if (!state.activeSubjectId && state.subjects.length > 0) {
        state.activeSubjectId = state.subjects[0].id;
      } else if (state.activeSubjectId && !state.subjects.find(s => s.id === state.activeSubjectId)) {
        state.activeSubjectId = state.subjects.length > 0 ? state.subjects[0].id : null;
      }

      renderAll();
    }
  } catch (err) {
    console.warn('Server fetch error, using local storage cache:', err);
  }
}

// ==========================================================================
// RENDERING FUNCTIONS
// ==========================================================================
function renderAll() {
  updateBadges();
  renderSubjectsBar();
  renderSubjectWorkspace();
  renderAssignments();
  renderFlashcardDecks();
  persistCache();
}

function updateBadges() {
  elements.subjectsCount.textContent = state.subjects.length;
  const pendingCount = state.assignments.filter(a => !a.completed).length;
  elements.assignmentsCount.textContent = pendingCount;
  elements.assignmentsOverviewMeta.textContent = `${pendingCount} Pending assignment${pendingCount === 1 ? '' : 's'}`;
  
  if (elements.decksCount) elements.decksCount.textContent = state.flashcardDecks.length;
  if (elements.decksOverviewMeta) {
    elements.decksOverviewMeta.textContent = `${state.flashcardDecks.length} Active recall study deck${state.flashcardDecks.length === 1 ? '' : 's'}`;
  }
}

// Render Subjects Bar
function renderSubjectsBar() {
  elements.subjectsList.innerHTML = '';

  if (state.subjects.length === 0) {
    elements.subjectWorkspace.classList.add('hidden');
    elements.noSubjectsView.classList.remove('hidden');
    return;
  }

  elements.subjectWorkspace.classList.remove('hidden');
  elements.noSubjectsView.classList.add('hidden');

  state.subjects.forEach(subject => {
    const chip = document.createElement('div');
    chip.className = `subject-chip ${subject.id === state.activeSubjectId ? 'active' : ''}`;
    chip.innerHTML = `
      <span class="chip-dot"></span>
      <span class="chip-title">${escapeHtml(subject.name)}</span>
      ${subject.code ? `<span class="subject-code-tag">${escapeHtml(subject.code)}</span>` : ''}
    `;
    chip.addEventListener('click', () => {
      state.activeSubjectId = subject.id;
      renderSubjectsBar();
      renderSubjectWorkspace();
    });
    elements.subjectsList.appendChild(chip);
  });

  // Quick "+ Add Subject" button at end of pill dock
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn-chip-add-subject';
  addBtn.title = 'Add new subject';
  addBtn.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  `;
  addBtn.addEventListener('click', openAddSubjectModal);
  elements.subjectsList.appendChild(addBtn);
}

// ==========================================================================
// GOOGLE DOCS-STYLE LESSON TABS & DOCUMENT EDITOR
// ==========================================================================

let docAutoSaveTimeout = null;

// Render Active Subject Workspace
function renderSubjectWorkspace() {
  const currentSubject = state.subjects.find(s => s.id === state.activeSubjectId);
  if (!currentSubject) {
    elements.subjectWorkspace.classList.add('hidden');
    elements.noSubjectsView.classList.remove('hidden');
    return;
  }

  elements.subjectWorkspace.classList.remove('hidden');
  elements.noSubjectsView.classList.add('hidden');
  elements.currentSubjectCode.textContent = currentSubject.code || '';
  elements.currentSubjectTitle.textContent = currentSubject.name;
  
  const lessons = currentSubject.lessons || [];
  elements.currentSubjectMeta.textContent = lessons.length > 0 ? `${lessons.length} Lesson document${lessons.length === 1 ? '' : 's'}` : '';

  // If there's nothing added, hide the tab bar & doc editor and display "empty"
  if (lessons.length === 0) {
    state.activeLessonId = null;
    elements.lessonTabsBar.classList.add('hidden');
    elements.docWorkspace.classList.add('hidden');
    elements.lessonsEmptyState.classList.remove('hidden');
    return;
  }

  if (!state.activeLessonId || !lessons.some(l => l.id === state.activeLessonId)) {
    state.activeLessonId = lessons[0].id;
  }

  renderLessonTabs(lessons);
  renderCurrentLessonDoc();
}

// Render Google Docs Horizontal Lesson Tabs
function renderLessonTabs(lessons) {
  elements.lessonTabsScroll.innerHTML = '';

  if (!lessons || lessons.length === 0) {
    elements.lessonTabsBar.classList.add('hidden');
    elements.docWorkspace.classList.add('hidden');
    elements.lessonsEmptyState.classList.remove('hidden');
    return;
  }

  elements.lessonTabsBar.classList.remove('hidden');
  elements.docWorkspace.classList.remove('hidden');
  elements.lessonsEmptyState.classList.add('hidden');

  lessons.forEach(lesson => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = `lesson-tab ${lesson.id === state.activeLessonId ? 'active' : ''}`;
    tab.title = lesson.title;
    tab.innerHTML = `
      <span class="lesson-tab-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      </span>
      <span class="lesson-tab-name">${escapeHtml(lesson.title || 'Untitled Lesson')}</span>
    `;

    tab.addEventListener('click', () => {
      if (state.activeLessonId === lesson.id) return;
      // Flush any pending auto-save before switching tab
      flushDocAutoSave();
      state.activeLessonId = lesson.id;
      renderLessonTabs(lessons);
      renderCurrentLessonDoc();
    });

    elements.lessonTabsScroll.appendChild(tab);
  });
}

// Render Active Lesson into Google Docs Document Canvas
function renderCurrentLessonDoc() {
  const currentSubject = state.subjects.find(s => s.id === state.activeSubjectId);
  if (!currentSubject) return;

  const lessons = currentSubject.lessons || [];
  const currentLesson = lessons.find(l => l.id === state.activeLessonId);

  if (!currentLesson) {
    elements.docWorkspace.classList.add('hidden');
    return;
  }

  elements.docWorkspace.classList.remove('hidden');
  elements.docLessonTitle.value = currentLesson.title || '';

  // Render initial content
  const content = currentLesson.content || '';
  if (content.includes('<p>') || content.includes('<div>') || content.includes('<h') || content.includes('<ul') || content.includes('<img') || content.includes('<mark')) {
    elements.docPaper.innerHTML = content;
  } else if (content.trim()) {
    // If stored as markdown or plain text, convert to rich HTML for Google Docs editor
    elements.docPaper.innerHTML = renderMarkdown(content);
  } else {
    elements.docPaper.innerHTML = '';
  }

  // Attach lightbox zoom on any embedded images
  attachDocImageHandlers();
  setDocSaveStatus('saved');
}

// Free-roaming overlay pictures state & handler
let maxFloatingPicZIndex = 25;

function attachDocImageHandlers() {
  if (!elements.docPaper) return;
  attachFloatingPicHandlers(elements.docPaper);
  upgradeLegacyDocImages();
}

function upgradeLegacyDocImages() {
  if (!elements.docPaper) return;
  const legacyImgs = elements.docPaper.querySelectorAll('img:not(.floating-pic-body img)');
  if (!legacyImgs || legacyImgs.length === 0) return;

  let converted = false;
  legacyImgs.forEach((img, idx) => {
    const parentP = img.closest('p, div');
    const url = img.src;
    const alt = img.alt || 'Lesson Picture';
    const paperWidth = elements.docPaper.clientWidth || 800;
    const left = Math.max(20, paperWidth - 340);
    const top = 50 + (idx * 160);

    const pic = document.createElement('div');
    pic.className = 'doc-floating-pic';
    pic.setAttribute('contenteditable', 'false');
    pic.style.cssText = `left: ${left}px; top: ${top}px; width: 280px; z-index: ${20 + idx};`;
    pic.innerHTML = `
      <div class="floating-pic-header">
        <div class="floating-pic-grip" title="Drag to move anywhere over notes">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="5" r="2"></circle><circle cx="12" cy="5" r="2"></circle><circle cx="19" cy="5" r="2"></circle>
            <circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle>
            <circle cx="5" cy="19" r="2"></circle><circle cx="12" cy="19" r="2"></circle><circle cx="19" cy="19" r="2"></circle>
          </svg>
          <span class="floating-pic-label">${escapeHtml(alt)}</span>
        </div>
        <div class="floating-pic-actions">
          <button type="button" class="floating-pic-btn btn-pic-front" title="Bring to Front">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button type="button" class="floating-pic-btn btn-pic-zoom" title="View Fullscreen">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </button>
          <button type="button" class="floating-pic-btn btn-pic-del" title="Delete Picture">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      <div class="floating-pic-body">
        <img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" draggable="false" loading="lazy">
      </div>
      <div class="floating-pic-resizer" title="Drag corner to resize"></div>
    `;

    if (parentP && parentP.children.length === 1 && !parentP.textContent.trim()) {
      parentP.replaceWith(pic);
    } else {
      img.replaceWith(pic);
    }
    converted = true;
  });

  if (converted) {
    attachFloatingPicHandlers(elements.docPaper);
    triggerDocAutoSave();
  }
}

function attachFloatingPicHandlers(scope = elements.docPaper) {
  if (!scope) return;
  const pics = scope.querySelectorAll('.doc-floating-pic');

  pics.forEach(pic => {
    if (pic.dataset.handlersAttached === 'true') return;
    pic.dataset.handlersAttached = 'true';

    // 1. Bring to front on click
    pic.addEventListener('mousedown', () => {
      maxFloatingPicZIndex += 1;
      pic.style.zIndex = maxFloatingPicZIndex;
      scope.querySelectorAll('.doc-floating-pic.is-focused').forEach(p => p.classList.remove('is-focused'));
      pic.classList.add('is-focused');
    });

    // 2. Dragging via Header Grip or Frame
    const grip = pic.querySelector('.floating-pic-grip');
    if (grip) {
      grip.addEventListener('mousedown', (e) => {
        if (e.target.closest('.floating-pic-btn') || e.target.closest('.floating-pic-resizer')) return;
        e.preventDefault();
        e.stopPropagation();

        maxFloatingPicZIndex += 1;
        pic.style.zIndex = maxFloatingPicZIndex;
        pic.classList.add('is-dragging');

        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = pic.offsetLeft;
        const startTop = pic.offsetTop;

        const onMouseMove = (moveEvt) => {
          const dx = moveEvt.clientX - startX;
          const dy = moveEvt.clientY - startY;

          const maxLeft = Math.max(0, elements.docPaper.clientWidth - 80);
          const newLeft = Math.max(0, Math.min(maxLeft, startLeft + dx));
          const newTop = Math.max(0, startTop + dy);

          pic.style.left = `${Math.round(newLeft)}px`;
          pic.style.top = `${Math.round(newTop)}px`;

          // Auto-expand paper height if picture dragged down
          if (newTop + pic.offsetHeight > elements.docPaper.offsetHeight - 50) {
            elements.docPaper.style.minHeight = `${Math.round(newTop + pic.offsetHeight + 100)}px`;
          }
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          pic.classList.remove('is-dragging');
          triggerDocAutoSave();
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    }

    // 3. Corner Resizing
    const resizer = pic.querySelector('.floating-pic-resizer');
    if (resizer) {
      resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        maxFloatingPicZIndex += 1;
        pic.style.zIndex = maxFloatingPicZIndex;

        const startX = e.clientX;
        const startWidth = pic.offsetWidth;
        const maxAllowedWidth = elements.docPaper.clientWidth - pic.offsetLeft - 10;

        const onMouseMove = (moveEvt) => {
          const dx = moveEvt.clientX - startX;
          const newWidth = Math.max(140, Math.min(maxAllowedWidth, startWidth + dx));
          pic.style.width = `${Math.round(newWidth)}px`;
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          triggerDocAutoSave();
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    }

    // 4. Action Buttons
    const btnDel = pic.querySelector('.btn-pic-del');
    if (btnDel) {
      btnDel.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        pic.remove();
        triggerDocAutoSave();
        showToast('Picture removed');
      });
    }

    const btnZoom = pic.querySelector('.btn-pic-zoom');
    const img = pic.querySelector('img');
    if (btnZoom && img) {
      btnZoom.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(img.src, img.alt || 'Study Picture');
      });
    }

    const btnFront = pic.querySelector('.btn-pic-front');
    if (btnFront) {
      btnFront.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        maxFloatingPicZIndex += 1;
        pic.style.zIndex = maxFloatingPicZIndex;
        triggerDocAutoSave();
      });
    }

    if (img) {
      img.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(img.src, img.alt || 'Study Picture');
      });
    }
  });
}

function handleDocImageClick(e) {
  openLightbox(e.target.src, e.target.alt || 'Lesson Image');
}

// Update Cloud Save indicator (Google Docs style)
function setDocSaveStatus(status) {
  if (status === 'saving') {
    elements.docSaveStatus.classList.add('saving');
    elements.docSaveStatus.querySelector('.save-text').innerHTML = `
      <svg class="save-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px;">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
      </svg>Saving...`;
  } else {
    elements.docSaveStatus.classList.remove('saving');
    elements.docSaveStatus.querySelector('.save-text').innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:4px;">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>Saved to cloud`;
  }
}

// Debounced Auto-Save
function triggerDocAutoSave() {
  setDocSaveStatus('saving');
  if (docAutoSaveTimeout) clearTimeout(docAutoSaveTimeout);
  docAutoSaveTimeout = setTimeout(() => {
    performDocSave();
  }, 650);
}

function flushDocAutoSave() {
  if (docAutoSaveTimeout) {
    clearTimeout(docAutoSaveTimeout);
    docAutoSaveTimeout = null;
    performDocSave();
  }
}

async function performDocSave() {
  const currentSubject = state.subjects.find(s => s.id === state.activeSubjectId);
  if (!currentSubject) return;

  const currentLesson = (currentSubject.lessons || []).find(l => l.id === state.activeLessonId);
  if (!currentLesson) return;

  const newTitle = elements.docLessonTitle.value.trim() || 'Untitled Lesson';
  const newContent = elements.docPaper.innerHTML;

  // Immediately store in memory and localStorage so refresh never wipes text
  currentLesson.title = newTitle;
  currentLesson.content = newContent;
  persistCache();

  try {
    const res = await fetch(`${API_BASE}/lessons/${currentLesson.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        content: newContent
      })
    });

    if (!res.ok) throw new Error('Failed to auto-save');
    const updated = await res.json();
    currentLesson.title = updated.title;
    currentLesson.content = updated.content;
    persistCache();

    // Update tab text in UI
    const activeTab = elements.lessonTabsScroll.querySelector('.lesson-tab.active .lesson-tab-name');
    if (activeTab) activeTab.textContent = newTitle;

    setDocSaveStatus('saved');
    attachDocImageHandlers();
  } catch (err) {
    console.error('Doc auto-save error:', err);
    elements.docSaveStatus.querySelector('.save-text').innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:4px;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>Save failed`;
  }
}

// Insert Image into Google Docs Paper as a Free-Roaming Overlay
function insertImageIntoDoc(url, alt = 'Lesson Picture', dropX = null, dropY = null) {
  maxFloatingPicZIndex += 1;

  const existingPics = elements.docPaper.querySelectorAll('.doc-floating-pic');
  const count = existingPics.length;

  let left, top;
  if (dropX !== null && dropY !== null) {
    left = Math.max(10, Math.min(elements.docPaper.clientWidth - 260, dropX - 100));
    top = Math.max(10, dropY - 20);
  } else {
    const paperWidth = elements.docPaper.clientWidth || 800;
    left = Math.max(20, paperWidth - 340);
    const scrollOffset = elements.docCanvasOuter ? elements.docCanvasOuter.scrollTop : 0;
    top = Math.max(30, scrollOffset + 50 + (count * 35));
  }

  const picHtml = `
    <div class="doc-floating-pic" contenteditable="false" style="left: ${Math.round(left)}px; top: ${Math.round(top)}px; width: 280px; z-index: ${maxFloatingPicZIndex};">
      <div class="floating-pic-header">
        <div class="floating-pic-grip" title="Drag to move anywhere over notes">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="5" r="2"></circle><circle cx="12" cy="5" r="2"></circle><circle cx="19" cy="5" r="2"></circle>
            <circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle>
            <circle cx="5" cy="19" r="2"></circle><circle cx="12" cy="19" r="2"></circle><circle cx="19" cy="19" r="2"></circle>
          </svg>
          <span class="floating-pic-label">${escapeHtml(alt || 'Picture')}</span>
        </div>
        <div class="floating-pic-actions">
          <button type="button" class="floating-pic-btn btn-pic-front" title="Bring to Front">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button type="button" class="floating-pic-btn btn-pic-zoom" title="View Fullscreen">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </button>
          <button type="button" class="floating-pic-btn btn-pic-del" title="Delete Picture">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      <div class="floating-pic-body">
        <img src="${escapeHtml(url)}" alt="${escapeHtml(alt || 'Lesson Picture')}" draggable="false" loading="lazy">
      </div>
      <div class="floating-pic-resizer" title="Drag corner to resize"></div>
    </div>
  `.trim();

  // Overlay insertion: never splits text, headings, or paragraphs!
  elements.docPaper.insertAdjacentHTML('beforeend', picHtml);
  attachFloatingPicHandlers(elements.docPaper);
  triggerDocAutoSave();
}

// Render Assignments
function renderAssignments() {
  // Populate subject filter options
  const currentVal = elements.assignmentSubjectFilter.value;
  elements.assignmentSubjectFilter.innerHTML = '<option value="all">All Subjects</option>';
  state.subjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub.id;
    opt.textContent = sub.name;
    elements.assignmentSubjectFilter.appendChild(opt);
  });
  if (currentVal) elements.assignmentSubjectFilter.value = currentVal;

  elements.assignmentsList.innerHTML = '';

  const filtered = state.assignments.filter(asg => {
    // Status filter
    if (state.activeAssignmentFilter === 'pending' && asg.completed) return false;
    if (state.activeAssignmentFilter === 'completed' && !asg.completed) return false;

    // Subject filter
    if (state.activeAssignmentSubject !== 'all' && asg.subjectId !== state.activeAssignmentSubject) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    elements.assignmentsList.classList.add('hidden');
    elements.assignmentsEmptyState.classList.remove('hidden');
    return;
  }

  elements.assignmentsList.classList.remove('hidden');
  elements.assignmentsEmptyState.classList.add('hidden');

  filtered.forEach(asg => {
    const item = document.createElement('div');
    item.className = `assignment-item ${asg.completed ? 'completed' : ''}`;

    const sub = state.subjects.find(s => s.id === asg.subjectId);
    const subLabel = sub ? (sub.code || sub.name) : 'General';
    const dueDateText = asg.dueDate ? formatDate(asg.dueDate) : 'No due date';
    const asgImgCount = (asg.images && asg.images.length) || 0;

    item.innerHTML = `
      <div class="assignment-left">
        <input type="checkbox" class="assignment-checkbox" ${asg.completed ? 'checked' : ''} title="Mark completed">
        <div class="assignment-content">
          <div class="assignment-title">${escapeHtml(asg.title)}</div>
          <div class="assignment-meta-row">
            <span class="assignment-subject-tag">${escapeHtml(subLabel)}</span>
            <span>${dueDateText}</span>
            ${asgImgCount > 0 ? `<span class="asg-img-badge btn-view-asg-images" title="Click to view attached images"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>${asgImgCount} image${asgImgCount === 1 ? '' : 's'}</span>` : ''}
            ${asg.notes ? `<span>&bull; ${escapeHtml(asg.notes)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="assignment-right">
        <span class="assignment-priority priority-${asg.priority || 'Medium'}">${escapeHtml(asg.priority || 'Medium')}</span>
        <div class="assignment-actions">
          <button class="action-icon-btn btn-edit-asg" title="Edit assignment">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="action-icon-btn danger btn-delete-asg" title="Delete assignment">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Checkbox toggle handler
    const checkbox = item.querySelector('.assignment-checkbox');
    checkbox.addEventListener('change', () => toggleAssignment(asg.id));

    // View attached pictures
    const viewImgBadge = item.querySelector('.btn-view-asg-images');
    if (viewImgBadge && asg.images && asg.images.length > 0) {
      viewImgBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(asg.images[0].url, `${asg.title} (${asg.images[0].name || 'Attachment'})`);
      });
    }

    // Edit button
    const editBtn = item.querySelector('.btn-edit-asg');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditAssignmentModal(asg);
    });

    // Delete button
    const deleteBtn = item.querySelector('.btn-delete-asg');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteAssignment(asg.id);
    });

    elements.assignmentsList.appendChild(item);
  });
}

// ==========================================================================
// LESSON VIEWER DRAWER
// ==========================================================================
function openLessonView(lesson) {
  state.currentViewingLesson = lesson;
  const currentSubject = state.subjects.find(s => s.id === state.activeSubjectId);

  elements.viewLessonSubjectCode.textContent = currentSubject ? (currentSubject.code || currentSubject.name) : 'LESSON';
  elements.viewLessonDate.textContent = lesson.createdAt ? `Created ${formatDate(lesson.createdAt)}` : '';
  elements.viewLessonTitle.textContent = lesson.title;
  elements.viewLessonSummary.textContent = lesson.summary || 'No summary provided.';
  
  const statusEl = elements.viewLessonStatus;
  statusEl.textContent = lesson.status || 'In Progress';
  statusEl.className = `status-indicator ${lesson.status === 'Completed' ? 'status-completed' : (lesson.status === 'In Progress' ? 'status-progress' : '')}`;

  // Render markdown/notes
  elements.viewLessonContent.innerHTML = renderMarkdown(lesson.content || '*No detailed notes recorded for this lesson yet.*');

  // Render attached pictures / slides gallery
  const images = lesson.images || [];
  if (images.length > 0) {
    elements.viewLessonGallerySection.classList.remove('hidden');
    elements.viewLessonGalleryCount.textContent = images.length;
    elements.viewLessonGalleryGrid.innerHTML = '';
    images.forEach((img, idx) => {
      const card = document.createElement('div');
      card.className = 'gallery-image-card';
      card.innerHTML = `
        <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.name || 'Slide ' + (idx + 1))}" loading="lazy">
        <div class="gallery-image-overlay">
          <span class="gallery-image-name">${escapeHtml(img.name || 'Slide ' + (idx + 1))}</span>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(img.url, img.name || `Slide ${idx + 1}`));
      elements.viewLessonGalleryGrid.appendChild(card);
    });
  } else {
    elements.viewLessonGallerySection.classList.add('hidden');
  }

  elements.drawerLessonView.classList.remove('hidden');
}

function closeLessonView() {
  elements.drawerLessonView.classList.add('hidden');
  state.currentViewingLesson = null;
}

// Toggle lesson status
async function toggleLessonStatus() {
  if (!state.currentViewingLesson) return;
  const current = state.currentViewingLesson;
  const nextStatus = current.status === 'Completed' ? 'In Progress' : 'Completed';

  try {
    const res = await fetch(`${API_BASE}/lessons/${current.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    if (!res.ok) throw new Error('Failed to update status');
    current.status = nextStatus;
    openLessonView(current);
    renderSubjectWorkspace();
    showToast(`Lesson marked as ${nextStatus}`);
  } catch (err) {
    showToast('Failed to update lesson status');
  }
}

// ==========================================================================
// FLASHCARDS & STUDY DECK PLAYER
// ==========================================================================

function renderFlashcardDecks() {
  if (!elements.decksGrid) return;

  // Populate subject filter
  if (elements.deckSubjectFilter) {
    const currentVal = elements.deckSubjectFilter.value;
    elements.deckSubjectFilter.innerHTML = '<option value="all">All Subjects</option>';
    state.subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      elements.deckSubjectFilter.appendChild(opt);
    });
    if (currentVal) elements.deckSubjectFilter.value = currentVal;
  }

  elements.decksGrid.innerHTML = '';

  const filtered = (state.flashcardDecks || []).filter(deck => {
    if (state.activeDeckSubject !== 'all' && deck.subjectId !== state.activeDeckSubject) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    elements.decksGrid.classList.add('hidden');
    elements.decksEmptyState.classList.remove('hidden');
    return;
  }

  elements.decksGrid.classList.remove('hidden');
  elements.decksEmptyState.classList.add('hidden');

  filtered.forEach(deck => {
    const card = document.createElement('div');
    card.className = 'deck-card';

    const sub = state.subjects.find(s => s.id === deck.subjectId);
    const subLabel = sub ? (sub.code || sub.name) : 'General';
    const cardCount = (deck.cards && deck.cards.length) || 0;
    const masteredCount = (deck.cards || []).filter(c => c.status === 'easy').length;

    card.innerHTML = `
      <div class="deck-card-top">
        <div class="deck-card-header-row">
          <span class="assignment-subject-tag">${escapeHtml(subLabel)}</span>
          <button class="action-icon-btn danger btn-delete-deck" title="Delete deck">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        <h3 class="deck-card-title">${escapeHtml(deck.title)}</h3>
      </div>
      <div class="deck-card-footer">
        <span class="deck-card-count">${cardCount} Card${cardCount === 1 ? '' : 's'}${masteredCount > 0 ? ` &bull; ${masteredCount} Mastered` : ''}</span>
        <button class="btn-primary btn-sm btn-start-deck">Study &rarr;</button>
      </div>
    `;

    card.addEventListener('click', () => startStudyDeck(deck.id));

    const delBtn = card.querySelector('.btn-delete-deck');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteDeck(deck.id);
    });

    elements.decksGrid.appendChild(card);
  });
}

function startStudyDeck(deckId) {
  const deck = (state.flashcardDecks || []).find(d => d.id === deckId);
  if (!deck || !deck.cards || deck.cards.length === 0) {
    showToast('This deck has no cards');
    return;
  }

  state.currentStudyDeck = JSON.parse(JSON.stringify(deck)); // clone for session
  state.currentCardIndex = 0;
  state.isCardFlipped = false;
  state.studySessionStats = { again: 0, good: 0, easy: 0 };

  const sub = state.subjects.find(s => s.id === deck.subjectId);
  elements.playerSubjectBadge.textContent = sub ? (sub.code || sub.name) : 'General';
  elements.playerDeckTitle.textContent = deck.title;

  elements.decksListView.classList.add('hidden');
  elements.deckStudyPlayer.classList.remove('hidden');
  elements.deckFinishedCard.classList.add('hidden');
  elements.flashcardStudyContainer.classList.remove('hidden');

  renderActiveStudyCard();
}

function renderActiveStudyCard() {
  if (!state.currentStudyDeck) return;
  const cards = state.currentStudyDeck.cards;

  if (state.currentCardIndex >= cards.length) {
    finishStudySession();
    return;
  }

  const current = cards[state.currentCardIndex];
  state.isCardFlipped = false;
  elements.activeFlashcard.classList.remove('is-flipped');

  elements.flashcardCounter.textContent = `CARD ${String(state.currentCardIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  elements.flashcardStatusTag.textContent = (current.status || 'NEW').toUpperCase();

  elements.cardQuestionText.textContent = current.question;
  elements.cardAnswerText.textContent = current.answer;

  const progressPercent = Math.round((state.currentCardIndex / cards.length) * 100);
  elements.playerProgressBar.style.width = `${progressPercent}%`;
}

function flipActiveCard() {
  state.isCardFlipped = !state.isCardFlipped;
  if (state.isCardFlipped) {
    elements.activeFlashcard.classList.add('is-flipped');
  } else {
    elements.activeFlashcard.classList.remove('is-flipped');
  }
}

function rateActiveCard(rating) {
  if (!state.currentStudyDeck) return;
  const cards = state.currentStudyDeck.cards;
  if (state.currentCardIndex >= cards.length) return;

  const current = cards[state.currentCardIndex];
  current.status = rating;

  if (rating === 'again') {
    state.studySessionStats.again++;
    cards.push({ ...current }); // Re-queue to end for reinforcement
  } else if (rating === 'good') {
    state.studySessionStats.good++;
  } else if (rating === 'easy') {
    state.studySessionStats.easy++;
  }

  // Sync state back to stored deck
  const origDeck = (state.flashcardDecks || []).find(d => d.id === state.currentStudyDeck.id);
  if (origDeck && origDeck.cards) {
    const c = origDeck.cards.find(item => item.id === current.id);
    if (c) c.status = rating;
    fetch(`${API_BASE}/flashcards/${origDeck.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(origDeck)
    }).catch(() => {});
  }

  state.currentCardIndex++;
  renderActiveStudyCard();
}

function finishStudySession() {
  elements.flashcardStudyContainer.classList.add('hidden');
  elements.deckFinishedCard.classList.remove('hidden');
  elements.playerProgressBar.style.width = '100%';

  const total = state.studySessionStats.again + state.studySessionStats.good + state.studySessionStats.easy;
  elements.finishedSessionStats.textContent = `Completed ${total} prompt reviews (${state.studySessionStats.easy} Mastered, ${state.studySessionStats.again} repeated).`;
}

function exitStudyDeckPlayer() {
  elements.deckStudyPlayer.classList.add('hidden');
  elements.decksListView.classList.remove('hidden');
  state.currentStudyDeck = null;
  renderFlashcardDecks();
  updateBadges();
}

function shuffleCurrentDeck() {
  if (!state.currentStudyDeck || !state.currentStudyDeck.cards) return;
  const currentIdx = state.currentCardIndex;
  const remaining = state.currentStudyDeck.cards.slice(currentIdx);
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }
  state.currentStudyDeck.cards = [
    ...state.currentStudyDeck.cards.slice(0, currentIdx),
    ...remaining
  ];
  renderActiveStudyCard();
  showToast('Deck shuffled');
}

async function deleteDeck(deckId) {
  if (!confirm('Are you sure you want to delete this flashcard deck?')) return;
  try {
    const res = await fetch(`${API_BASE}/flashcards/${deckId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete deck');
    state.flashcardDecks = state.flashcardDecks.filter(d => d.id !== deckId);
    renderFlashcardDecks();
    updateBadges();
    showToast('Deck deleted');
  } catch (err) {
    showToast('Failed to delete deck');
  }
}

// ==========================================================================
// FLASHCARD GENERATOR MODAL & HEURISTICS
// ==========================================================================

async function scanDocumentFile(file) {
  if (!file) return;
  const validExts = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.txt', '.md'];
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!validExts.includes(ext)) {
    showToast('Please upload a PDF, PowerPoint (.pptx), or Word (.docx) file');
    return;
  }

  // Show status indicator
  elements.scannerStatus.classList.remove('hidden');
  elements.scannerStatusText.textContent = `Scanning "${file.name}"...`;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const res = await fetch(`${API_BASE}/scan-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          data: reader.result
        })
      });

      elements.scannerStatus.classList.add('hidden');

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to scan document');
      }

      const result = await res.json();
      elements.genSourceText.value = result.text;
      if (!elements.genDeckTitle.value.trim() || elements.genDeckTitle.value.includes('Review Deck')) {
        elements.genDeckTitle.value = result.suggestedTitle;
      }
      showToast(`Scanned ${file.name} successfully! Click Generate Q&A Cards.`);
    } catch (err) {
      elements.scannerStatus.classList.add('hidden');
      showToast(err.message || 'Error scanning file');
    }
  };
  reader.onerror = () => {
    elements.scannerStatus.classList.add('hidden');
    showToast('Could not read file from disk');
  };
  reader.readAsDataURL(file);
}

function openGenerateModal(prefillTitle = '', prefillSubjectId = '', prefillText = '') {
  elements.genDeckTitle.value = prefillTitle || '';
  elements.genSourceText.value = prefillText || '';
  elements.scannerStatus.classList.add('hidden');

  elements.genSubjectSelect.innerHTML = '<option value="">(None / General)</option>';
  state.subjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub.id;
    opt.textContent = sub.name + (sub.code ? ` (${sub.code})` : '');
    if (sub.id === (prefillSubjectId || state.activeSubjectId)) opt.selected = true;
    elements.genSubjectSelect.appendChild(opt);
  });

  elements.genStepInput.classList.remove('hidden');
  elements.genStepPreview.classList.add('hidden');
  state.tempGenCards = [];

  elements.modalGenerateFlashcards.classList.remove('hidden');
  if (!prefillText) elements.genSourceText.focus();
}

function closeGenerateModal() {
  elements.modalGenerateFlashcards.classList.add('hidden');
  elements.scannerStatus.classList.add('hidden');
  state.tempGenCards = [];
}

function renderGenPreviewCards() {
  elements.genPreviewStats.textContent = `${state.tempGenCards.length} Card${state.tempGenCards.length === 1 ? '' : 's'} Generated`;
  elements.genCardsList.innerHTML = '';

  state.tempGenCards.forEach((c, idx) => {
    const item = document.createElement('div');
    item.className = 'gen-card-item';
    item.innerHTML = `
      <div class="gen-card-item-top">
        <span class="gen-card-num">CARD #${idx + 1}</span>
        <button type="button" class="btn-delete-gencard" title="Remove this card">&times;</button>
      </div>
      <div class="form-group">
        <label>Question</label>
        <input type="text" class="input-clean card-q-input" value="${escapeHtml(c.question)}" required>
      </div>
      <div class="form-group">
        <label>Answer</label>
        <textarea class="textarea-clean card-a-input" rows="2" required>${escapeHtml(c.answer)}</textarea>
      </div>
    `;

    // Input changes update state
    const qInput = item.querySelector('.card-q-input');
    qInput.addEventListener('input', () => { c.question = qInput.value; });

    const aInput = item.querySelector('.card-a-input');
    aInput.addEventListener('input', () => { c.answer = aInput.value; });

    // Delete card
    item.querySelector('.btn-delete-gencard').addEventListener('click', () => {
      state.tempGenCards.splice(idx, 1);
      renderGenPreviewCards();
    });

    elements.genCardsList.appendChild(item);
  });
}

// Client-side extraction fallback
function generateCardsFromTextClient(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const text = rawText.trim();
  const cards = [];
  const seen = new Set();

  function add(q, a) {
    q = q.trim().replace(/^[-*•\d.)\s]+/, '');
    a = a.trim().replace(/^[-*•\s]+/, '');
    if (!q || !a || q.length < 3 || a.length < 2) return;
    const key = q.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    cards.push({
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      question: q,
      answer: a,
      status: 'new'
    });
  }

  const lines = text.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    const termMatch = line.match(/^[-*•\s]*(\*\*[^*]+\*\*|[A-Za-z0-9\s()/_.-]{2,45})\s*[:–—=]\s*(.+)$/);
    if (termMatch) {
      add(`What is ${termMatch[1].replace(/\*\*/g, '').trim()}?`, termMatch[2].trim());
      continue;
    }

    const isMatch = line.match(/^([A-Z][A-Za-z0-9\s()/_.-]{1,45})\s+(is defined as|refers to|is an?|means)\s+(.+)$/i);
    if (isMatch) {
      add(`What is ${isMatch[1].trim()}?`, `${isMatch[1].trim()} ${isMatch[2].trim()} ${isMatch[3].trim()}`);
      continue;
    }
  }

  if (cards.length === 0 && text.length > 5) {
    add('Summary / Core Concept:', text.substring(0, 250));
  }
  return cards;
}

// ==========================================================================
// IMAGE UPLOADS & ATTACHMENTS
// ==========================================================================
async function uploadImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name || 'study-picture.png',
            data: reader.result
          })
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderLessonThumbnails() {
  elements.lessonThumbnailsRow.innerHTML = '';
  state.tempLessonImages.forEach((img, index) => {
    const chip = document.createElement('div');
    chip.className = 'thumbnail-chip';
    chip.innerHTML = `
      <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.name || '')}">
      <button type="button" class="btn-remove-thumb" title="Remove image">&times;</button>
    `;
    chip.querySelector('.btn-remove-thumb').addEventListener('click', (e) => {
      e.stopPropagation();
      state.tempLessonImages.splice(index, 1);
      renderLessonThumbnails();
    });
    elements.lessonThumbnailsRow.appendChild(chip);
  });
}

function renderAsgThumbnails() {
  elements.asgThumbnailsRow.innerHTML = '';
  state.tempAsgImages.forEach((img, index) => {
    const chip = document.createElement('div');
    chip.className = 'thumbnail-chip';
    chip.innerHTML = `
      <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.name || '')}">
      <button type="button" class="btn-remove-thumb" title="Remove image">&times;</button>
    `;
    chip.querySelector('.btn-remove-thumb').addEventListener('click', (e) => {
      e.stopPropagation();
      state.tempAsgImages.splice(index, 1);
      renderAsgThumbnails();
    });
    elements.asgThumbnailsRow.appendChild(chip);
  });
}

async function handleFilesUpload(files, targetArray, renderCallback) {
  if (!files || files.length === 0) return;
  showToast('Uploading pictures...');
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    try {
      const uploaded = await uploadImageFile(file);
      targetArray.push({ url: uploaded.url, name: uploaded.name });
      renderCallback();
    } catch (err) {
      showToast(`Failed to upload ${file.name}`);
    }
  }
  showToast('Picture(s) attached');
}

// Fullscreen Lightbox
function openLightbox(url, caption = '') {
  elements.lightboxImg.src = url;
  elements.lightboxCaption.textContent = caption;
  elements.lightboxModal.classList.remove('hidden');
}

function closeLightbox() {
  elements.lightboxModal.classList.add('hidden');
  elements.lightboxImg.src = '';
}

// ==========================================================================
// MODAL CONTROLLERS
// ==========================================================================

// Add Subject Modal
function openAddSubjectModal() {
  elements.subNameInput.value = '';
  elements.subCodeInput.value = '';
  elements.modalAddSubject.classList.remove('hidden');
  elements.subNameInput.focus();
}

function closeAddSubjectModal() {
  elements.modalAddSubject.classList.add('hidden');
}

// Add Lesson Modal (Clean, fast Google Docs style)
function openAddLessonModal() {
  if (!state.activeSubjectId) {
    showToast('Please select or create a subject first');
    return;
  }
  elements.lessonTitleInput.value = '';
  elements.modalAddLesson.classList.remove('hidden');
  elements.lessonTitleInput.focus();
}

function closeAddLessonModal() {
  elements.modalAddLesson.classList.add('hidden');
}

// Add/Edit Assignment Modal
function openAddAssignmentModal() {
  elements.assignmentModalTitle.textContent = 'Add Assignment';
  elements.editAssignmentId.value = '';
  elements.asgTitleInput.value = '';
  elements.asgDueDateInput.value = '';
  elements.asgPriorityInput.value = 'Medium';
  elements.asgNotesInput.value = '';
  state.tempAsgImages = [];
  renderAsgThumbnails();

  // Populate subjects dropdown
  elements.asgSubjectSelect.innerHTML = '';
  state.subjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub.id;
    opt.textContent = sub.name + (sub.code ? ` (${sub.code})` : '');
    if (sub.id === state.activeSubjectId) opt.selected = true;
    elements.asgSubjectSelect.appendChild(opt);
  });

  elements.modalAddAssignment.classList.remove('hidden');
  elements.asgTitleInput.focus();
}

function openEditAssignmentModal(asg) {
  elements.assignmentModalTitle.textContent = 'Edit Assignment';
  elements.editAssignmentId.value = asg.id;
  elements.asgTitleInput.value = asg.title;
  elements.asgDueDateInput.value = asg.dueDate || '';
  elements.asgPriorityInput.value = asg.priority || 'Medium';
  elements.asgNotesInput.value = asg.notes || '';
  state.tempAsgImages = [...(asg.images || [])];
  renderAsgThumbnails();

  elements.asgSubjectSelect.innerHTML = '';
  state.subjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub.id;
    opt.textContent = sub.name + (sub.code ? ` (${sub.code})` : '');
    if (sub.id === asg.subjectId) opt.selected = true;
    elements.asgSubjectSelect.appendChild(opt);
  });

  elements.modalAddAssignment.classList.remove('hidden');
  elements.asgTitleInput.focus();
}

function closeAddAssignmentModal() {
  elements.modalAddAssignment.classList.add('hidden');
}

// ==========================================================================
// FORM SUBMISSIONS & ACTIONS
// ==========================================================================

// Create Subject
elements.formAddSubject.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = elements.subNameInput.value.trim();
  const code = elements.subCodeInput.value.trim().toUpperCase();
  if (!name) return;

  try {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code })
    });
    if (!res.ok) throw new Error('Failed to create subject');
    const created = await res.json();
    state.subjects.push(created);
    state.activeSubjectId = created.id;
    closeAddSubjectModal();
    renderAll();
    showToast(`Subject "${name}" created`);
  } catch (err) {
    showToast('Failed to create subject');
  }
});

// Delete Subject
elements.btnDeleteSubject.addEventListener('click', async () => {
  if (!state.activeSubjectId) return;
  const current = state.subjects.find(s => s.id === state.activeSubjectId);
  if (!current) return;

  if (!confirm(`Are you sure you want to delete "${current.name}" and all its lessons?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/subjects/${current.id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete subject');
    state.subjects = state.subjects.filter(s => s.id !== current.id);
    state.assignments = state.assignments.filter(a => a.subjectId !== current.id);
    state.activeSubjectId = state.subjects.length > 0 ? state.subjects[0].id : null;
    renderAll();
    showToast('Subject deleted');
  } catch (err) {
    showToast('Failed to delete subject');
  }
});

// Create Lesson (Google Docs style - simply give it a title and start typing)
elements.formAddLesson.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = elements.lessonTitleInput.value.trim() || 'Untitled Lesson';

  if (!state.activeSubjectId) {
    showToast('Please select a subject first');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/subjects/${state.activeSubjectId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content: ''
      })
    });
    if (!res.ok) throw new Error('Failed to create lesson');
    const newLesson = await res.json();
    
    const currentSubject = state.subjects.find(s => s.id === state.activeSubjectId);
    if (currentSubject) {
      if (!currentSubject.lessons) currentSubject.lessons = [];
      currentSubject.lessons.push(newLesson);
    }
    
    state.activeLessonId = newLesson.id;
    persistCache();
    closeAddLessonModal();
    renderSubjectWorkspace();
    
    // Focus into the Google Docs page immediately so the user can start typing
    setTimeout(() => {
      if (elements.docPaper) {
        elements.docPaper.focus();
      }
    }, 100);

    showToast(`Lesson "${title}" created`);
  } catch (err) {
    showToast('Failed to create lesson');
  }
});

// Real-Time Google Docs Document Canvas Listeners
// 1. Live Title Changes
elements.docLessonTitle.addEventListener('input', () => {
  const activeTab = elements.lessonTabsScroll.querySelector('.lesson-tab.active .lesson-tab-name');
  if (activeTab) activeTab.textContent = elements.docLessonTitle.value || 'Untitled Lesson';
  triggerDocAutoSave();
});
elements.docLessonTitle.addEventListener('change', () => {
  flushDocAutoSave();
});

// 2. Live Content Changes
elements.docPaper.addEventListener('input', () => {
  triggerDocAutoSave();
});

// 3. Paste handling: paste text or paste screenshots directly into doc
elements.docPaper.addEventListener('paste', async (e) => {
  const clipboard = e.clipboardData;
  if (!clipboard || !clipboard.items) return;

  for (let item of clipboard.items) {
    if (item.type.indexOf('image') !== -1) {
      e.preventDefault();
      const file = item.getAsFile();
      showToast('Uploading pasted picture...');
      try {
        const uploaded = await uploadImageFile(file);
        insertImageIntoDoc(uploaded.url, uploaded.name || 'Pasted Note');
        showToast('Picture inserted into document');
      } catch (err) {
        showToast('Failed to upload picture');
      }
      return;
    }
  }

  // If text pasted, allow normal paste and trigger save
  setTimeout(triggerDocAutoSave, 50);
});

// 4. Drag & Drop images directly onto document canvas
elements.docPaper.addEventListener('dragover', (e) => {
  e.preventDefault();
  elements.docPaper.style.borderColor = 'rgba(255, 255, 255, 0.4)';
});
['dragleave', 'dragend'].forEach(evt => {
  elements.docPaper.addEventListener(evt, () => {
    elements.docPaper.style.borderColor = '';
  });
});
elements.docPaper.addEventListener('drop', async (e) => {
  e.preventDefault();
  elements.docPaper.style.borderColor = '';
  const files = e.dataTransfer && e.dataTransfer.files;
  if (!files || files.length === 0) return;

  const canvasRect = elements.docPaper.getBoundingClientRect();
  const dropX = e.clientX - canvasRect.left;
  const dropY = e.clientY - canvasRect.top;

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      showToast('Uploading dropped slide/image...');
      try {
        const uploaded = await uploadImageFile(file);
        insertImageIntoDoc(uploaded.url, file.name, dropX, dropY);
        showToast('Picture placed as free-roaming overlay');
      } catch (err) {
        showToast('Failed to upload image');
      }
    }
  }
});

// Deselect overlay pictures when clicking elsewhere
document.addEventListener('mousedown', (e) => {
  if (!e.target.closest('.doc-floating-pic')) {
    elements.docPaper?.querySelectorAll('.doc-floating-pic.is-focused').forEach(p => p.classList.remove('is-focused'));
  }
});

// ==========================================================================
// 5. GOOGLE DOCS FORMATTING TOOLBAR ENGINE
// ==========================================================================

// Track and preserve text selection across toolbar interactions
let savedDocRange = null;

function saveDocSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    if (elements.docPaper && elements.docPaper.contains(range.commonAncestorContainer)) {
      savedDocRange = range.cloneRange();
    }
  }
}

function restoreDocSelection() {
  if (savedDocRange && window.getSelection) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedDocRange);
  }
}

// Update Active Button Highlights on Toolbar (like Google Docs)
function updateToolbarActiveStates() {
  if (!elements.docPaper) return;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  const node = sel.anchorNode;
  if (!node || !elements.docPaper.contains(node)) return;

  // 1. Inline commands: Bold, Italic, Underline, Strikethrough, Lists
  document.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
    const cmd = btn.dataset.command;
    try {
      if (document.queryCommandState(cmd)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    } catch (e) {
      btn.classList.remove('active');
    }
  });

  // 2. Block format: check closest H1, H2, H3, blockquote, pre
  let cur = node.nodeType === 1 ? node : node.parentElement;
  let blockTag = 'p';
  while (cur && cur !== elements.docPaper) {
    const tag = cur.tagName ? cur.tagName.toLowerCase() : '';
    if (['h1', 'h2', 'h3', 'blockquote', 'pre'].includes(tag)) {
      blockTag = tag;
      break;
    }
    cur = cur.parentElement;
  }
  if (elements.docFormatBlock && elements.docFormatBlock.value !== blockTag) {
    elements.docFormatBlock.value = blockTag;
  }

  // 3. Highlighter active state & color indicator sync
  const activeMark = getClosestHighlightMark(node);
  if (elements.btnToolbarHighlighter) {
    if (activeMark) {
      elements.btnToolbarHighlighter.classList.add('active');
      const colorMatch = activeMark.className.match(/doc-highlight-(amber|emerald|cyan|violet|coral)/);
      if (colorMatch && colorMatch[1]) {
        updateHighlighterIndicatorColor(colorMatch[1]);
      }
    } else {
      elements.btnToolbarHighlighter.classList.remove('active');
    }
  }

  // 4. Font family sync
  if (elements.docFontFamily) {
    let fontNode = node.nodeType === 1 ? node : node.parentElement;
    let detectedFont = "'Plus Jakarta Sans', sans-serif";
    while (fontNode && fontNode !== elements.docPaper) {
      const ff = fontNode.style.fontFamily || (fontNode.getAttribute && fontNode.getAttribute('face'));
      if (ff) {
        const options = Array.from(elements.docFontFamily.options);
        const match = options.find(opt => {
          const optPrefix = opt.value.replace(/['"]/g, '').split(',')[0].trim().toLowerCase();
          return ff.toLowerCase().includes(optPrefix);
        });
        if (match) {
          detectedFont = match.value;
          break;
        }
      }
      fontNode = fontNode.parentElement;
    }
    if (elements.docFontFamily.value !== detectedFont) {
      elements.docFontFamily.value = detectedFont;
    }
  }

  // 5. Font size sync
  if (elements.docFontSize) {
    let sizeNode = node.nodeType === 1 ? node : node.parentElement;
    let detectedSize = null;
    while (sizeNode && sizeNode !== elements.docPaper) {
      if (sizeNode.style && sizeNode.style.fontSize) {
        detectedSize = sizeNode.style.fontSize;
        break;
      }
      sizeNode = sizeNode.parentElement;
    }
    if (detectedSize) {
      const numeric = parseInt(detectedSize, 10);
      const match = Array.from(elements.docFontSize.options).find(opt => parseInt(opt.value, 10) === numeric);
      if (match && elements.docFontSize.value !== match.value) {
        elements.docFontSize.value = match.value;
      }
    } else {
      if (elements.docFontSize.value !== '16px') {
        elements.docFontSize.value = '16px';
      }
    }
  }
}

// Apply block format safely across all browsers
function applyDocBlockFormat(tag) {
  elements.docPaper.focus();
  restoreDocSelection();

  let success = false;
  try {
    success = document.execCommand('formatBlock', false, `<${tag}>`);
  } catch (e) {}

  if (!success) {
    try {
      success = document.execCommand('formatBlock', false, tag);
    } catch (e) {}
  }

  triggerDocAutoSave();
  updateToolbarActiveStates();
}

// Apply Font Family to selected text or active block
function applyDocFontFamily(fontValue) {
  elements.docPaper.focus();
  restoreDocSelection();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!elements.docPaper.contains(range.commonAncestorContainer)) return;

  if (range.collapsed) {
    let node = range.startContainer;
    let el = node.nodeType === 1 ? node : node.parentElement;
    if (el && el !== elements.docPaper && el.tagName === 'SPAN' && el.style.fontFamily) {
      el.style.fontFamily = fontValue;
    } else {
      let block = el;
      while (block && block !== elements.docPaper && !['p', 'h1', 'h2', 'h3', 'li', 'blockquote'].includes(block.tagName.toLowerCase())) {
        block = block.parentElement;
      }
      if (block && block !== elements.docPaper) {
        block.style.fontFamily = fontValue;
      }
    }
  } else {
    let success = false;
    try {
      success = document.execCommand('fontName', false, fontValue);
      const fontTags = elements.docPaper.querySelectorAll('font[face]');
      fontTags.forEach(f => {
        const span = document.createElement('span');
        span.style.fontFamily = f.getAttribute('face') || fontValue;
        while (f.firstChild) span.appendChild(f.firstChild);
        f.replaceWith(span);
      });
    } catch (e) {}

    if (!success) {
      try {
        const span = document.createElement('span');
        span.style.fontFamily = fontValue;
        span.appendChild(range.extractContents());
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedDocRange = newRange.cloneRange();
      } catch (err) {}
    }
  }

  triggerDocAutoSave();
  updateToolbarActiveStates();
}

// Preset font sizes for text scaling
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 44, 56];

// Apply Font Size to selected text or active block
function applyDocFontSize(sizeStr) {
  elements.docPaper.focus();
  restoreDocSelection();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!elements.docPaper.contains(range.commonAncestorContainer)) return;

  const size = sizeStr.endsWith('px') ? sizeStr : `${sizeStr}px`;

  if (range.collapsed) {
    let node = range.startContainer;
    let el = node.nodeType === 1 ? node : node.parentElement;
    if (el && el !== elements.docPaper && el.tagName === 'SPAN' && el.style.fontSize) {
      el.style.fontSize = size;
    } else {
      let block = el;
      while (block && block !== elements.docPaper && !['p', 'h1', 'h2', 'h3', 'li', 'blockquote'].includes(block.tagName.toLowerCase())) {
        block = block.parentElement;
      }
      if (block && block !== elements.docPaper) {
        block.style.fontSize = size;
      }
    }
  } else {
    try {
      let el = range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;

      if (el && el !== elements.docPaper && el.tagName === 'SPAN' && el.style.fontSize && range.toString() === el.textContent) {
        el.style.fontSize = size;
      } else {
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.appendChild(range.extractContents());
        range.insertNode(span);

        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedDocRange = newRange.cloneRange();
      }
    } catch (err) {
      console.warn('Font size error:', err);
    }
  }

  if (elements.docFontSize) {
    elements.docFontSize.value = size;
  }

  triggerDocAutoSave();
  updateToolbarActiveStates();
}

// Google Docs Formatting Toolbar Buttons
document.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
  // CRITICAL: Prevent mousedown from stealing focus and unselecting highlighted text!
  btn.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    elements.docPaper.focus();
    const command = btn.dataset.command;
    if (!command) return;

    if (command === 'insertHorizontalRule') {
      document.execCommand('insertHorizontalRule', false, null);
      // Ensure cursor is placed below rule in a fresh paragraph
      const hr = elements.docPaper.querySelector('hr:last-of-type');
      if (hr && (!hr.nextElementSibling || hr.nextElementSibling.tagName !== 'P')) {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        hr.after(p);
      }
    } else {
      document.execCommand(command, false, null);
    }

    triggerDocAutoSave();
    updateToolbarActiveStates();
  });
});

// Toolbar Styles dropdown (Normal text, Heading 1, 2, 3, Quote, Code)
if (elements.docFormatBlock) {
  elements.docFormatBlock.addEventListener('pointerdown', saveDocSelection);
  elements.docFormatBlock.addEventListener('mousedown', saveDocSelection);

  elements.docFormatBlock.addEventListener('change', (e) => {
    applyDocBlockFormat(e.target.value);
  });
}

// Toolbar Font Family dropdown (Jakarta, Montserrat, Playfair, Lora, Caveat, JetBrains, Space Grotesk)
if (elements.docFontFamily) {
  elements.docFontFamily.addEventListener('pointerdown', saveDocSelection);
  elements.docFontFamily.addEventListener('mousedown', saveDocSelection);

  elements.docFontFamily.addEventListener('change', (e) => {
    applyDocFontFamily(e.target.value);
  });
}

// Toolbar Font Size Controls (Dropdown, - and + steppers)
if (elements.docFontSize) {
  elements.docFontSize.addEventListener('pointerdown', saveDocSelection);
  elements.docFontSize.addEventListener('mousedown', saveDocSelection);

  elements.docFontSize.addEventListener('change', (e) => {
    applyDocFontSize(e.target.value);
  });
}

if (elements.btnFontSizeDec) {
  elements.btnFontSizeDec.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  elements.btnFontSizeDec.addEventListener('click', (e) => {
    e.preventDefault();
    const curSize = parseInt(elements.docFontSize?.value || '16', 10);
    const prevSize = [...FONT_SIZES].reverse().find(s => s < curSize) || FONT_SIZES[0];
    applyDocFontSize(`${prevSize}px`);
  });
}

if (elements.btnFontSizeInc) {
  elements.btnFontSizeInc.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  elements.btnFontSizeInc.addEventListener('click', (e) => {
    e.preventDefault();
    const curSize = parseInt(elements.docFontSize?.value || '16', 10);
    const nextSize = FONT_SIZES.find(s => s > curSize) || FONT_SIZES[FONT_SIZES.length - 1];
    applyDocFontSize(`${nextSize}px`);
  });
}

// Checklist item insertion
if (elements.btnInsertChecklist) {
  elements.btnInsertChecklist.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  elements.btnInsertChecklist.addEventListener('click', (e) => {
    e.preventDefault();
    elements.docPaper.focus();
    const checkHtml = `<div class="doc-checklist-item"><input type="checkbox"> <span>To-do item...</span></div><p><br></p>`;
    
    let inserted = false;
    try {
      inserted = document.execCommand('insertHTML', false, checkHtml);
    } catch (err) {}

    if (!inserted) {
      elements.docPaper.insertAdjacentHTML('beforeend', checkHtml);
    }

    triggerDocAutoSave();
    updateToolbarActiveStates();
  });
}

// Interactive Checkbox toggling inside docPaper
elements.docPaper.addEventListener('click', (e) => {
  if (e.target.matches('input[type="checkbox"]')) {
    const item = e.target.closest('.doc-checklist-item');
    if (e.target.checked) {
      e.target.setAttribute('checked', 'checked');
      if (item) item.classList.add('checked');
    } else {
      e.target.removeAttribute('checked');
      if (item) item.classList.remove('checked');
    }
    triggerDocAutoSave();
  }
});

// Enter key support for checklists
elements.docPaper.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const node = sel.anchorNode;
    const checklistItem = node && (node.nodeType === 1 ? node : node.parentElement)?.closest('.doc-checklist-item');

    if (checklistItem) {
      e.preventDefault();
      const textSpan = checklistItem.querySelector('span');
      // If pressing enter on empty checklist item, convert back to standard paragraph
      if (!textSpan || !textSpan.textContent.trim()) {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        checklistItem.replaceWith(p);
        const range = document.createRange();
        range.setStart(p, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        const nextItem = document.createElement('div');
        nextItem.className = 'doc-checklist-item';
        nextItem.innerHTML = '<input type="checkbox"> <span></span>';
        checklistItem.after(nextItem);
        const range = document.createRange();
        const span = nextItem.querySelector('span');
        range.setStart(span, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      triggerDocAutoSave();
    }
  }
});

// Selection & cursor monitoring for active toolbar button feedback
document.addEventListener('selectionchange', () => {
  saveDocSelection();
  updateToolbarActiveStates();
});
elements.docPaper.addEventListener('keyup', updateToolbarActiveStates);
elements.docPaper.addEventListener('mouseup', updateToolbarActiveStates);

// ==========================================================================
// 6. COOL HIGHLIGHTER SYSTEM (LUMINOUS INK & FLOATING BUBBLE)
// ==========================================================================
let currentHighlighterColor = 'amber';

const HIGHLIGHT_COLOR_HEX = {
  amber: '#f59e0b',
  emerald: '#10b981',
  cyan: '#0ea5e9',
  violet: '#a855f7',
  coral: '#f43f5e',
  none: '#ffffff'
};

function updateHighlighterIndicatorColor(color) {
  if (elements.highlighterIndicator) {
    const hex = HIGHLIGHT_COLOR_HEX[color] || '#f59e0b';
    elements.highlighterIndicator.style.background = hex;
    elements.highlighterIndicator.style.boxShadow = `0 0 6px ${hex}`;
  }
}

function getClosestHighlightMark(node) {
  if (!node) return null;
  let cur = node.nodeType === 1 ? node : node.parentElement;
  while (cur && cur !== elements.docPaper) {
    if (cur.tagName && cur.tagName.toLowerCase() === 'mark' && cur.classList.contains('doc-highlight')) {
      return cur;
    }
    cur = cur.parentElement;
  }
  return null;
}

function unwrapElement(el) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
  parent.normalize();
}

function applyHighlightToSelection(color) {
  if (color && color !== 'none') {
    currentHighlighterColor = color;
    updateHighlighterIndicatorColor(color);
  }

  elements.docPaper.focus();
  restoreDocSelection();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);

  if (!elements.docPaper.contains(range.commonAncestorContainer)) return;

  // Case 1: Cursor is collapsed inside an existing highlight mark
  if (range.collapsed) {
    const mark = getClosestHighlightMark(range.startContainer);
    if (mark) {
      if (color === 'none') {
        unwrapElement(mark);
      } else {
        mark.className = `doc-highlight doc-highlight-${color}`;
      }
      triggerDocAutoSave();
      updateToolbarActiveStates();
    }
    hideHighlighterBubble();
    return;
  }

  // Case 2: Selected text
  if (color === 'none') {
    removeHighlightFromRange(range);
  } else {
    highlightRange(range, color);
  }

  hideHighlighterBubble();
  triggerDocAutoSave();
  updateToolbarActiveStates();
}

function removeHighlightFromRange(range) {
  const ancestorMark = getClosestHighlightMark(range.commonAncestorContainer);
  if (ancestorMark) {
    unwrapElement(ancestorMark);
    return;
  }

  const container = range.commonAncestorContainer.nodeType === 1
    ? range.commonAncestorContainer
    : range.commonAncestorContainer.parentElement;

  if (container) {
    const marks = container.querySelectorAll('mark.doc-highlight');
    marks.forEach(m => {
      try {
        if (range.intersectsNode(m)) {
          unwrapElement(m);
        }
      } catch (e) {}
    });
  }
}

function highlightRange(range, color) {
  // If selection is already completely inside a mark
  const ancestorMark = getClosestHighlightMark(range.commonAncestorContainer);
  if (ancestorMark) {
    ancestorMark.className = `doc-highlight doc-highlight-${color}`;
    return;
  }

  // Clean any nested marks within container
  const container = range.commonAncestorContainer.nodeType === 1
    ? range.commonAncestorContainer
    : range.commonAncestorContainer.parentElement;

  if (container) {
    const childMarks = container.querySelectorAll('mark.doc-highlight');
    childMarks.forEach(m => {
      try {
        if (range.intersectsNode(m)) {
          unwrapElement(m);
        }
      } catch (e) {}
    });
  }

  try {
    const mark = document.createElement('mark');
    mark.className = `doc-highlight doc-highlight-${color}`;
    range.surroundContents(mark);

    const newRange = document.createRange();
    newRange.selectNodeContents(mark);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(newRange);
    savedDocRange = newRange.cloneRange();
  } catch (err) {
    // If surroundContents fails (e.g. crossing block boundaries)
    try {
      const fragment = range.extractContents();
      const mark = document.createElement('mark');
      mark.className = `doc-highlight doc-highlight-${color}`;
      mark.appendChild(fragment);
      range.insertNode(mark);

      const newRange = document.createRange();
      newRange.selectNodeContents(mark);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedDocRange = newRange.cloneRange();
    } catch (e2) {
      console.warn('Highlight extraction fallback:', e2);
    }
  }
}

function hideHighlighterBubble() {
  if (elements.selectionHighlighterBubble) {
    elements.selectionHighlighterBubble.classList.add('hidden');
  }
}

function updateHighlighterBubble() {
  const bubble = elements.selectionHighlighterBubble;
  if (!bubble || !elements.docPaper || !elements.docCanvasOuter) return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
    hideHighlighterBubble();
    return;
  }

  const range = sel.getRangeAt(0);
  if (!elements.docPaper.contains(range.commonAncestorContainer)) {
    hideHighlighterBubble();
    return;
  }

  const selectedText = sel.toString().trim();
  if (!selectedText) {
    hideHighlighterBubble();
    return;
  }

  const rect = range.getBoundingClientRect();
  const canvasRect = elements.docCanvasOuter.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) {
    hideHighlighterBubble();
    return;
  }

  // Calculate coordinates relative to #docCanvasOuter scrollable context
  const bubbleHeight = 36;
  const bubbleMargin = 12;
  let top = (rect.top - canvasRect.top + elements.docCanvasOuter.scrollTop) - (bubbleHeight + bubbleMargin);
  let left = (rect.left - canvasRect.left + elements.docCanvasOuter.scrollLeft) + (rect.width / 2);

  // If too close to visible top, place bubble below selection
  if (rect.top - canvasRect.top < 45) {
    top = (rect.bottom - canvasRect.top + elements.docCanvasOuter.scrollTop) + bubbleMargin;
  }

  const canvasWidth = elements.docCanvasOuter.clientWidth;
  const halfWidth = 110;
  if (left < halfWidth + 12) left = halfWidth + 12;
  if (left > canvasWidth - halfWidth - 12) left = canvasWidth - halfWidth - 12;

  bubble.style.top = `${Math.round(top)}px`;
  bubble.style.left = `${Math.round(left)}px`;
  bubble.classList.remove('hidden');
}

// Toolbar Highlighter Dropdown Button
if (elements.btnToolbarHighlighter) {
  elements.btnToolbarHighlighter.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  elements.btnToolbarHighlighter.addEventListener('click', (e) => {
    e.preventDefault();
    if (elements.highlighterPalette) {
      elements.highlighterPalette.classList.toggle('hidden');
    }
  });
}

// Swatches inside Toolbar Palette
document.querySelectorAll('.swatch-btn[data-color]').forEach(btn => {
  btn.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const color = btn.dataset.color;
    applyHighlightToSelection(color);
    if (elements.highlighterPalette) {
      elements.highlighterPalette.classList.add('hidden');
    }
  });
});

// Swatches inside Floating Selection Bubble
if (elements.selectionHighlighterBubble) {
  elements.selectionHighlighterBubble.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  elements.selectionHighlighterBubble.querySelectorAll('.bubble-swatch[data-color]').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const color = btn.dataset.color;
      applyHighlightToSelection(color);
      hideHighlighterBubble();
    });
  });
}

// Close Toolbar Palette when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.highlighter-picker-wrapper')) {
    elements.highlighterPalette?.classList.add('hidden');
  }
});

// Trigger Floating Highlighter Bubble on Text Selection
elements.docPaper.addEventListener('mouseup', () => {
  setTimeout(updateHighlighterBubble, 20);
});

elements.docPaper.addEventListener('keyup', (e) => {
  if (['Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    setTimeout(updateHighlighterBubble, 20);
  } else {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      hideHighlighterBubble();
    }
  }
});

// Hide Floating Bubble on click outside selection
document.addEventListener('mousedown', (e) => {
  if (!e.target.closest('#selectionHighlighterBubble') && !e.target.closest('#docPaper')) {
    hideHighlighterBubble();
  }
});

// Insert Image Buttons (Toolbar and Doc Top Bar)
[elements.btnDocInsertImage, elements.btnToolbarAddImage].forEach(btn => {
  if (btn) {
    btn.addEventListener('click', () => {
      elements.docInlineImageInput.click();
    });
  }
});

elements.docInlineImageInput.addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  showToast('Uploading pictures...');
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      try {
        const uploaded = await uploadImageFile(file);
        insertImageIntoDoc(uploaded.url, file.name);
      } catch (err) {
        showToast(`Failed to upload ${file.name}`);
      }
    }
  }
  e.target.value = '';
  showToast('Picture(s) inserted');
});

// Delete Lesson Button in Google Docs Top Bar
elements.btnDocDeleteLesson.addEventListener('click', async () => {
  const currentSubject = state.subjects.find(s => s.id === state.activeSubjectId);
  if (!currentSubject) return;

  const currentLesson = (currentSubject.lessons || []).find(l => l.id === state.activeLessonId);
  if (!currentLesson) return;

  if (!confirm(`Are you sure you want to delete the lesson "${currentLesson.title}"?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/lessons/${currentLesson.id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete lesson');

    currentSubject.lessons = currentSubject.lessons.filter(l => l.id !== currentLesson.id);
    state.activeLessonId = currentSubject.lessons.length > 0 ? currentSubject.lessons[0].id : null;
    
    renderSubjectWorkspace();
    showToast(`Lesson "${currentLesson.title}" deleted`);
  } catch (err) {
    showToast('Failed to delete lesson');
  }
});

// Generate Flashcards from current Google Doc button
elements.btnDocGenerateCards.addEventListener('click', () => {
  const currentSubject = state.subjects.find(s => s.id === state.activeSubjectId);
  if (!currentSubject) return;

  const currentLesson = (currentSubject.lessons || []).find(l => l.id === state.activeLessonId);
  if (!currentLesson) return;

  const title = `${elements.docLessonTitle.value || currentLesson.title} - Study Deck`;
  
  // Extract clean text excluding floating overlay pictures
  const clone = elements.docPaper.cloneNode(true);
  clone.querySelectorAll('.doc-floating-pic').forEach(p => p.remove());
  const text = clone.innerText || '';

  if (!text.trim()) {
    showToast('Add some notes to this lesson first to generate flashcards');
    return;
  }

  openGenerateModal(title, currentSubject.id, text);
});

// Tab Bar "+ New Lesson" Button
if (elements.btnTabAddLesson) {
  elements.btnTabAddLesson.addEventListener('click', () => openAddLessonModal());
}

// Global Ctrl+S shortcut to save document instantly
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    flushDocAutoSave();
    showToast('Document saved');
  }
});

// Toggle Lesson Status (if button exists)
if (elements.btnToggleLessonStatus) {
  elements.btnToggleLessonStatus.addEventListener('click', toggleLessonStatus);
}

// Create / Update Assignment
elements.formAddAssignment.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = elements.asgTitleInput.value.trim();
  const subjectId = elements.asgSubjectSelect.value;
  const dueDate = elements.asgDueDateInput.value;
  const priority = elements.asgPriorityInput.value;
  const notes = elements.asgNotesInput.value.trim();
  const editId = elements.editAssignmentId.value;

  if (!title) return;

  try {
    if (editId) {
      // Update
      const res = await fetch(`${API_BASE}/assignments/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subjectId,
          dueDate,
          priority,
          notes,
          images: state.tempAsgImages
        })
      });
      if (!res.ok) throw new Error('Failed to update assignment');
      const updated = await res.json();
      const idx = state.assignments.findIndex(a => a.id === editId);
      if (idx !== -1) state.assignments[idx] = updated;
      closeAddAssignmentModal();
      renderAssignments();
      updateBadges();
      showToast('Assignment updated');
    } else {
      // Create
      const res = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subjectId,
          dueDate,
          priority,
          notes,
          images: state.tempAsgImages
        })
      });
      if (!res.ok) throw new Error('Failed to add assignment');
      const newAsg = await res.json();
      state.assignments.unshift(newAsg);
      closeAddAssignmentModal();
      renderAssignments();
      updateBadges();
      showToast('Assignment added to queue');
    }
  } catch (err) {
    showToast('Failed to save assignment');
  }
});

// Toggle Assignment Completed
async function toggleAssignment(id) {
  try {
    const res = await fetch(`${API_BASE}/assignments/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle assignment');
    const updated = await res.json();
    const idx = state.assignments.findIndex(a => a.id === id);
    if (idx !== -1) state.assignments[idx] = updated;
    renderAssignments();
    updateBadges();
  } catch (err) {
    showToast('Failed to update assignment status');
  }
}

// Delete Assignment
async function deleteAssignment(id) {
  try {
    const res = await fetch(`${API_BASE}/assignments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete assignment');
    state.assignments = state.assignments.filter(a => a.id !== id);
    renderAssignments();
    updateBadges();
    showToast('Assignment removed');
  } catch (err) {
    showToast('Failed to delete assignment');
  }
}

// ==========================================================================
// NAVIGATION & FILTERS
// ==========================================================================
elements.navTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-btn');
  if (!btn) return;
  const tab = btn.dataset.tab;

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  elements.viewSubjects.classList.remove('active');
  elements.viewAssignments.classList.remove('active');
  elements.viewFlashcards.classList.remove('active');
  elements.viewFocus.classList.remove('active');

  if (tab === 'subjects') elements.viewSubjects.classList.add('active');
  if (tab === 'assignments') elements.viewAssignments.classList.add('active');
  if (tab === 'flashcards') {
    elements.viewFlashcards.classList.add('active');
    renderFlashcardDecks();
  }
  if (tab === 'focus') elements.viewFocus.classList.add('active');
});

// Lesson Filter Pills (if present)
if (elements.lessonFilterPills) {
  elements.lessonFilterPills.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill-btn');
    if (!btn) return;
    elements.lessonFilterPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeLessonFilter = btn.dataset.filter;
    renderSubjectWorkspace();
  });
}

// Assignment Filter Pills
elements.assignmentFilterPills.addEventListener('click', (e) => {
  const btn = e.target.closest('.pill-btn');
  if (!btn) return;
  elements.assignmentFilterPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.activeAssignmentFilter = btn.dataset.status;
  renderAssignments();
});

// Assignment Subject Dropdown Filter
elements.assignmentSubjectFilter.addEventListener('change', (e) => {
  state.activeAssignmentSubject = e.target.value;
  renderAssignments();
});

// Button triggers
elements.btnOpenAddSubject.addEventListener('click', openAddSubjectModal);
elements.btnEmptyAddSubject.addEventListener('click', openAddSubjectModal);
elements.btnCloseSubjectModal.addEventListener('click', closeAddSubjectModal);
elements.btnCancelAddSubject.addEventListener('click', closeAddSubjectModal);

elements.btnOpenAddLesson.addEventListener('click', () => openAddLessonModal());
if (elements.btnEmptyAddLesson) {
  elements.btnEmptyAddLesson.addEventListener('click', () => openAddLessonModal());
}
if (elements.lessonsEmptyState) {
  elements.lessonsEmptyState.addEventListener('click', () => openAddLessonModal());
}
elements.btnCloseLessonModal.addEventListener('click', closeAddLessonModal);
elements.btnCancelAddLesson.addEventListener('click', closeAddLessonModal);

elements.btnOpenAddAssignment.addEventListener('click', openAddAssignmentModal);
elements.btnEmptyAddAssignment.addEventListener('click', openAddAssignmentModal);
elements.btnCloseAssignmentModal.addEventListener('click', closeAddAssignmentModal);
elements.btnCancelAddAssignment.addEventListener('click', closeAddAssignmentModal);

elements.btnCloseLessonView.addEventListener('click', closeLessonView);

// Flashcard Generator Modal Triggers
if (elements.btnOpenGenerateFlashcards) {
  elements.btnOpenGenerateFlashcards.addEventListener('click', () => openGenerateModal());
}
if (elements.btnEmptyGenerateDeck) {
  elements.btnEmptyGenerateDeck.addEventListener('click', () => openGenerateModal());
}
if (elements.btnQuickScanDocument) {
  elements.btnQuickScanDocument.addEventListener('click', () => {
    openGenerateModal();
    if (elements.fileScannerInput) elements.fileScannerInput.click();
  });
}
if (elements.btnCloseGenerateModal) {
  elements.btnCloseGenerateModal.addEventListener('click', closeGenerateModal);
}
if (elements.btnCancelGenerate) {
  elements.btnCancelGenerate.addEventListener('click', closeGenerateModal);
}

// Document Scanner triggers (PDF, PPTX, DOCX)
if (elements.btnBrowseScanFile && elements.fileScannerInput) {
  elements.btnBrowseScanFile.addEventListener('click', () => elements.fileScannerInput.click());
  elements.fileScannerInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      scanDocumentFile(e.target.files[0]);
      e.target.value = '';
    }
  });
}

if (elements.fileScannerDropzone) {
  ['dragenter', 'dragover'].forEach(name => {
    elements.fileScannerDropzone.addEventListener(name, (e) => {
      e.preventDefault();
      elements.fileScannerDropzone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(name => {
    elements.fileScannerDropzone.addEventListener(name, (e) => {
      e.preventDefault();
      elements.fileScannerDropzone.classList.remove('dragover');
    });
  });
  elements.fileScannerDropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files[0]) {
      scanDocumentFile(dt.files[0]);
    }
  });
}

// Generate Flashcards from current lesson in viewer
if (elements.btnLessonGenerateFlashcards) {
  elements.btnLessonGenerateFlashcards.addEventListener('click', () => {
    if (!state.currentViewingLesson) return;
    const lesson = state.currentViewingLesson;
    const currentSubject = state.subjects.find(s => s.id === state.activeSubjectId);
    const title = `${lesson.title} - Study Deck`;
    const text = `${lesson.summary ? lesson.summary + '\n\n' : ''}${lesson.content || ''}`;
    closeLessonView();
    openGenerateModal(title, currentSubject ? currentSubject.id : '', text);
  });
}

// Load from current subject in generator
if (elements.btnLoadFromCurrentSubject) {
  elements.btnLoadFromCurrentSubject.addEventListener('click', () => {
    const targetSubjectId = elements.genSubjectSelect.value || state.activeSubjectId;
    const currentSubject = state.subjects.find(s => s.id === targetSubjectId);
    if (!currentSubject || !currentSubject.lessons || currentSubject.lessons.length === 0) {
      showToast('No lessons found in this subject');
      return;
    }
    const combined = currentSubject.lessons.map(l => `### ${l.title}\n${l.summary ? l.summary + '\n' : ''}${l.content || ''}`).join('\n\n');
    elements.genSourceText.value = combined;
    if (!elements.genDeckTitle.value) {
      elements.genDeckTitle.value = `${currentSubject.name} - Review Deck`;
    }
    showToast(`Loaded ${currentSubject.lessons.length} lesson(s) notes`);
  });
}

// Form Generate Cards Submit
if (elements.formGenerateCards) {
  elements.formGenerateCards.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = elements.genSourceText.value.trim();
    const title = elements.genDeckTitle.value.trim();
    const subjectId = elements.genSubjectSelect.value || null;

    if (!text) {
      showToast('Please provide notes or text');
      return;
    }

    showToast('Extracting questions & answers...');

    try {
      const res = await fetch(`${API_BASE}/flashcards/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title, subjectId })
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      state.tempGenCards = data.cards || [];
    } catch (err) {
      state.tempGenCards = generateCardsFromTextClient(text);
    }

    if (state.tempGenCards.length === 0) {
      state.tempGenCards = [
        { id: 'card_' + Date.now(), question: `What is the core takeaway of ${title}?`, answer: text.substring(0, 200), status: 'new' }
      ];
    }

    renderGenPreviewCards();
    elements.genStepInput.classList.add('hidden');
    elements.genStepPreview.classList.remove('hidden');
  });
}

// Add manual card in preview
if (elements.btnAddManualCard) {
  elements.btnAddManualCard.addEventListener('click', () => {
    state.tempGenCards.push({
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      question: '',
      answer: '',
      status: 'new'
    });
    renderGenPreviewCards();
  });
}

// Back to Step 1
if (elements.btnBackToGenInput) {
  elements.btnBackToGenInput.addEventListener('click', () => {
    elements.genStepPreview.classList.add('hidden');
    elements.genStepInput.classList.remove('hidden');
  });
}

// Save Deck & Start Studying
if (elements.btnSaveGeneratedDeck) {
  elements.btnSaveGeneratedDeck.addEventListener('click', async () => {
    const title = elements.genDeckTitle.value.trim() || 'New Flashcard Deck';
    const subjectId = elements.genSubjectSelect.value || null;

    if (state.tempGenCards.length === 0) {
      showToast('Please add at least 1 card');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subjectId,
          cards: state.tempGenCards
        })
      });
      if (!res.ok) throw new Error('Failed to save deck');
      const saved = await res.json();
      state.flashcardDecks.unshift(saved);
      closeGenerateModal();

      // Navigate to flashcards tab
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      elements.tabBtnFlashcards.classList.add('active');
      elements.viewSubjects.classList.remove('active');
      elements.viewAssignments.classList.remove('active');
      elements.viewFocus.classList.remove('active');
      elements.viewFlashcards.classList.add('active');

      renderFlashcardDecks();
      updateBadges();
      startStudyDeck(saved.id);
      showToast(`Deck "${title}" generated!`);
    } catch (err) {
      showToast('Failed to save deck');
    }
  });
}

// Study Player Events
if (elements.btnExitDeckPlayer) {
  elements.btnExitDeckPlayer.addEventListener('click', exitStudyDeckPlayer);
}
if (elements.btnShuffleDeck) {
  elements.btnShuffleDeck.addEventListener('click', shuffleCurrentDeck);
}
if (elements.btnRestartDeck) {
  elements.btnRestartDeck.addEventListener('click', () => {
    if (state.currentStudyDeck) startStudyDeck(state.currentStudyDeck.id);
  });
}
if (elements.activeFlashcard) {
  elements.activeFlashcard.addEventListener('click', flipActiveCard);
}
if (elements.btnRateAgain) {
  elements.btnRateAgain.addEventListener('click', () => rateActiveCard('again'));
}
if (elements.btnRateGood) {
  elements.btnRateGood.addEventListener('click', () => rateActiveCard('good'));
}
if (elements.btnRateEasy) {
  elements.btnRateEasy.addEventListener('click', () => rateActiveCard('easy'));
}
if (elements.btnFinishedStudyAgain) {
  elements.btnFinishedStudyAgain.addEventListener('click', () => {
    if (state.currentStudyDeck) startStudyDeck(state.currentStudyDeck.id);
  });
}
if (elements.btnFinishedBackToDecks) {
  elements.btnFinishedBackToDecks.addEventListener('click', exitStudyDeckPlayer);
}

if (elements.deckSubjectFilter) {
  elements.deckSubjectFilter.addEventListener('change', (e) => {
    state.activeDeckSubject = e.target.value;
    renderFlashcardDecks();
  });
}

// Lightbox listeners
elements.btnCloseLightbox.addEventListener('click', closeLightbox);
elements.lightboxModal.addEventListener('click', (e) => {
  if (e.target === elements.lightboxModal) closeLightbox();
});

// File upload button triggers
elements.btnBrowseLessonFiles.addEventListener('click', () => elements.lessonFileInput.click());
elements.lessonFileInput.addEventListener('change', (e) => {
  handleFilesUpload(e.target.files, state.tempLessonImages, renderLessonThumbnails);
  e.target.value = '';
});

elements.btnBrowseAsgFiles.addEventListener('click', () => elements.asgFileInput.click());
elements.asgFileInput.addEventListener('change', (e) => {
  handleFilesUpload(e.target.files, state.tempAsgImages, renderAsgThumbnails);
  e.target.value = '';
});

// Drag & drop for Lesson dropzone
['dragenter', 'dragover'].forEach(eventName => {
  elements.lessonDropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    elements.lessonDropzone.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach(eventName => {
  elements.lessonDropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    elements.lessonDropzone.classList.remove('dragover');
  });
});
elements.lessonDropzone.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  if (dt && dt.files) {
    handleFilesUpload(dt.files, state.tempLessonImages, renderLessonThumbnails);
  }
});

// Drag & drop for Assignment dropzone
['dragenter', 'dragover'].forEach(eventName => {
  elements.asgDropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    elements.asgDropzone.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach(eventName => {
  elements.asgDropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    elements.asgDropzone.classList.remove('dragover');
  });
});
elements.asgDropzone.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  if (dt && dt.files) {
    handleFilesUpload(dt.files, state.tempAsgImages, renderAsgThumbnails);
  }
});

// Global Paste (Ctrl+V) listener for pasting screenshot of slides/notes
window.addEventListener('paste', async (e) => {
  const clipboardData = e.clipboardData || window.clipboardData;
  if (!clipboardData) return;
  const items = clipboardData.items;
  const imageFiles = [];
  for (const item of items) {
    if (item.type && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) imageFiles.push(file);
    }
  }
  if (imageFiles.length === 0) return;

  if (!elements.modalAddLesson.classList.contains('hidden')) {
    e.preventDefault();
    await handleFilesUpload(imageFiles, state.tempLessonImages, renderLessonThumbnails);
  } else if (!elements.modalAddAssignment.classList.contains('hidden')) {
    e.preventDefault();
    await handleFilesUpload(imageFiles, state.tempAsgImages, renderAsgThumbnails);
  }
});

// Dismiss modal on background click
[elements.modalAddSubject, elements.modalAddLesson, elements.modalAddAssignment, elements.modalGenerateFlashcards, elements.drawerLessonView].forEach(overlay => {
  if (!overlay) return;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
    }
  });
});

// Global keyboard shortcuts (Modals & Study Player)
window.addEventListener('keydown', (e) => {
  // Ignore typing inside inputs/textareas for study shortcuts
  const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

  if (e.key === 'Escape') {
    closeAddSubjectModal();
    closeAddLessonModal();
    closeAddAssignmentModal();
    closeGenerateModal();
    closeLessonView();
    closeLightbox();
    return;
  }

  // Active Flashcard Study Mode shortcuts
  if (!isTyping && elements.deckStudyPlayer && !elements.deckStudyPlayer.classList.contains('hidden') && state.currentStudyDeck) {
    if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      flipActiveCard();
    } else if (e.key === '1') {
      rateActiveCard('again');
    } else if (e.key === '2') {
      rateActiveCard('good');
    } else if (e.key === '3') {
      rateActiveCard('easy');
    } else if (e.key === 'ArrowRight') {
      if (state.currentCardIndex < state.currentStudyDeck.cards.length - 1) {
        state.currentCardIndex++;
        renderActiveStudyCard();
      }
    } else if (e.key === 'ArrowLeft') {
      if (state.currentCardIndex > 0) {
        state.currentCardIndex--;
        renderActiveStudyCard();
      }
    }
  }
});

// ==========================================================================
// FOCUS TIMER
// ==========================================================================
function updateTimerDisplay() {
  const m = Math.floor(state.timer.remaining / 60);
  const s = state.timer.remaining % 60;
  const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  elements.timerClock.textContent = formatted;
  elements.miniTimerDisplay.textContent = formatted;
}

function startTimer() {
  if (state.timer.isRunning) return;
  state.timer.isRunning = true;
  elements.timerToggleBtn.textContent = 'Pause';
  elements.timerCaption.textContent = state.timer.mode === 'focus' ? 'FOCUS SESSION IN PROGRESS' : 'BREAK SESSION';

  state.timer.intervalId = setInterval(() => {
    if (state.timer.remaining > 0) {
      state.timer.remaining--;
      updateTimerDisplay();
    } else {
      pauseTimer();
      showToast('Focus session complete! Great work.');
      // Sound prompt or gentle vibration if supported
    }
  }, 1000);
}

function pauseTimer() {
  state.timer.isRunning = false;
  elements.timerToggleBtn.textContent = 'Start';
  if (state.timer.intervalId) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
  }
}

function resetTimer() {
  pauseTimer();
  state.timer.remaining = state.timer.duration;
  updateTimerDisplay();
  elements.timerCaption.textContent = state.timer.mode === 'focus' ? 'FOCUS SESSION' : 'BREAK SESSION';
}

elements.timerToggleBtn.addEventListener('click', () => {
  if (state.timer.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

elements.timerResetBtn.addEventListener('click', resetTimer);

document.querySelectorAll('.timer-mode-selector .pill-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.timer-mode-selector .pill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const minutes = parseInt(btn.dataset.time, 10);
    state.timer.mode = minutes >= 25 ? 'focus' : 'break';
    state.timer.duration = minutes * 60;
    resetTimer();
  });
});

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

// Simple Clean Markdown Renderer (supports headings, bold, lists, code)
function renderMarkdown(md) {
  if (!md) return '';
  let html = escapeHtml(md);

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Line breaks to paragraphs
  const paragraphs = html.split(/\n\n+/);
  return paragraphs.map(p => {
    p = p.trim();
    if (p.startsWith('<h1>') || p.startsWith('<h2>') || p.startsWith('<h3>')) {
      return p;
    }
    // Bullet lists
    if (p.includes('\n- ') || p.startsWith('- ')) {
      const items = p.split(/\n?- /).filter(Boolean);
      return '<ul>' + items.map(it => `<li>${it.replace(/\n/g, '<br>')}</li>`).join('') + '</ul>';
    }
    // Numbered lists
    if (/\d+\.\s/.test(p)) {
      const items = p.split(/\n?\d+\.\s/).filter(Boolean);
      return '<ol>' + items.map(it => `<li>${it.replace(/\n/g, '<br>')}</li>`).join('') + '</ol>';
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  fetchStudyData();
  updateTimerDisplay();
});
