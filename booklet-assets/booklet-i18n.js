(function () {
  "use strict";

  var LANG_STORAGE_KEY = 'anamaruchi_booklet_previewer_lang';
  var DEFAULT_LANG = 'en';

  var langSwitcher = document.getElementById('langSwitcher');

  function getSavedLang() {
    try {
      var saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'id') return saved;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  function saveLang(lang) {
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) {}
  }

  function applyTranslations(lang) {
    if (!__i18nDict || !__i18nDict[lang]) return;
    var dict = __i18nDict[lang];
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var key = node.getAttribute('data-i18n');
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        node.textContent = dict[key];
      }
    }
    if (typeof refreshDynamicI18nText === 'function') refreshDynamicI18nText();
  }

  function setLanguage(lang) {
    __i18nLang = (lang === 'id') ? 'id' : 'en';
    if (langSwitcher) langSwitcher.checked = (__i18nLang === 'id');
    applyTranslations(__i18nLang);
    saveLang(__i18nLang);
  }

  function initI18n() {
    __i18nLang = getSavedLang();
    if (langSwitcher) langSwitcher.checked = (__i18nLang === 'id');

    try {
      fetch('booklet-3d-previewer-lang.json')
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to load lang.json (status ' + res.status + ')');
          return res.json();
        })
        .then(function (data) {
          __i18nDict = data;
          applyTranslations(__i18nLang);
        })
        .catch(function (err) {
          console.warn('i18n: lang.json could not be loaded.', err);
        });
    } catch (err) {
      console.warn('i18n: fetch is not available in this browser.', err);
    }
  }

  if (langSwitcher) {
    langSwitcher.addEventListener('change', function () {
      setLanguage(langSwitcher.checked ? 'id' : 'en');
    });
  }

  initI18n();
})();
