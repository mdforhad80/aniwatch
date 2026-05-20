// ============================================
// SCHEDULE PAGE - AnimeVault
// ============================================

import { initAuth, updateUserUI } from './auth.js';
import { initSearch } from './search.js';
import { fetchSchedule } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    initAuth();
    initSearch();
    initNavbar();
    initMobileNav();
    initScheduleTabs();

    // Load today's schedule by default
    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
    await loadSchedule(today);

    // Hide loader
    const loader = document.getElementById('loading-screen');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
    }
});

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

function initMobileNav() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
}

function initScheduleTabs() {
    const tabs = document.querySelectorAll('.schedule-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const day = tab.dataset.day;
            await loadSchedule(day);
        });
    });
}

async function loadSchedule(day) {
    const grid = document.getElementById('schedule-grid');
    const emptyState = document.getElementById('empty-schedule');

    if (!grid) return;

    grid.innerHTML = '<div class="loading-more" style="grid-column:1/-1;padding:3rem"><div class="loader-spinner"></div><p>Loading schedule...</p></div>';
    if (emptyState) emptyState.classList.add('hidden');

    try {
        const schedule = await fetchSchedule(day === 'all' ? '' : day);

        if (!schedule || schedule.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        grid.innerHTML = schedule.map(item => createScheduleCard(item)).join('');

        // Add click handlers
        grid.querySelectorAll('.schedule-item').forEach((card, index) => {
            card.addEventListener('click', () => {
                window.location.href = `anime.html?id=${schedule[index].mal_id}`;
            });
        });

    } catch (error) {
        console.error('Error loading schedule:', error);
        grid.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
    }
}

function createScheduleCard(item) {
    const image = item.images?.jpg?.image_url || '';
    const title = item.title_english || item.title;
    const time = item.broadcast?.time || 'TBA';
    const day = item.broadcast?.day || 'Unknown';

    return `
        <div class="schedule-item">
            <img src="${image}" alt="${title}" loading="lazy">
            <div class="schedule-item-info">
                <h4>${title}</h4>
                <p class="schedule-time"><i class="fas fa-clock"></i> ${time}</p>
                <p><i class="fas fa-calendar"></i> ${day}</p>
                <p><i class="fas fa-tv"></i> ${item.type || 'TV'}</p>
            </div>
        </div>
    `;
}
