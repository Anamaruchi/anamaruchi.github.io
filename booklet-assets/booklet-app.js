var __i18nDict = null;
var __i18nLang = 'en';
var refreshDynamicI18nText = null;
function t(key, fallback){
  var dict = (__i18nDict && __i18nDict[__i18nLang]) ? __i18nDict[__i18nLang] : null;
  if(dict && Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
  return fallback !== undefined ? fallback : key;
}
pdfjsLib.GlobalWorkerOptions.workerSrc = '/booklet-assets/vendor/pdf.worker.min.js';

const RENDER_DPI = 300;
const RENDER_SCALE = RENDER_DPI / 72;
const BOOK_SIZE_CONFIG = { navReserve: 140, sidePadding: 60, vertPadding: 140, maxImageHeight: 760 };
const BOOK_SIZE_CONFIG_SMALL = { navReserve: 88, sidePadding: 28, vertPadding: 76, maxImageHeight: 760 };
const BOOK_SIZE_CONFIG_TINY = { navReserve: 64, sidePadding: 18, vertPadding: 54, maxImageHeight: 760 };
const BOOK_SIZE_CONFIG_TABLET = { navReserve: 130, sidePadding: 40, vertPadding: 100, maxImageHeight: 760 };
const BOOK_SIZE_CONFIG_PHONE = { navReserve: 140, sidePadding: 40, vertPadding: 110, maxImageHeight: 760 };
const BOOK_SIZE_CONFIG_PHONE_SHORT = { navReserve: 100, sidePadding: 36, vertPadding: 68, maxImageHeight: 760 };

function isCompactViewport() {
  return Math.min(window.innerWidth, window.innerHeight) <= 820;
}

function getBookSizeConfig() {
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!coarse) {
    const w = window.innerWidth;
    if (w <= 480) return BOOK_SIZE_CONFIG_TINY;
    if (w <= 900) return BOOK_SIZE_CONFIG_SMALL;
    return BOOK_SIZE_CONFIG;
  }
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  if (shortSide <= 420) {
    return window.innerHeight <= 420 ? BOOK_SIZE_CONFIG_PHONE_SHORT : BOOK_SIZE_CONFIG_PHONE;
  }
  if (shortSide <= 500) return BOOK_SIZE_CONFIG_PHONE;
  if (shortSide <= 820) return BOOK_SIZE_CONFIG_TABLET;
  return BOOK_SIZE_CONFIG;
}

const specBar = document.getElementById('spec-bar');
const singleUploadSection = document.getElementById('single-upload-section');
const separateUploadSection = document.getElementById('separate-upload-section');

const uploadTargets = {
  single: {
    input: document.getElementById('pdf-input-single'),
    dropzone: document.getElementById('dropzone-single'),
    info: document.getElementById('file-info-single'),
    nameEl: document.getElementById('file-name-single'),
    metaEl: document.getElementById('file-meta-single'),
    changeBtn: document.getElementById('change-file-btn-single')
  },
  cover: {
    input: document.getElementById('pdf-input-cover'),
    dropzone: document.getElementById('dropzone-cover'),
    info: document.getElementById('file-info-cover'),
    nameEl: document.getElementById('file-name-cover'),
    metaEl: document.getElementById('file-meta-cover'),
    changeBtn: document.getElementById('change-file-btn-cover')
  },
  pages: {
    input: document.getElementById('pdf-input-pages'),
    dropzone: document.getElementById('dropzone-pages'),
    info: document.getElementById('file-info-pages'),
    nameEl: document.getElementById('file-name-pages'),
    metaEl: document.getElementById('file-meta-pages'),
    changeBtn: document.getElementById('change-file-btn-pages')
  }
};

const stepSize = document.getElementById('step-size');
const sizeSelect = document.getElementById('size-select');
const stepOrientation = document.getElementById('step-orientation');
const stepCustom = document.getElementById('step-custom');
const customWidthInput = document.getElementById('custom-width');
const customHeightInput = document.getElementById('custom-height');

const previewBtn = document.getElementById('preview-btn');
const previewHint = document.getElementById('preview-hint');

const formView = document.getElementById('form-view');
const previewView = document.getElementById('preview-view');
const infoCluster = document.getElementById('info-cluster');
const infoPanel = document.getElementById('info-panel');
const pageIndicator = document.getElementById('page-indicator');
const previewMetaSize = document.getElementById('preview-meta-size');
const savePdfBtn = document.getElementById('save-pdf-btn');
const savePdfLabel = document.getElementById('save-pdf-label');
const removePreviewBtn = document.getElementById('remove-preview-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const bookFrame = document.getElementById('book-frame');
const pageCountWarning = document.getElementById('page-count-warning');
const pageCountWarningDetail = document.getElementById('page-count-warning-detail');
const pageCountWarningHideBtn = document.getElementById('page-count-warning-hide-btn');
const pageCountWarningSimple = document.getElementById('page-count-warning-simple');
const pageCountWarningSimpleText = document.getElementById('page-count-warning-simple-text');
const pageCountWarningShowBtn = document.getElementById('page-count-warning-show-btn');
let pageCountWarningCollapsed = false;
const rotateSuggestBanner = document.getElementById('rotate-suggest-banner');
const rotateSuggestCloseBtn = document.getElementById('rotate-suggest-close');

function getPageScrollY() {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
}
function setPageScrollY(y) {
  window.scrollTo(0, y);
  document.documentElement.scrollTop = y;
  document.body.scrollTop = y;
}
function lockPageScroll() {
  const scY = getPageScrollY();
  document.documentElement.classList.add('drag-scroll-lock');
  document.body.classList.add('drag-scroll-lock');
  setPageScrollY(scY);
}
function unlockPageScroll() {
  const scY = getPageScrollY();
  document.documentElement.classList.remove('drag-scroll-lock');
  document.body.classList.remove('drag-scroll-lock');
  setPageScrollY(scY);
}

const zoomCluster = document.getElementById('zoom-cluster');
const zoomPanel = document.getElementById('zoom-panel');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomFitBtn = document.getElementById('zoom-fit-btn');
const zoomPercentInput = document.getElementById('zoom-percent-input');
const thumbToggleBtn = document.getElementById('thumb-toggle-btn');
const thumbSidebar = document.getElementById('thumb-sidebar');
const homeButton = document.getElementById('home-button');
const hudToggleBtn = document.getElementById('hud-toggle-btn');

function setHudHidden(hidden) {
  document.body.classList.toggle('hud-hidden', hidden);
  hudToggleBtn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
}

hudToggleBtn.addEventListener('click', () => {
  setHudHidden(!document.body.classList.contains('hud-hidden'));
});
const thumbOverlay = document.getElementById('thumb-overlay');
const thumbCloseBtn = document.getElementById('thumb-close-btn');
const thumbGrid = document.getElementById('thumb-grid');
const pageContextMenu = document.getElementById('page-context-menu');
const pageContextMenuMulti = document.getElementById('page-context-menu-multi');
const contextAddToggle = document.getElementById('context-add-page-toggle');
const contextAddSubmenu = document.getElementById('context-add-submenu');

thumbGrid.addEventListener('touchmove', (e) => {
  if (!touchDragState) return;
  e.preventDefault();
  const touch = e.touches[0];
  thumbGrid.querySelectorAll('.thumb-item.drag-over').forEach(el => el.classList.remove('drag-over'));
  const target = getThumbItemAtPoint(touch.clientX, touch.clientY);
  if (target) target.classList.add('drag-over');
}, { passive: false });

thumbGrid.addEventListener('touchend', (e) => {
  if (!touchDragState) return;
  const touch = e.changedTouches[0];
  const target = touch ? getThumbItemAtPoint(touch.clientX, touch.clientY) : null;
  thumbGrid.querySelectorAll('.thumb-item').forEach(el => {
    el.classList.remove('dragging');
    el.classList.remove('drag-over');
  });
  const sourceIndex = touchDragState.sourceIndex;
  touchDragState = null;
  dragSourceIndex = null;
  if (target) {
    const targetIndex = Number(target.dataset.index);
    if (!isNaN(targetIndex) && targetIndex !== sourceIndex) {
      setTimeout(() => reorderPages(sourceIndex, targetIndex), 0);
    }
  }
});

thumbGrid.addEventListener('touchcancel', () => {
  if (!touchDragState) return;
  touchDragState = null;
  dragSourceIndex = null;
  thumbGrid.querySelectorAll('.thumb-item').forEach(el => {
    el.classList.remove('dragging');
    el.classList.remove('drag-over');
  });
});

let bookContainer = document.getElementById('book');

document.addEventListener('mousemove', function(e) {
  if (e.buttons !== 1) {
    const overBook = e.target.closest && e.target.closest('#book, .stf__parent, .stf__block, .stf__wrapper, #thumb-overlay, #thumb-sidebar');
    if (overBook) e.stopPropagation();
  }
}, true);
let uploadMode = 'single';
let pdfDoc = null;
let coverPdfDoc = null;
let pagesPdfDoc = null;
let singleFileBytes = null;
let coverFileBytes = null;
let pagesFileBytes = null;
let singleFileName = '';
let coverFileName = '';
let pagesFileName = '';
let singleLibDocCache = null;
let coverLibDocCache = null;
let pagesLibDocCache = null;
let pdfLibPromise = null;
let pageFlipInstance = null;
let pageDataList = [];
let dragSourceIndex = null;
let contextMenuIndex = null;
let selectedPageIndexes = new Set();
let selectionAnchorIndex = null;
let touchDragState = null;
let longPressTimer = null;
let longPressStartPos = null;
let suppressNextThumbClick = false;
const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE = 10;
const DRAG_HANDLE_ONLY = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
let currentRatio = null;
let currentSpec = null;
let renderGeneration = 0;
let reorderRenderTimer = null;
let baseBookWidth = 0;
let baseBookHeight = 0;
let customZoomScale = 1.1;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2;
const baselineDPR = window.devicePixelRatio || 1;

function lockElementScale(el, origin) {
  const desktopZoom = (window.devicePixelRatio || 1) / baselineDPR;
  const pinchZoom = (window.visualViewport && window.visualViewport.scale) || 1;
  const totalZoom = desktopZoom * pinchZoom;
  el.style.transform = Math.abs(totalZoom - 1) > 0.01 ? `scale(${1 / totalZoom})` : '';
  el.style.transformOrigin = origin;
}

function lockAllScales() {
  lockElementScale(infoCluster, 'bottom right');
  lockElementScale(zoomCluster, 'bottom left');
}

function watchZoomLevel() {
  if (!window.matchMedia) return;
  const mq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
  mq.addEventListener('change', () => {
    lockAllScales();
    watchZoomLevel();
  }, { once: true });
}
watchZoomLevel();

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', lockAllScales);
  window.visualViewport.addEventListener('scroll', lockAllScales);
}

function isMobileLikeDevice() {
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const maxDim = Math.max(window.innerWidth, window.innerHeight);
  return !!coarse && maxDim <= 950;
}

function isPortraitOrientation() {
  if (window.matchMedia) {
    return window.matchMedia('(orientation: portrait)').matches;
  }
  return window.innerHeight > window.innerWidth;
}

let rotateBannerDismissed = false;

function updateRotateBanner() {
  const previewActive = !previewView.classList.contains('hidden');
  const wasShown = !rotateSuggestBanner.classList.contains('hidden');
  const shouldShow = previewActive && !rotateBannerDismissed && isMobileLikeDevice() && isPortraitOrientation();

  if (shouldShow) {
    rotateSuggestBanner.classList.remove('hidden');
    rotateSuggestBanner.classList.add('flex');
  } else {
    rotateSuggestBanner.classList.add('hidden');
    rotateSuggestBanner.classList.remove('flex');
  }

  if (wasShown && !shouldShow && previewActive && pageFlipInstance && currentRatio) {
    let keepIndex = 0;
    try { keepIndex = pageFlipInstance.getCurrentPageIndex(); } catch (e) { keepIndex = 0; }
    clearTimeout(reorderRenderTimer);
    reorderRenderTimer = setTimeout(() => {
      reorderRenderTimer = null;
      renderBook(currentRatio, keepIndex);
    }, 350);
  }
}

rotateSuggestCloseBtn.addEventListener('click', () => {
  rotateBannerDismissed = true;
  updateRotateBanner();
});

window.addEventListener('resize', updateRotateBanner);
window.addEventListener('orientationchange', updateRotateBanner);
if (window.visualViewport) window.visualViewport.addEventListener('resize', updateRotateBanner);
if (window.matchMedia) {
  const orientationQuery = window.matchMedia('(orientation: portrait)');
  if (orientationQuery.addEventListener) orientationQuery.addEventListener('change', updateRotateBanner);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function showStep(el) {
  el.classList.remove('hidden');
  el.classList.add('flex', 'step-enter');
}

function hideStep(el) {
  el.classList.add('hidden');
  el.classList.remove('step-enter');
}

function isStandardSize() {
  return sizeSelect.value === 'a4' || sizeSelect.value === 'a5';
}

function filesReady() {
  return uploadMode === 'single' ? !!pdfDoc : (!!coverPdfDoc && !!pagesPdfDoc);
}

function setHint(text, tone) {
  const toneClass = tone === 'error' ? ' hint-error' : tone === 'success' ? ' hint-success' : '';
  previewHint.className = `hint${toneClass}`;
  previewHint.textContent = text;
}

function resetBookContainer() {
  const fresh = document.createElement('div');
  fresh.id = 'book';
  fresh.className = bookContainer.className;
  bookContainer.replaceWith(fresh);
  bookContainer = fresh;
}

function destroyBook() {
  clearTimeout(reorderRenderTimer);
  renderGeneration++;
  resetShareButton();
  unlockPageScroll();
  if (pageFlipInstance) {
    try { pageFlipInstance.destroy(); } catch (e) { console.warn(e); }
    pageFlipInstance = null;
  }
  resetBookContainer();
  if (bookFrame) {
    Array.from(bookFrame.children).forEach(child => { if (child !== bookContainer) child.remove(); });
  }
  pageIndicator.textContent = '';
  baseBookWidth = 0;
  baseBookHeight = 0;
  customZoomScale = 1.1;
  if (bookFrame) {
    bookFrame.style.width = '';
    bookFrame.style.height = '';
  }
  zoomPercentInput.value = 110;
  zoomCluster.classList.add('hidden');
  closeThumbSidebar();
  closePageContextMenu();
  thumbGrid.innerHTML = '';
  pageCountWarning.classList.add('hidden');
  pageCountWarning.classList.remove('flex');
  pageCountWarningSimple.classList.add('hidden');
  pageCountWarningCollapsed = false;
}

function applyCustomZoom() {
  if (!pageFlipInstance || !baseBookWidth || !baseBookHeight) return;
  bookContainer.style.transform = `scale(${customZoomScale})`;
  bookFrame.style.width = `${baseBookWidth * 2 * customZoomScale}px`;
  bookFrame.style.height = `${baseBookHeight * customZoomScale}px`;
  zoomPercentInput.value = Math.round(customZoomScale * 100);
  zoomInBtn.disabled = customZoomScale >= ZOOM_MAX;
  zoomOutBtn.disabled = customZoomScale <= ZOOM_MIN;
}

zoomInBtn.addEventListener('click', () => {
  customZoomScale = Math.min(ZOOM_MAX, +(customZoomScale + ZOOM_STEP).toFixed(2));
  applyCustomZoom();
});

zoomOutBtn.addEventListener('click', () => {
  customZoomScale = Math.max(ZOOM_MIN, +(customZoomScale - ZOOM_STEP).toFixed(2));
  applyCustomZoom();
});

zoomFitBtn.addEventListener('click', () => {
  customZoomScale = 1;
  applyCustomZoom();
});

function applyZoomFromInput() {
  if (!pageFlipInstance) return;
  let val = parseFloat(zoomPercentInput.value);
  if (isNaN(val)) val = Math.round(customZoomScale * 100);
  val = Math.min(ZOOM_MAX * 100, Math.max(ZOOM_MIN * 100, val));
  customZoomScale = +(val / 100).toFixed(2);
  applyCustomZoom();
}

zoomPercentInput.addEventListener('change', applyZoomFromInput);
zoomPercentInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    zoomPercentInput.blur();
  }
});

function updateBookIndicator() {
  if (!pageFlipInstance) return;
  try {
    const idx = pageFlipInstance.getCurrentPageIndex();
    const total = pageFlipInstance.getPageCount();

    let text;
    if (idx === 0) {
      text = t('indicator_front_cover', 'Front Cover 1 of {{total}}').split('{{total}}').join(total);
    } else if (idx >= total - 1) {
      text = t('indicator_back_cover', 'Back Cover {{total}} of {{total}}').split('{{total}}').join(total);
    } else {
      const left = idx + 1;
      const right = Math.min(idx + 2, total);
      text = t('indicator_page_range', 'Page {{left}}-{{right}} of {{total}}').split('{{left}}').join(left).split('{{right}}').join(right).split('{{total}}').join(total);
    }
    pageIndicator.textContent = text;

    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= total - 1;
  } catch (e) { console.warn(e); }
}

function computeBookSize(ratio) {
  const cfg = getBookSizeConfig();
  const availableWidth = Math.max(240, window.innerWidth - cfg.navReserve - cfg.sidePadding);
  const availableHeight = Math.max(200, window.innerHeight - cfg.vertPadding);

  let imageHeight = Math.max(140, availableHeight);
  let imageWidth = imageHeight * ratio;

  if (imageWidth * 2 > availableWidth) {
    imageWidth = availableWidth / 2;
    imageHeight = imageWidth / ratio;
  }

  if (imageHeight > cfg.maxImageHeight) {
    imageHeight = cfg.maxImageHeight;
    imageWidth = imageHeight * ratio;
  }

  if (cfg === BOOK_SIZE_CONFIG_PHONE || cfg === BOOK_SIZE_CONFIG_PHONE_SHORT) {
    imageWidth /= 1.1;
    imageHeight /= 1.1;
  }

  const labelScale = Math.max(0.55, Math.min(1, imageWidth / 460));

  return { bookWidth: imageWidth, bookHeight: imageHeight, labelScale: labelScale };
}

function updatePageCountWarningVisibility() {
  if (pageCountWarningCollapsed) {
    pageCountWarning.classList.add('hidden');
    pageCountWarning.classList.remove('flex');
    pageCountWarningSimple.classList.remove('hidden');
  } else {
    pageCountWarningSimple.classList.add('hidden');
    pageCountWarning.classList.remove('hidden');
    pageCountWarning.classList.add('flex');
  }
}

function checkPageCountWarning() {
  const total = pageDataList.length;
  const remainder = total % 4;
  if (!total || remainder === 0) {
    pageCountWarning.classList.add('hidden');
    pageCountWarning.classList.remove('flex');
    pageCountWarningSimple.classList.add('hidden');
    pageCountWarningCollapsed = false;
    return;
  }
  const short = 4 - remainder;
  const over = remainder;
  const pluralS = short > 1 ? 's' : '';
  pageCountWarningDetail.innerHTML = t('warning_page_count_detail', 'Current total: <strong>{{total}} pages</strong><br>Add by <strong>{{short}} page{{s}}</strong> or Delete by <strong>{{over}} pages<br></strong>To match a multiple of 4')
    .split('{{total}}').join(total).split('{{short}}').join(short).split('{{over}}').join(over).split('{{s}}').join(pluralS);
  pageCountWarningSimpleText.innerHTML = t('warning_page_count_simple', 'Add by <strong>{{short}} page{{s}}</strong> or Delete by <strong>{{over}} pages</strong>')
    .split('{{short}}').join(short).split('{{over}}').join(over).split('{{s}}').join(pluralS);
  updatePageCountWarningVisibility();
}

pageCountWarningHideBtn.addEventListener('click', () => {
  pageCountWarningCollapsed = true;
  updatePageCountWarningVisibility();
});

pageCountWarningShowBtn.addEventListener('click', () => {
  pageCountWarningCollapsed = false;
  updatePageCountWarningVisibility();
});

function closeThumbSidebar() {
  thumbSidebar.classList.remove('open');
  thumbOverlay.classList.remove('open');
  closePageContextMenu();
  clearThumbSelection();
  homeButton.classList.remove('is-hidden');
  hudToggleBtn.classList.remove('is-hidden');
}

function openThumbSidebar() {
  thumbSidebar.classList.add('open');
  thumbOverlay.classList.add('open');
  syncThumbnailActive(true);
  homeButton.classList.add('is-hidden');
  hudToggleBtn.classList.add('is-hidden');
}

thumbToggleBtn.addEventListener('click', () => {
  if (thumbSidebar.classList.contains('open')) closeThumbSidebar();
  else openThumbSidebar();
});
thumbCloseBtn.addEventListener('click', closeThumbSidebar);
thumbOverlay.addEventListener('click', closeThumbSidebar);

function relabelContentPages() {
  let n = 0;
  pageDataList.forEach(p => {
    if (p.isCover) return;
    if (p.isBlank) {
      p.label = t('label_blank_page', 'Blank Page');
    } else {
      n++;
      p.label = t('label_page_n', 'Page {{n}}').split('{{n}}').join(n);
    }
  });
}

function commitPageListChange(preferredIndex) {
  resetShareButton();
  clearThumbSelection();
  relabelContentPages();
  buildThumbnails();
  syncThumbnailActive();
  checkPageCountWarning();

  let keepIndex = preferredIndex;
  if (keepIndex === undefined || keepIndex === null) {
    keepIndex = 0;
    if (pageFlipInstance) {
      try { keepIndex = pageFlipInstance.getCurrentPageIndex(); } catch (e) { keepIndex = 0; }
    }
  }
  keepIndex = Math.max(0, Math.min(keepIndex, pageDataList.length - 1));

  clearTimeout(reorderRenderTimer);
  reorderRenderTimer = setTimeout(() => {
    reorderRenderTimer = null;
    renderBook(currentRatio, keepIndex);
  }, 140);
}

function reorderPages(fromIndex, toIndex) {
  if (fromIndex === toIndex) return;
  if (fromIndex < 0 || fromIndex >= pageDataList.length || toIndex < 0 || toIndex >= pageDataList.length) return;

  const [moved] = pageDataList.splice(fromIndex, 1);
  pageDataList.splice(toIndex, 0, moved);
  commitPageListChange();
}

function insertBlankPage(index, position) {
  if (!pageDataList.length) return;
  if (index < 0 || index >= pageDataList.length) return;
  const insertAt = position === 'after' ? index + 1 : index;
  pageDataList.splice(insertAt, 0, { label: t('label_blank_page', 'Blank Page'), isCover: false, canvasEl: null, isBlank: true });
  commitPageListChange(insertAt);
}

function copyPageAt(index) {
  if (index < 0 || index >= pageDataList.length) return;
  const source = pageDataList[index];
  const copy = {
    label: `${source.label} ${t('suffix_copy', '(Copy)')}`,
    isCover: source.isCover,
    isBlank: source.isBlank,
    isCopy: true,
    canvasEl: source.canvasEl ? cloneCanvas(source.canvasEl) : null,
    sourceKind: source.sourceKind,
    sourcePage: source.sourcePage
  };
  pageDataList.splice(index + 1, 0, copy);
  commitPageListChange(index + 1);
}

function deletePageAt(index) {
  if (pageDataList.length <= 1) return;
  if (index < 0 || index >= pageDataList.length) return;
  pageDataList.splice(index, 1);
  commitPageListChange(Math.min(index, pageDataList.length - 1));
}

function syncThumbSelectionUI() {
  thumbGrid.querySelectorAll('.thumb-item').forEach(el => {
    const i = Number(el.dataset.index);
    el.classList.toggle('selected', selectedPageIndexes.has(i));
  });
}

function clearThumbSelection() {
  selectionAnchorIndex = null;
  if (!selectedPageIndexes.size) return;
  selectedPageIndexes.clear();
  syncThumbSelectionUI();
}

function toggleThumbSelection(index) {
  if (selectedPageIndexes.has(index)) selectedPageIndexes.delete(index);
  else selectedPageIndexes.add(index);
  selectionAnchorIndex = index;
  syncThumbSelectionUI();
}

function selectThumbRange(index) {
  if (selectionAnchorIndex === null) selectionAnchorIndex = index;
  const start = Math.min(selectionAnchorIndex, index);
  const end = Math.max(selectionAnchorIndex, index);
  selectedPageIndexes = new Set();
  for (let i = start; i <= end; i++) selectedPageIndexes.add(i);
  syncThumbSelectionUI();
}

function deleteSelectedPages() {
  if (selectedPageIndexes.size < 2) return;
  const indexes = Array.from(selectedPageIndexes).sort((a, b) => a - b);
  const anchorIndex = indexes[0];
  let removed = false;
  for (let i = indexes.length - 1; i >= 0; i--) {
    if (pageDataList.length <= 1) break;
    const idx = indexes[i];
    if (idx < 0 || idx >= pageDataList.length) continue;
    pageDataList.splice(idx, 1);
    removed = true;
  }
  selectedPageIndexes.clear();
  if (removed) commitPageListChange(Math.min(anchorIndex, pageDataList.length - 1));
}

function clampContextMenuPosition(menuEl) {
  const menu = menuEl || pageContextMenu;
  const menuRect = menu.getBoundingClientRect();
  const maxX = window.innerWidth - menuRect.width - 8;
  const maxY = window.innerHeight - menuRect.height - 8;
  menu.style.left = `${Math.max(8, Math.min(menuRect.left, maxX))}px`;
  menu.style.top = `${Math.max(8, Math.min(menuRect.top, maxY))}px`;
}

function closePageContextMenu() {
  pageContextMenu.classList.add('hidden');
  pageContextMenuMulti.classList.add('hidden');
  contextAddSubmenu.classList.remove('open');
  contextAddToggle.classList.remove('expanded');
  contextMenuIndex = null;
}

function openPageContextMenu(x, y, index) {
  contextMenuIndex = index;
  contextAddSubmenu.classList.remove('open');
  contextAddToggle.classList.remove('expanded');
  pageContextMenuMulti.classList.add('hidden');
  pageContextMenu.style.left = `${x}px`;
  pageContextMenu.style.top = `${y}px`;
  pageContextMenu.classList.remove('hidden');

  const deleteBtn = pageContextMenu.querySelector('[data-action="delete"]');
  deleteBtn.disabled = pageDataList.length <= 1;

  requestAnimationFrame(() => clampContextMenuPosition(pageContextMenu));
}

function openPageContextMenuMulti(x, y) {
  contextMenuIndex = null;
  pageContextMenu.classList.add('hidden');
  pageContextMenuMulti.style.left = `${x}px`;
  pageContextMenuMulti.style.top = `${y}px`;
  pageContextMenuMulti.classList.remove('hidden');

  requestAnimationFrame(() => clampContextMenuPosition(pageContextMenuMulti));
}

pageContextMenu.querySelectorAll('.page-context-item[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    const action = btn.dataset.action;

    if (action === 'toggle-add') {
      const isOpen = contextAddSubmenu.classList.toggle('open');
      contextAddToggle.classList.toggle('expanded', isOpen);
      requestAnimationFrame(() => clampContextMenuPosition(pageContextMenu));
      setTimeout(() => clampContextMenuPosition(pageContextMenu), 200);
      return;
    }

    const index = contextMenuIndex;
    closePageContextMenu();
    if (index === null) return;
    if (action === 'copy') copyPageAt(index);
    else if (action === 'before') insertBlankPage(index, 'before');
    else if (action === 'after') insertBlankPage(index, 'after');
    else if (action === 'delete') deletePageAt(index);
  });
});

pageContextMenuMulti.querySelectorAll('.page-context-item[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    const action = btn.dataset.action;
    closePageContextMenu();
    if (action === 'delete-multi') deleteSelectedPages();
  });
});

document.addEventListener('click', (e) => {
  if (!pageContextMenu.classList.contains('hidden') && !pageContextMenu.contains(e.target)) {
    closePageContextMenu();
  }
  if (!pageContextMenuMulti.classList.contains('hidden') && !pageContextMenuMulti.contains(e.target)) {
    closePageContextMenu();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closePageContextMenu(); clearThumbSelection(); }
});
window.addEventListener('resize', closePageContextMenu);
window.addEventListener('scroll', closePageContextMenu, true);

function drawThumbCanvas(sourceCanvas, ratio) {
  const boxW = 168;
  const boxH = Math.max(1, Math.round(boxW / ratio));
  const c = document.createElement('canvas');
  c.width = boxW;
  c.height = boxH;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, boxW, boxH);
  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;
  const scale = Math.min(boxW / srcW, boxH / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const offsetX = (boxW - drawW) / 2;
  const offsetY = (boxH - drawH) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, offsetX, offsetY, drawW, drawH);
  return c;
}

function clearLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  longPressStartPos = null;
}

function getThumbItemAtPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  return el ? el.closest('.thumb-item') : null;
}

function buildThumbnails() {
  const thumbRatio = (currentRatio && isFinite(currentRatio) && currentRatio > 0) ? currentRatio : 0.7071;
  thumbGrid.style.setProperty('--thumb-ratio', thumbRatio);
  thumbGrid.innerHTML = '';
  pageDataList.forEach((data, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'thumb-item' + (data.isCover ? ' cover' : '') + (data.isBlank ? ' blank' : (data.isCopy ? ' copy' : ' original')) + (selectedPageIndexes.has(index) ? ' selected' : '');
    item.dataset.index = String(index);

    const visual = document.createElement('div');
    visual.className = 'thumb-visual';

    const badge = document.createElement('div');
    badge.className = 'thumb-index-badge';
    badge.textContent = String(index + 1).padStart(2, '0');
    visual.appendChild(badge);

    const handle = document.createElement('div');
    handle.className = 'thumb-drag-handle';
    handle.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="8" cy="6" r="1.2"/><circle cx="16" cy="6" r="1.2"/><circle cx="8" cy="12" r="1.2"/><circle cx="16" cy="12" r="1.2"/><circle cx="8" cy="18" r="1.2"/><circle cx="16" cy="18" r="1.2"/></svg>';
    visual.appendChild(handle);

    if (data.isBlank || !data.canvasEl) {
      const blankVisual = document.createElement('div');
      blankVisual.className = 'thumb-blank-visual';
      blankVisual.textContent = t('label_thumb_blank', 'Blank');
      visual.appendChild(blankVisual);
    } else {
      visual.appendChild(drawThumbCanvas(data.canvasEl, thumbRatio));
    }

    const labelEl = document.createElement('span');
    labelEl.className = 'thumb-meta-label';
    labelEl.textContent = data.label;

    item.appendChild(visual);
    item.appendChild(labelEl);

    item.addEventListener('click', (e) => {
      if (suppressNextThumbClick) { suppressNextThumbClick = false; return; }
      if (e.shiftKey) {
        e.preventDefault();
        selectThumbRange(index);
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        toggleThumbSelection(index);
        return;
      }
      if (selectedPageIndexes.size) clearThumbSelection();
      selectionAnchorIndex = index;
      if (!pageFlipInstance) return;
      try { pageFlipInstance.turnToPage(index); } catch (e) { console.warn(e); }
      syncThumbnailActive();
    });

    item.draggable = !DRAG_HANDLE_ONLY;

    item.addEventListener('dragstart', (e) => {
      if (DRAG_HANDLE_ONLY) { e.preventDefault(); return; }
      dragSourceIndex = index;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', String(index)); } catch (err) {}
    });

    item.addEventListener('dragend', () => {
      dragSourceIndex = null;
      thumbGrid.querySelectorAll('.thumb-item').forEach(el => {
        el.classList.remove('dragging');
        el.classList.remove('drag-over');
      });
    });

    item.addEventListener('dragover', (e) => {
      if (dragSourceIndex === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      item.classList.add('drag-over');
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      if (dragSourceIndex === null) return;
      const sourceIndex = dragSourceIndex;
      const targetIndex = Number(item.dataset.index);
      dragSourceIndex = null;
      if (sourceIndex !== targetIndex) {
        setTimeout(() => reorderPages(sourceIndex, targetIndex), 0);
      }
    });

    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (selectedPageIndexes.size > 1 && selectedPageIndexes.has(index)) {
        openPageContextMenuMulti(e.clientX, e.clientY);
      } else {
        clearThumbSelection();
        selectionAnchorIndex = index;
        openPageContextMenu(e.clientX, e.clientY, index);
      }
    });

    handle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearLongPressTimer();
      dragSourceIndex = index;
      touchDragState = { sourceIndex: index };
      item.classList.add('dragging');
    }, { passive: false });

    item.addEventListener('touchstart', (e) => {
      if (e.target.closest('.thumb-drag-handle')) return;
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      longPressStartPos = { x: touch.clientX, y: touch.clientY };
      longPressTimer = setTimeout(() => {
        longPressTimer = null;
        suppressNextThumbClick = true;
        if (navigator.vibrate) { try { navigator.vibrate(15); } catch (err) {} }
        openPageContextMenu(touch.clientX, touch.clientY, index);
      }, LONG_PRESS_MS);
    }, { passive: true });

    item.addEventListener('touchmove', (e) => {
      if (!longPressStartPos || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - longPressStartPos.x);
      const dy = Math.abs(touch.clientY - longPressStartPos.y);
      if (dx > LONG_PRESS_MOVE_TOLERANCE || dy > LONG_PRESS_MOVE_TOLERANCE) {
        clearLongPressTimer();
      }
    }, { passive: true });

    item.addEventListener('touchend', () => {
      clearLongPressTimer();
    });

    item.addEventListener('touchcancel', () => {
      clearLongPressTimer();
    });

    thumbGrid.appendChild(item);
  });
}

function syncThumbnailActive(scrollIntoView) {
  if (!pageFlipInstance) return;
  let idx, total;
  try {
    idx = pageFlipInstance.getCurrentPageIndex();
    total = pageFlipInstance.getPageCount();
  } catch (e) { return; }

  let activeIndexes;
  if (idx === 0) activeIndexes = [0];
  else if (idx >= total - 1) activeIndexes = [total - 1];
  else activeIndexes = [idx, Math.min(idx + 1, total - 1)];

  const items = thumbGrid.querySelectorAll('.thumb-item');
  items.forEach(el => {
    const i = Number(el.dataset.index);
    if (activeIndexes.indexOf(i) !== -1) {
      el.classList.add('active');
      if (scrollIntoView && i === activeIndexes[0]) {
        el.scrollIntoView({ block: 'nearest' });
      }
    } else {
      el.classList.remove('active');
    }
  });
}

function createPageElement(data) {
  const pageDiv = document.createElement('div');
  pageDiv.className = 'my-page';

  const inner = document.createElement('div');
  inner.className = 'page-inner';

  if (data.isBlank) {
    const blankDiv = document.createElement('div');
    blankDiv.className = 'page-blank';
    blankDiv.innerText = t('label_additional_blank_pages', 'Additional Blank Pages\n(Adjusting Print Folds)');
    inner.appendChild(blankDiv);
  } else if (data.canvasEl) {
    if (!data.canvasEl._flipImgSrc) {
      data.canvasEl._flipImgSrc = data.canvasEl.toDataURL('image/jpeg', 0.92);
    }
    const pageImg = document.createElement('img');
    pageImg.className = 'page-flip-img';
    pageImg.alt = '';
    pageImg.src = data.canvasEl._flipImgSrc;
    inner.appendChild(pageImg);
  } else {
    const blankDiv = document.createElement('div');
    blankDiv.className = 'page-blank';
    blankDiv.innerText = t('label_page_not_found', 'Page Not Found');
    inner.appendChild(blankDiv);
  }

  if (data.label) {
    const label = document.createElement('div');
    label.className = 'page-label' + (data.isCover ? ' cover-label' : '');
    label.textContent = data.label;
    inner.appendChild(label);
  }

  pageDiv.appendChild(inner);
  return pageDiv;
}

function renderBook(ratio, startIndex) {
  if (!pageDataList.length || !ratio || !isFinite(ratio) || ratio <= 0) return;

  const isFreshBook = !pageFlipInstance;
  const preRenderScrollY = getPageScrollY();

  unlockPageScroll();

  const myGeneration = ++renderGeneration;

  const fresh = document.createElement('div');
  fresh.id = 'book';
  fresh.className = bookContainer.className;
  fresh.style.visibility = 'hidden';
  bookFrame.appendChild(fresh);

  try {
    pageDataList.forEach(d => fresh.appendChild(createPageElement(d)));

    const { bookWidth, bookHeight, labelScale } = computeBookSize(ratio);
    if (!isFinite(bookWidth) || !isFinite(bookHeight) || bookWidth <= 0 || bookHeight <= 0) {
      throw new Error('Invalid preview size.');
    }
    fresh.style.setProperty('--pv-label-scale', String(labelScale || 1));

    const newInstance = new St.PageFlip(fresh, {
      width: bookWidth,
      height: bookHeight,
      size: 'fixed',
      showCover: true,
      usePortrait: false,
      maxShadowOpacity: 0.5,
      drawShadow: true
    });

    newInstance.loadFromHTML(fresh.querySelectorAll('.my-page'));

    if (myGeneration !== renderGeneration) {
      try { newInstance.destroy(); } catch (e) { console.warn(e); }
      fresh.remove();
      return;
    }

    if (pageFlipInstance) {
      try { pageFlipInstance.destroy(); } catch (e) { console.warn(e); }
      pageFlipInstance = null;
    }
    Array.from(bookFrame.children).forEach(child => { if (child !== fresh) child.remove(); });

    fresh.style.visibility = '';
    bookContainer = fresh;
    pageFlipInstance = newInstance;
    baseBookWidth = bookWidth;
    baseBookHeight = bookHeight;
    if (isFreshBook) customZoomScale = 1.1;

    pageFlipInstance.on('flip', () => { updateBookIndicator(); syncThumbnailActive(); });
    pageFlipInstance.on('changeState', (e) => {
      if (e.data === 'read') {
        unlockPageScroll();
      } else {
        lockPageScroll();
      }
    });
    if (startIndex > 0) {
      try { pageFlipInstance.turnToPage(startIndex); } catch (e) { console.warn(e); }
    }
    updateBookIndicator();
    buildThumbnails();
    syncThumbnailActive();
    applyCustomZoom();
    zoomCluster.classList.remove('hidden');
    zoomCluster.classList.add('flex');
    if (!isFreshBook) setPageScrollY(preRenderScrollY);
  } catch (err) {
    console.error(err);
    if (myGeneration === renderGeneration) fresh.remove();
  }
}

prevBtn.addEventListener('click', () => { if (pageFlipInstance) { try { pageFlipInstance.flipPrev(); } catch (e) { console.warn(e); } } });
nextBtn.addEventListener('click', () => { if (pageFlipInstance) { try { pageFlipInstance.flipNext(); } catch (e) { console.warn(e); } } });

function resetDownstream() {
  hideStep(stepSize);
  hideStep(stepOrientation);
  hideStep(stepCustom);
  sizeSelect.value = '';
  syncSizeDropdownUI();
  closeSizeDropdown();
  customWidthInput.value = '';
  customHeightInput.value = '';
  document.querySelectorAll('input[name="orientation"]').forEach(r => r.checked = false);

  destroyBook();
  pageDataList = [];
  currentRatio = null;
  currentSpec = null;
  previewView.classList.add('hidden');
  infoCluster.classList.add('hidden');
  formView.classList.remove('hidden');
  document.body.classList.remove('preview-lock');
  rotateSuggestBanner.classList.add('hidden');
  rotateSuggestBanner.classList.remove('flex');
  rotateBannerDismissed = false;
  setHudHidden(false);
  hudToggleBtn.classList.add('is-off');
  previewMetaSize.textContent = '';
  previewBtn.disabled = true;
  previewBtn.textContent = t('btn_preview_booklet', 'Preview Booklet');
  setHint(t('hint_upload_pdf_first', 'Upload the PDF first.'), 'default');
}

function resetUploadUI(kind) {
  const target = uploadTargets[kind];
  target.info.classList.add('hidden');
  target.dropzone.classList.remove('hidden');
  target.nameEl.textContent = '';
  target.metaEl.textContent = '';
  target.input.value = '';
}

document.querySelectorAll('input[name="upload-mode"]').forEach(r => {
  r.addEventListener('change', () => {
    uploadMode = document.querySelector('input[name="upload-mode"]:checked').value;
    pdfDoc = null;
    coverPdfDoc = null;
    pagesPdfDoc = null;
    singleFileBytes = null;
    coverFileBytes = null;
    pagesFileBytes = null;
    singleFileName = '';
    coverFileName = '';
    pagesFileName = '';
    singleLibDocCache = null;
    coverLibDocCache = null;
    pagesLibDocCache = null;
    resetDownstream();
    resetUploadUI('single');
    resetUploadUI('cover');
    resetUploadUI('pages');

    if (uploadMode === 'single') {
      singleUploadSection.classList.remove('hidden');
      separateUploadSection.classList.add('hidden');
    } else {
      singleUploadSection.classList.add('hidden');
      separateUploadSection.classList.remove('hidden');
      separateUploadSection.classList.add('flex');
    }
    validate();
  });
});

async function handlePdfFile(file, kind) {
  const target = uploadTargets[kind];

  if (!file || file.type !== 'application/pdf') {
    setHint(t('error_invalid_pdf', 'Please select a valid PDF file'), 'error');
    return;
  }

  if (kind === 'single') { pdfDoc = null; singleFileBytes = null; singleFileName = ''; singleLibDocCache = null; }
  else if (kind === 'cover') { coverPdfDoc = null; coverFileBytes = null; coverFileName = ''; coverLibDocCache = null; }
  else { pagesPdfDoc = null; pagesFileBytes = null; pagesFileName = ''; pagesLibDocCache = null; }

  resetDownstream();

  target.info.classList.remove('hidden');
  target.info.classList.add('step-enter');
  target.dropzone.classList.add('hidden');
  target.nameEl.textContent = file.name;
  target.metaEl.textContent = `${formatBytes(file.size)} \u00b7 ${t('status_reading_pages', 'Reading Pages')}`;
  setHint(t('status_reading_pdf', 'Reading PDF File'), 'default');

  try {
    const buffer = await file.arrayBuffer();
    const bufferForLib = buffer.slice(0);
    const doc = await pdfjsLib.getDocument({ data: buffer, isEvalSupported: false }).promise;  // mitigasi CVE-2024-4367

    if (kind === 'single') { pdfDoc = doc; singleFileBytes = new Uint8Array(bufferForLib); singleFileName = file.name; }
    else if (kind === 'cover') { coverPdfDoc = doc; coverFileBytes = new Uint8Array(bufferForLib); coverFileName = file.name; }
    else { pagesPdfDoc = doc; pagesFileBytes = new Uint8Array(bufferForLib); pagesFileName = file.name; }

    target.metaEl.textContent = `${formatBytes(file.size)} \u00b7 ${doc.numPages} ${t('unit_pages', 'Pages')}`;
    setHint(t('status_file_ready', 'The file is ready to be processed'), 'success');
    if (filesReady()) showStep(stepSize);
  } catch (err) {
    console.error(err);
    if (kind === 'single') { pdfDoc = null; singleFileBytes = null; singleFileName = ''; }
    else if (kind === 'cover') { coverPdfDoc = null; coverFileBytes = null; coverFileName = ''; }
    else { pagesPdfDoc = null; pagesFileBytes = null; pagesFileName = ''; }
    setHint(`${t('error_failed_read_pdf', 'Failed to read the PDF:')} ${err.message}`, 'error');
  } finally {
    validate();
    target.input.value = '';
  }
}

function setupDropzone(dropzoneEl, inputEl, kind) {
  ['dragover', 'dragenter'].forEach(evt => {
    dropzoneEl.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzoneEl.classList.add('border-accent');
    });
  });
  ['dragleave', 'dragend'].forEach(evt => {
    dropzoneEl.addEventListener(evt, () => dropzoneEl.classList.remove('border-accent'));
  });
  dropzoneEl.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzoneEl.classList.remove('border-accent');
    const file = e.dataTransfer.files[0];
    if (file) {
      inputEl.files = e.dataTransfer.files;
      handlePdfFile(file, kind);
    }
  });
  inputEl.addEventListener('change', (e) => handlePdfFile(e.target.files[0], kind));
}

Object.keys(uploadTargets).forEach(kind => {
  const target = uploadTargets[kind];
  setupDropzone(target.dropzone, target.input, kind);
  target.changeBtn.addEventListener('click', () => {
    target.input.value = '';
    target.input.click();
  });
});

sizeSelect.addEventListener('change', () => {
  document.querySelectorAll('input[name="orientation"]').forEach(r => r.checked = false);
  customWidthInput.value = '';
  customHeightInput.value = '';

  if (isStandardSize()) {
    showStep(stepOrientation);
    hideStep(stepCustom);
  } else if (sizeSelect.value === 'custom') {
    hideStep(stepOrientation);
    showStep(stepCustom);
  } else {
    hideStep(stepOrientation);
    hideStep(stepCustom);
  }
  validate();
});

document.querySelectorAll('input[name="orientation"]').forEach(r => {
  r.addEventListener('change', validate);
});

function parseDecimalInput(value) {
  return parseFloat(String(value).replace(',', '.'));
}

function sanitizeDecimalInput(el) {
  let v = el.value.replace(/[^0-9.,]/g, '');
  const i = v.search(/[.,]/);
  if (i !== -1) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/[.,]/g, '');
  if (v !== el.value) el.value = v;
}

[customWidthInput, customHeightInput].forEach(el => {
  el.addEventListener('input', () => {
    sanitizeDecimalInput(el);
    validate();
  });
});

function validate() {
  const ready = filesReady();
  const sizeOk = sizeSelect.value !== '';
  const orientationOk = isStandardSize() ? document.querySelector('input[name="orientation"]:checked') !== null : true;
  const customOk = sizeSelect.value === 'custom'
    ? (parseDecimalInput(customWidthInput.value) > 0 && parseDecimalInput(customHeightInput.value) > 0)
    : true;

  let hint = '';
  if (uploadMode === 'single') {
    if (!pdfDoc) hint = t('hint_upload_pdf_first', 'Upload the PDF first.');
  } else {
    if (!coverPdfDoc && !pagesPdfDoc) hint = t('hint_upload_cover_and_pages', 'Upload the cover file and pages file first');
    else if (!coverPdfDoc) hint = t('hint_upload_cover_first', 'Upload the cover file first');
    else if (!pagesPdfDoc) hint = t('hint_upload_pages_first', 'Upload the pages file first');
  }

  if (!hint) {
    if (!sizeOk) hint = t('hint_select_booklet_size', 'Select the booklet size');
    else if (isStandardSize() && !orientationOk) hint = t('hint_select_orientation', 'Select page orientation');
    else if (sizeSelect.value === 'custom' && !customOk) hint = t('hint_complete_custom_size', 'Complete the custom size (Width & Height)');
    else hint = t('hint_all_ready', 'All settings are ready, Click Preview Booklet');
  }
  setHint(hint, 'default');

  previewBtn.disabled = !(ready && sizeOk && orientationOk && customOk);
}

function getTargetSpec() {
  if (isStandardSize()) {
    let wcm, hcm;
    if (sizeSelect.value === 'a4') { wcm = 21; hcm = 29.7; } else { wcm = 14.8; hcm = 21; }
    const orientation = document.querySelector('input[name="orientation"]:checked').value;
    if (orientation === 'landscape' && wcm < hcm) { [wcm, hcm] = [hcm, wcm]; }
    if (orientation === 'portrait' && wcm > hcm) { [wcm, hcm] = [hcm, wcm]; }
    return { ratio: wcm / hcm, wcm, hcm, orientation, sizeValue: sizeSelect.value };
  }
  const wcm = parseDecimalInput(customWidthInput.value);
  const hcm = parseDecimalInput(customHeightInput.value);
  return { ratio: wcm / hcm, wcm, hcm, orientation: null, sizeValue: sizeSelect.value };
}

function getSizeLabel(spec) {
  const sizeKey = spec.sizeValue || sizeSelect.value;
  const sizeName = sizeKey === 'a4' ? 'A4' : sizeKey === 'a5' ? 'A5' : t('option_custom_size', 'Custom Size');
  const parts = [sizeName];
  if (spec.orientation) {
    parts.push(spec.orientation === 'portrait' ? t('orientation_portrait', 'Portrait') : t('orientation_landscape', 'Landscape'));
  }
  parts.push(`${spec.wcm}\u00d7${spec.hcm} cm`);
  return parts.join(' \u00b7 ');
}

function cloneCanvas(source) {
  const clone = document.createElement('canvas');
  clone.width = source.width;
  clone.height = source.height;
  clone.getContext('2d').drawImage(source, 0, 0);
  return clone;
}

async function renderPdfPageToCanvas(doc, pageNum) {
  const page = await doc.getPage(pageNum);
  const renderViewport = page.getViewport({ scale: RENDER_SCALE });
  const canvas = document.createElement('canvas');
  canvas.width = renderViewport.width;
  canvas.height = renderViewport.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
  return canvas;
}

function buildCoverSlots(n) {
  if (n === 2) {
    return {
      front: [{ label: t('label_front_cover', 'Front Cover'), real: 1 }, { label: t('label_front_inner_cover', 'Front Inner Cover'), real: null }],
      back: [{ label: t('label_back_inner_cover', 'Back Inner Cover'), real: null }, { label: t('label_back_cover', 'Back Cover'), real: 2 }]
    };
  }
  if (n === 4) {
    return {
      front: [{ label: t('label_front_cover', 'Front Cover'), real: 1 }, { label: t('label_front_inner_cover', 'Front Inner Cover'), real: 2 }],
      back: [{ label: t('label_back_inner_cover', 'Back Inner Cover'), real: 3 }, { label: t('label_back_cover', 'Back Cover'), real: 4 }]
    };
  }
  if (n === 1) {
    return {
      front: [{ label: t('label_front_cover', 'Front Cover'), real: 1 }],
      back: [{ label: t('label_back_cover', 'Back Cover'), real: 1 }]
    };
  }
  return {
    front: [{ label: t('label_front_cover', 'Front Cover'), real: 1 }],
    back: [{ label: t('label_back_cover', 'Back Cover'), real: n }]
  };
}

async function renderCoverPages(coverDoc) {
  const n = coverDoc.numPages;
  const slots = buildCoverSlots(n);
  const totalToRender = [...slots.front, ...slots.back].filter(s => s.real !== null).length;
  let rendered = 0;
  const cache = {};

  async function resolveSlot(slot) {
    if (slot.real === null) {
      return { label: `${slot.label} ${t('suffix_empty', '(Empty)')}`, isCover: true, canvasEl: null, isBlank: true };
    }
    if (!cache[slot.real]) {
      rendered++;
      setHint(t('status_rendering_cover_page', 'Rendering the page cover {{n}} from {{total}} ({{dpi}} DPI)').split('{{n}}').join(rendered).split('{{total}}').join(totalToRender).split('{{dpi}}').join(RENDER_DPI), 'default');
      cache[slot.real] = await renderPdfPageToCanvas(coverDoc, slot.real);
      return { label: slot.label, isCover: true, canvasEl: cache[slot.real], isBlank: false, sourceKind: 'cover', sourcePage: slot.real };
    }
    return { label: slot.label, isCover: true, canvasEl: cloneCanvas(cache[slot.real]), isBlank: false, sourceKind: 'cover', sourcePage: slot.real };
  }

  const frontPages = [];
  for (const slot of slots.front) frontPages.push(await resolveSlot(slot));

  const backPages = [];
  for (const slot of slots.back) backPages.push(await resolveSlot(slot));

  return { frontPages, backPages };
}

async function generatePreview() {
  if (!filesReady()) return;

  previewBtn.disabled = true;
  previewBtn.textContent = t('btn_processing', 'Processing');
  setHint(t('status_preparing_page', 'Preparing the page'), 'default');

  destroyBook();
  pageDataList = [];

  try {
    const spec = getTargetSpec();
    const ratio = spec.ratio;

    let frontPages = [];
    let backPages = [];
    let contentDoc;

    if (uploadMode === 'separate') {
      const coverResult = await renderCoverPages(coverPdfDoc);
      frontPages = coverResult.frontPages;
      backPages = coverResult.backPages;
      contentDoc = pagesPdfDoc;
    } else {
      contentDoc = pdfDoc;
    }

    const totalContentPages = contentDoc.numPages;
    const wrapCount = frontPages.length + backPages.length;
    const contentPadded = sharedLoadState === 'loading' ? totalContentPages : Math.ceil(totalContentPages / 4) * 4;
    const bookletPages = wrapCount + contentPadded;

    frontPages.forEach(p => pageDataList.push(p));

    let globalIndex = frontPages.length;
    for (let i = 1; i <= contentPadded; i++) {
      globalIndex++;
      const renderingText = t('status_rendering_page', 'Rendering the page {{n}} from {{total}} ({{dpi}} DPI)').split('{{n}}').join(globalIndex).split('{{total}}').join(bookletPages).split('{{dpi}}').join(RENDER_DPI);
      setHint(renderingText, 'default');
      if (sharedLoadState === 'loading') document.getElementById('shared-render-msg').textContent = renderingText;

      const isPadding = i > totalContentPages;
      let label;
      let isCover = false;
      if (uploadMode === 'separate') {
        label = t('label_page_n', 'Page {{n}}').split('{{n}}').join(i);
      } else if (globalIndex === 1) {
        label = t('label_front_cover', 'Front Cover');
        isCover = true;
      } else if (globalIndex === 2) {
        label = t('label_front_inner_cover', 'Front Inner Cover');
        isCover = true;
      } else if (globalIndex === bookletPages - 1) {
        label = t('label_back_inner_cover', 'Back Inner Cover');
        isCover = true;
      } else if (globalIndex === bookletPages) {
        label = t('label_back_cover', 'Back Cover');
        isCover = true;
      } else {
        label = t('label_page_n', 'Page {{n}}').split('{{n}}').join(globalIndex - 2);
      }

      if (isPadding) {
        label = isCover ? `${label} ${t('suffix_blank', '(Blank)')}` : t('label_blank_page', 'Blank Page');
      }

      if (i <= totalContentPages) {
        const canvas = await renderPdfPageToCanvas(contentDoc, i);
        pageDataList.push({ label, isCover, canvasEl: canvas, isBlank: false, sourceKind: uploadMode === 'single' ? 'single' : 'pages', sourcePage: i });
      } else {
        pageDataList.push({ label, isCover, canvasEl: null, isBlank: true });
      }
    }

    backPages.forEach(p => pageDataList.push(p));

    currentRatio = ratio;
    currentSpec = spec;
    previewMetaSize.textContent = getSizeLabel(spec);
    checkPageCountWarning();

    formView.classList.add('hidden');
    previewView.classList.remove('hidden');
    infoCluster.classList.remove('hidden');
    infoCluster.classList.add('flex');
    document.body.classList.add('preview-lock');
    hudToggleBtn.classList.remove('is-off');
    lockAllScales();
    updateRotateBanner();

    requestAnimationFrame(() => requestAnimationFrame(() => renderBook(ratio, 0)));

  } catch (err) {
    console.error(err);
    setHint(`${t('error_preview_generation', 'An error occurred while creating the preview:')} ${err.message}`, 'error');
  } finally {
    previewBtn.disabled = false;
    previewBtn.textContent = t('btn_preview_booklet', 'Preview Booklet');
  }
}

previewBtn.addEventListener('click', generatePreview);

removePreviewBtn.addEventListener('click', () => {
  window.location.href = window.location.pathname;
});

function ensurePdfLib() {
  if (window.PDFLib) return Promise.resolve();
  if (!pdfLibPromise) {
    pdfLibPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/booklet-assets/vendor/pdf-lib.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return pdfLibPromise;
}

async function getSourceLibDoc(kind) {
  if (kind === 'single') {
    if (!singleFileBytes) throw new Error('File PDF tidak ditemukan.');
    if (!singleLibDocCache) singleLibDocCache = await PDFLib.PDFDocument.load(singleFileBytes);
    return singleLibDocCache;
  }
  if (kind === 'cover') {
    if (!coverFileBytes) throw new Error('File cover tidak ditemukan.');
    if (!coverLibDocCache) coverLibDocCache = await PDFLib.PDFDocument.load(coverFileBytes);
    return coverLibDocCache;
  }
  if (!pagesFileBytes) throw new Error('File pages tidak ditemukan.');
  if (!pagesLibDocCache) pagesLibDocCache = await PDFLib.PDFDocument.load(pagesFileBytes);
  return pagesLibDocCache;
}

function sanitizeFileBase(name) {
  const base = (name || '').replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9\-_ ]/g, '').trim();
  return base || 'booklet';
}

function buildExportFileName() {
  const base = uploadMode === 'single'
    ? sanitizeFileBase(singleFileName)
    : sanitizeFileBase(coverFileName) || sanitizeFileBase(pagesFileName);
  return `${base}-booklet.pdf`;
}

async function buildBookletPdfBytes() {
  await ensurePdfLib();
  const outDoc = await PDFLib.PDFDocument.create();

  const ptPerCm = 28.3465;
  const blankSize = (currentSpec && currentSpec.wcm && currentSpec.hcm)
    ? [currentSpec.wcm * ptPerCm, currentSpec.hcm * ptPerCm]
    : [419.53, 595.28];

  const groups = {};
  pageDataList.forEach((data, index) => {
    if (data.isBlank || !data.sourceKind) return;
    if (!groups[data.sourceKind]) groups[data.sourceKind] = [];
    groups[data.sourceKind].push(index);
  });

  const copiedByPosition = new Array(pageDataList.length).fill(null);

  for (const kind of Object.keys(groups)) {
    const libDoc = await getSourceLibDoc(kind);
    const positions = groups[kind];
    const srcIndices = positions.map(pos => pageDataList[pos].sourcePage - 1);
    const copiedPages = await outDoc.copyPages(libDoc, srcIndices);
    positions.forEach((pos, i) => { copiedByPosition[pos] = copiedPages[i]; });
  }

  pageDataList.forEach((data, index) => {
    if (data.isBlank || !data.sourceKind) {
      outDoc.addPage(blankSize);
    } else {
      outDoc.addPage(copiedByPosition[index]);
    }
  });

  return await outDoc.save();
}

async function exportPdf() {
  if (!pageDataList.length || savePdfBtn.disabled) return;

  savePdfBtn.disabled = true;
  savePdfLabel.textContent = t('status_saving', 'Saving');

  try {
    const pdfBytes = await buildBookletPdfBytes();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildExportFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);

    savePdfLabel.textContent = t('status_downloaded', 'Downloaded!');
  } catch (err) {
    console.error(err);
    savePdfLabel.textContent = t('status_failed_download', 'Failed Download');
  } finally {
    setTimeout(() => {
      savePdfLabel.textContent = t('btn_save_pdf', 'Save PDF');
      savePdfBtn.disabled = false;
    }, 1600);
  }
}

savePdfBtn.addEventListener('click', exportPdf);

const sizeSelectTrigger = document.getElementById('size-select-trigger');
const sizeSelectTriggerLabel = document.getElementById('size-select-trigger-label');
const sizeSelectOptions = document.getElementById('size-select-options');

function positionSizeDropdown() {
  const rect = sizeSelectTrigger.getBoundingClientRect();
  sizeSelectOptions.style.left = `${rect.left}px`;
  sizeSelectOptions.style.top = `${rect.bottom + 6}px`;
  sizeSelectOptions.style.width = `${rect.width}px`;
}

function closeSizeDropdown() {
  sizeSelectOptions.classList.remove('show');
  sizeSelectTrigger.classList.remove('active');
  sizeSelectTrigger.setAttribute('aria-expanded', 'false');
}

function openSizeDropdown() {
  positionSizeDropdown();
  sizeSelectOptions.classList.add('show');
  sizeSelectTrigger.classList.add('active');
  sizeSelectTrigger.setAttribute('aria-expanded', 'true');
}

function syncSizeDropdownUI() {
  const opt = sizeSelectOptions.querySelector(`[data-value="${sizeSelect.value}"]`);
  sizeSelectTriggerLabel.textContent = opt ? opt.textContent : t('placeholder_select_size', 'Select Size\u2026');
  sizeSelectOptions.querySelectorAll('.print-mode-option').forEach(o => {
    o.classList.toggle('selected', o.dataset.value === sizeSelect.value);
  });
}

sizeSelectTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  if (sizeSelectOptions.classList.contains('show')) closeSizeDropdown();
  else openSizeDropdown();
});

sizeSelectOptions.querySelectorAll('.print-mode-option').forEach(optEl => {
  optEl.addEventListener('click', () => {
    sizeSelect.value = optEl.dataset.value;
    syncSizeDropdownUI();
    closeSizeDropdown();
    sizeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  });
});

document.addEventListener('click', (e) => {
  if (!sizeSelectTrigger.contains(e.target) && !sizeSelectOptions.contains(e.target)) closeSizeDropdown();
});
function followSpecBarDropdownPosition() {
  if (!sizeSelectOptions.classList.contains('show')) return;
  const start = performance.now();
  const duration = 320;
  function step(now) {
    if (!sizeSelectOptions.classList.contains('show')) return;
    positionSizeDropdown();
    if (now - start < duration) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

specBar.addEventListener('mouseenter', followSpecBarDropdownPosition);
specBar.addEventListener('mouseleave', followSpecBarDropdownPosition);

window.addEventListener('scroll', () => {
  if (sizeSelectOptions.classList.contains('show')) closeSizeDropdown();
}, true);

window.addEventListener('resize', () => {
  if (sizeSelectOptions.classList.contains('show')) closeSizeDropdown();
});
window.addEventListener('resize', lockAllScales);

lockAllScales();
syncSizeDropdownUI();
validate();

function applyAriaLabels() {
  prevBtn.setAttribute('aria-label', t('aria_previous', 'Sebelumnya'));
  nextBtn.setAttribute('aria-label', t('aria_next', 'Berikutnya'));
  pageCountWarningHideBtn.setAttribute('aria-label', t('aria_hide', 'Hide'));
  pageCountWarningShowBtn.setAttribute('aria-label', t('aria_show', 'Show'));
  rotateSuggestCloseBtn.setAttribute('aria-label', t('aria_dismiss', 'Dismiss'));
  zoomOutBtn.setAttribute('aria-label', t('aria_zoom_out', 'Zoom Out'));
  zoomInBtn.setAttribute('aria-label', t('aria_zoom_in', 'Zoom In'));
  zoomFitBtn.setAttribute('aria-label', t('aria_fit_to_screen', 'Fit to Screen'));
  zoomPercentInput.setAttribute('aria-label', t('aria_zoom_percentage', 'Persentase Zoom'));
  thumbToggleBtn.setAttribute('aria-label', t('btn_open_pages', 'Open Pages'));
  thumbCloseBtn.setAttribute('aria-label', t('aria_close', 'Tutup'));
  sizeSelectOptions.setAttribute('aria-label', t('label_booklet_size', 'Booklet Size'));
  hudToggleBtn.setAttribute('aria-label', t('aria_toggle_hud', 'Show/Hide HUD'));
  hudToggleBtn.setAttribute('title', t('aria_toggle_hud', 'Show/Hide HUD'));
}

refreshDynamicI18nText = function () {
  applyAriaLabels();
  updateSharedStatusUI();
  validate();
  syncSizeDropdownUI();
  if (currentSpec) previewMetaSize.textContent = getSizeLabel(currentSpec);
  if (pageFlipInstance) updateBookIndicator();
  if (pageDataList.length) checkPageCountWarning();
};

applyAriaLabels();

const shareLinkBtn = document.getElementById('share-link-btn');
const shareLinkLabel = document.getElementById('share-link-label');
const sharedLoadingMsg = document.getElementById('shared-loading-msg');
let isSharedView = false;
let pendingShareUrl = null;
let shareCopyIcon = null;
let sharedLoadState = 'idle';
let sharedLoadErrorRaw = '';
let sharedExpiresAt = null;
let shareExpireBubble = null;
let shareContentVersion = 0;
let shareUploading = false;

function resetShareButton() {
  shareContentVersion++;
  if (isSharedView) return;
  pendingShareUrl = null;
  if (shareUploading) return;
  if (shareCopyIcon && shareCopyIcon.parentNode === shareLinkBtn) shareCopyIcon.remove();
  shareLinkBtn.classList.remove('share-copy');
  shareLinkLabel.setAttribute('data-i18n', 'btn_share_link');
  shareLinkLabel.textContent = shareText('btn_share_link', 'Share Link Preview', 'Bagikan Link');
  shareLinkBtn.disabled = false;
}

function translateSharedError(raw) {
  var s = String(raw || '');
  if (s === 'Booklet tidak ditemukan') return shareText('error_shared_booklet_not_found', 'Booklet not found', 'Booklet tidak ditemukan');
  if (s === 'ID tidak ditemukan') return shareText('error_shared_id_not_found', 'ID not found', 'ID tidak ditemukan');
  if (s === 'File PDF hilang') return shareText('error_shared_pdf_missing', 'PDF file is missing', 'File PDF hilang');
  if (s.indexOf('Link sudah kedaluwarsa') === 0) return shareText('error_shared_expired', 'Link has expired (valid for 3 hours)', 'Link sudah kedaluwarsa (berlaku 3 jam)');
  return s;
}

function renderShareCopyButton(labelText) {
  if (!shareCopyIcon) {
    const ns = 'http://www.w3.org/2000/svg';
    shareCopyIcon = document.createElementNS(ns, 'svg');
    shareCopyIcon.setAttribute('width', '13');
    shareCopyIcon.setAttribute('height', '13');
    shareCopyIcon.setAttribute('viewBox', '0 0 24 24');
    shareCopyIcon.setAttribute('fill', 'none');
    shareCopyIcon.setAttribute('stroke', 'currentColor');
    shareCopyIcon.setAttribute('stroke-width', '2');
    shareCopyIcon.setAttribute('stroke-linecap', 'round');
    shareCopyIcon.setAttribute('stroke-linejoin', 'round');
    const p1 = document.createElementNS(ns, 'path');
    p1.setAttribute('d', 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71');
    const p2 = document.createElementNS(ns, 'path');
    p2.setAttribute('d', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71');
    shareCopyIcon.appendChild(p1);
    shareCopyIcon.appendChild(p2);
  }
  if (shareCopyIcon.parentNode !== shareLinkBtn) shareLinkBtn.insertBefore(shareCopyIcon, shareLinkLabel);
  shareLinkBtn.classList.add('share-copy');
  shareLinkLabel.removeAttribute('data-i18n');
  shareLinkLabel.textContent = labelText || shareText('btn_copy_link', 'Copy Link', 'Salin Link');
}

function updateSharedStatusUI() {
  if (pendingShareUrl && !isSharedView && !shareLinkBtn.disabled) {
    renderShareCopyButton();
  }
  if (sharedLoadState === 'done' || sharedLoadState === 'error') {
    const renderMsgEl = document.getElementById('shared-render-msg');
    if (renderMsgEl) renderMsgEl.textContent = '';
  }
  if (sharedLoadingMsg && (sharedLoadState === 'loading' || sharedLoadState === 'error')) {
    if (sharedLoadState === 'error') {
      sharedLoadingMsg.textContent = shareText('error_load_shared_title', 'Failed to load the shared link:', 'Gagal memuat tautan yang dibagikan:');
      sharedLoadingMsg.appendChild(document.createElement('br'));
      sharedLoadingMsg.appendChild(document.createTextNode(translateSharedError(sharedLoadErrorRaw)));
      sharedLoadingMsg.classList.add('is-error');
    } else {
      sharedLoadingMsg.textContent = shareText('status_loading_preview', 'Loading Preview', 'Memuat Preview');
      sharedLoadingMsg.classList.remove('is-error');
    }
  }
  if (isSharedView) {
    shareLinkBtn.classList.add('share-info');
    shareLinkBtn.disabled = true;
    shareLinkLabel.removeAttribute('data-i18n');
    shareLinkLabel.textContent = shareText('info_preview_expire_3h', 'The Preview expire in 3 hours', 'Preview kedaluwarsa dalam 3 jam');
    if (sharedExpiresAt) {
      if (!shareExpireBubble) {
        shareExpireBubble = document.createElement('span');
        shareExpireBubble.className = 'share-expire-bubble';
      }
      shareExpireBubble.textContent = shareText('tooltip_preview_expire', 'Preview Booklet will expire in 3 hours ({{time}})', 'Preview Booklet akan kedaluwarsa dalam 3 jam ({{time}})').split('{{time}}').join(formatShareExpireTime(sharedExpiresAt));
      if (shareExpireBubble.parentNode !== shareLinkBtn) shareLinkBtn.appendChild(shareExpireBubble);
    }
  }
}

function formatShareExpireTime(ms) {
  const d = new Date(ms);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function shareText(key, en, id) {
  return t(key, __i18nLang === 'id' ? id : en);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e2) {
      return false;
    }
  }
}

async function copyPendingShareLink() {
  shareLinkBtn.disabled = true;
  const copied = await copyToClipboard(pendingShareUrl);
  if (copied) {
    renderShareCopyButton(shareText('status_link_copied', 'Link copied!', 'Link disalin!'));
    setTimeout(() => {
      shareLinkBtn.disabled = false;
      if (pendingShareUrl) renderShareCopyButton();
    }, 1800);
  } else {
    window.prompt(shareText('prompt_copy_link', 'Copy this link:', 'Salin link ini:'), pendingShareUrl);
    shareLinkBtn.disabled = false;
    renderShareCopyButton();
  }
}

async function generateShareLink() {
  if (isSharedView || !pageDataList.length || shareLinkBtn.disabled) return;

  if (pendingShareUrl) {
    await copyPendingShareLink();
    return;
  }

  shareLinkBtn.disabled = true;
  shareLinkLabel.textContent = shareText('status_sharing', 'Creating a Link\u2026', 'Membuat Link\u2026');

  let resultLabel = null;
  let uploaded = false;
  const versionAtStart = shareContentVersion;
  shareUploading = true;
  try {
    const pdfBytes = await buildBookletPdfBytes();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const tooLargeMsg = shareText('error_file_too_large', 'File is too large (max 100 MB)', 'File terlalu besar (maks 100 MB)');
    if (blob.size > 100 * 1024 * 1024) throw new Error(tooLargeMsg);

    let sizeValue = sizeSelect.value || 'a4';
    let orientationValue = (currentSpec && currentSpec.orientation) ? currentSpec.orientation : '';
    if (sizeValue === 'custom' && currentSpec) {
      sizeValue = `custom:${currentSpec.wcm}x${currentSpec.hcm}`;
    }

    // Raw body (di-stream server ke R2), metadata lewat query string
    const qs = new URLSearchParams({ size: sizeValue });
    if (orientationValue) qs.set('orientation', orientationValue);

    const res = await fetch('/api/upload?' + qs.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf' },
      body: blob
    });
    if (res.status === 413) throw new Error(tooLargeMsg);
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);

    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(data.id)}`;
    if (versionAtStart === shareContentVersion) {
      pendingShareUrl = shareUrl;
      uploaded = true;
      shareLinkBtn.disabled = false;
      renderShareCopyButton();
    }
  } catch (err) {
    console.error(err);
    resultLabel = shareText('status_share_failed', 'Failed to share', 'Gagal membagikan');
    alert(`${shareText('error_share_failed', 'Failed to create share link:', 'Gagal membuat link share:')} ${err.message}`);
  } finally {
    shareUploading = false;
    if (!uploaded) {
      shareLinkLabel.textContent = resultLabel || shareText('btn_share_link', 'Share Link', 'Bagikan Link');
      setTimeout(() => {
        shareLinkLabel.textContent = shareText('btn_share_link', 'Share Link', 'Bagikan Link');
        shareLinkBtn.disabled = false;
      }, 1800);
    }
  }
}

shareLinkBtn.addEventListener('click', generateShareLink);

async function applySharedSpec(metaSize, metaOrientation) {
  let size = (metaSize || '').toLowerCase();
  let customW = null, customH = null;

  const m = size.match(/^custom:([\d.]+)x([\d.]+)$/);
  if (m) { size = 'custom'; customW = m[1]; customH = m[2]; }
  if (size !== 'a4' && size !== 'a5' && size !== 'custom') size = 'a4';

  sizeSelect.value = size;
  syncSizeDropdownUI();
  sizeSelect.dispatchEvent(new Event('change', { bubbles: true }));

  if (size === 'custom') {
    customWidthInput.value = customW;
    customHeightInput.value = customH;
  } else {
    let orientation = (metaOrientation === 'landscape' || metaOrientation === 'portrait') ? metaOrientation : null;
    if (!orientation) {
      const vp = (await pdfDoc.getPage(1)).getViewport({ scale: 1 });
      orientation = vp.width > vp.height ? 'landscape' : 'portrait';
    }
    const radio = document.querySelector(`input[name="orientation"][value="${orientation}"]`);
    if (radio) radio.checked = true;
  }
  validate();
}

async function loadSharedBooklet() {
  const bookletId = new URLSearchParams(window.location.search).get('id');
  if (!bookletId) return;

  sharedLoadState = 'loading';
  updateSharedStatusUI();
  previewBtn.disabled = true;
  setHint(shareText('status_loading_shared', 'Loading booklet from link\u2026', 'Memuat booklet dari link\u2026'), 'default');

  try {
    const response = await fetch(`/api/booklet?id=${encodeURIComponent(bookletId)}`);
    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try { const j = await response.json(); if (j && j.error) msg = j.error; } catch (e) {}
      throw new Error(msg);
    }

    const metaSize = response.headers.get('X-Booklet-Size');
    const metaOrientation = response.headers.get('X-Booklet-Orientation');
    const metaExpires = Number(response.headers.get('X-Booklet-Expires'));
    sharedExpiresAt = metaExpires > 0 ? metaExpires : null;

    const blob = await response.blob();
    const file = new File([blob], 'shared-booklet.pdf', { type: 'application/pdf' });

    await handlePdfFile(file, 'single');
    if (!pdfDoc) throw new Error(shareText('error_failed_read_pdf', 'Failed to read the PDF', 'Gagal membaca PDF'));

    await applySharedSpec(metaSize, metaOrientation);
    await generatePreview();

    if (previewView.classList.contains('hidden')) {
      throw new Error(previewHint.textContent || 'Preview failed');
    }

    sharedLoadState = 'done';
    isSharedView = true;
    updateSharedStatusUI();
  } catch (err) {
    console.error(err);
    const msg = `${shareText('error_load_shared_title', 'Failed to load the shared link:', 'Gagal memuat tautan yang dibagikan:')} ${translateSharedError(err.message)}`;
    setHint(msg, 'error');
    sharedLoadState = 'error';
    sharedLoadErrorRaw = err.message;
    updateSharedStatusUI();
  }
}

loadSharedBooklet();
