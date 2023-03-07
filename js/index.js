const menu = document.getElementById("menu");
const menuButton = document.getElementById("menuButton");
const menuNewList = document.getElementById("menuNewList");
const menuOZUniversities = document.getElementById("menuOZUniversities");

const spin = document.getElementById("spin");
const screen = document.getElementById("screen");
const wheel = document.getElementById("wheel").getContext`2d`;

const resultText = document.getElementById("resultText");
const resultClose = document.getElementById("resultClose");
const resultRemove = document.getElementById("resultRemove");
const resultDialog = document.getElementById("resultDialog");

const newListAdd = document.getElementById("newListAdd");
const newListClear = document.getElementById("newListClear");
const newListClose = document.getElementById("newListClose");
const newListInput = document.getElementById("newListInput");
const newListDialog = document.getElementById("newListDialog");

const doublePI = 2 * Math.PI;

let sectors = [];
let radian = 0;
let ang = 0;            // Angle rotation in radians.
let angVel = 0;         // Current angular velocity.
let angVelMax = 0;      // Random ang.vel. to accelerate to.
let animFrame = null;   // Engine's requestAnimationFrame.
let isSpinning = false;
let isAccelerating = false;

// Generate random float in range min-max.
const rand = (m, M) => Math.random() * (M - m) + m;

// Get index of current sector.
const getIndex = () => Math.floor(sectors.length - ang / doublePI * sectors.length) % sectors.length;

// CSS rotate CANVAS Element.
const rotate = () => wheel.canvas.style.transform = `rotate(${ang - Math.PI / 2}rad)`;

const preventClose = (e) => e.stopPropagation();

const centerElement = (element, width, height) => {
    element.style.left = `${(window.innerWidth - width) / 2}px`;
    element.style.top = `${(window.innerHeight - height) / 2}px`;
};

const toggleMenu = (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display == "none" ? "block" : "none";
};

const showNewListDialog = () => {
    screen.classList.add("opacity");
    newListDialog.style.display = "block";
    newListInput.focus();
};

const clearNewListInput = () => newListInput.value = "";
const closeNewListDialog = () => hideElement(newListDialog);

const showResult = () => {
    let sector = sectors[getIndex()];

    screen.classList.add("opacity");

    resultText.innerText = sector.label;
    resultDialog.style.display = "block";

    resizeResultDialog();
};

const hideResult = () => hideElement(resultDialog);

const hideElement = (element) => {
    if (element.style.display != "none") {
        element.style.display = "none";
        screen.classList.remove("opacity");
    }
};

const removeResult = () => {
    sectors.splice(getIndex(), 1);
    resizeWheel();
    hideResult();
};

const prepareSector = (list) => {
    let colorIndex = 0;

    sectors.length = 0;

    for (let item of list) {
        let sector = {
            color: colors[colorIndex],
            label: item,
        };

        sectors.push(sector);

        colorIndex += colorIndex == colors.length - 1 ? -colorIndex : 1;
    }
};

// Draw sectors and prizes texts to canvas.
const drawSector = (sector, i) => {
    const arc = doublePI / sectors.length;
    ang = arc * i;

    wheel.save();

    // COLOR
    wheel.beginPath();
    wheel.fillStyle = sector.color;
    wheel.moveTo(radian, radian);
    wheel.arc(radian, radian, radian, ang, ang + arc);
    wheel.lineTo(radian, radian);
    wheel.fill();

    // TEXT
    wheel.translate(radian, radian);
    wheel.rotate(ang + arc / 2);
    wheel.textAlign = "right";
    wheel.fillStyle = "#fff";
    wheel.font = "8px sans-serif";
    wheel.fillText(sector.label, radian - 5, 2);

    wheel.restore();
};

const frame = () => {
    const angVelMin = 0.002;    // Below that number will be treated as a stop.
    const friction = 0.991;     // 0.995=soft, 0.99=mid, 0.98=hard.

    if (!isSpinning) return;

    if (angVel >= angVelMax) isAccelerating = false;

    // Accelerate.
    if (isAccelerating) {
        angVel ||= angVelMin;   // Initial velocity kick.
        angVel *= 1.06;         // Accelerate.
    }

    // Decelerate
    else {
        isAccelerating = false;
        angVel *= friction;     // Decelerate by friction.

        // SPIN END:
        if (angVel < angVelMin) {
            isSpinning = false;
            angVel = 0;
            cancelAnimationFrame(animFrame);

            showResult();
        }
    }

    ang += angVel;              // Update angle.
    ang %= doublePI;            // Normalize angle.
    rotate();                   // CSS rotate!
};

const engine = () => {
    frame();
    animFrame = requestAnimationFrame(engine);
};

const start = () => {
    if (isSpinning) return;

    isSpinning = true;
    isAccelerating = true;

    angVelMax = rand(0.25, 0.40);

    engine(); // Start engine!
};

const resize = () => {
    resizeWheel();

    if (resultDialog.style.display == "block")
        resizeResultDialog();
};

const resizeResultDialog = () => {
    resultDialog.style.width = `${wheel.canvas.width * 85 / 100}px`;

    centerElement(resultDialog, resultDialog.offsetWidth, resultDialog.offsetHeight);
};

const resizeWheel = () => {
    let wheelSize = (window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth) * 95 / 100;

    screen.width = wheelSize;
    screen.height = wheelSize;

    wheel.canvas.width = wheelSize;
    wheel.canvas.height = wheelSize;

    centerElement(screen, wheelSize, wheelSize);

    radian = wheelSize / 2;

    // INIT!
    sectors.forEach(drawSector);
    rotate(); // Initial rotation.
};

const getSchoolList = () => {
    prepareSector(schools);
    resizeWheel();
};

const addNewList = () => {
    let input = newListInput.value;
    if (input != "") {
        let list = input.split(/[\n;,]/);
        prepareSector(list);
        resizeWheel();

        hideElement(newListDialog);
    }
};

const hideElements = (e) => {
    if (resultDialog.style.display == "block")
        hideResult();

    if (menu.style.display == "block")
        menu.style.display = "none";
};

window.addEventListener("resize", resize);
window.addEventListener("click", hideElements);
window.addEventListener("load", getSchoolList);
window.addEventListener("orientationchange", resize);

spin.addEventListener("click", start);
resultClose.addEventListener("click", hideResult);
resultRemove.addEventListener("click", removeResult);
resultDialog.addEventListener("click", preventClose);

menuButton.addEventListener("click", toggleMenu);
menuNewList.addEventListener("click", showNewListDialog);
menuOZUniversities.addEventListener("click", getSchoolList);

newListAdd.addEventListener("click", addNewList);
newListClear.addEventListener("click", clearNewListInput);
newListClose.addEventListener("click", closeNewListDialog);