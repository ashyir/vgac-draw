const colors = [
    "#1B4B93",
    "#040404",
    "#FBDB04",
    "#E4242B",
];

const schools = [
    "Australian National University",
    "University of Canberra",
    "Australian Catholic University",
    "Charles Sturt University",
    "Macquarie University",
    "The University of Newcastle",
    "The University of New South Wales",
    "The University of Sydney",
    "University of New England",
    "University of Technology Sydney",
    "University of Wollongong",
    "Western Sydney University",
    "Charles Darwin University",
    "Bond University",
    "Central Queensland University",
    "Griffith University",
    "James Cook University",
    "Queensland University of Technology",
    "Southern Cross University",
    "The University of Queensland",
    "University of Southern Queensland",
    "University of Sunshine Coast",
    "Carnegie Mellon University",
    "Flinders University",
    "The University of Adelaide",
    "Torrens University Australia",
    "University College London",
    "University of South Australia",
    "University of Tasmania",
    "Deakin University",
    "La Trobe University",
    "Monash University",
    "RMIT University",
    "Swinburne University of Technology",
    "University of Divinity",
    "University of Melbourne",
    "Federation University",
    "Victoria University",
    "Curtin University of Technology",
    "Edith Cowan University",
    "Murdoch University",
    "The University of Western Australia",
    "The University of Notre Dame Australia",
]

const sectors = [];

let colorPos = 0;
for (let school of schools) {
    let sector = {
        color: colors[colorPos],
        label: school
    };

    sectors.push(sector);

    colorPos += colorPos == colors.length - 1 ? -colorPos : 1;
}

const ctx = document.querySelector("#wheel").getContext`2d`;

const arc = 2 * Math.PI / sectors.length;
const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard.
const angVelMin = 0.002; // Below that number will be treated as a stop.
let angVelMax = 0; // Random ang.vel. to accelerate to.
let angVel = 0; // Current angular velocity.
let ang = 0; // Angle rotation in radians.
let isSpinning = false;
let isAccelerating = false;
let animFrame = null; // Engine's requestAnimationFrame.

let rad = 0;

// Generate random float in range min-max:
const rand = (m, M) => Math.random() * (M - m) + m;

// Get index of current sector.
const getIndex = () => Math.floor(sectors.length - ang / (2 * Math.PI * sectors.length)) % sectors.length;

// Draw sectors and prizes texts to canvas.
const drawSector = (sector, i) => {
    const ang = arc * i;
    ctx.save();

    // COLOR
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();

    // TEXT
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "8px sans-serif";
    ctx.fillText(sector.label, rad - 5, 2);

    //
    ctx.restore();
};

// CSS rotate CANVAS Element.
const rotate = () => ctx.canvas.style.transform = `rotate(${ang - Math.PI / 2}rad)`;

const frame = () => {
    if (!isSpinning) return;

    if (angVel >= angVelMax) isAccelerating = false;

    // Accelerate.
    if (isAccelerating) {
        angVel ||= angVelMin; // Initial velocity kick.
        angVel *= 1.06; // Accelerate.
    }

    // Decelerate
    else {
        isAccelerating = false;
        angVel *= friction; // Decelerate by friction.

        // SPIN END:
        if (angVel < angVelMin) {
            isSpinning = false;
            angVel = 0;
            cancelAnimationFrame(animFrame);

            const sector = sectors[getIndex()];

            $('#result').text(sector.label);
            $('#resultDialog').modal("show");
        }
    }

    ang += angVel; // Update angle.
    ang %= 2 * Math.PI;    // Normalize angle.
    rotate();      // CSS rotate!
};

const engine = () => {
    frame();
    animFrame = requestAnimationFrame(engine)
};

const start = () => {
    if (isSpinning) return;

    isSpinning = true;
    isAccelerating = true;
    angVelMax = rand(0.25, 0.40);
    engine(); // Start engine!
};

const resize = () => {
    let windowWidth = $(window).width();
    let windowHeight = $(window).height();
    let wheelSize = windowWidth > windowHeight ? windowHeight : windowWidth;

    wheelSize = wheelSize * 95 / 100;

    ctx.canvas.width = wheelSize;
    ctx.canvas.height = wheelSize;

    rad = wheelSize / 2;

    // INIT!
    sectors.forEach(drawSector);
    rotate(); // Initial rotation.
};

$(window).on("load", resize);
$(window).on("resize", resize);

$(document).on("click", "#spin", start);

$(document).on("click", "#btnClose", () => {
    $('#resultDialog').modal("hide");
});