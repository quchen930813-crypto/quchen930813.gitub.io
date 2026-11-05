// 个人主页的少量交互：导航、年份、头像兜底、滚动淡入
document.addEventListener('DOMContentLoaded', function () {
  // 页脚年份
  var year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // 移动端导航
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    var closeNav = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '打开导航菜单');
    };

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '打开导航菜单');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeNav();
      }
    });

    // 回到桌面尺寸时复位菜单
    window.matchMedia('(min-width: 761px)').addEventListener('change', function (event) {
      if (event.matches) {
        closeNav();
      }
    });
  }

  // 头像缺失时显示文字占位，避免出现破图
  var avatar = document.getElementById('avatar');
  var fallback = document.querySelector('.portrait__fallback');

  if (avatar && fallback) {
    var showFallback = function () {
      avatar.hidden = true;
      fallback.hidden = false;
    };

    if (avatar.complete && avatar.naturalWidth === 0) {
      showFallback();
    }
    avatar.addEventListener('error', showFallback);
  }

  // 滚动进入视口时淡入
  var revealItems = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  revealItems.forEach(function (item) {
    observer.observe(item);
  });
});

// 作品详情弹窗
document.addEventListener('DOMContentLoaded', function () {
  var works = {
    notes: {
      index: '01',
      category: '学习笔记',
      title: '高等数学学习笔记',
      desc: '整理数学知识、公式和解题思路。',
      images: [{ src: 'images/study-notes.jpg', alt: '高等数学学习笔记' }]
    },
    nature: {
      index: '02',
      category: '摄影作品',
      title: '自然与风景',
      desc: '记录旅途中的风景与自然光影。',
      images: [
        { src: 'images/nature1.jpg', alt: '自然与风景照片一' },
        { src: 'images/nature2.jpg', alt: '自然与风景照片二' }
      ]
    },
    daily: {
      index: '03',
      category: '摄影作品',
      title: '日常生活片段',
      desc: '收藏日常生活中值得记录的瞬间。',
      images: [{ src: 'images/daily.jpg', alt: '日常生活片段' }]
    }
  };

  var dialog = document.getElementById('work-dialog');
  var media = document.getElementById('work-dialog-media');
  var indexEl = document.getElementById('work-dialog-index');
  var categoryEl = document.getElementById('work-dialog-category');
  var titleEl = document.getElementById('work-dialog-title');
  var descEl = document.getElementById('work-dialog-desc');
  var closeButton = dialog ? dialog.querySelector('.work-modal__close') : null;
  var lastTrigger = null;

  if (!dialog || !media) {
    return;
  }

  // 图片加载失败时换成占位背景，避免出现破图图标
  function markMissing(img) {
    img.hidden = true;
    var frame = img.closest('.media-frame');
    if (frame) {
      frame.classList.add('is-missing');
    }
  }

  function watchImage(img) {
    img.addEventListener('error', function () {
      markMissing(img);
    });
    if (img.complete && img.naturalWidth === 0) {
      markMissing(img);
    }
  }

  document.querySelectorAll('.work-card__media img').forEach(watchImage);

  function openWork(key, trigger) {
    var work = works[key];
    if (!work) {
      return;
    }

    media.innerHTML = '';
    work.images.forEach(function (image) {
      var frame = document.createElement('figure');
      frame.className = 'work-modal__frame media-frame';

      var img = document.createElement('img');
      img.src = image.src;
      img.alt = image.alt;

      frame.appendChild(img);
      media.appendChild(frame);
      watchImage(img);
    });

    media.classList.toggle('work-modal__media--pair', work.images.length > 1);

    indexEl.textContent = work.index;
    categoryEl.textContent = work.category;
    titleEl.textContent = work.title;
    descEl.textContent = work.desc;

    lastTrigger = trigger;

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeWork() {
    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('[data-work]').forEach(function (card) {
    card.addEventListener('click', function () {
      openWork(card.getAttribute('data-work'), card);
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeWork);
  }

  // 点击弹窗外部（遮罩）关闭
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) {
      closeWork();
    }
  });

  // 关闭后恢复页面滚动与焦点
  dialog.addEventListener('close', function () {
    document.body.style.overflow = '';
    if (lastTrigger) {
      lastTrigger.focus();
    }
  });
});
