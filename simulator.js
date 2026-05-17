// --- PAGE NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active-link'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById(pageId.replace('page-', 'nav-')).classList.add('active-link');
    window.scrollTo(0, 0);
}

// --- ACCORDION LOGIC ---
const accordions = document.querySelectorAll(".accordion");
accordions.forEach(acc => {
    acc.addEventListener("click", function () {
        // Close all other accordions when one is opened
        accordions.forEach(otherAcc => {
            if (otherAcc !== this && otherAcc.classList.contains("active")) {
                otherAcc.classList.remove("active");
                otherAcc.nextElementSibling.style.maxHeight = null;
                otherAcc.nextElementSibling.classList.remove("show");
            }
        });

        // Toggle current accordion
        this.classList.toggle("active");
        const panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
            panel.classList.remove("show");
        } else {
            panel.classList.add("show");
            panel.style.maxHeight = panel.scrollHeight + 50 + "px"; // Account for extra padding
        }
    });
});

// --- TERMINAL LOGIC ---
let disk = Array(100).fill('.');
let meta = {};

function printLog(text) {
    const screen = document.getElementById('term-out');
    if (screen) {
        screen.innerHTML += '\n' + text;
        screen.scrollTop = screen.scrollHeight;
    }
}

function getFree() {
    let free = [];
    for (let i = 0; i < 100; i++) if (disk[i] === '.') free.push(i);
    return free;
}

function drawMap() {
    let map = "\n========================================\n          CURRENT DISK MAP\n========================================\n";
    for (let i = 0; i < 100; i += 10) {
        let row = disk.slice(i, i + 10).join("  ");
        map += `Block ${i === 0 ? '00' : (i < 10 ? '0' + i : i)} | ${row}\n`;
    }
    map += "========================================\nLegend: '.'=Free | 'I'=Index | Letter=Data\n";
    printLog(map);
}

function executeCommand() {
    let method = document.getElementById('sim-method').value;
    let id = document.getElementById('sim-id').value.toUpperCase();
    let size = parseInt(document.getElementById('sim-size').value);

    if (!id || !id.match(/[A-Z]/)) return printLog("!! Error: Enter a single letter (A-Z).");
    if (meta[id]) return printLog("!! Error: File exists.");
    if (!size || size < 1) return printLog("!! Error: Enter valid size.");

    let success = false;
    let typeName = "";

    if (method === "1") {
        typeName = "Contiguous";
        let count = 0, start = -1;
        for (let i = 0; i < 100; i++) {
            if (disk[i] === '.') {
                if (count === 0) start = i;
                count++;
                if (count === size) {
                    let blocks = [];
                    for (let j = start; j < start + size; j++) { disk[j] = id; blocks.push(j); }
                    meta[id] = { type: "Contiguous", blocks: blocks };
                    success = true; break;
                }
            } else count = 0;
        }
    }
    else if (method === "2") {
        typeName = "Linked";
        let free = getFree();
        if (free.length >= size) {
            let blocks = [];
            for (let i = 0; i < size; i++) {
                let randIdx = free.splice(Math.floor(Math.random() * free.length), 1)[0];
                disk[randIdx] = id; blocks.push(randIdx);
            }
            meta[id] = { type: "Linked", blocks: blocks };
            success = true;
        }
    }
    else if (method === "3") {
        typeName = "Indexed";
        let free = getFree();
        if (free.length >= size + 1) {
            let blocks = [];
            for (let i = 0; i < size + 1; i++) {
                blocks.push(free.splice(Math.floor(Math.random() * free.length), 1)[0]);
            }
            let idxBlock = blocks.shift();
            disk[idxBlock] = "I";
            for (let b of blocks) disk[b] = id;
            meta[id] = { type: "Indexed", index: idxBlock, blocks: blocks };
            success = true;
        }
    }

    if (success) {
        printLog(`>> SUCCESS: File ${id} (${typeName}) allocated.`);
        drawMap();
    } else {
        printLog(`!! FAILED: Disk full or fragmented for ${typeName}.`);
    }
}

function formatDisk() {
    disk = Array(100).fill('.');
    meta = {};
    printLog(">> WARNING: SYSTEM FORMATTED. ALL DATA CLEARED.");
    drawMap();
}

function deleteFile() {
    let id = document.getElementById('sim-id').value.toUpperCase();
    if (!meta[id]) return printLog("!! Error: File not found.");

    for (let b of meta[id].blocks) disk[b] = '.';
    if (meta[id].type === "Indexed") disk[meta[id].index] = '.';

    delete meta[id];
    printLog(`>> SUCCESS: File ${id} deleted.`);
    drawMap();
}

// Initial draw map when the script loads
if (document.getElementById('term-out')) {
    drawMap();
}

// Lock intro animations after they finish playing
setTimeout(() => {
    const intro = document.querySelector('.intro-section');
    if (intro) {
        intro.classList.add('animation-finished');
    }
}, 8000);