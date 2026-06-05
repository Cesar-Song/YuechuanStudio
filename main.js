// ========== 波浪线交互效果（a-waves 自定义元素）==========
class AWaves extends HTMLElement {
    connectedCallback() {
        this.svg = this.querySelector('svg');
        this.mouse = { x: 0, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0 };
        this.lines = [];
        this.paths = [];
        this.bindEvents();
        this.setSize();
        this.setLines();
        requestAnimationFrame(this.tick.bind(this));
    }
    bindEvents() {
        window.addEventListener('resize', () => { this.setSize(); this.setLines(); });
        window.addEventListener('mousemove', (e) => { this.updateMousePosition(e.pageX, e.pageY); });
        this.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
    }
    setSize() {
        this.bounding = this.getBoundingClientRect();
        this.svg.style.width = this.bounding.width + 'px';
        this.svg.style.height = this.bounding.height + 'px';
    }
    setLines() {
        const { width, height } = this.bounding;
        this.lines = [];
        this.paths.forEach(p => p.remove());
        this.paths = [];
        const xGap = 10, yGap = 32;
        const oWidth = width + 200, oHeight = height + 30;
        const totalLines = Math.ceil(oWidth / xGap);
        const totalPoints = Math.ceil(oHeight / yGap);
        const xStart = (width - xGap * totalLines) / 2;
        const yStart = (height - yGap * totalPoints) / 2;
        for (let i = 0; i <= totalLines; i++) {
            const points = [];
            for (let j = 0; j <= totalPoints; j++) {
                points.push({ x: xStart + xGap * i, y: yStart + yGap * j, cursor: { x: 0, y: 0, vx: 0, vy: 0 } });
            }
            this.lines.push(points);
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.svg.appendChild(path);
            this.paths.push(path);
        }
    }
    updateMousePosition(x, y) {
        this.mouse.x = x - this.bounding.left;
        this.mouse.y = y - this.bounding.top + window.scrollY;
    }
    movePoints() {
        const { lines, mouse } = this;
        lines.forEach(points => {
            points.forEach(p => {
                const dx = p.x - mouse.sx;
                const dy = p.y - mouse.sy;
                const d = Math.hypot(dx, dy);
                const l = Math.max(175, mouse.vs);
                if (d < l) {
                    const f = 1 - d / l;
                    p.cursor.vx += Math.cos(mouse.a) * f * mouse.vs * 0.08;
                    p.cursor.vy += Math.sin(mouse.a) * f * mouse.vs * 0.08;
                }
                p.cursor.vx += (0 - p.cursor.x) * 0.005;
                p.cursor.vy += (0 - p.cursor.y) * 0.005;
                p.cursor.vx *= 0.925;
                p.cursor.vy *= 0.925;
                p.cursor.x += p.cursor.vx * 2;
                p.cursor.y += p.cursor.vy * 2;
                p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x));
                p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y));
            });
        });
    }
    moved(point, withCursorForce) {
        return {
            x: Math.round((point.x + (withCursorForce ? point.cursor.x : 0)) * 10) / 10,
            y: Math.round((point.y + (withCursorForce ? point.cursor.y : 0)) * 10) / 10
        };
    }
    drawLines() {
        this.lines.forEach((points, lIndex) => {
            let p1 = this.moved(points[0], false);
            let d = 'M ' + p1.x + ' ' + p1.y;
            points.forEach((p, pIndex) => {
                const isLast = pIndex === points.length - 1;
                const pm = this.moved(p, !isLast);
                d += 'L ' + pm.x + ' ' + pm.y;
            });
            this.paths[lIndex].setAttribute('d', d);
        });
    }
    tick() {
        const { mouse } = this;
        mouse.sx += (mouse.x - mouse.sx) * 0.1;
        mouse.sy += (mouse.y - mouse.sy) * 0.1;
        const dx = mouse.x - mouse.lx;
        const dy = mouse.y - mouse.ly;
        const d = Math.hypot(dx, dy);
        mouse.v = d;
        mouse.vs += (d - mouse.vs) * 0.1;
        mouse.vs = Math.min(100, mouse.vs);
        mouse.lx = mouse.x;
        mouse.ly = mouse.y;
        mouse.a = Math.atan2(dy, dx);
        this.movePoints();
        this.drawLines();
        requestAnimationFrame(this.tick.bind(this));
    }
}
customElements.define('a-waves', AWaves);

// ========== 导航栏滚动效果 ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ========== 汉堡菜单 ==========
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ========== Hero粒子动画 ==========
const particlesContainer = document.getElementById('heroParticles');
if (particlesContainer) {
    for (let i = 0; i < 35; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 3 + 1.5;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = Math.random() * 8 + 6 + 's';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.opacity = Math.random() * 0.6 + 0.1;
        particlesContainer.appendChild(particle);
    }
}


// ========== 模态框逻辑 ==========
const modal = document.getElementById('previewModal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const fullscreenBtn = document.getElementById('fullscreenBtn');
let currentPPTImages = [];
let currentPPTIndex = 0;
let currentVideoElement = null;

function closeModal() {
    modal.classList.remove('active');
    if (currentVideoElement) {
        currentVideoElement.pause();
        currentVideoElement.currentTime = 0;
        currentVideoElement = null;
    }
    modalContent.innerHTML = '';
    fullscreenBtn.style.display = 'none';
    const existingNav = document.querySelectorAll('.ppt-nav');
    existingNav.forEach(n => n.remove());
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

fullscreenBtn.addEventListener('click', () => {
    const video = modalContent.querySelector('video');
    if (video) {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    }
});

function showPPTImages(imagesArray) {
    currentPPTImages = imagesArray;
    currentPPTIndex = 0;
    renderMediaItem();
    if (imagesArray.length > 1) {
        var oldNav = modalContent.querySelectorAll('.ppt-nav');
        oldNav.forEach(function(b) { b.remove(); });
        const prevBtn = document.createElement('button');
        prevBtn.classList.add('ppt-nav', 'prev');
        prevBtn.innerHTML = '‹';
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentPPTIndex > 0) {
                currentPPTIndex--;
                renderMediaItem();
            }
        });
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('ppt-nav', 'next');
        nextBtn.innerHTML = '›';
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentPPTIndex < currentPPTImages.length - 1) {
                currentPPTIndex++;
                renderMediaItem();
            }
        });
        modalContent.appendChild(prevBtn);
        modalContent.appendChild(nextBtn);
    }
}

function isVideoFile(path) {
    return /\.(mp4|webm|mov|avi|mkv)$/i.test(path);
}

function renderMediaItem() {
    var existingMedia = modalContent.querySelector('img, video');
    if (existingMedia) existingMedia.remove();

    var src = currentPPTImages[currentPPTIndex];
    if (isVideoFile(src)) {
        fullscreenBtn.style.display = 'block';
        var video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        video.src = src;
        video.style.maxWidth = '90vw';
        video.style.maxHeight = '85vh';
        modalContent.insertBefore(video, modalContent.firstChild);
        currentVideoElement = video;
    } else {
        fullscreenBtn.style.display = 'none';
        var img = document.createElement('img');
        img.src = src;
        img.alt = '预览 第' + (currentPPTIndex + 1) + '项';
        modalContent.insertBefore(img, modalContent.firstChild);
    }
}

function showVideo(videoUrl) {
    fullscreenBtn.style.display = 'block';
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.src = videoUrl;
    video.style.maxWidth = '90vw';
    video.style.maxHeight = '85vh';
    modalContent.appendChild(video);
    currentVideoElement = video;
}

document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', function(e) {
        const type = this.dataset.type;
        if (type === 'ppt') {
            const imagesStr = this.dataset.images;
            if (imagesStr) {
                const images = imagesStr.split(',').map(s => s.trim());
                modalContent.innerHTML = '';
                showPPTImages(images);
                modal.classList.add('active');
            }
        } else if (type === 'aigc') {
            var cardVideo = this.querySelector('video');
            if (cardVideo) cardVideo.pause();
            const imagesStr = this.dataset.images;
            const videoUrl = this.dataset.video;
            modalContent.innerHTML = '';
            var mediaItems = [];
            if (videoUrl) {
                mediaItems.push(videoUrl.trim());
            }
            if (imagesStr) {
                var images = imagesStr.split(',').map(function(s) { return s.trim(); });
                images = images.filter(function(s) { return s.length > 0; });
                mediaItems = mediaItems.concat(images);
            }
            if (mediaItems.length > 0) {
                showPPTImages(mediaItems);
                modal.classList.add('active');
            }
        } else if (type === 'video') {
            const videoUrl = this.dataset.video;
            if (videoUrl) {
                modalContent.innerHTML = '';
                showVideo(videoUrl);
                modal.classList.add('active');
            }
        }
    });

    // 移动端触摸显示 overlay
    card.addEventListener('touchstart', function() {
        document.querySelectorAll('.work-card.touch-active').forEach(c => c.classList.remove('touch-active'));
        this.classList.add('touch-active');
    }, { passive: true });
});

// 点击空白区域移除卡片 overlay
document.addEventListener('touchstart', function(e) {
    if (!e.target.closest('.work-card')) {
        document.querySelectorAll('.work-card.touch-active').forEach(function(c) {
            c.classList.remove('touch-active');
            var v = c.querySelector('video');
            if (v) v.pause();
        });
    }
}, { passive: true });

// ========== 模态框触摸滑动切换 PPT ==========
let touchStartX = 0;
let touchEndX = 0;

modal.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

modal.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    const threshold = 60;
    if (Math.abs(diff) < threshold) return;
    if (currentPPTImages.length <= 1) return;
    if (diff > 0 && currentPPTIndex < currentPPTImages.length - 1) {
        currentPPTIndex++;
        renderMediaItem();
    } else if (diff < 0 && currentPPTIndex > 0) {
        currentPPTIndex--;
        renderMediaItem();
    }
}

// ========== 点击导航链接外部区域关闭菜单（移动端）==========
document.addEventListener('click', function(e) {
    if (navLinks.classList.contains('active') && !e.target.closest('.nav-links') && !e.target.closest('.hamburger')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

// ========== AIGC 卡片 hover 自动播放视频 ==========
(function initAigcCardHover() {
    var aigcCards = document.querySelectorAll('.aigc-card');
    aigcCards.forEach(function(card) {
        var video = card.querySelector('video');
        if (!video) return;
        card.addEventListener('mouseenter', function() {
            video.currentTime = 0;
            video.play().catch(function() {});
        });
        card.addEventListener('mouseleave', function() {
            video.pause();
        });
        card.addEventListener('touchstart', function() {
            video.currentTime = 0;
            video.play().catch(function() {});
        }, { passive: true });
    });
})();

// ========== Hero 3D文字 - 鼠标跟随倾斜 + 鱼眼效果 ==========
(function initHero3DEffect() {
    const heroContent = document.querySelector('.hero-content');
    const heroSection = document.querySelector('.hero');
    if (!heroContent || !heroSection) return;

    // 将文字拆分为单个字符的span
    function splitTextToChars(element) {
        const text = element.textContent;
        element.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.classList.add('text3d-char');
            if (text[i] === ' ') {
                span.innerHTML = '&nbsp;';
            } else {
                span.textContent = text[i];
            }
            element.appendChild(span);
        }
    }

    // 对h1和副标题进行文字拆分
    const h1 = heroContent.querySelector('h1');
    const subtitle = heroContent.querySelector('.hero-subtitle');
    if (h1) {
        const accentSpan = h1.querySelector('.accent');
        if (accentSpan) {
            const nodes = Array.from(h1.childNodes);
            h1.innerHTML = '';
            // 用一个nowrap行内容器包裹YUECHUAN.STUDIO的所有字符，防止换行
            const lineWrap = document.createElement('span');
            lineWrap.style.whiteSpace = 'nowrap';
            let addedToWrap = false;
            nodes.forEach(node => {
                if (node === accentSpan) {
                    const accentText = accentSpan.textContent;
                    accentSpan.innerHTML = '';
                    for (let i = 0; i < accentText.length; i++) {
                        const span = document.createElement('span');
                        span.classList.add('text3d-char');
                        span.textContent = accentText[i] === ' ' ? '\u00A0' : accentText[i];
                        accentSpan.appendChild(span);
                    }
                    h1.appendChild(accentSpan);
                } else if (node.nodeType === 1 && node.tagName === 'BR') {
                    // 遇到<br>，先把已收集的字符wrap放入h1，再加<br>
                    if (addedToWrap) {
                        h1.appendChild(lineWrap);
                    }
                    h1.appendChild(document.createElement('br'));
                    addedToWrap = false;
                } else if (node.nodeType === 3) {
                    const text = node.textContent;
                    for (let i = 0; i < text.length; i++) {
                        const span = document.createElement('span');
                        span.classList.add('text3d-char');
                        if (text[i] === '\n') {
                            if (addedToWrap) {
                                h1.appendChild(lineWrap);
                            }
                            h1.appendChild(document.createElement('br'));
                            addedToWrap = false;
                        } else if (text[i] === ' ') {
                            span.innerHTML = '&nbsp;';
                            lineWrap.appendChild(span);
                            addedToWrap = true;
                        } else {
                            span.textContent = text[i];
                            lineWrap.appendChild(span);
                            addedToWrap = true;
                        }
                    }
                }
            });
            // 把剩余的wrap内容加入
            if (addedToWrap) {
                h1.appendChild(lineWrap);
            }
        }
    }
    if (subtitle) {
        splitTextToChars(subtitle);
    }

    // 鼠标跟随倾斜效果
    let tiltX = 0, tiltY = 0;
    let currentTiltX = 0, currentTiltY = 0;
    const maxTilt = 5; // 最大倾斜角度，保持微妙

    heroSection.addEventListener('mousemove', function(e) {
        const rect = heroSection.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const ratioX = (e.clientX - centerX) / (rect.width / 2);
        const ratioY = (e.clientY - centerY) / (rect.height / 2);
        tiltX = -ratioY * maxTilt;
        tiltY = ratioX * maxTilt;
    });

    heroSection.addEventListener('mouseleave', function() {
        tiltX = 0;
        tiltY = 0;
    });

    // 平滑动画帧
    function animateTilt() {
        currentTiltX += (tiltX - currentTiltX) * 0.1;
        currentTiltY += (tiltY - currentTiltY) * 0.1;
        heroContent.style.transform = 'perspective(1000px) rotateX(' + currentTiltX.toFixed(2) + 'deg) rotateY(' + currentTiltY.toFixed(2) + 'deg)';
        requestAnimationFrame(animateTilt);
    }
    animateTilt();

    // 鱼眼放大效果 - 鼠标悬停在字符上
    const allChars = heroContent.querySelectorAll('.text3d-char');
    allChars.forEach(function(char) {
        char.addEventListener('mouseenter', function() {
            this.classList.add('fisheye');
            const prev = this.previousElementSibling;
            const next = this.nextElementSibling;
            if (prev && prev.classList.contains('text3d-char')) {
                prev.style.transform = 'scale(1.06)';
            }
            if (next && next.classList.contains('text3d-char')) {
                next.style.transform = 'scale(1.06)';
            }
            const prev2 = prev ? prev.previousElementSibling : null;
            const next2 = next ? next.nextElementSibling : null;
            if (prev2 && prev2.classList.contains('text3d-char')) {
                prev2.style.transform = 'scale(1.02)';
            }
            if (next2 && next2.classList.contains('text3d-char')) {
                next2.style.transform = 'scale(1.02)';
            }
        });
        char.addEventListener('mouseleave', function() {
            this.classList.remove('fisheye');
            const prev = this.previousElementSibling;
            const next = this.nextElementSibling;
            if (prev && prev.classList.contains('text3d-char')) {
                prev.style.transform = '';
            }
            if (next && next.classList.contains('text3d-char')) {
                next.style.transform = '';
            }
            const prev2 = prev ? prev.previousElementSibling : null;
            const next2 = next ? next.nextElementSibling : null;
            if (prev2 && prev2.classList.contains('text3d-char')) {
                prev2.style.transform = '';
            }
            if (next2 && next2.classList.contains('text3d-char')) {
                next2.style.transform = '';
            }
        });
    });
})();

// ========== 滚动淡入动画（单个元素）==========
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.work-card, .social-card, .about-content, .skill-tag').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
});

// ========== 区域淡入动画（整个section）==========
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.fade-section').forEach(el => {
    sectionObserver.observe(el);
});

// ========== 简历下载（强制保存为文件，避免浏览器内嵌打开 PDF）==========
(function initCvDownload() {
    const btn = document.getElementById('btnDownloadCv');
    if (!btn) return;

    const cvPath = 'cans/简历.pdf';
    const fileName = '跃川工作室_简历.pdf';

    function saveBlob(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    btn.addEventListener('click', function(e) {
        const encodedUrl = encodeURI(cvPath);

        // 直接双击 HTML 打开时无法用 fetch，走原生链接下载/打开
        if (location.protocol === 'file:') {
            return;
        }

        e.preventDefault();

        // 显示下载中状态
        const originalText = btn.textContent;
        btn.textContent = '下载中…';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.6';

        fetch(encodedUrl)
            .then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.blob();
            })
            .then(function(blob) {
                saveBlob(new Blob([blob], { type: 'application/octet-stream' }));
                btn.textContent = '✓ 下载成功';
                btn.style.opacity = '1';
                setTimeout(function() {
                    btn.textContent = originalText;
                    btn.style.pointerEvents = '';
                }, 2000);
            })
            .catch(function() {
                const a = document.createElement('a');
                a.href = encodedUrl;
                a.download = fileName;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                btn.textContent = originalText;
                btn.style.pointerEvents = '';
                btn.style.opacity = '1';
            });
    });
})();

// ========== 联系区域 LeonSans 背景文字（逐渐写入动画）==========
(function initContactLeonBg() {
    const canvas = document.getElementById('contactLeonCanvas');
    if (!canvas || typeof LeonSans === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const section = document.getElementById('contact');
    if (!section) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let sw = 0, sh = 0;
    let animating = false;
    let rafId = null;

    const leon = new LeonSans({
        text: 'YUECHUAN.STUDIO',
        color: ['#c9a87c'],
        size: 120,
        weight: 500,
        tracking: 3
    });

    // 写入动画状态
    let currentCharIndex = 0;   // 当前正在写入的字符索引
    let charProgress = 0;       // 当前字符写入进度 (0~1)
    const writeSpeed = 0.05;   // 每帧写入速度
    let writingComplete = false;
    let pauseTimer = 0;
    const pauseDuration = 75;  // 写完后停留帧数
    // 擦除动画状态
    let erasing = false;
    let eraseCharIndex = 0;
    let eraseProgress = 0;
    const eraseSpeed = 0.05;    // 每帧擦除速度

    function resize() {
        sw = section.clientWidth;
        sh = section.clientHeight;
        canvas.width = Math.ceil(sw * pixelRatio);
        canvas.height = Math.ceil(sh * pixelRatio);
        canvas.style.width = sw + 'px';
        canvas.style.height = sh + 'px';
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        leon.size = Math.min(Math.max(sw * 0.08, 40), 160);
        const maxW = sw * 0.95;
        if (leon.rect.w > maxW) {
            leon.size = leon.size * (maxW / leon.rect.w);
        }
    }

    resize();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    // 动画循环
    function animate() {
        if (!animating) return;
        ctx.clearRect(0, 0, sw, sh);
        const x = (sw - leon.rect.w) / 2;
        const y = (sh - leon.rect.h) / 2;
        leon.position(x, y);

        const totalChars = leon.drawing.length;

        if (!erasing) {
            // 写入阶段：逐字符逐渐写入
            if (currentCharIndex < totalChars) {
                charProgress += writeSpeed;
                if (charProgress >= 1) {
                    leon.drawing[currentCharIndex].value = 1;
                    currentCharIndex++;
                    charProgress = 0;
                } else {
                    leon.drawing[currentCharIndex].value = charProgress;
                }
            } else {
                writingComplete = true;
                pauseTimer++;
                if (pauseTimer >= pauseDuration) {
                    erasing = true;
                    eraseCharIndex = totalChars - 1;
                    eraseProgress = 0;
                    pauseTimer = 0;
                }
            }
        } else {
            // 擦除阶段：逐字符逐渐擦除（从后往前）
            if (eraseCharIndex >= 0) {
                eraseProgress += eraseSpeed;
                if (eraseProgress >= 1) {
                    leon.drawing[eraseCharIndex].value = 0;
                    eraseCharIndex--;
                    eraseProgress = 0;
                } else {
                    leon.drawing[eraseCharIndex].value = 1 - eraseProgress;
                }
            } else {
                // 擦除完毕，重新开始写入
                erasing = false;
                currentCharIndex = 0;
                charProgress = 0;
                writingComplete = false;
            }
        }

        leon.draw(ctx);
        rafId = requestAnimationFrame(animate);
    }

    function startAnim() {
        if (animating) return;
        animating = true;
        // 重置所有字符的绘制进度为 0
        leon.drawing.forEach(function(d) { d.value = 0; });
        currentCharIndex = 0;
        charProgress = 0;
        writingComplete = false;
        erasing = false;
        pauseTimer = 0;
        rafId = requestAnimationFrame(animate);
    }

    function stopAnim() {
        animating = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        ctx.clearRect(0, 0, sw, sh);
    }

    // 进入/离开视口时控制动画
    const contactObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAnim();
            } else {
                stopAnim();
            }
        });
    }, { threshold: 0.05 });
    contactObs.observe(section);
})();
