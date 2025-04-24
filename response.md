Okay, here's a P5.js script that creates a dynamic periodic table.

You will need 3 files:

index.html: The webpage to host the sketch.

sketch.js: The P5.js code.

elements.json: A data file containing periodic table element information.

1. elements.json (Data File)

Create a file named elements.json in the same directory as your HTML file. Populate it with element data. Here's a sample structure with a few elements. You'll want to expand this significantly for a full table. You can find complete JSON datasets online or create your own.

number: Atomic Number

symbol: Element Symbol

name: Element Name

atomic_mass: Atomic Mass

category: Type of element (for coloring)

xpos, ypos: Grid position (1-based index) in the standard periodic table layout.

shells: An array representing electron counts per shell (for the Bohr model animation).

electron_configuration_semantic: Standard electron configuration string.

{
"elements": [
{
"name": "Hydrogen",
"symbol": "H",
"number": 1,
"atomic_mass": 1.008,
"category": "diatomic nonmetal",
"xpos": 1,
"ypos": 1,
"shells": [1],
"electron_configuration_semantic": "1s¹"
},
{
"name": "Helium",
"symbol": "He",
"number": 2,
"atomic_mass": 4.002602,
"category": "noble gas",
"xpos": 18,
"ypos": 1,
"shells": [2],
"electron_configuration_semantic": "1s²"
},
{
"name": "Lithium",
"symbol": "Li",
"number": 3,
"atomic_mass": 6.94,
"category": "alkali metal",
"xpos": 1,
"ypos": 2,
"shells": [2, 1],
"electron_configuration_semantic": "[He] 2s¹"
},
{
"name": "Beryllium",
"symbol": "Be",
"number": 4,
"atomic_mass": 9.0121831,
"category": "alkaline earth metal",
"xpos": 2,
"ypos": 2,
"shells": [2, 2],
"electron_configuration_semantic": "[He] 2s²"
},
{
"name": "Boron",
"symbol": "B",
"number": 5,
"atomic_mass": 10.81,
"category": "metalloid",
"xpos": 13,
"ypos": 2,
"shells": [2, 3],
"electron_configuration_semantic": "[He] 2s² 2p¹"
},
{
"name": "Carbon",
"symbol": "C",
"number": 6,
"atomic_mass": 12.011,
"category": "polyatomic nonmetal",
"xpos": 14,
"ypos": 2,
"shells": [2, 4],
"electron_configuration_semantic": "[He] 2s² 2p²"
},
{
"name": "Nitrogen",
"symbol": "N",
"number": 7,
"atomic_mass": 14.007,
"category": "diatomic nonmetal",
"xpos": 15,
"ypos": 2,
"shells": [2, 5],
"electron_configuration_semantic": "[He] 2s² 2p³"
},
{
"name": "Oxygen",
"symbol": "O",
"number": 8,
"atomic_mass": 15.999,
"category": "diatomic nonmetal",
"xpos": 16,
"ypos": 2,
"shells": [2, 6],
"electron_configuration_semantic": "[He] 2s² 2p⁴"
},
{
"name": "Fluorine",
"symbol": "F",
"number": 9,
"atomic_mass": 18.998403163,
"category": "diatomic nonmetal",
"xpos": 17,
"ypos": 2,
"shells": [2, 7],
"electron_configuration_semantic": "[He] 2s² 2p⁵"
},
{
"name": "Neon",
"symbol": "Ne",
"number": 10,
"atomic_mass": 20.1797,
"category": "noble gas",
"xpos": 18,
"ypos": 2,
"shells": [2, 8],
"electron_configuration_semantic": "[He] 2s² 2p⁶"
},
{
"name": "Sodium",
"symbol": "Na",
"number": 11,
"atomic_mass": 22.98976928,
"category": "alkali metal",
"xpos": 1,
"ypos": 3,
"shells": [2, 8, 1],
"electron_configuration_semantic": "[Ne] 3s¹"
},
{
"name": "Magnesium",
"symbol": "Mg",
"number": 12,
"atomic_mass": 24.305,
"category": "alkaline earth metal",
"xpos": 2,
"ypos": 3,
"shells": [2, 8, 2],
"electron_configuration_semantic": "[Ne] 3s²"
},
{
"name": "Argon",
"symbol": "Ar",
"number": 18,
"atomic_mass": 39.948,
"category": "noble gas",
"xpos": 18,
"ypos": 3,
"shells": [2, 8, 8],
"electron_configuration_semantic": "[Ne] 3s² 3p⁶"
}
// ... Add many more elements here following the same pattern
]
}

2. index.html (HTML Host Page)

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Periodic Table</title>
    <!-- Import p5.js library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>
    <!-- Optional: p5.dom.js if you need DOM manipulation, not strictly needed here -->
    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/addons/p5.dom.min.js"></script> -->
    <style>
        body { margin: 0; overflow: hidden; font-family: sans-serif;}
        canvas { display: block; } /* Prevent scroll bars */
    </style>
</head>
<body>
    <!-- The P5.js sketch will be loaded here -->
    <script src="sketch.js"></script>
</body>
</html>
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Html
IGNORE_WHEN_COPYING_END

3. sketch.js (P5.js Code)

let elementsData;
let hoveredElement = null;
let elements = []; // Array to hold Element objects

// --- Layout and Styling ---
const GRID_COLS = 18;
const GRID_ROWS = 7; // Main table rows (adjust if including Lanthanides/Actinides separately)
let cellSize = 50;
let marginX, marginY; // Calculated margins for centering

// --- Colors ---
let categoryColors;

// --- Animation ---
let atomCenterX, atomCenterY;
let atomRadius = 150;
let electronSize = 6;
let nucleusSize = 15;
let orbitColor;
let electronColor;
let nucleusColor;

// --- Info Box ---
let infoBoxX, infoBoxY, infoBoxW, infoBoxH;

// --- Preload ---
function preload() {
elementsData = loadJSON('elements.json');
}

// --- Setup ---
function setup() {
createCanvas(windowWidth, windowHeight);
textFont('sans-serif');

// Calculate cell size and margins based on window size
let tableWidth = GRID_COLS _ cellSize;
let tableHeight = GRID_ROWS _ cellSize;
// Try to fit based on width first
cellSize = floor(windowWidth _ 0.8 / GRID_COLS);
// If too tall, resize based on height
if (GRID_ROWS _ cellSize > windowHeight _ 0.7) {
cellSize = floor(windowHeight _ 0.7 / GRID_ROWS);
}
// Minimum cell size
cellSize = max(25, cellSize);

tableWidth = GRID_COLS _ cellSize;
tableHeight = GRID_ROWS _ cellSize;

marginX = (windowWidth - tableWidth) / 2;
marginY = 50; // Top margin for title/info

// Define element colors (expand this!)
categoryColors = {
"diatomic nonmetal": color(120, 220, 120, 200), // Light green
"noble gas": color(180, 160, 255, 200), // Light purple
"alkali metal": color(255, 150, 100, 200), // Orange
"alkaline earth metal": color(255, 220, 100, 200), // Yellow
"metalloid": color(100, 200, 200, 200), // Teal
"polyatomic nonmetal": color(140, 230, 140, 200), // Brighter green
"lanthanide": color(255, 180, 200, 200), // Pink
"actinide": color(230, 160, 220, 200), // Magenta
"transition metal": color(220, 180, 180, 200), // Light red/pink
"post-transition metal": color(180, 180, 180, 200), // Grey
"unknown": color(230, 230, 230, 200), // Light Grey
"default": color(200, 200, 200, 180) // Default Grey
};

orbitColor = color(100, 100, 100, 150);
electronColor = color(0, 0, 255);
nucleusColor = color(255, 0, 0);

// Create Element objects from JSON data
if (elementsData && elementsData.elements) {
elementsData.elements.forEach(data => {
elements.push(new Element(data));
});
} else {
console.error("Failed to load or parse elements.json");
// Draw error message on screen
createP("Error: Could not load element data from elements.json").position(20, 20);
}

// Define positions for info box and atom animation
infoBoxW = 250;
infoBoxH = 150;
infoBoxX = windowWidth - marginX - infoBoxW; // Top right
infoBoxY = marginY;

atomCenterX = marginX + tableWidth / 2; // Center below table (adjust as needed)
atomCenterY = marginY + tableHeight + atomRadius + 50; // Below table

// Adjust atom center if info box overlaps or goes off screen
if (infoBoxX < marginX + tableWidth + 20) {
// If table is wide, place atom animation to the right
atomCenterX = marginX + tableWidth + atomRadius + 30;
atomCenterY = marginY + tableHeight / 2;
}
if (atomCenterY + atomRadius > windowHeight - 20) {
// If too low, move it up or make radius smaller (simple move up here)
atomCenterY = windowHeight - atomRadius - 20;
}
// Ensure Info Box isn't off screen right
infoBoxX = min(infoBoxX, windowWidth - infoBoxW - 10);
}

// --- Draw Loop ---
function draw() {
background(250);
hoveredElement = null; // Reset hover state each frame

// --- Draw Title ---
fill(0);
textSize(24);
textAlign(CENTER, TOP);
text("Dynamic Periodic Table", windowWidth / 2, 10);

// --- Draw Elements and Detect Hover ---
elements.forEach(element => {
element.draw();
if (element.isHovered(mouseX, mouseY)) {
hoveredElement = element;
}
});

// --- Draw Hover Highlight ---
if (hoveredElement) {
hoveredElement.highlight();
}

// --- Display Info Box and Atom Animation ---
if (hoveredElement) {
displayElementInfo(hoveredElement);
drawAtom(hoveredElement);
} else {
// Optional: Display default text when nothing is hovered
fill(150);
textSize(14);
textAlign(LEFT, TOP);
text("Hover over an element", infoBoxX + 10, infoBoxY + 10);

     // Optional: Maybe draw a generic atom placeholder?
     // fill(200); noStroke();
     // ellipse(atomCenterX, atomCenterY, nucleusSize * 0.8, nucleusSize * 0.8);

}
}

// --- Window Resized ---
function windowResized() {
resizeCanvas(windowWidth, windowHeight);
// Recalculate layout on resize
setup(); // Re-run setup to recalculate sizes and positions
}

// --- Element Class ---
class Element {
constructor(data) {
this.data = data; // Store all JSON data
this.x = marginX + (data.xpos - 1) _ cellSize;
this.y = marginY + (data.ypos - 1) _ cellSize;
this.size = cellSize;
this.color = categoryColors[data.category] || categoryColors["default"];
}

draw() {
// Element Box
fill(this.color);
stroke(50);
strokeWeight(1);
rect(this.x, this.y, this.size, this.size, 4); // Slightly rounded corners

    // Text (Symbol, Number)
    textAlign(CENTER, CENTER);

    // Adjust text size based on cell size
    let symbolSize = this.size * 0.4;
    let numberSize = this.size * 0.2;

    // Draw Atomic Number (Top Left)
    fill(0); // Black text
    textSize(numberSize);
    textAlign(LEFT, TOP);
    text(this.data.number, this.x + this.size * 0.05, this.y + this.size * 0.05);

    // Draw Symbol (Center)
    textSize(symbolSize);
    textAlign(CENTER, CENTER);
     // Check for long symbols if needed
     if (this.data.symbol.length > 2) textSize(symbolSize * 0.7);
    text(this.data.symbol, this.x + this.size / 2, this.y + this.size / 2);

     // Draw Name (Bottom, smaller) - Optional, can get crowded
     // textSize(numberSize * 0.9);
     // textAlign(CENTER, BOTTOM);
     // text(this.data.name, this.x + this.size / 2, this.y + this.size * 0.95);

}

isHovered(mx, my) {
return (
mx > this.x &&
mx < this.x + this.size &&
my > this.y &&
my < this.y + this.size
);
}

highlight() {
// Draw a thicker border or a glow effect
noFill();
stroke(0, 0, 255, 180); // Blue highlight
strokeWeight(3);
rect(this.x - 1, this.y - 1, this.size + 2, this.size + 2, 5);
}
}

// --- Display Info Function ---
function displayElementInfo(element) {
// Draw info box background
fill(255, 255, 255, 220); // Semi-transparent white
stroke(50);
strokeWeight(1);
rect(infoBoxX, infoBoxY, infoBoxW, infoBoxH, 5);

// Display text
fill(0); // Black text
textAlign(LEFT, TOP);
let txtSize = 14;
let spacing = txtSize \* 1.5;
let currentY = infoBoxY + 10;
let currentX = infoBoxX + 10;

textSize(txtSize + 2); // Slightly larger for name/symbol
text(`${element.data.number}. ${element.data.name} (${element.data.symbol})`, currentX, currentY);
currentY += spacing \* 1.2; // More space after title

textSize(txtSize);
text(`Atomic Mass: ${element.data.atomic_mass.toFixed(3)}`, currentX, currentY);
currentY += spacing;

text(`Category: ${element.data.category}`, currentX, currentY);
currentY += spacing;

text(`Electron Config:`, currentX, currentY);
currentY += spacing _ 0.9;
textSize(txtSize _ 0.9); // Smaller for config
text(`${element.data.electron_configuration_semantic}`, currentX + 5, currentY);
currentY += spacing;

textSize(txtSize \* 0.9); // Smaller for shell config
text(`Shells: ${element.data.shells.join(', ')}`, currentX + 5, currentY);

}

// --- Draw Atom Animation ---
function drawAtom(element) {
push(); // Isolate transformations and styles

translate(atomCenterX, atomCenterY);

// Draw Nucleus
fill(nucleusColor);
noStroke();
ellipse(0, 0, nucleusSize, nucleusSize);
// Optional: Text inside nucleus (atomic number or symbol)
fill(255); textSize(nucleusSize \* 0.6); textAlign(CENTER, CENTER);
text(element.data.symbol, 0, 1); // Slight Y offset looks better

// Draw Orbits and Electrons
let shells = element.data.shells;
let maxRadius = 0; // Track the largest radius drawn

for (let i = 0; i < shells.length; i++) {
let numElectrons = shells[i];
if (numElectrons === 0) continue; // Skip empty shells

    let shellRadius = nucleusSize + 15 + i * (atomRadius * 0.15); // Adjust spacing
    maxRadius = shellRadius;

    // Draw Orbit Path
    noFill();
    stroke(orbitColor);
    strokeWeight(1);
    ellipse(0, 0, shellRadius * 2, shellRadius * 2);

    // Calculate electron positions
    fill(electronColor);
    noStroke();
    let baseAngle = (frameCount * (0.01 + i * 0.002)) % TWO_PI; // Rotate faster for inner shells
    let angleIncrement = TWO_PI / numElectrons;

    for (let j = 0; j < numElectrons; j++) {
      let angle = baseAngle + j * angleIncrement;
      let ex = shellRadius * cos(angle);
      let ey = shellRadius * sin(angle);
      ellipse(ex, ey, electronSize, electronSize);
    }

}
// Optional: Draw an outer boundary circle based on max radius
// noFill(); stroke(0, 50); strokeWeight(0.5);
// ellipse(0, 0, (maxRadius + electronSize) _ 2, (maxRadius + electronSize) _ 2);

pop(); // Restore previous drawing state
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
JavaScript
IGNORE_WHEN_COPYING_END

How to Use:

Save the three files (index.html, sketch.js, elements.json) in the same folder.

Make sure you have a decent number of elements defined in elements.json for the table to look populated. Include their xpos and ypos correctly according to the standard periodic table layout (1-18 columns, 1-7+ rows).

Open the index.html file in your web browser. You might need to run a simple local web server if your browser has security restrictions about loading local JSON files directly (using file:///...). Many code editors (like VS Code with the "Live Server" extension) make this easy.

Hover your mouse over the element squares. You should see:

The element cell highlighted.

An information box appearing (likely in the top-right) with details.

An animated Bohr model of the atom appearing (likely below the table or to the side).

Key Features & Concepts:

Data Loading (preload): loadJSON ensures the element data is available before setup runs.

Object-Oriented Structure: An Element class is used to manage the drawing and state of each element cell.

Layout Calculation: cellSize, marginX, marginY are calculated dynamically based on window size for some responsiveness.

Hover Detection: The draw loop checks mouseX and mouseY against the boundaries of each Element object.

Conditional Rendering: The info box and atom animation are only drawn when hoveredElement is not null.

Bohr Model Animation:

Uses the shells array from the JSON data.

Calculates orbit radii based on shell index (i).

Calculates electron positions using cos() and sin() (polar coordinates).

Uses frameCount to animate the angle, making the electrons appear to orbit. Different shells rotate at slightly different speeds.

Color Coding: Uses a categoryColors object to assign distinct background colors to element cells based on their type.

Styling (push/pop): Used in the drawAtom function to isolate transformations (translate) and style changes, preventing them from affecting other parts of the drawing.

Responsiveness (windowResized): Basic resizing is handled by recalculating layout in setup() when the window size changes.
